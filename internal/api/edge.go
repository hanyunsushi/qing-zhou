package api

import (
	"encoding/base64"
	"encoding/json"
	"net/url"
	"os"
	"strings"

	"qingzhou/internal/store"
)

func edgeTunnelHost() string {
	host := strings.TrimSpace(os.Getenv("QZ_EDGE_HOST"))
	if host == "" {
		host = "edge.kreeper.cc"
	}
	return strings.ToLower(strings.TrimSuffix(host, "."))
}

// isEdgeTunnelURL accepts the common CDN form where the dial address is an
// IP, while the actual Worker hostname is carried by the transport Host/SNI.
// Matching only URL.Hostname() leaves those nodes on the shared upstream UUID
// and prevents the Worker from seeing edge_user at all.
func isEdgeTunnelURL(u *url.URL) bool {
	if u == nil {
		return false
	}
	if strings.EqualFold(strings.TrimSuffix(u.Hostname(), "."), edgeTunnelHost()) {
		return true
	}
	q := u.Query()
	for _, key := range []string{"host", "sni", "peer"} {
		if strings.EqualFold(strings.TrimSuffix(strings.TrimSpace(q.Get(key)), "."), edgeTunnelHost()) {
			return true
		}
	}
	return false
}

func rewriteEdgeTunnelLink(raw string, userID int64) string {
	secret := strings.TrimSpace(os.Getenv("QZ_EDGE_SECRET"))
	if secret == "" || userID <= 0 {
		return raw
	}
	edgeUUID := store.EdgeUUIDForUser(userID, secret)
	if edgeUUID == "" {
		return raw
	}
	if strings.HasPrefix(strings.ToLower(raw), "vmess://") {
		return rewriteEdgeVMess(raw, edgeUUID)
	}
	u, err := url.Parse(raw)
	if err != nil || !isEdgeTunnelURL(u) || u.User == nil {
		return raw
	}
	switch strings.ToLower(u.Scheme) {
	case "vless", "trojan", "hysteria2", "hy2", "anytls", "tuic":
		if password, ok := u.User.Password(); ok {
			u.User = url.UserPassword(edgeUUID, password)
		} else {
			u.User = url.User(edgeUUID)
		}
	case "ss":
		if rewritten, ok := rewriteEdgeSSUser(u.User.Username(), edgeUUID); ok {
			u.User = url.User(rewritten)
		} else {
			return raw
		}
	default:
		return raw
	}
	q := u.Query()
	q.Set("edge_user", edgeUUID)
	u.RawQuery = q.Encode()
	return u.String()
}

func rewriteEdgeSSUser(encoded, edgeUUID string) (string, bool) {
	decoded, err := base64.RawStdEncoding.DecodeString(strings.TrimRight(encoded, "="))
	if err != nil {
		decoded, err = base64.StdEncoding.DecodeString(encoded)
	}
	if err != nil {
		return "", false
	}
	parts := strings.SplitN(string(decoded), ":", 2)
	if len(parts) != 2 || parts[0] == "" {
		return "", false
	}
	return base64.RawStdEncoding.EncodeToString([]byte(parts[0] + ":" + edgeUUID)), true
}

func rewriteEdgeVMess(raw, edgeUUID string) string {
	u, err := url.Parse(raw)
	if err != nil || u.Host == "" {
		return raw
	}
	encoded := u.Host
	decoded, err := decodeEdgeBase64(encoded)
	if err != nil {
		return raw
	}
	var profile map[string]any
	if json.Unmarshal(decoded, &profile) != nil {
		return raw
	}
	matched := false
	for _, key := range []string{"add", "host", "sni", "peer"} {
		if value, _ := profile[key].(string); strings.EqualFold(strings.TrimSuffix(strings.TrimSpace(value), "."), edgeTunnelHost()) {
			matched = true
			break
		}
	}
	if !matched {
		return raw
	}
	profile["id"] = edgeUUID
	body, err := json.Marshal(profile)
	if err != nil {
		return raw
	}
	u.Host = base64.RawStdEncoding.EncodeToString(body)
	q := u.Query()
	q.Set("edge_user", edgeUUID)
	u.RawQuery = q.Encode()
	return u.String()
}

func decodeEdgeBase64(value string) ([]byte, error) {
	value = strings.TrimSpace(value)
	for _, enc := range []*base64.Encoding{base64.StdEncoding, base64.RawStdEncoding, base64.URLEncoding, base64.RawURLEncoding} {
		if decoded, err := enc.DecodeString(value); err == nil {
			return decoded, nil
		}
	}
	return nil, os.ErrInvalid
}
