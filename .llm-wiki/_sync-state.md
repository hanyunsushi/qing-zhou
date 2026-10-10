---
title: Current Wiki Sync State
updated: 2026-10-10
---

# Current synchronization evidence

- Source and behavior owner: [Cloudscape Visual System](modules/cloudscape-visual-system.md) and [Validation Guide](guides/validation.md). The desktop dashboard brand block and layout header now share the fixed 64px topbar height and bottom divider; the mobile drawer brand remains borderless.
- Published source commit: `c3aecf0c622f7df1263becc3d377f1021b3e556a`; release: `v0.2.95-kreeper-20261010-topbar-divider`. Deployment and rollback facts remain canonical in [project authority](../agent.md).
- Validation evidence: frontend 132/132, typecheck, Vite build, `go test ./...`, release checksum, runtime hash and public asset comparison passed. Authenticated production desktop expanded/collapsed and 390x844/360x800 checks passed without horizontal overflow; production screenshots are retained in the visualization directory. The known ECharts asynchronous chunk warning and existing dependency audit alerts remain documented in the authority.
- Scope boundary: this release changes the desktop sidebar brand/header divider only. Mobile drawer styling, navigation, typography, dual rings, homepage resource rings, renewal reminders, APIs, database and protected service configuration were not changed.

# Working-tree boundary

Concurrent uncommitted frontend and visual documentation edits remain outside this synchronization and release. The documentation follow-up stages only `_schema.md`, this scoped sync-state record, validation test count, and the divider-specific visual contract correction. The published source was verified from the isolated `c3aecf0` archive; this task does not rebuild, deploy, stage, or revert concurrent edits.
