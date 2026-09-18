---
title: Subscription Delivery
updated: 2026-09-18
---

# Subscription Delivery

The current public base is `https://proxy.kreeper.cc`. The historical
`https://qz.kreeper.cc` hostname has been removed; changing
`settings.public_base` controls the direct QingZhou links generated for users.

QingZhou renders the authenticated subscription according to the requested format and sends a `Content-Disposition` header so Clash-family clients can use the site name instead of exposing the subscription token.

## Profile display name

The Clash format uses the site name without a `.yaml` suffix. Sing-box, Surge, and Base64 keep their format-specific `.json`, `.conf`, and `.txt` suffixes. The ASCII `filename` fallback remains available for clients that do not implement RFC 5987; the UTF-8 `filename*` value is percent-encoded.

The behavior is implemented in `internal/api/subinfo.go` and covered by `internal/api/subinfo_test.go`.

## Node order

The nodes in the rendered profile follow the global `nodes.sort_order` sequence. This sequence includes both external nodes and self-built native nodes; it is not rebuilt as “external first, self-built last.” A subscription-source refresh preserves the order of unchanged share links and places newly discovered links after the current maximum. The ordering path is implemented in `internal/api/user.go` and `internal/store/nodes.go`.
