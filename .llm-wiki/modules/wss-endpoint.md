---
title: Native VLESS behind a WSS frontend
updated: 2026-11-12
---

# Responsibility

QingZhou owns users, node entitlements, traffic accounting and the native
sing-box listener. Cloudflare terminates external TLS and carries WebSocket
traffic through Tunnel to a loopback VLESS/WS listener. The public connection
address is independent of that listener's bind address and port.

# Subscription endpoint metadata

The authenticated `POST /api/admin/sb/inbounds` and
`PUT /api/admin/sb/inbounds/{id}` APIs accept `options.client_endpoint`:

```json
{
  "flow": "none",
  "transport": {"type": "ws", "path": "/your-ws-path"},
  "client_endpoint": {
    "server": "node.example.com",
    "server_port": 443,
    "server_name": "node.example.com"
  }
}
```

`options` remains a JSON-encoded string in the inbound API request. This
metadata is accepted only for VLESS/WS, a loopback listener and `tls_id=0`.
The frontend must provide trusted external TLS. `server_name` defaults to
`server`. A missing metadata field on an update preserves the stored value,
including updates from existing panel/Console forms; explicit `null` clears it.

`internal/singbox/client_endpoint.go::ParseClientEndpoint` validates the
endpoint. `internal/store/singbox.go::BuildSelfBuiltLinks` uses it for the
public address, port, TLS SNI and WebSocket Host while retaining each owner's
credentials. Certificate verification stays enabled and WS carries no Vision
flow. Inbounds without metadata retain their existing subscription endpoints.
`internal/singbox/generate.go::GenerateConfigWithOptions` removes this metadata
before emitting the core configuration; the actual loopback port and WS
transport remain unchanged.

# Effective Tunnel configuration

For a Tunnel managed by Cloudflare, route changes belong to the Cloudflare
configuration API, even when the connector has a local `config.yml`. Verify
the remote configuration version and the connector's update log. A local
`cloudflared tunnel ingress validate` result does not prove that those rules
are effective.

A dedicated WS path must precede the broader panel hostname rule. The panel
and subscription paths continue to reach QingZhou; only the matching WS path
reaches the loopback proxy listener. Preserve other routes and the catch-all.

# Verification and rollback

Verify the generated per-user subscription, public WS upgrade and real proxy
traffic with normal certificate validation. An independent client bound to
the physical interface avoids changing the active Clash selection. Measure
20 MB upload/download separately from handshake and small-request latency.

Disable the added node/inbound before rolling back to an older backend that
does not understand endpoint metadata. Remove only the added remote path
rule after checking for concurrent Tunnel changes. Restoring a whole SQLite
database is not part of a node rollback.

Tests: `internal/api/client_endpoint_test.go`,
`internal/store/client_endpoint_test.go` and
`internal/singbox/client_endpoint_test.go`.

See also: [System overview](../architecture/overview.md),
[Subscription delivery](../apis/subscription-delivery.md),
[Project authority](../../agent.md).
