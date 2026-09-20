---
title: User Plans API
updated: 2026-09-20
source_commit: 1083756
---

# User Plans API

All endpoints require a logged-in browser session and reject API-token authentication.

Plan packages may define `edge_request_limit`; each duration option carries its
own value. `0` means unlimited. A purchased or manually assigned plan snapshots
the selected limit into its bucket, so later package edits do not rewrite an
existing entitlement. Active plan views expose `edge_request_limit` and
`edge_requests_used`; the dashboard exposes the aggregate `edge_requests` view.

## List plans

`GET /api/user/plans` returns independently metered plan buckets and visible traffic pools. Real plan entries include `queue_key`, `status`, `duration_days` and `auto_renew`. The setting is line-wide, so live and queued entries that share a `queue_key` return the same `auto_renew` value.

## Update automatic renewal

`PUT /api/user/plans/{id}/auto-renew`

```json
{"enabled": false}
```

The endpoint returns the bucket id and the saved `auto_renew` value. The `enabled` field is required. A missing/non-positive id or malformed body returns `400`; a bucket that does not belong to the session user returns `404`; a pool/free/non-package bucket returns `400`. Changing this preference does not require an immediate sing-box rebuild because it does not change the currently granted entitlement.
