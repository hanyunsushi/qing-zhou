---
title: QingZhou Deployment and Artifact Retention
updated: 2026-09-17
---

# QingZhou Deployment and Artifact Retention

OCI production is the host-service path: `/opt/qingzhou/qingzhou` under
`qingzhou.service`, with `qingzhou-sing-box.service` owning the local node on
`:8882`. Local `server_id=0` generation, reload, version probing, and traffic
collection are provided by QingZhou's official controller. The Docker Compose
file is an optional containerized deployment template and does not replace the
production service.

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
