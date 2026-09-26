---
title: Wiki Schema
updated: 2026-09-23
last_synced_commit: dbca87e
commit_policy: committed
authority_entry: ../agent.md
---

# Project Metadata

| Field | Value |
| --- | --- |
| Project Name | QingZhou Fork |
| Languages | Go, TypeScript, Vue, CSS |
| Frameworks | chi, SQLite, Vue 3, Naive UI, Vite |
| Build System | Go modules, npm scripts |
| Entry Points | `main.go`, `frontend/src/main.ts` |
| Test Framework | Go test, node:test |
| Package Manager | npm |
| Monorepo | no |

# Document Inventory

| Asset | Owner | Audience | Update Rule |
| --- | --- | --- | --- |
| `agent.md` | project authority | agents/operators | runtime, deployment, security facts change |
| `.llm-wiki/` | llm-wiki | developers | behavior, module, API facts change |
| `KREEPER-MAINTENANCE.md` | fork maintenance | operators | merge/deployment contract changes |
| `README.md` | manual | users/developers | manual update only |

# Directory Overview

- `internal/api/`: authenticated HTTP API and admin handlers.
- `internal/officialusage/`: OCI and Cloudflare official usage adapters.
- `internal/store/`: SQLite settings, encrypted secret storage, models and migrations.
- `frontend/src/`: Vue administrative interface, router and shared visual styles.

# Wiki Conventions

- Article names use kebab case and relative links.
- No credentials, private keys, concrete account IDs, database values, or deployment secrets may appear in Wiki content.
- API behavior is documented under `apis/`; reusable provider-request logic under `modules/`.
