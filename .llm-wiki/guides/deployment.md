---
title: QingZhou Deployment and Artifact Retention
updated: 2026-09-17
---

# QingZhou Deployment and Artifact Retention

OCI production is the host-service path: `/opt/qingzhou/qingzhou` under
`qingzhou.service`, with `qingzhou-sing-box.service` owning the local node on
`:8882`. The Docker Compose file is an optional center-panel/remote-SSH mode and
does not replace the production service.

The shared retention workflow is
`/Users/hinaw/Documents/Codex/2026-09-17/oci/oci-retention-cleanup.sh`. It keeps
exactly the three newest custom `qingzhou:kreeper-*` or `qingzhou:rollback-*`
Docker images as containerized rollback material, but does not treat them as the
active production artifact. Other `qingzhou:*` tags and unused
official `ghcr.io/mllt992/qing-zhou:*` application tags are removed unless a
container references them. The shared cleanup also removes any other tagged image
that no container references after the active and rollback sets are protected. It never removes the
host binary, `/opt/qingzhou/backups`, `qingzhou_qingzhou-data`, the SQLite
database, sing-box configuration, service definitions, or secrets.

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
