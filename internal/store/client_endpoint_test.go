package store

import (
	"encoding/json"
	"net/url"
	"testing"
	"time"

	"qingzhou/internal/singbox"
)

func TestWSSClientEndpointKeepsOriginPrivateAndCredentialsPerUser(t *testing.T) {
	st := newRefundStore(t)
	uid := mkUser(t, st, "ws-user")
	pkg := mkPlan(t, st, "P", 10, 100, 30)
	buy(t, st, uid, pkg)
	for _, ib := range []*SbInbound{
		{Type: "vless", Tag: "ws", Listen: "127.0.0.1", ListenPort: 18883, Enabled: true,
			Options: `{"transport":{"type":"ws","path":"/test-ws"},"client_endpoint":{"server":"node.example.com","server_port":443}}`},
		{Type: "anytls", Tag: "direct", Listen: "::", ListenPort: 8882, Enabled: true},
	} {
		if _, err := st.SaveSbInbound(ib); err != nil {
			t.Fatal(err)
		}

	}
	bindPlanToInbounds(t, st, pkg.ID, "ws", "direct")
	u, _ := st.UserByID(uid)
	links := st.BuildSelfBuiltLinks(u, "203.0.113.9")
	if len(links) != 2 {
		t.Fatalf("links=%d", len(links))
	}
	for _, link := range links {
		parsed, err := url.Parse(link.Link)
		if err != nil {
			t.Fatal(err)
		}
		if link.Tag == "ws" {
			q := parsed.Query()
			if parsed.Host != "node.example.com:443" || parsed.User.Username() == "" || q.Get("security") != "tls" || q.Get("sni") != "node.example.com" || q.Get("host") != "node.example.com" || q.Get("path") != "/test-ws" || q.Get("flow") != "" || q.Get("allowInsecure") != "" {
				t.Fatal("WSS subscription has incorrect endpoint, TLS, transport, or credentials")
			}
		} else if parsed.Host != "203.0.113.9:8882" {
			t.Fatalf("existing node endpoint changed: %s", parsed.Host)
		}
	}
	byTag, err := st.BuildUsersByTag(time.Now().Unix())
	if err != nil {
		t.Fatal(err)
	}
	raw, err := st.BuildSingboxConfig(singbox.DefaultBaseConfig, "127.0.0.1:18082", byTag)
	if err != nil {
		t.Fatal(err)
	}
	var cfg struct {
		Inbounds []map[string]interface{} `json:"inbounds"`
	}
	if err := json.Unmarshal(raw, &cfg); err != nil {
		t.Fatal(err)
	}
	for _, ib := range cfg.Inbounds {
		if _, found := ib["client_endpoint"]; found {
			t.Fatal("client metadata leaked into core config")
		}
		if ib["tag"] == "ws" && (ib["listen"] != "127.0.0.1" || ib["listen_port"] != float64(18883) || ib["tls"] != nil) {
			t.Fatal("origin listener changed")
		}
	}
}
