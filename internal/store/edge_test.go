package store

import (
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
	if EdgeUUIDForUser(1<<48, "test-secret") != "" {
		t.Fatal("user IDs that cannot fit around UUID version bits must be rejected")
	}
}
