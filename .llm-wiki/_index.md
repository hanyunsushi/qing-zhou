---
title: QingZhou Fork Wiki
updated: 2026-09-17
---

[Project Authority](../agent.md)

# Architecture
- [System Overview](architecture/overview.md) - QingZhou boundaries and admin data flow.

# Modules
- [Official Usage](modules/official-usage.md) - direct OCI and Cloudflare provider adapters.
- [Subscription Auto Renewal](modules/subscription-auto-renew.md) - queued-plan renewal and charging rules.

# APIs
- [Admin Upstreams](apis/admin-upstreams.md) - configuration and usage-refresh contract.
- [Admin Remote Backups](apis/admin-backups.md) - R2/S3 configuration, scheduling, retention, and snapshot records.
- [User Plans](apis/user-plans.md) - user plan state and automatic-renewal setting.
- [Subscription Delivery](apis/subscription-delivery.md) - subscription formats and profile display-name headers.

# Guides
- [Validation](guides/validation.md) - local verification commands.
- [Deployment and Artifact Retention](guides/deployment.md) - host-service rollout, Docker rollback images, and safe cleanup.
