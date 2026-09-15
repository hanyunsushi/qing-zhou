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

The provider tests cover OCI signing (including PKCS#1 and PKCS#8 keys), OCI transfer-unit parsing, Cloudflare Pages/Workers aggregation, provider error handling, encrypted storage, credential masking, and administrator-only routing. The front-end contract test verifies the page, direct refresh endpoint and sidebar order.

## Production deployment record

On 2026-09-15, `qingzhou:kreeper-7e0f784` was loaded on the OCI host and deployed with a service-only `docker compose ... up -d --no-deps qingzhou`. The existing data volume and production environment file were preserved. Container health plus local and public `/api/health` responses verified version `v0.2.80-kreeper-7e0f784`.

The encrypted OCI profile was exercised directly inside the QingZhou container after deployment: OCI Usage API returned a successful official-usage snapshot. The Cloudflare profile remains unconfigured pending a dedicated Account Analytics Read token; do not use a Wrangler OAuth session or DNS/ACME token for this check.

## Local-node cutover record

On 2026-09-15, the production panel was moved from the Docker center-panel deployment to `/opt/qingzhou/qingzhou` under host `systemd`. The database was copied from the stopped Docker volume without changing `QZ_SECRET_KEY`; the native QingZhou inbound and TLS profile were reassigned to `server_id=0`. `qingzhou.service`, `qingzhou-sing-box.service`, and their local health/listener checks passed, with QingZhou listening on `127.0.0.1:8081`, the QingZhou inbound on `:8882`, and the stats API on `127.0.0.1:18082`.

The older EdgeTunnel-backed `sing-box.service` remains active on `:8881` because the current EdgeTunnel Worker subscription still advertises that endpoint. The stopped Docker container was removed, while its named volume, image, and cutover backup were retained for rollback.
