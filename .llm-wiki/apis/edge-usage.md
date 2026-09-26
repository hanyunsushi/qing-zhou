---
title: Edge Usage Callback API
updated: 2026-09-25
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
  "items": [{"external_id": "123", "usage_day": "2026-09-20", "requests": 42}]
}
```

The store inserts `batch_id` into `edge_request_batches` with a unique key.
Repeated batches are acknowledged without changing counters. Invalid source,
empty/duplicate user ids (including alternate numeric spellings of the same
positive id), non-positive counts and oversized values are rejected.

Counts are applied to the user's active plan buckets in id order. A plan's
`edge_request_limit=0` means unlimited for compatibility; a positive limit is
the daily UTC request allowance copied from the package or selected duration
option when the bucket is created. `edge_requests_used` is the current day's
counter, tagged by the internal `edge_usage_day` column and reset lazily at the
next UTC date. The normal package `duration_days/expiry_at` remains the shared
traffic and plan validity period; daily Edge exhaustion never advances a
queued plan.
The response returns `blocked_external_ids` for users whose finite active
allowance is exhausted:

```json
{"accepted": 1, "blocked_external_ids": ["123"]}
```

`usage_day` cannot be a future UTC date. Delayed callbacks for an older UTC
day remain idempotently recorded but cannot overwrite a bucket that already
stores a newer day, so out-of-order provider delivery cannot reset today's
allowance. Ingestion, dashboard/admin rollups, and per-plan views share one UTC
day snapshot per request.

`GET /api/user/dashboard`, `GET /api/user/plans` and administrator user views
expose `edge_requests` / `edge_request_limit` / `edge_requests_used` for the
panel. OCI byte usage remains a separate provider statistic.

The paired EdgeTunnel credential uses a 60-bit user-id payload split around the
UUIDv4 version nibble, reserves the RFC 4122 variant bits, and authenticates
the eight-byte big-endian id with HMAC-SHA256. The worker must multiply the
version-nibble segment by 16 when decoding it; treating it as a full byte
corrupts user ids after the low byte range. VMess protocol ids and the
`edge_user` query parameter are rewritten together; other supported Edge link
schemes carry the same query parameter.
