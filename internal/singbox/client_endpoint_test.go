package singbox

import "testing"

func TestClientEndpointValidation(t *testing.T) {
	for _, tc := range []struct {
		name, protocol string
		endpoint       interface{}
		transport      string
		valid          bool
	}{
		{"wss", "vless", map[string]interface{}{"server": "node.example.com", "server_port": 443}, "ws", true},
		{"url", "vless", map[string]interface{}{"server": "https://node.example.com", "server_port": 443}, "ws", false},
		{"port", "vless", map[string]interface{}{"server": "node.example.com", "server_port": 0}, "ws", false},
		{"fractional", "vless", map[string]interface{}{"server": "node.example.com", "server_port": 443.5}, "ws", false},
		{"explicit-clear", "vless", nil, "ws", true},
		{"raw-tcp", "vless", map[string]interface{}{"server": "node.example.com", "server_port": 443}, "tcp", false},
		{"anytls", "anytls", map[string]interface{}{"server": "node.example.com", "server_port": 443}, "ws", false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			_, err := ParseClientEndpoint(tc.protocol, map[string]interface{}{"transport": map[string]interface{}{"type": tc.transport}, "client_endpoint": tc.endpoint})
			if (err == nil) != tc.valid {
				t.Fatalf("valid=%v err=%v", tc.valid, err)
			}
		})
	}
}
