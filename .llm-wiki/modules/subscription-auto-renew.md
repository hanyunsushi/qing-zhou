---
title: Subscription Auto Renewal
updated: 2026-10-10
source_commit: 834cd3e
---

# Subscription Auto Renewal

Automatic renewal is a user opt-out feature for real subscription plans. It is stored as `user_plans.auto_renew`, defaults to `1` for new and migrated rows, and is exposed on every user-plan response as `auto_renew`.

## Dashboard expiry reminders

`frontend/src/views/UserDashboard.vue` reads `auto_renew` from the existing
dashboard plan response. Within the existing seven-day reminder window, the
nearest active expiry determines the message, not another active or queued plan.
An opted-in real package plan gets an information alert explaining automatic
renewal and linking to `/sub` (订阅管理) for cancellation. A disabled or missing
preference retains the warning and `/shop` manual-renewal link.

When multiple plans share the nearest expiry, all opted-in plans get the automatic
renewal message; mixed settings report the enabled count and link to subscription
management. Pools and package-less buckets cannot promise automatic renewal.
The message reflects the saved preference, not a guarantee of a successful charge;
the scheduler and failure conditions below are unchanged.

See [User Plans API](../apis/user-plans.md) and the
[validation guide](../guides/validation.md) for response and test contracts.

## Renewal-line semantics

- A renewal line is identified by the plan bucket's immutable `queue_key` snapshot.
- Updating the setting changes every non-retired `kind='plan'` bucket in that line, including manually purchased queued segments.
- A newly purchased segment inherits the line's current value. A line with no prior segment starts enabled.
- Pool, free, package-less and retired buckets cannot act as a user-facing renewal control.

## Scheduler and charging

`StartQueueAdvance` runs every two minutes. Its sweep first advances manually queued plans, then calls `AutoRenewDuePlans` for active, expired, opted-in plan lines that have no queued successor. The resulting affected users are deduplicated before subscription-cache invalidation and sing-box rebuild.

The store re-reads the package inside one SQLite transaction and charges the current price for the original `duration_days`. It writes a successful order, a `point_transactions` row with `type='auto_renew'`, a fresh queued bucket and then performs the normal queue advancement. The expired old bucket is retired and the new bucket starts immediately.

No renewal is attempted when a manual queued segment already exists. Insufficient points, disabled/deleted packages, exhausted stock, removed duration options or revoked package-group access leave the toggle on and create no charge or order, so a later scheduler pass can retry after the condition changes.
