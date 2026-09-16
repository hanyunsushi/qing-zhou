---
title: Subscription Auto Renewal
updated: 2026-09-16
source_commit: 834cd3e
---

# Subscription Auto Renewal

Automatic renewal is a user opt-out feature for real subscription plans. It is stored as `user_plans.auto_renew`, defaults to `1` for new and migrated rows, and is exposed on every user-plan response as `auto_renew`.

## Renewal-line semantics

- A renewal line is identified by the plan bucket's immutable `queue_key` snapshot.
- Updating the setting changes every non-retired `kind='plan'` bucket in that line, including manually purchased queued segments.
- A newly purchased segment inherits the line's current value. A line with no prior segment starts enabled.
- Pool, free, package-less and retired buckets cannot act as a user-facing renewal control.

## Scheduler and charging

`StartQueueAdvance` runs every two minutes. Its sweep first advances manually queued plans, then calls `AutoRenewDuePlans` for active, expired, opted-in plan lines that have no queued successor. The resulting affected users are deduplicated before subscription-cache invalidation and sing-box rebuild.

The store re-reads the package inside one SQLite transaction and charges the current price for the original `duration_days`. It writes a successful order, a `point_transactions` row with `type='auto_renew'`, a fresh queued bucket and then performs the normal queue advancement. The expired old bucket is retired and the new bucket starts immediately.

No renewal is attempted when a manual queued segment already exists. Insufficient points, disabled/deleted packages, exhausted stock, removed duration options or revoked package-group access leave the toggle on and create no charge or order, so a later scheduler pass can retry after the condition changes.
