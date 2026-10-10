---
title: Current Wiki Sync State
updated: 2026-10-10
---

# Current synchronization evidence

- Source and behavior owner: [Subscription Auto Renewal](modules/subscription-auto-renew.md) and [Validation Guide](guides/validation.md). The dashboard reminder now reads the existing plan `auto_renew` value: enabled real plans show the automatic renewal information message and `/sub` cancellation link; disabled or missing values retain manual renewal and `/shop`.
- Published source commit: `f87ee95c507d3091bb9b7a5ac2a5ec9a16bec33a`; release: `v0.2.94-kreeper-20261010-renewal-alert`. Deployment and rollback facts remain canonical in [project authority](../agent.md); they are not duplicated here.
- Validation evidence: frontend 130/130, typecheck, Vite build, `go test ./...`, and `git diff --check` passed. The known ECharts asynchronous chunk warning and existing dependency audit alerts remain documented in the authority.
- Browser acceptance: authenticated production showed the automatic renewal message and `/sub` link; the subscription page showed the existing 自动续订 checkbox checked, without changing the preference. Production dashboard was verified at desktop, 390x844, and 360x800: the notice wrapped, `scrollWidth === clientWidth`, and no browser console errors were recorded. Temporary QA tabs and the viewport override were cleaned up.
- Scope boundary: this release changes the dashboard reminder presentation only. Renewal scheduling, charging, subscription controls, dual rings, homepage rings, and unrelated dirty worktree edits were not changed by this task.

# Working-tree boundary

Concurrent uncommitted frontend and visual documentation edits remain outside this synchronization and release. Only `_schema.md` and this scoped sync-state record are staged for the documentation follow-up. The published source was verified from the isolated `f87ee95` archive; this task does not rebuild, deploy, stage, or revert concurrent edits.
