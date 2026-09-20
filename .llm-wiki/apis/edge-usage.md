---
title: Edge Usage Callback API
updated: 2026-09-20
source_commit: 1083756
---

# Edge Usage Callback API

`POST /api/internal/edge/usage` is a machine callback, not a browser/admin
session route. It requires `Authorization: Bearer $QZ_EDGE_USAGE_TOKEN`.
The token is read from the process environment and is never returned by an
API or written to the database.

```json
{
  "source": "edgetunnel",
  "batch_id": "uuid-or-opaque-id",
  "period_start": 0,
  "period_end": 0,
  "items": [{"external_id": "123", "requests": 42}]
}
```

The store inserts `batch_id` into `edge_request_batches` with a unique key.
Repeated batches are acknowledged without changing counters. Invalid source,
empty/duplicate user ids, non-positive counts and oversized values are rejected.

Counts are applied to the user's active plan buckets in id order. A plan's
`edge_request_limit=0` means unlimited for compatibility; a positive limit is
copied from the package or selected duration option when the bucket is created.
The response returns `blocked_external_ids` for users whose finite active
allowance is exhausted:

```json
{"accepted": 1, "blocked_external_ids": ["123"]}
```

`GET /api/user/dashboard`, `GET /api/user/plans` and administrator user views
expose `edge_requests` / `edge_request_limit` / `edge_requests_used` for the
panel. OCI byte usage remains a separate provider statistic.

The paired EdgeTunnel credential uses the first 48 bits of a UUID-shaped value
for the user id, reserves RFC 4122 version/variant bits, and authenticates the
eight-byte big-endian id with HMAC-SHA256. VMess protocol ids and the
`edge_user` query parameter are rewritten together; other supported Edge link
schemes carry the same query parameter.
