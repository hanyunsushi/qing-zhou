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
the three newest `qingzhou:*` Docker images as containerized rollback material,
but does not treat them as the active production artifact. It never removes the
host binary, `/opt/qingzhou/backups`, `qingzhou_qingzhou-data`, the SQLite
database, sing-box configuration, service definitions, or secrets.

Before a host-binary rollout, back up the binary, database, environment, service
definitions, and `/etc/qingzhou-sing-box`; after restart verify `/api/health`,
`qingzhou.service`, `qingzhou-sing-box.service`, `:8882`, and the active binary
hash. Rollback restores the binary and matching service/configuration material,
not a full database snapshot over newer user data.
