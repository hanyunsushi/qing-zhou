package subconv

import (
	"strings"
	"testing"
)

func TestEdgeUserSurvivesClientRenderers(t *testing.T) {
	const edgeUser = "00000000-0000-402a-adc4-e557ecff1e44"
	link := "vless://" + edgeUser + "@172.67.75.53:443?security=tls&type=ws&host=edge.example&sni=edge.example&path=%2F&edge_user=" + edgeUser + "#edge"
	clash, err := Clash(ParseLinks([]string{link}), "")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(clash, "/?edge_user="+edgeUser) {
		t.Fatalf("clash websocket path dropped edge_user: %s", clash)
	}
	singbox, err := Singbox(ParseLinks([]string{link}), "")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(singbox, "/?edge_user="+edgeUser) {
		t.Fatalf("sing-box websocket path dropped edge_user: %s", singbox)
	}
}
