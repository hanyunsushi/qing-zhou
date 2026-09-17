---
title: System Overview
updated: 2026-09-17
---

# System Overview

QingZhou is a Go/SQLite service with a Vue 3 administrative UI. Admin routes are authenticated by JWT/cookie session and `requireAdmin`; the front-end uses the unified `{code,msg,data}` API envelope.

## Production node topology

The OCI production deployment runs QingZhou as a host `systemd` service rather than the Docker center-panel template. `QZ_SINGBOX_LOCAL=true` makes the controller generate, validate, write, and reload the local native sing-box configuration at `/etc/qingzhou-sing-box/config.json`; traffic statistics are read from its loopback `v2ray_api` endpoint at `127.0.0.1:18082`. The QingZhou inbound is owned by `server_id=0`, so this path does not use SSH.

The legacy EdgeTunnel OCI node service has been retired; port `8881` is not part of the current production path. QingZhou's native service owns the OCI node on `8882`. The optional Docker Compose deployment remains a center-panel/remote-SSH mode and must not be used to replace the production host service without an explicit migration.

### Subscription node order

The admin node order is stored in `nodes.sort_order` and applies globally across external nodes and QingZhou's native self-built nodes. Subscription aggregation carries that order through both paths and sorts the combined links before rendering Clash, sing-box, Surge, or Base64 output. When a node source refreshes, existing links keep their stored order by `share_link`; newly discovered links are appended after the current maximum.

The implementation is covered by `internal/api/node_order_test.go` and `internal/store/source_order_test.go`.

The admin node management view uses native drag-and-drop for node cards. Each drop is translated into the complete global node ID order and sent to `POST /api/admin/nodes/reorder`; the UI rolls back the optimistic order when the request fails. Because a node may appear in more than one group, group views are projections of the shared order rather than independent sortable lists.

The upstream-management flow is independent of node telemetry:

1. An administrator saves an OCI or Cloudflare profile in the Vue page.
2. `internal/api/upstreams.go` validates and serializes the profile to the `settings` table.
3. The store encrypts the whole profile at rest with `QZ_SECRET_KEY`.
4. A refresh route calls the fixed official provider API host.
5. The response returns only usage, configured allowance and derived remaining balance; no credential is serialized to the browser.

See also: [Official Usage](../modules/official-usage.md), [Admin Upstreams](../apis/admin-upstreams.md).

The admin monitor adds the combined `上游余额` card directly after the `面板本机` server card. OCI and Cloudflare are shown as draggable subcards, and their order is shared with 上游管理 through `settings.admin_upstream_balance_order`. The card is administrator-only and does not alter the public monitor payload.
