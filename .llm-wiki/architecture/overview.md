---
title: System Overview
updated: 2026-09-15
---

# System Overview

QingZhou is a Go/SQLite service with a Vue 3 administrative UI. Admin routes are authenticated by JWT/cookie session and `requireAdmin`; the front-end uses the unified `{code,msg,data}` API envelope.

## Production node topology

The OCI production deployment runs QingZhou as a host `systemd` service rather than the Docker center-panel template. `QZ_SINGBOX_LOCAL=true` makes the controller generate, validate, write, and reload the local native sing-box configuration at `/etc/qingzhou-sing-box/config.json`; traffic statistics are read from its loopback `v2ray_api` endpoint at `127.0.0.1:18082`. The QingZhou inbound is owned by `server_id=0`, so this path does not use SSH.

The legacy EdgeTunnel node remains a separate host service on port `8881` while its Worker subscriptions still advertise that endpoint. It must not be stopped as part of QingZhou deployment. The optional Docker Compose deployment remains a center-panel/remote-SSH mode and must not be used to replace the production host service without an explicit migration.

The upstream-management flow is independent of node telemetry:

1. An administrator saves an OCI or Cloudflare profile in the Vue page.
2. `internal/api/upstreams.go` validates and serializes the profile to the `settings` table.
3. The store encrypts the whole profile at rest with `QZ_SECRET_KEY`.
4. A refresh route calls the fixed official provider API host.
5. The response returns only usage, configured allowance and derived remaining balance; no credential is serialized to the browser.

See also: [Official Usage](../modules/official-usage.md), [Admin Upstreams](../apis/admin-upstreams.md).
