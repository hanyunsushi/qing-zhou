---
title: Current Wiki Sync State
updated: 2026-10-16
---

# Current synchronization evidence

Release source `34c3d3bf93570d61e6eb2d6b7605d0a9f3bf78da` and canonical `7d42361b50db392ac56b6070c156a345117de353` are synchronized through `v0.2.114-kreeper-20261016-ui-contract-sync`. Doc impact covers optional split dropdowns, button/status geometry, font metrics, folder wheel/shadows, settings and region loading, tabs/gauges, exact canonical snapshots/patterns/showcase plus publication/runtime validation. No backend/auth/API/data/configuration changes; unrelated launch/registry edits remain untouched.

209 frontend/35canonical tests, both typechecks/builds, Go tests/vet and80/54/247 audit pass; CI38887258501 and release38887263135 succeeded. Native atomic panel-only rollout used an integrity-checked online SQLite snapshot; active/Release digests and local/public health agree, node/Tunnel PIDs/configuration unchanged,12 public resources match. [Validation](guides/validation.md#v02114发布与生产验收), [module](modules/kreeper-first-design-system.md), [authority](../agent.md). Wiki links/reachability/source references/authority symlink and diff-check pass; signature/dependency/chunk/Actions caveats remain explicit.
