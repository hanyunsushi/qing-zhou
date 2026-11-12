package singbox

import (
	"encoding/json"
	"fmt"
	"strings"
)

// ClientEndpoint describes WSS terminated by a reverse proxy in front of a
// loopback VLESS/WS listener. It is subscription metadata, never a core option.
type ClientEndpoint struct {
	Server     string `json:"server"`
	ServerPort int    `json:"server_port"`
	ServerName string `json:"server_name,omitempty"`
}

func ParseClientEndpoint(protocol string, opts map[string]interface{}) (*ClientEndpoint, error) {
	raw, present := opts["client_endpoint"]
	if !present || raw == nil {
		return nil, nil
	}
	tr, _ := opts["transport"].(map[string]interface{})
	if protocol != "vless" || tr["type"] != "ws" {
		return nil, fmt.Errorf("client_endpoint 仅支持 VLESS + WS 入站")
	}
	b, err := json.Marshal(raw)
	var ep ClientEndpoint
	if err != nil || json.Unmarshal(b, &ep) != nil {
		return nil, fmt.Errorf("client_endpoint 必须是有效对象")
	}
	validHost := func(s string) bool {
		return s != "" && strings.TrimSpace(s) == s && !strings.ContainsAny(s, "/@?# \t\r\n")
	}
	if !validHost(ep.Server) || ep.ServerPort < 1 || ep.ServerPort > 65535 {
		return nil, fmt.Errorf("client_endpoint 需要有效 server 和 1-65535 的 server_port")
	}
	if ep.ServerName == "" {
		ep.ServerName = ep.Server
	}
	if !validHost(ep.ServerName) {
		return nil, fmt.Errorf("client_endpoint.server_name 必须是主机名")
	}
	return &ep, nil
}
