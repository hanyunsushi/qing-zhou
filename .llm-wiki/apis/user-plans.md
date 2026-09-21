---
title: User Plans API
updated: 2026-09-21
source_commit: working-tree
---

# User Plans API

All endpoints require a logged-in browser session and reject API-token authentication.

Plan packages may define `edge_request_limit` as a daily UTC Edge request limit;
each duration option carries its own daily value. `0` means unlimited. A
purchased or manually assigned plan snapshots the selected limit into its
bucket, so later package edits do not rewrite an existing entitlement. Active
plan views expose `edge_request_limit` and the current-day `edge_requests_used`;
the dashboard exposes the aggregate `edge_requests` view. The ordinary package
`duration_days/expiry_at` remains the shared traffic and plan validity period.

The user dashboard's `流量用量` card renders the aggregate `edge_requests` view
as a separate current-UTC-day Edge quota meter; it does not change traffic
accounting.

## Force-sync package entitlements

`POST /api/admin/packages/force-sync` is an administrator-only destructive
maintenance action. After confirmation, every non-retired plan bucket whose
package still exists is copied from the current package definition. For
multi-duration packages, the bucket's existing duration is matched to the
current option and falls back to the first option if that duration was removed.
Traffic usage and current-day Edge request counters are reset to zero; order
history, points, expiry, queue state and historical usage reports are retained.
The response reports affected users and buckets, and the API schedules the
normal sing-box rebuild/link-cache invalidation for affected users.

## List plans

`GET /api/user/plans` returns independently metered plan buckets and visible traffic pools. Real plan entries include `queue_key`, `status`, `duration_days` and `auto_renew`. The setting is line-wide, so live and queued entries that share a `queue_key` return the same `auto_renew` value.

## Update automatic renewal

`PUT /api/user/plans/{id}/auto-renew`

```json
{"enabled": false}
```

The endpoint returns the bucket id and the saved `auto_renew` value. The `enabled` field is required. A missing/non-positive id or malformed body returns `400`; a bucket that does not belong to the session user returns `404`; a pool/free/non-package bucket returns `400`. Changing this preference does not require an immediate sing-box rebuild because it does not change the currently granted entitlement.
