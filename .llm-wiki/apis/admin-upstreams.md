---
title: Admin Upstreams API
updated: 2026-09-17
---

# Admin Upstreams API

All routes live in QingZhou's admin route group and require a valid administrator session. API tokens do not grant configuration access.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/upstreams` | Return OCI/Cloudflare safe configuration views, including `*_set` flags but no credentials. |
| `PUT` | `/api/admin/upstreams/{oci|cloudflare}` | Validate and encrypted-store a complete provider profile. A blank secret retains the existing one. |
| `DELETE` | `/api/admin/upstreams/{oci|cloudflare}` | Delete the encrypted provider profile. |
| `POST` | `/api/admin/upstreams/{oci|cloudflare}/refresh` | Read the stored profile and directly fetch the current official usage snapshot. |

The two providers use independent credentials and allowance configurations. Cloudflare Analytics tokens must not be mixed with the existing Cloudflare DNS/ACME token.

## Front-end presentation

The administrator monitor renders one combined `上游余额` card immediately after `面板本机`. It contains OCI and Cloudflare subcards, uses the same direct refresh routes above, refreshes on initial load and every 15 minutes while visible, and is not loaded by the public monitor page. The subcards can be dragged in the monitor and 上游管理; both views persist the normalized order under the admin setting `admin_upstream_balance_order`.

OCI refresh responses expose `query_end`, item counts, and a `warning` on successful reference calculations. `query_end` is not a provider data watermark. Consumers must inspect `success`: an empty window, absent or unrecognized transfer data, failed pagination, or unsupported units must not be rendered as zero usage or a full balance. Failure counters are diagnostic only. This response extension is locally tested and not production-verified.
