---
title: Subscription Delivery
updated: 2026-09-17
---

# Subscription Delivery

QingZhou renders the authenticated subscription according to the requested format and sends a `Content-Disposition` header so Clash-family clients can use the site name instead of exposing the subscription token.

## Profile display name

The Clash format uses the site name without a `.yaml` suffix. Sing-box, Surge, and Base64 keep their format-specific `.json`, `.conf`, and `.txt` suffixes. The ASCII `filename` fallback remains available for clients that do not implement RFC 5987; the UTF-8 `filename*` value is percent-encoded.

The behavior is implemented in `internal/api/subinfo.go` and covered by `internal/api/subinfo_test.go`.
