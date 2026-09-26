package store

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/binary"
)

// EdgeUUIDForUser creates a UUID-shaped credential whose 60-bit user-id
// payload is split across the first six bytes, the low nibble of byte seven,
// and byte eight. The high nibble of byte seven and the high two bits of byte
// nine remain available for the UUIDv4 version/variant markers; the remaining
// bytes carry an HMAC. This layout matches EdgeTunnel's local decoder and
// avoids a QingZhou request for every proxy connection.
func EdgeUUIDForUser(userID int64, secret string) string {
	if userID <= 0 || uint64(userID) > (uint64(1)<<60)-1 || secret == "" {
		return ""
	}
	var raw [16]byte
	// EdgeTunnel decodes bytes 0..5, byte 6's low nibble, then byte 7.
	// Pack the same 60-bit value around the UUID version nibble.
	packed := uint64(userID)
	for i := 0; i < 6; i++ {
		raw[5-i] = byte(packed >> (12 + 8*i))
	}
	raw[6] = byte((packed >> 8) & 0x0f)
	raw[7] = byte(packed)
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
