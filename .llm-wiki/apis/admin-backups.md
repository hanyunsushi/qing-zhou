---
title: Admin Remote Backups API
updated: 2026-09-17
---

# Admin Remote Backups API

All routes require the existing administrator session and `requireAdmin`; API
tokens do not grant backup configuration access. The feature stores a SQLite
 consistency snapshot in an S3-compatible object store such as Cloudflare R2.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/backups/config` | Return safe object-store configuration, a configured flag and server-controlled recovery mode; never return `SecretAccessKey`. |
| `PUT` | `/api/admin/backups/config` | Validate and encrypt the R2/S3 profile; an empty secret keeps the existing secret. |
| `POST` | `/api/admin/backups/config/test` | Test the supplied profile, or the stored profile when the secret is omitted. |
| `GET` | `/api/admin/backups/schedule` | Return cron, enabled state, and retention defaults. |
| `PUT` | `/api/admin/backups/schedule` | Validate and persist the cron/retention policy and reload the scheduler. |
| `POST` | `/api/admin/backups` | Start one asynchronous remote backup and return its pending record. |
| `GET` | `/api/admin/backups` | List local metadata records sorted newest first. |
| `GET` | `/api/admin/backups/{id}/download-url` | Return a one-hour presigned URL for a completed object. |
| `DELETE` | `/api/admin/backups/{id}` | Delete both the remote object and its local metadata record. |

## Snapshot and retention

The worker uses `Store.BackupTo`, which runs SQLite `VACUUM INTO` beside the
active database. This captures committed WAL data as one self-contained `.db`
file while normal reads and writes continue. The temporary snapshot is removed
after upload. Each completed record keeps the object key, byte size, SHA-256,
trigger source, and timestamps; backup content is never stored in the settings
table.

The default schedule is `0 3 * * *`, with 14 days and 10 completed files
retained. A zero retention value disables that respective limit. Failed deletes
are kept in the local record list so an object-store outage does not silently
forget remote data. The feature deliberately does not expose browser-driven
restore, avoiding accidental overwrite of the production SQLite database.

When `QZ_BACKUP_MANIFEST` names a valid server-controlled JSON allowlist, the
same snapshot is packed as a `.tar.gz` recovery package with selected runtime
files, per-file hashes/permissions, version metadata and a Chinese recovery
guide. Required missing paths, symlinks/special files, direct online database
paths and archive size/count limits fail closed. The package has **no additional
client-side encryption**: it may contain environment secrets or private files,
so operators must use a verified private HTTPS object store and keep access/MFA
recovery material independent of the server. The browser never supplies file
paths and never exposes archive contents.

Records carry `format=sqlite` for legacy database-only uploads and `format=tar.gz`
for recovery packages. This keeps existing database objects downloadable and
deletable after disaster recovery mode is enabled.

The `backup_s3_config` setting is included in the store's encrypted-setting
allowlist and is protected by `QZ_SECRET_KEY`. Secrets must not appear in logs,
API responses, frontend readback, Wiki pages, or Git.
