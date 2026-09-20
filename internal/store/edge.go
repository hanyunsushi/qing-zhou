package store

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/binary"
)

// EdgeUUIDForUser creates a UUID-shaped credential whose first 48 bits carry
// the QingZhou user id and whose remaining bytes carry an HMAC. The UUID
// version and variant bits occupy the remaining two identifier bytes. This
// lets EdgeTunnel identify a user locally without fetching a user registry for
// every proxy request. The shared secret stays in the two services' environments.
func EdgeUUIDForUser(userID int64, secret string) string {
	if userID <= 0 || uint64(userID) > (uint64(1)<<48)-1 || secret == "" {
		return ""
	}
	var raw [16]byte
	binary.BigEndian.PutUint64(raw[:8], uint64(userID))
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte("edge:"))
	var id [8]byte
	binary.BigEndian.PutUint64(id[:], uint64(userID))
	mac.Write(id[:])
	sum := mac.Sum(nil)
	copy(raw[8:], sum[:8])
	raw[6] = (raw[6] & 0x0f) | 0x40
	raw[8] = (raw[8] & 0x3f) | 0x80
	return formatUUID(raw[:])
}
