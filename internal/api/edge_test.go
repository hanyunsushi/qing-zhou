package api

import (
	"encoding/base64"
	"encoding/json"
	"net/url"
	"testing"

	"qingzhou/internal/store"
)

func TestRewriteEdgeTunnelLinkAddsSignedUserToProtocols(t *testing.T) {
	t.Setenv("QZ_EDGE_SECRET", "test-secret")
	t.Setenv("QZ_EDGE_HOST", "edge.example")
	want := store.EdgeUUIDForUser(42, "test-secret")

	vless, err := url.Parse(rewriteEdgeTunnelLink("vless://origin-pass@edge.example:443?type=ws#edge", 42))
	if err != nil {
		t.Fatal(err)
	}
	if vless.User.Username() != want || vless.Query().Get("edge_user") != want {
		t.Fatalf("vless credential = %s / %s, want %s", vless.User.Username(), vless.Query().Get("edge_user"), want)
	}

	profile := map[string]any{"add": "edge.example", "id": "old-id", "net": "ws"}
	body, err := json.Marshal(profile)
	if err != nil {
		t.Fatal(err)
	}
	vmess, err := url.Parse(rewriteEdgeTunnelLink("vmess://"+base64.RawStdEncoding.EncodeToString(body)+"#edge", 42))
	if err != nil {
		t.Fatal(err)
	}
	if vmess.Query().Get("edge_user") != want {
		t.Fatalf("vmess edge_user = %s, want %s", vmess.Query().Get("edge_user"), want)
	}
	decoded, err := base64.RawStdEncoding.DecodeString(vmess.Host)
	if err != nil {
		t.Fatal(err)
	}
	var rewritten map[string]any
	if err := json.Unmarshal(decoded, &rewritten); err != nil {
		t.Fatal(err)
	}
	if rewritten["id"] != want {
		t.Fatalf("vmess id = %v, want %s", rewritten["id"], want)
	}
}
