---
title: Validation Guide
updated: 2026-09-15
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

The provider tests cover OCI signing (including PKCS#1 and PKCS#8 keys), OCI transfer-unit parsing, Cloudflare Pages/Workers aggregation, provider error handling, encrypted storage, credential masking, and administrator-only routing. Automatic-renewal tests cover default opt-in, line-wide switching, current-price charge/order/ledger creation, insufficient-funds retry and precedence of an already queued manual renewal. The front-end contract tests verify the page, direct refresh endpoint, sidebar order and automatic-renewal control.

## Production deployment record

On 2026-09-15, `qingzhou:kreeper-7e0f784` was loaded on the OCI host and deployed with a service-only `docker compose ... up -d --no-deps qingzhou`. The existing data volume and production environment file were preserved. Container health plus local and public `/api/health` responses verified version `v0.2.80-kreeper-7e0f784`.

The encrypted OCI profile was exercised directly inside the QingZhou container after deployment: OCI Usage API returned a successful official-usage snapshot. The Cloudflare profile remains unconfigured pending a dedicated Account Analytics Read token; do not use a Wrangler OAuth session or DNS/ACME token for this check.

## Local-node cutover record

On 2026-09-15, the production panel was moved from the Docker center-panel deployment to `/opt/qingzhou/qingzhou` under host `systemd`. The database was copied from the stopped Docker volume without changing `QZ_SECRET_KEY`; the native QingZhou inbound and TLS profile were reassigned to `server_id=0`. `qingzhou.service`, `qingzhou-sing-box.service`, and their local health/listener checks passed, with QingZhou listening on `127.0.0.1:8081`, the QingZhou inbound on `:8882`, and the stats API on `127.0.0.1:18082`.

The older EdgeTunnel-backed `sing-box.service` was stopped and archived during the cutover; `:8881` is no longer listening. The stopped Docker container was removed, while its named volume, image, and cutover backup were retained for rollback.

## Automatic-renewal deployment record

On 2026-09-16, source commit `834cd3e` was built for Linux ARM64 and deployed as `/opt/qingzhou/qingzhou`. The active binary SHA-256 is `bddb30404ce34f3aeab90843aaba49cb33f90d36c83ce1e065bb91c5dfbbe538`; the previous binary, database, environment and service definitions are backed up at `/opt/qingzhou/backups/auto-renew-20260916-105144/`. Local and public `/api/health` both reported `v0.2.80-kreeper-auto-renew-834cd3e`; `qingzhou` and `qingzhou-sing-box` were active on `127.0.0.1:8081` and `:8882`. Startup migration confirmed `user_plans.auto_renew` has SQL default `1` and all existing plan rows remained enabled.
