---
title: Validation Guide
updated: 2026-09-21
---

# Validation Guide

Run from the repository root:

```bash
go test ./...
npm --prefix frontend test
npm --prefix frontend run typecheck
npm --prefix frontend run build
git diff --check
```

## 2026-09-26 Authentik OIDC Issuer fix

The focused OAuth suite and `go test ./... -count=1` passed. The focused source
diff also passed `git diff --check`; an unrelated pre-existing trailing-space
warning remains in `frontend/src/views/AdminSingbox.vue` and was not changed.
The live OCI check confirmed Authentik discovery `200`, local/public health
`200`, and local/public OAuth start `200` with PKCE S256 authorization URLs.

## Edge quota and package force-sync release

The release gate passed `go test ./...`, the 23 front-end contract tests,
`npm run typecheck`, `npm run build`, and `git diff --check`. Source
`c0b46be` was deployed as `v0.2.80-kreeper-c0b46be`; the active ARM64 binary
hash is
`71a013cb483e5bcea6cdcf8d2a5d4e5bd8b432e349ceaa2ccbe380ac3068e893`.
The rollback SQLite snapshot at
`/opt/qingzhou/backups/edge-quota-force-sync-c0b46be-20260921-025700/` passed
`PRAGMA integrity_check`. Local/public health, all three services, and ports
`8081`, `8882`, `18082` passed. Public feature chunks were fetched and checked
for the force-sync and Edge-quota markers; the unauthenticated admin route
returned `401` as expected.

## Site branding

Brand icon coverage is exercised by the API and front-end test suites. The API
tests verify save-to-public-config round trips and reject unsupported SVG,
invalid Base64 and MIME/signature mismatches without partially writing other
settings. The front-end test verifies the basic-settings upload entry and the
shared logo/favicon/Apple touch-icon update path.

For an operator check after deployment, sign in as an administrator, open
`系统设置 → 基本设置`, upload a PNG/JPEG/WebP image no larger than 512 KiB, save,
then reload a public page and inspect the header/sidebar/login mark and browser
tab. Use `恢复默认图标` and save to verify the `/qingzhou-mark.svg` fallback.

## Site branding deployment record

On 2026-09-18, source commit `3fd12bb` was built for Linux ARM64 and deployed
as `v0.2.80-kreeper-3fd12bb`. The active binary SHA-256 is
`2339a92e8ce127064eda51634467348ea9fd3a2437e0d0b64a8be8f8402ba22d`; the
pre-release binary, environment, service definitions, sing-box configuration
and a consistent SQLite backup are retained in
`/opt/qingzhou/backups/site-brand-3fd12bb-20260918-040237/`.

After the restart, `qingzhou.service`, `qingzhou-sing-box.service` and
`cloudflared.service` were active. Both local and public `/api/health` returned
the deployed version; `127.0.0.1:8081`, `*:8882` and `127.0.0.1:18082` were
listening while retired `:8881` remained absent. Public `/api/config` contained
`brand_icon_data_uri` with the default empty value. The backup snapshot returned
`ok` from `PRAGMA integrity_check`.

The provider tests cover OCI signing (including PKCS#1 and PKCS#8 keys), OCI transfer-unit parsing, Cloudflare Pages/Workers aggregation, provider error handling, encrypted storage, credential masking, and administrator-only routing. Automatic-renewal tests cover default opt-in, line-wide switching, current-price charge/order/ledger creation, insufficient-funds retry and precedence of an already queued manual renewal. The front-end contract tests verify the page, direct refresh endpoint, sidebar order and automatic-renewal control.

## Production deployment record

On 2026-09-15, `qingzhou:kreeper-7e0f784` was loaded on the OCI host and deployed with a service-only `docker compose ... up -d --no-deps qingzhou`. The existing data volume and production environment file were preserved. Container health plus local and public `/api/health` responses verified version `v0.2.80-kreeper-7e0f784`.

The encrypted OCI profile was exercised directly inside the QingZhou container after deployment: OCI Usage API returned a successful official-usage snapshot. The Cloudflare profile remains unconfigured pending a dedicated Account Analytics Read token; do not use a Wrangler OAuth session or DNS/ACME token for this check.

## Local-node cutover record

On 2026-09-15, the production panel was moved from the Docker center-panel deployment to `/opt/qingzhou/qingzhou` under host `systemd`. The database was copied from the stopped Docker volume without changing `QZ_SECRET_KEY`; the native QingZhou inbound and TLS profile were reassigned to `server_id=0`. `qingzhou.service`, `qingzhou-sing-box.service`, and their local health/listener checks passed, with QingZhou listening on `127.0.0.1:8081`, the QingZhou inbound on `:8882`, and the stats API on `127.0.0.1:18082`.

The older EdgeTunnel-backed `sing-box.service` was stopped and archived during the cutover; `:8881` is no longer listening. The stopped Docker container was removed, while its named volume, image, and cutover backup were retained for rollback.

## Automatic-renewal deployment record

On 2026-09-16, source commit `834cd3e` was built for Linux ARM64 and deployed as `/opt/qingzhou/qingzhou`. The active binary SHA-256 is `bddb30404ce34f3aeab90843aaba49cb33f90d36c83ce1e065bb91c5dfbbe538`; the previous binary, database, environment and service definitions are backed up at `/opt/qingzhou/backups/auto-renew-20260916-105144/`. Local and public `/api/health` both reported `v0.2.80-kreeper-auto-renew-834cd3e`; `qingzhou` and `qingzhou-sing-box` were active on `127.0.0.1:8081` and `:8882`. Startup migration confirmed `user_plans.auto_renew` has SQL default `1` and all existing plan rows remained enabled.

## Draggable cards deployment record

On 2026-09-17, source commit `4b65fec` was built for Linux ARM64 and deployed as `/opt/qingzhou/qingzhou` with version `v0.2.80-kreeper-4b65fec`. The active binary SHA-256 is `9b4dfec76b8523db32ce98c4a8a1fb07c6b9afabdcb489c3de559248135f66ff`; the previous binary, database, environment, service definitions and native sing-box configuration are backed up at `/opt/qingzhou/backups/node-order-4b65fec-20260917-133155/`.

Local and public `/api/health` both returned `v0.2.80-kreeper-4b65fec`. `qingzhou.service` and `qingzhou-sing-box.service` were active and enabled, with the panel on `127.0.0.1:8081`, the native inbound on `:8882`, and the stats API on `127.0.0.1:18082`; the retired EdgeTunnel port `:8881` remained closed. No service errors were emitted during startup.

## Remote backup checks

The remote backup implementation is covered locally by:

```bash
go test ./internal/backup ./internal/api ./internal/store
npm --prefix frontend test
npm --prefix frontend run typecheck
npm --prefix frontend run build
git diff --check
```

The focused backend tests cover encrypted secret storage and redacted reads,
cron validation, successful snapshot upload and digest recording, upload
failure, concurrent-run rejection, retention deletion, recovery archive layout,
missing required source rejection and symlink rejection. The frontend source
contract tests cover the R2/S3 form, secret non-readback, schedule controls,
history actions, authenticated deletion, recovery-mode messaging and format
labels.

The deployed binary is `v0.2.80-kreeper-e75381d` with SHA-256
`d7cbee2e6acdc03a8a9f2b36862919ef2beead38a2bf0a1540aac9aad41d3fb1`.
The rollout backup is
`/opt/qingzhou/backups/disaster-recovery-e75381d-20260917-171516/`. The saved
R2 `HeadBucket` test succeeded after normalizing its Endpoint. A real recovery
archive uploaded successfully; an isolated remote download matched its recorded
SHA-256 and manifest entries, and its extracted SQLite snapshot returned `ok`
from `PRAGMA integrity_check`. Local/public health, the two QingZhou services,
Cloudflare Tunnel and expected listeners were healthy; retired `:8881` remained
absent. Administrator-page rendering was not browser-tested because the stored
administrator password was not available to the deployment process and was not
reset.
