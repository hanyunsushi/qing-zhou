---
title: QingZhou Deployment and Artifact Retention
updated: 2026-10-14
---

## v0.2.107 switch/mobile rollout

Source `5dc58fcc9a1765c8ac1169d79112aa78f9c84b09` is released and deployed as
`v0.2.107-kreeper-20261014-switch-mobile-scroll`. Release run `38593721201`
and CI run `38593807022` both succeeded. The scope is limited to the global
switch proportion/bounce and the mobile page scrollbar-gutter correction;
parallel shop, copy/Dialog, hyperlink and settings-sidebar work was excluded.

The Linux ARM64 panel asset, installed binary and running executable all match
SHA-256 `48197bcd26b83868aae00e9bf7aad85f88ac5d07250f8cdf397db6b6e95b75da`.
At 2026-10-15 00:15:55 CST the panel was atomically replaced and only
`qingzhou.service` was restarted. Rollback material is retained at
`/opt/qingzhou/backups/fork-v0.2.107-kreeper-20261014-switch-mobile-scroll-20261015-001554/`;
the SQLite Backup API snapshot passed `PRAGMA integrity_check=ok`, and the
runtime database was not overwritten.

Post-rollout local/public health returned the new version. All three services
are active with `NRestarts=0`; sing-box PID `808675` and Tunnel PID `725422`
were unchanged, expected listeners `8081`, `8882`, `18082` and `19000` remain,
protected configuration hashes are unchanged, and the panel error journal is
empty. Public index JS/CSS matched the isolated build byte-for-byte, including
the switch bounce and mobile compensation rules. Release assets are unsigned.

## 开关与手机滚动槽发布前候选记录

候选范围仅为全局切换开关的 `40×23px` / `17×17px` 参考比例与回弹，以及≤768px页面隐藏桌面滚动条槽并交还原生滚动；不包含当前工作区其他商城、复制栏、Dialog、链接或设置页并行修改。发布门禁已通过前端测试、类型检查、Vite、Go 测试和 vet；其后续 Release/OCI 原子替换与运行态证据见上方 `v0.2.107` 条目。

## Current DotMatrix rollout

Loading-only source `3a91d7748816957587d682baff9697b9cc1968db` is released and
deployed as `v0.2.106-kreeper-20261014-dotmatrix`. Release build38531536709
and CI38531542063 succeeded, including171 frontend tests/typecheck/Vite,
Go vet/race and shell checks; isolated source Go tests also passed.
Independent uncommitted copy/Dialog, hyperlink and shop-folder changes were
excluded and preserved in the working tree.

The panel-only atomic replacement completed at2026-10-14 16:05:41 CST.
GitHub digest, SHA256SUMS, installed and running binary all match
`b0a6ed4908d2512aee4f7d3920429544bec01acc210202c2f4c9c02d4579cc18`.
Rollback point `/opt/qingzhou/backups/fork-v0.2.106-kreeper-20261014-dotmatrix-20261014-160540/`
includes the old executable, configuration and SQLite Backup API snapshot
(integrity_check=ok). Runtime database/configuration were not overwritten;
sing-box/Tunnel PIDs stayed808675/725422, all three services remain active with
NRestarts=0 and original listeners. No QZ_WEB_DIR or error journal entries.
Release signing is not configured; artifacts are unsigned.

Local/public health reports106; six core public frontend assets match the
isolated tag build byte-for-byte. Read-only production Chrome desktop/390/360px
and reduced-motion loading/transition checks passed, with real public GET
responses delayed only in the isolated browser context. See[validation](validation.md)
and[authority](../../agent.md) for limits and exact runtime evidence.

## Current mobile scrolling and interaction rollout

Source`62d26764480bf12cac4e23d6a71a351bbf852e1a`is released and deployed as
`v0.2.105-kreeper-20261014-mobile-scroll`. Exact tag Release build and CI passed,
including Go vet/race, frontend tests/typecheck/build and shell checks. Rollout
keeps the established native panel-only atomic replacement and SQLite Backup
API rollback point. Installed/running hashes, local/public health, protected
configuration and unchanged sing-box/Tunnel PIDs passed; no database or service
configuration was overwritten. Exact checksum, time and backup belong to
[project authority](../../agent.md).

Mobile page scrolling restores platform indicators without the desktop rail
or16px reserved space; mobile menus hide scrollbar/gutter but scroll natively,
with portrait-aligned glass branding and fixed64px brand/footer. Sidebar empty
feedback, Markdown hover and wave-free same-color button recoil are included.
Production390/360px and820px portrait checks plus8 matched public assets are
recorded in[validation](validation.md), including a continuous-resize chart risk
that was not changed in this release.

## Previous UI and monitor rollout

Source `1459bc5740a4c078390555c29c85f5097f4996b3` is released and deployed
as `v0.2.104-kreeper-20261014-ui-contract`. The guarded rollout verifies the
release checksum, snapshots SQLite with the Backup API, atomically replaces only
the native panel executable and restarts only `qingzhou.service`. Installed and
running hashes, local/public health, configuration preservation, unchanged
sing-box/Tunnel PIDs and service health passed. Exact release, checksum and
rollback evidence belong to [project authority](../../agent.md).

The admin overview, heatmap and native metric/trend card count the physical
panel machine once. Loopback OCI asset settings remain accessible as linked
asset edit actions; no asset, probe, database or public-visibility policy is
removed or changed. Admin and public heatmaps reuse the same 16x3 matrix/3D
component while keeping their independent API permission boundaries.
Read-only production and showcase verification is recorded in
[validation](validation.md).

## 2026-10-13 OCI loopback monitor correction

The monitor source now maps an enabled or disabled server asset whose host is
`localhost`, `127.0.0.1` or `::1` to the native panel metric stream
`server_id=0`. The OCI asset name and edit metadata remain separate, while its
monitor card, trend endpoint and traffic analysis reuse the panel's real data.
The card does not offer a second probe installation path. Billing settings remain
asset-specific while samples and calibration use the native metric stream.
Server titles use real router links under the existing project-hyperlink contract:
Apple blue, no default underline, shared hover color and visible keyboard focus.
Only the title is clickable; the card is not categorized as a whole-card link.

Release `v0.2.101-kreeper-20261013-local-monitor` was deployed at
2026-10-13 16:37:45 CST. Release, installed and running binary SHA-256 matched
`924ff1eed8ea21a967eec5c365837ce5f5e27df3fba67a567115126312012f38`.
Backup API integrity, configuration preservation and unchanged sing-box/Tunnel
PIDs passed; authenticated browser verification confirmed both cards show native
metrics. Follow-up source `da341b70e8c90e06ae78e8236aff88ca4d1d8359` was
released as `v0.2.102-kreeper-20261013-monitor-contract` by successful run
`38374922084` and deployed panel-only on 2026-10-13. Actual running hash,
health, backup integrity and preservation checks passed. Production browser
confirmed project-link titles, both native metric cards and the OCI detail;
desktop/390/360px checks and exact rollback evidence are linked through
[validation](validation.md) and [project authority](../../agent.md).

## 2026-10-13 Monitor, links and refresh interaction rollout

Source commit `4ec8bd18cfe66dd32a83ea73134797fa21fe9cbc` aligns the monitored
admin views with the existing Kreeper design-system categories: edit actions use
the default arc button, traffic analysis uses the highlight arc button, and
destructive clear/delete actions use the delete or default-arc contract according
to their meaning. Monitor navigation, notice links, document actions and refresh
entry points were also synchronized with their existing semantic comments.

The source passed the 148 frontend tests, vue-tsc, Vite, full Go tests, the 18
skill checks/build and the 71-source/50-pattern/220-hash audit. The existing
ECharts large-chunk warning remains non-blocking. GitHub Release
[`v0.2.100-kreeper-20261013-monitor-refresh`](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.100-kreeper-20261013-monitor-refresh)
was built by release run `38356666544`; the Linux ARM64 panel asset SHA-256 is
`9084ff13c493ff4aa0585b86a6f91ea8b89dfe8c85b2c55be4ce1bee38c32cbe`.

At 2026-10-13 14:30:01 CST, the guarded panel-only rollout atomically replaced
`/opt/qingzhou/qingzhou` and restarted only `qingzhou.service`. The rollback
directory is
`/opt/qingzhou/backups/fork-v0.2.100-kreeper-20261013-monitor-refresh-20261013-143001/`;
the SQLite Backup API snapshot passed `PRAGMA integrity_check=ok`. Local health
returned `v0.2.100-kreeper-20261013-monitor-refresh`, the active and running
binary hashes matched the release asset, all three services were active with
`NRestarts=0`, and sing-box/Tunnel PIDs plus protected configuration hashes were
unchanged. Production node/monitor pages were then checked read-only; no delete,
clear, save, sort or other destructive business write was executed.

## 2026-10-13 Unified button layout and package drag-sort rollout

Source commit `1c665580765e18ceb1c5ac4eef22da5287387d3a` was pushed to the
fork `main` branch. GitHub Release
[`v0.2.99-kreeper-20261013-button-layout`](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.99-kreeper-20261013-button-layout), release run
`38344380386` and CI run `38345030148` completed successfully. The Linux ARM64
release asset and running panel binary both have SHA-256
`593658f185722b1ae5a4545797127ef2d9e8b1d91949394e33fba2394baf840d`.

The release standardizes the operation track at 32px desktop height, 13px/20px
text, weight 500 and 10px inline padding; coarse touch targets use 44px hit
height. Delete, revoke, edit, recharge, order, publish/unpublish and drag
handles share the same track geometry. Package-card previous/next buttons were
removed in favor of mouse, touch-pointer and keyboard drag sorting. Sorting
sends the complete package ID order and restores the previous order when the
save fails. No production reorder, delete or save write was executed.

The desktop sidebar brand area now shares the right topbar's glass opacity,
`saturate(180%) blur(20px)`, divider and scroll/menu-open states; it remains
64px high, and collapsed sidebar SVGs remain centered in the 72px content rail.
The change reuses existing semantic categories and synchronizes the QingZhou
source, snapshots, patterns, showcase and design-system specification.

At 2026-10-13 12:17:40 CST, deployment atomically replaced only
`/opt/qingzhou/qingzhou` and restarted only `qingzhou.service`. Rollback material
is retained at
`/opt/qingzhou/backups/fork-v0.2.99-kreeper-20261013-button-layout-20261013-121740/`.
Local and public `/api/health` returned the new version;
`qingzhou.service`, `qingzhou-sing-box.service` and `cloudflared.service` were
active with zero restarts. sing-box/Tunnel PIDs, protected configuration hashes
and the database were unchanged, and the panel error journal was empty.

After reload, the authenticated production package page rendered all four drag
handles, operation buttons and drag instructions; its accessibility tree and
runtime log were clean. This was a read-only browser check, so it does not claim
that production sorting was executed. Frontend tests (148), typecheck, Vite,
full Go tests, the 18 skill contracts/build and the 71-source/50-pattern/220-hash
audit passed. The existing large ECharts chunk warning remains non-blocking.

## Unified button rollout

The button-contract release `v0.2.98-kreeper-20261012-buttons` is built from source `d93967b312aac0de2be70117c9cc13bdf85b5d3e`; Release and CI including Go race/vet succeeded. Rollout follows the atomic panel-only process below: verify the release checksum, take a SQLite Backup API snapshot, retain old binary/config, restart only the panel, and verify actual running hash plus local/public health and emitted frontend assets. Deployment does not repair missing business confirmations; original destructive handlers remain unchanged.

Twenty relevant public JS/CSS assets match the isolated source build. Production authenticated node/package screens confirm final button geometry/color and click/focus feedback; temporary viewport-capable production tabs verify node390/360px and package360px without overflow. User native tabs may ignore viewport overrides: always record actual innerWidth, not requested dimensions. Exact running version, binary checksum, backup and retained-data/process results are owned by [project authority](../../agent.md).

## Targeted node-group deletion recovery

For accidental group deletion, compare a verified pre-deletion snapshot against
current rows and restore only the missing group, memberships for current node
IDs, and plan-group grants. Subscription refresh can replace source node IDs;
restoring historical node rows or the whole database would overwrite newer state.
Take a SQLite Backup API snapshot before the transaction, check integrity, then
let the production controller rebuild access and invalidate cached links. A panel
restart performs both without replacing the binary; confirm sing-box credentials,
service state, public health and the authenticated node inventory afterward.

Group deletion clears node memberships and plan-group grants. A subscription
source can still retain the deleted group ID and later recreate orphan memberships;
those nodes have nonempty group IDs but no existing group, so the current admin
view omits them from both grouped and ungrouped cards. Running sing-box with zero
authorized users can therefore coexist with healthy services and unavailable nodes.
The current delete handlers lack confirmation/audit for this path. Runtime recovery
does not constitute a source fix. Incident backup and verified production results
are maintained in [project authority](../../agent.md).

## 2026-10-12 Homepage availability matrix correction

Commit `898da68fb6e117fdbe2393e1fbe750c55ce04399` was pushed to `origin/main`
and released as `v0.2.97-kreeper-20261012-heatmap-3row`. GitHub Actions run
`38231175720` succeeded. The Linux ARM64 panel asset SHA-256 is
`ec2d6f7309612c5ed8a99f27ee40e1128b01b82cff2e904d08bf7cb85d3c195d`; the
release and asset are unsigned.

The 48 availability buckets are now displayed in 16 columns by 3 rows, retaining
chronological order and the existing three native status colors plus a gray
missing-data sentinel. The Y axis is labeled “时间分组”; the toolbar explanation
and the balance-card footer drag hint were removed without removing chart
accessibility text or the balance drag handle and sorting behavior.

Production was updated by atomically replacing only `/opt/qingzhou/qingzhou` and
restarting only `qingzhou.service`. Pre-change material is in
`/opt/qingzhou/backups/fork-v0.2.97-kreeper-20261012-heatmap-3row-20261012-175232/`;
it contains the previous binary, environment and service files, sing-box config,
and SQLite Backup API snapshot (`PRAGMA integrity_check=ok`). No database, env,
systemd definition, sing-box or Cloudflare Tunnel config was changed.

Local/public `/api/health` report `v0.2.97-kreeper-20261012-heatmap-3row`; the
public homepage returns HTTP 200. All three services are active with zero
restarts, expected listeners `8081`, `8882`, `18082` and `19000` are present,
protected configuration hashes match their backups, and sing-box/Tunnel
processes were not restarted. The authenticated production dashboard visibly
shows the three-row chart, updated axis and no toolbar/footer explanation; the
balance drag handles remain. The only warning after restart was a non-fatal
startup message that the separately hosted probe release could not be found;
there were no error-level journal entries. The panel process itself uses the
released ARM64 binary hash above.

## 2026-10-12 Homepage availability matrix release

Commit `4a99e11` was pushed to the fork `main` branch and released as
`v0.2.96-kreeper-20261012-heatmap`. Actions workflow `38225056376` completed
successfully. The Linux ARM64 panel asset is an ELF with SHA-256
`870fd8e0091753388a2e78e111f8a970917399a6da69ab7281846c9f948ebb46`; release
signing is not configured, so assets are unsigned. The release builds the
embedded Vite frontend from the exact tag commit; no static `QZ_WEB_DIR` was
used.

The homepage now renders the per-server 8x6 availability matrix in the shared
flat/isometric Canvas scene, preserving the three native green/orange/red
severity colors and a separate gray missing/offline sentinel. The standard
refresh button and the desktop sidebar-collapse rules are included. The
production rollout changed only `/opt/qingzhou/qingzhou`: it was atomically
replaced and only `qingzhou.service` was restarted. Rollback material is
`/opt/qingzhou/backups/fork-v0.2.96-kreeper-20261012-heatmap-20261012-1651/`;
the SQLite Backup API snapshot `qingzhou.db.backupapi` returned
`PRAGMA integrity_check=ok`. The raw database copy and old panel binary are
also retained there.

After deployment, local and public `/api/health` returned the release version;
`qingzhou.service`, `qingzhou-sing-box.service` and `cloudflared.service` were
active; listeners `8081`, `8882`, `18082` and `19000` were present; and the
panel error journal was empty. The environment, panel unit, sing-box config and
Cloudflare Tunnel config hashes were unchanged, as were the sing-box/Tunnel
PIDs. The authenticated production monitor page visibly rendered the 3D matrix,
time/server axes and the green/orange/red/gray legend. Mobile production was
not re-certified in this rollout; the 390x844/360x800 evidence remains local
browser evidence.

## Dual-ring dashboard rollout

Production uses embedded `frontend/dist` and an explicit release version; do not
work around motion bugs by setting `QZ_WEB_DIR` or appending `Environment` under
systemd's `[Install]` section. Compare the unit against its verified backup and
preserve `qingzhou.env`. Check `systemctl show -p Environment` and the running
process environment rather than assuming that a line in the unit is effective.
Local preview binaries, diagnostic logs, screenshots and patch rejects are
ignored and excluded from the release source, while their local copies can be
retained. Retired erroneous releases must not remain the recommended version.

Circle style/motion changes are released from an isolated source archive;
only the requested view/components and their regression tests enter the application
change. The release workflow builds Vite assets before Go embedding and resolves
the selected release tag to its exact commit.

The host rollout verifies the ARM64 release checksum, creates a SQLite backup
with the backup API and checks `PRAGMA integrity_check`, and retains the old
binary, environment, service units and sing-box configuration. It atomically
replaces the panel and restarts only `qingzhou.service`; a failed local health
check restores the old binary. Acceptance compares the active binary hash,
configuration hashes and the unchanged sing-box/Tunnel process IDs, then
checks public assets and the actual desktop/mobile page modified by the release
(dashboard dual rings or homepage resource rings). Current
version, checksum, backup path and verification evidence are owned by the
[project authority](../../agent.md).

## 2026-09-30 Typography contract release

The typography contract was unified across Vue components, Go-generated HTML,
and the repository tutorial pages. The release uses four roles: display
headings (`var(--ff-heading)`), body/UI (`var(--ff-body)`), and numeric/code
content (`var(--ff-mono)`), with a bundled `Inter-Variable.ttf` covering
weights `100-900`. The release also removes local mono-stack overrides,
undefined mono variables, and negative tracking from text and numeric surfaces.

Commit `125631a` was pushed to `origin/main` and released as
`v0.2.87-kreeper-20260930-font-contract`; Actions workflow `36727439609`
completed successfully. The ARM64 panel asset SHA-256 is
`9feaafc8e0c736ac04a81972015b0aebe2fcdb1e8133d0c8025dae3c229ffc11`.
Release signing is not configured, so assets are unsigned.

Production was atomically updated at `/opt/qingzhou/qingzhou` through
`ubuntu@140.245.43.76`; only `qingzhou.service` was restarted. Rollback
material is `/opt/qingzhou/backups/fork-v0.2.87-kreeper-20260930-font-contract-20260930-222853/`
and contains the previous binary, the SQLite database plus WAL/SHM files,
environment, both systemd units and `/etc/qingzhou-sing-box`. The database and
service configuration were not overwritten; the host has no `sqlite3` CLI, so
`PRAGMA integrity_check` was not run. Local/public `/api/health` returned the
new version, all three services were active, listeners `8081`, `8882`, `18082`
were present, public HTML, hashed JS/CSS and `Inter-Variable.ttf` returned
`200`, and the post-restart `qingzhou.service` error log was empty.

## 2026-09-29 Apple soft status surfaces (released and deployed)

This visual revision changes ordinary status badges from saturated
solid backgrounds with white labels to Apple Light system colors as colored
text/icons on translucent soft surfaces: success `#34c759`, warning `#ff9500`,
error `#ff3b30`, inactive `#8e8e93`, and information blue `#007aff`.
Status-coded heatmap cells, legend dots, gauges, rings and progress fills keep
solid Apple colors for legibility. Frontend tests (100), `vue-tsc -b`, `vite
build`, and `git diff --check` pass; the known 567 KB ECharts async chunk
warning is non-blocking.

Commit `537e5be` was pushed to `origin/main` and released as
`v0.2.86-kreeper-20260929-apple-soft`; Actions workflow `36545227310`
completed successfully. The ARM64 panel asset SHA-256 is
`c9f8248dda85e86f60e838dc2ee1f1e411d02098b1200bf0d80ab2f535b26942`.
Release signing is not configured, so assets are unsigned.

Production was atomically updated at `/opt/qingzhou/qingzhou` through
`ubuntu@140.245.43.76` using `~/.ssh/oci-a1-20260730.key`; only
`qingzhou.service` was restarted. Rollback material is
`/opt/qingzhou/backups/fork-v0.2.86-kreeper-20260929-apple-soft-20260929-165909/`
and contains the old binary, database snapshot, env, service definitions and
sing-box configuration. The host has no `sqlite3` CLI, so this deployment did
not run `PRAGMA integrity_check`; the database copy remains available.
Local/public `/api/health` returned the release version, all three services
were active, listeners `8081`, `8882`, `18082` were present, public hashed JS
and CSS resources returned `200`, the public bundle contained the Apple soft
status tokens, and the post-restart `qingzhou.service` error log was empty.

## 2026-09-28 Apple status palette and monitor visual deployment

The Apple-derived status palette now covers ordinary status surfaces and
status-coded visualizations: success `#248a3d`, warning `#c93400`, error
`#d70015`, inactive `#636366`, and Apple blue `#007aff` for information.
Heatmaps, legends, gauges, quota rings, resource meters and progress
visualizations reuse the same status entry point; ordinary categorical chart
colors remain independent. Provider cards use the page surface, status/price
badges use Apple blue with white text, and numeric font styling is opt-in on
numeric nodes only.

The release gate passed 100 frontend contract tests, `vue-tsc -b`, `vite build`,
`go test ./...`, and `git diff --check`. Vite reports the known non-blocking
567 KB ECharts async chunk warning.

Commit `84b9f0e` was pushed to `origin/main` and released as
`v0.2.85-kreeper-20260928-apple-status`; Actions workflow `36406243452`
completed successfully. The ARM64 panel asset SHA-256 is
`b3347cb2fac549a1cf79e5b405617cd720619461a24c6e13a9bcd3fc4b6cce60`.
Release signing is not configured, so assets are unsigned.

Production runs the same version from `/opt/qingzhou/qingzhou`. Deployment used
`ubuntu@140.245.43.76` and `~/.ssh/oci-a1-20260730.key`; only
`qingzhou.service` was restarted. Rollback material is
`/opt/qingzhou/backups/fork-v0.2.85-kreeper-20260928-apple-status-20260928-095718/`.
The backup contains the previous binary, database copy, env, service
definitions and sing-box configuration; production data and configuration
were not replaced. Local/public `/api/health`, all three services, listeners
`8081`, `8882`, `18082`, and public hashed resources passed. The host has no
`sqlite3` CLI, so this deployment did not run `PRAGMA integrity_check`; the
database copy remains available for rollback verification.

## 2026-09-28 Admin hierarchy and node card release

Source release `v0.2.84-kreeper-20260928` contains the first-level admin
sidebar hierarchy and node card surface changes. The production rollout must
use the existing host-service path `/opt/qingzhou/qingzhou` under
`qingzhou.service`; preserve the database, environment, service definitions,
sing-box configuration and rollback backup. Verify local/public `/api/health`,
the three related services, listeners `8081`, `8882`, `18082`, the active
ARM64 binary hash and the public hashed frontend resource after restart.

The release was published from source commit `69786f0` as
`v0.2.84-kreeper-20260928`; workflow `36344618817` uploaded the ARM64 panel
asset with SHA-256
`ce4b7cde25a1d17d81a6dc0b0667767a5804a25488c61ecc0f312a08f022dc9c`.
Production deployment completed through the fixed OCI endpoint
`ubuntu@140.245.43.76` with `~/.ssh/oci-a1-20260730.key`; the `qingzhou` alias
was intentionally not used because Mihomo resolves it to Fake-IP
`198.18.1.50`. The backup is
`/opt/qingzhou/backups/fork-v0.2.84-kreeper-20260928-20260928-102819/`, and the
SQLite backup passed `PRAGMA integrity_check`. Local/public health now report
`v0.2.84-kreeper-20260928`, all three services are active, listeners `8081`,
`8882`, `18082` are present, and the public root plus hashed assets return
`200`. The panel self-updater still targets the official
`mllt992/qing-zhou` repository, so it cannot install this fork release until
the host `QZ_UPDATE_REPO` is changed through the protected host-service path.

# QingZhou Deployment and Artifact Retention

## 2026-09-26 Embedded frontend resource release

The production binary was rebuilt after the frontend build step was omitted;
without `frontend/dist`, `go:embed` had no SPA assets and the server returned
the explicit missing-frontend error. The release process is now verified as
`cd frontend && npx vite build`, followed by the Linux ARM64 Go build.

Stable source baseline: `293613b`. Production version:
`v0.2.80-kreeper-oidcfix-embedded-20260926`. Active binary SHA-256:
`8a0570b43f176a8ab9addb9b11936b3e67f565e0fd3eeb770416a9b6f2ffab58`.
Rollback material is at
`/opt/qingzhou/backups/embedded-frontend-20260926-105638/`.
Only `qingzhou.service` was restarted; database, sing-box and Cloudflare
Tunnel were not replaced.

Local and public home pages, `/api/health`, and the hashed JS/CSS assets return
`200`. Public OAuth start remains `200` with Authentik PKCE S256. All three
services are active with zero restarts.

## 2026-09-26 Authentik OIDC Issuer fix

The OAuth start path returned `502` because configuration validation removed the
trailing slash from the Issuer before `go-oidc` compared it with Authentik's
discovery `issuer`. The fix preserves the configured Issuer string (after
whitespace trimming) and adds a regression test; endpoint same-origin, HTTPS,
PKCE S256, and safe egress checks remain unchanged.

Production runs `v0.2.80-kreeper-oidcfix-20260926` with ARM64 binary SHA-256
`5b56faed2eee3af3937fcaf2c433bc7ceeb0d1846a80aaba8eb77a2b6c5d3990`.
Rollback material is at
`/opt/qingzhou/backups/oauth-issuer-fix-20260926-101438/`, and the pre-edit
database backup is `/opt/qingzhou/backups/oauth-issuer-before-20260926-095327.db`.
Only `qingzhou.service` was restarted; sing-box, Cloudflare Tunnel, and user
data were not replaced.

Local and public `/api/health` return the new version. Local and public
`POST /api/auth/oauth2/start` return `200` with an Authentik authorization URL
and a per-flow `__Host-qz_oauth_*` cookie. `qingzhou.service`,
`qingzhou-sing-box.service`, and `cloudflared.service` are active and the
expected listeners remain available.

## 2026-09-21 Edge quota and package force-sync release

Source commit `c0b46be` was built as Linux ARM64
`v0.2.80-kreeper-c0b46be` and deployed to `/opt/qingzhou/qingzhou`. The active
binary SHA-256 is
`71a013cb483e5bcea6cdcf8d2a5d4e5bd8b432e349ceaa2ccbe380ac3068e893`.
Rollback material is at
`/opt/qingzhou/backups/edge-quota-force-sync-c0b46be-20260921-025700/`; its
SQLite snapshot returned `ok` from `PRAGMA integrity_check` and includes the
previous binary, environment, service definitions and native sing-box
configuration. Only `qingzhou.service` was restarted.

Local and public `/api/health` both return `v0.2.80-kreeper-c0b46be`.
`qingzhou.service`, `qingzhou-sing-box.service` and `cloudflared.service` are
active, with `127.0.0.1:8081`, `*:8882` and `127.0.0.1:18082` listening.
The public `AdminPackages` and `UserDashboard` chunks contain the new
force-sync and Edge-quota UI, and an unauthenticated force-sync request returns
`401` without changing data.

## 2026-09-21 China return group isolation

The Clash renderer keeps `🏠🇨🇳中国-境外回国` as a real proxy but removes it
from the normal selector, fixed selector, health/fallback/load-balance groups,
and template `all` expansions. It is present only in `🇨🇳 中国节点`, whose
members remain `DIRECT` followed by the return node. This prevents a manual
choice in the ordinary foreign-node selector from routing unrelated traffic
through the domestic egress.

## 2026-09-20 China return selector default

Source `82a741e` is deployed as Linux ARM64
`v0.2.80-kreeper-82a741e` at `/opt/qingzhou/qingzhou`. The active binary
SHA-256 is `905021ee4a4756b1fccfbbbf14f4cb3542e71ec2caeb61a91e90ef212b7af544`.
The `🇨🇳 中国节点` Clash selector now follows the normal node selector and
defaults to `DIRECT`; `🏠🇨🇳中国-境外回国` remains available as the second manual
choice. Rollback material is at
`/opt/qingzhou/backups/cn-return-direct-82a741e-20260920-122438/`.

Only `qingzhou.service` was restarted. The database snapshot passed
`PRAGMA integrity_check`; `qingzhou.service`, `qingzhou-sing-box.service` and
`cloudflared.service` are active. Local and public `/api/health` return the new
version, and ports `8081`, `8882` and `18082` remain listening.

## 2026-09-20 Daily Edge quota release

Source `19b76b2` is deployed as Linux ARM64
`v0.2.80-kreeper-19b76b2` at `/opt/qingzhou/qingzhou`. The active binary
SHA-256 is `73564ab342afeab3d251dbf6d2e3ad4458b95c5b7470bc628bc5636c7312ed0b`.
Rollback material is at
`/opt/qingzhou/backups/edge-daily-19b76b2-20260920-072024/`; it includes the
previous binary, database files, environment file, systemd units and native
sing-box configuration. The panel uses the existing host-service path and only
`qingzhou.service` was restarted.

Local and public health checks return `v0.2.80-kreeper-19b76b2`. The three
related services are active and ports `8081`, `8882` and `18082` are listening.
`edge_request_limit` is now a per-UTC-day limit; `edge_usage_day` scopes the
current-day counter, while the ordinary package `duration_days/expiry_at`
continues to control the shared traffic and plan validity period.

Follow-up source `b5c4d95` fixes user/admin plan-state checks after the UTC day
changes. It is deployed as `v0.2.80-kreeper-b5c4d95` with active binary
SHA-256 `1308641fe1454701c273bdb290f088ccf1490a5277627ef8c04bf3be4e06976a`.
Rollback material is at
`/opt/qingzhou/backups/edge-daily-b5c4d95-20260920-073326/`.

## 2026-09-20 Edge usage callback configuration

QingZhou production is paired with the EdgeTunnel Pages production secrets
`EDGE_QZ_SECRET`, `EDGE_QZ_USAGE_TOKEN` and
`EDGE_QZ_USAGE_URL=https://proxy.kreeper.cc/api/internal/edge/usage`.
QingZhou uses the matching `QZ_EDGE_SECRET`, `QZ_EDGE_USAGE_TOKEN` and
`QZ_EDGE_USAGE_URL` values. The running panel version is
`v0.2.80-kreeper-68f7055`. A signed empty-batch request returned `400`, which
confirmed authentication and endpoint reachability without recording usage.

## 2026-09-20 Binary byte display correction

The decimal OCI presentation from the 2026-09-18 releases is superseded. All
frontend byte displays now use the shared `fmtBytes` formatter: divide by 1024
while retaining the existing `KB/MB/GB/TB/PB` labels. The panel's default OCI
allowance is `10_995_116_277_760` bytes (`10 × 1024^4`) and is displayed as
`10 TB`. Previously saved `10_000_000_000_000`-byte legacy defaults are
normalized automatically; explicit non-default limits are preserved.

This applies to the OCI upstream cards, the homepage server-monitor upstream
card, user plans, and other server/user traffic views. API, database, and OCI
official usage values remain raw bytes and are unchanged.

Commit `dc22079` is deployed as Linux ARM64 version
`v0.2.80-kreeper-dc22079` at `/opt/qingzhou/qingzhou`. The active binary
SHA-256 is
`975aa76a7e2e2e24ad47a8e5c940327e422c437c2778ae33eb2bef320108c4ad`.
Rollback material is at
`/opt/qingzhou/backups/binary-oci-binary-quota-dc22079-20260920-024455/`; its
SQLite snapshot passed `PRAGMA integrity_check`. Local and public health checks
return the new version, `qingzhou.service`, `qingzhou-sing-box.service`, and
`cloudflared.service` are active, ports `8081`, `8882`, and `18082` are
listening, and only `qingzhou.service` was restarted.

## 2026-09-18 Homepage OCI balance-card release

The previous decimal-unit change covered only `AdminUpstreams.vue`; the
homepage server-monitor card in `Monitor.vue` still used the binary formatter.
Commit `98b6c6b` changes only that card's OCI remaining, total, and official-used
values to the decimal formatter. Server memory, disk, network, and user-plan
traffic displays remain unchanged.

The ARM64 host binary is `v0.2.80-kreeper-98b6c6b` with SHA-256
`dbb7c8aad6e02d0dbfe0f0df9e9923e884041ab6e8270f6235a8c982af1c6d03`.
Rollback material is at
`/opt/qingzhou/backups/monitor-decimal-98b6c6b-20260918-153352/`; its SQLite
snapshot passed `PRAGMA integrity_check`. Local and public health checks report
the new version, all three related services are active, and the public
`Monitor-B_zNuhQ8.js` chunk matches the local build SHA-256
`9235ed29c60af964f3a8ab47c7b8773f7118e6e2437a9603b2fa0b031d231a55`.

## 2026-09-18 Decimal OCI allowance release

Commit `adce9e9` is deployed as Linux ARM64 version
`v0.2.80-kreeper-adce9e9` at `/opt/qingzhou/qingzhou`. The active binary
SHA-256 is
`cdfac1f71275d768c52ccff415e81221ad668971032c035b3307cdea9dd18563`.

The OCI allowance was displayed in decimal units in this historical release;
that presentation was superseded on 2026-09-20 by the shared binary formatter.
The rollback directory is
`/opt/qingzhou/backups/oci-quota-decimal-adce9e9-20260918-150019/` and contains
the old binary, a consistent SQLite snapshot, environment files, both systemd
units, and `/etc/qingzhou-sing-box`. The snapshot passed `PRAGMA integrity_check`.

Post-deploy checks passed for local and public `/api/health`, with
`qingzhou.service`, `qingzhou-sing-box.service`, and `cloudflared.service`
active; `127.0.0.1:8081`, `*:8882`, and `127.0.0.1:18082` are listening. Only
`qingzhou.service` was restarted; the database, credentials, node settings, and
sing-box service were not replaced or restarted.

OCI production is the host-service path: `/opt/qingzhou/qingzhou` under
`qingzhou.service`, with `qingzhou-sing-box.service` owning the local node on
`:8882`. Local `server_id=0` generation, reload, version probing, and traffic
collection are provided by QingZhou's official controller. The Docker Compose
file is an optional containerized deployment template and does not replace the
production service.

## Public domains and compatibility

The current QingZhou public base is `https://proxy.kreeper.cc`, stored in the
runtime database as `settings.public_base`. It is routed directly through the
OCI Cloudflare Tunnel to `127.0.0.1:8081`. The historical
`https://qz.kreeper.cc` hostname has been removed. Before the setting change, the database backup was
`/opt/qingzhou/backups/public-base-proxy-20260918-020951.db`.

The EdgeTunnel Pages domain is `https://edge.kreeper.cc`. Edge subscriptions
use that domain directly, while QingZhou subscriptions use
`https://proxy.kreeper.cc` directly. No compatibility Worker or historical
`qz` hostname is part of the production path.

The Edge user credential is a cross-runtime contract: QingZhou packs a 60-bit
user id around the UUIDv4 version/variant bits and the Worker decodes the
version nibble with base 16. Keep both implementations in lockstep before
publishing either side; a byte-multiplier mismatch routes usage to the wrong
`external_id` and leaves the user's daily counter unchanged.

The fork does not carry a custom writable `/data/probe` Docker adaptation.
Container builds use the upstream hosted-probe location `/opt/qingzhou/probe`;
the host-service production path remains independent of this container setting.

The shared retention workflow is
`/Users/hinaw/Documents/Codex/2026-09-17/oci/oci-retention-cleanup.sh`. Its normal
mode retains up to the three newest existing custom `qingzhou:kreeper-*` or
`qingzhou:rollback-*` Docker images as optional containerized rollback material;
they are never the active production artifact. When that rollback path is no
longer needed, `--purge-qingzhou` uses the same dry-run → `--apply` flow to
verify both QingZhou services, local `/api/health`, and every image/volume
container reference before deleting all `qingzhou:*` and
`ghcr.io/mllt992/qing-zhou:*` images plus the unreferenced
`qingzhou_qingzhou-data` volume. It does not run a builder prune or touch
Sub2API/website Docker resources, the host binary, `/opt/qingzhou/backups`, the
SQLite database, sing-box configuration, service definitions, or secrets.
Normal cleanup accepts zero remaining QingZhou images and an absent retired
volume; it does not recreate either resource after the dedicated purge.

Before a host-binary rollout, back up the binary, database, environment, service
definitions, and `/etc/qingzhou-sing-box`; after restart verify `/api/health`,
`qingzhou.service`, `qingzhou-sing-box.service`, `:8882`, and the active binary
hash. Rollback restores the binary and matching service/configuration material,
not a full database snapshot over newer user data.

## Remote database backup

The remote-backup feature is configured after deployment from `系统设置 → 数据备份`.
Use a dedicated Cloudflare R2 API token/key pair or equivalent S3 credentials;
do not reuse the Cloudflare DNS/ACME token. The UI saves the secret through the
encrypted `backup_s3_config` setting, tests the bucket, and can enable the
default daily `03:00` UTC schedule. Verify a manual run reaches `completed`,
has a non-empty SHA-256 and size, and appears in the configured bucket. The
service does not overwrite the active database during browser restore; recovery
remains an operator-controlled SQLite replacement using the same
`QZ_SECRET_KEY`.

The 2026-09-17 host-service rollout built source `4b65fec` as
`v0.2.80-kreeper-4b65fec`. The active binary hash is
`9b4dfec76b8523db32ce98c4a8a1fb07c6b9afabdcb489c3de559248135f66ff`, and the
rollback directory is
`/opt/qingzhou/backups/node-order-4b65fec-20260917-133155/`. Local and public
health checks passed; `127.0.0.1:8081`, `*:8882`, and `127.0.0.1:18082` were
listening, while the retired `:8881` listener was absent.

The deployed binary is `v0.2.80-kreeper-5cf18bb` with SHA-256
`73dd6afb9168c201be212b0a96ac7b087ae2b382395c38109125447cd5d95e83`; its
rollback material is `/opt/qingzhou/backups/remote-backup-5cf18bb-20260917-094324/`.
R2 credentials are not configured yet; complete the operator-side connection
test from the admin page after entering a dedicated key pair.

## Disaster recovery archive release

On 2026-09-17, commit `e75381d` was built as
`v0.2.80-kreeper-e75381d` and deployed to the host service. The active binary
SHA-256 is `d7cbee2e6acdc03a8a9f2b36862919ef2beead38a2bf0a1540aac9aad41d3fb1`;
rollback material is `/opt/qingzhou/backups/disaster-recovery-e75381d-20260917-171516/`.

The host sets `QZ_BACKUP_MANIFEST=/etc/qingzhou/recovery.json`. It is a server
allowlist for the consistent SQLite snapshot, QingZhou environment/unit files,
sing-box configuration and the current Cloudflare Tunnel configuration and
credential. The package is intentionally not additionally encrypted and may
contain secrets; only a verified private HTTPS object store is acceptable.
R2 recovery access/MFA must be held independently from the server. The saved
R2 connection test, a real `tar.gz` upload, remote download/hash/manifest
verification and `PRAGMA integrity_check` of the extracted snapshot all passed.

## Remote-only mode removal

On 2026-09-17, source commit `e876013` removed the fork-only
`QZ_SINGBOX_LOCAL` switch and restored QingZhou's official local controller
path. The change removes the custom local-disable branch, its tests, and the
environment entry; it does not remove official remote SSH server management or
the independent upstream-balance, backup, renewal, subscription-name, and node
ordering customizations. The ARM64 binary was deployed as
`v0.2.80-kreeper-e876013`.

The rollout backup is
`/opt/qingzhou/backups/remove-remote-only-e876013-20260917-230809/`. The
environment file was then cleaned of the obsolete `QZ_SINGBOX_LOCAL` line
without changing the database, secret key, service definitions, or native
sing-box configuration. Both local and public `/api/health` returned the new
version; `qingzhou.service` and `qingzhou-sing-box.service` were active and
enabled, `127.0.0.1:8081`, `*:8882`, and `127.0.0.1:18082` were listening, and
the service error journal was empty. Active binary SHA-256:
`6022692c35a91686a817f31a9aa68390633c778c0e0f8dff9c0763c52c29acc6`.
