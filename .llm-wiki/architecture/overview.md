---
title: System Overview
updated: 2026-09-15
---

# System Overview

QingZhou is a Go/SQLite service with a Vue 3 administrative UI. Admin routes are authenticated by JWT/cookie session and `requireAdmin`; the front-end uses the unified `{code,msg,data}` API envelope.

The upstream-management flow is independent of node telemetry:

1. An administrator saves an OCI or Cloudflare profile in the Vue page.
2. `internal/api/upstreams.go` validates and serializes the profile to the `settings` table.
3. The store encrypts the whole profile at rest with `QZ_SECRET_KEY`.
4. A refresh route calls the fixed official provider API host.
5. The response returns only usage, configured allowance and derived remaining balance; no credential is serialized to the browser.

See also: [Official Usage](../modules/official-usage.md), [Admin Upstreams](../apis/admin-upstreams.md).
