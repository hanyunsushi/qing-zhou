---
title: QingZhou Deployment and Artifact Retention
updated: 2026-09-20
---

# QingZhou Deployment and Artifact Retention

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
