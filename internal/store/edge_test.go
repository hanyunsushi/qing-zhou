package store

import (
	"encoding/hex"
	"strings"
	"testing"
)

func TestEdgeUUIDForUserUsesStableUUIDShapeAndBounds(t *testing.T) {
	got := EdgeUUIDForUser(42, "test-secret")
	if got != "00000000-0000-402a-adc4-e557ecff1e44" {
		t.Fatalf("uuid = %s, want stable cross-runtime value", got)
	}
	if !strings.HasPrefix(got, "00000000-0000-4") || !strings.ContainsAny(got[19:20], "89ab") {
		t.Fatalf("uuid does not have RFC 4122 version/variant bits: %s", got)
	}
	if EdgeUUIDForUser(1<<60, "test-secret") != "" {
		t.Fatal("user IDs that cannot fit around UUID version bits must be rejected")
	}

	// Keep this decoder in lockstep with EdgeTunnel's worker contract. The old
	// Go layout silently corrupted every id whose low bytes crossed the version nibble.
	for _, want := range []uint64{256, 123456, 1 << 48, (1 << 60) - 1} {
		got := EdgeUUIDForUser(int64(want), "test-secret")
		clean, err := hex.DecodeString(strings.ReplaceAll(got, "-", ""))
		if err != nil {
			t.Fatal(err)
		}
		var decoded uint64
		for i := 0; i < 6; i++ {
			decoded = decoded*256 + uint64(clean[i])
		}
		decoded = decoded*16 + uint64(clean[6]&0x0f)
		decoded = decoded*256 + uint64(clean[7])
		if decoded != want {
			t.Fatalf("user id %d decoded as %d from %s", want, decoded, got)
		}
	}
}
