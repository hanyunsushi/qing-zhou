---
title: System Overview
updated: 2026-10-17
---

# System Overview

QingZhou is a Go/SQLite service with a Vue 3 administrative UI. Admin routes are authenticated by the backend's seven-day HttpOnly `qz_token` cookie and `requireAdmin`; the frontend does not persist or resend JWTs from JavaScript and uses the unified `{code,msg,data}` API envelope.

## Local preview lifecycle

The local preview uses the workspace database at `.local/qingzhou.db`. The Go
preview listens on `127.0.0.1:8081`, while the Vite development server listens
on `127.0.0.1:5173` and proxies `/api` and `/sub` to the Go service. Both are
kept outside the task terminal by the user-level LaunchAgents
`com.hinaw.qingzhou-preview` and `com.hinaw.qingzhou-preview-frontend`; this
prevents a Codex task ending from taking down the API while the browser still
has the Vite page open. The database-stored JWT signing key and HttpOnly cookie
therefore survive a preview process restart. The preview service exposes the
Homebrew `sing-box` PATH, but the installed build currently lacks
`with_v2ray_api`; that can prevent automatic sing-box apply while leaving panel
health and auth available.

The public bootstrap configuration also carries the non-sensitive site name,
description and optional `brand_icon_data_uri`. The shared front-end config
store updates the visible `BrandMark`, document title, favicon, shortcut icon
and Apple touch icon together, so authenticated and unauthenticated views use
one source of branding.

## Production node topology

The OCI production deployment runs QingZhou as a host `systemd` service rather than the Docker center-panel template. QingZhou's official controller generates, validates, writes, and reloads the local native sing-box configuration at `/etc/qingzhou-sing-box/config.json`; traffic statistics are read from its loopback `v2ray_api` endpoint at `127.0.0.1:18082`. The QingZhou inbound is owned by `server_id=0`, so this path does not use SSH and does not require a custom local-mode switch.

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

## Monitoring status semantics

`internal/api/monitor.go` 的 `buildHeatmap` 同时用于公开与管理员监控矩阵：仅 CPU 使用率或内存占用率达到 70% 时分类为“高负载”，任一达到 90% 时为“严重负载”；其余有效样本为正常，无样本为无数据。磁盘容量占用率和 `load1`、`load5`、`load15` 均不参与此分类。磁盘指标继续采集、存储并在资源卡与详情中展示。内存采集由 `internal/sysmetrics/sysmetrics_linux.go` 的 `readMemInfo` 使用 `MemTotal - MemAvailable`，不是将所有文件缓存计为已用。

`/api/monitor/heatmap` 与 `/api/admin/monitor/heatmap` 把所选 1h、6h、24h 或 7d 划为 48 个时间桶，每桶保留全部有效样本中最严重的 CPU/内存分类，不取均值，也不等同于当前瞬时状态。分类在查询时从原始指标计算，CPU/内存规则生效后历史桶也按同一口径重算，不迁移或改写历史指标。前端 `frontend/src/views/Monitor.vue`、`AdminMonitor.vue` 与 `frontend/src/utils/heatmap-skyline.ts` 展示这一分类。`internal/api/monitor_local_test.go` 的 `TestHeatmapLoadUsesOnlyCPUAndMemory` 覆盖两个接口、四种范围、磁盘满载不升级、CPU/内存阈值、缺少内存总量、桶内最严重分类和无数据哨兵。运行状态与源码生效边界见[项目权威](../../agent.md)，历史排查与清理见[运行态诊断](../../agent.md#监控高负载的运行态排查)。

## Remote backups and disaster recovery

The administrator's `系统设置 → 数据备份` section supports local snapshot
download plus optional Cloudflare R2/S3-compatible storage. The backend creates
one SQLite `VACUUM INTO` snapshot, uploads it asynchronously, stores only
metadata in SQLite, and applies cron/retention policy through the background
backup manager. The complete object-store profile is encrypted under
`QZ_SECRET_KEY`; read APIs redact the secret. Browser restore is intentionally
not exposed. A server-only `QZ_BACKUP_MANIFEST` allowlist optionally upgrades
each remote upload to a recovery `.tar.gz` containing the consistent database
snapshot, selected runtime files, per-file SHA-256/permissions, platform and
version metadata, plus isolated manual recovery instructions. The archive is
not additionally encrypted by this deployment decision, so its private object
storage, independent credential custody and periodic restoration drill are part
of the operational contract.
