---
title: Admin Site Settings
updated: 2026-09-18
---

# Admin Site Settings

`系统设置 → 基本设置` is saved through the administrator-only settings API.
The public `GET /api/config` bootstrap response exposes only the values the
browser needs before login, including the site name and optional branding image.

| Route | Purpose |
| --- | --- |
| `PUT /api/admin/settings` | Persist administrator-managed settings after validating the complete submitted payload. |
| `GET /api/config` | Return public bootstrap configuration, including `site_name` and `brand_icon_data_uri`. |

## Brand icon contract

The `brand_icon_data_uri` setting is optional. An empty value restores the
built-in `/qingzhou-mark.svg`; it never changes any credentials or node
configuration.

- The administrator UI places `修改图标` next to `站点名称`, provides a preview,
  and accepts PNG, JPEG and WebP uploads up to 512 KiB.
- The server performs the authoritative validation before writing any setting:
  it accepts only canonical Base64 image data URIs, enforces the same 512 KiB
  decoded limit, and verifies the matching PNG/JPEG/WebP file signature.
- SVG and arbitrary data URIs are rejected to keep scriptable image content out
  of the public configuration path.
- Invalid icon input rejects the whole settings request, preventing partial
  writes such as changing the site name while leaving a rejected icon behind.

The shared client configuration store applies the accepted image to the panel
logo, browser tab favicon, `shortcut icon` and `apple-touch-icon`; it also keeps
the document title aligned with the saved site name. This is public branding
data, not a secret: administrators should not upload private material.

## See Also

- [System Overview](../architecture/overview.md)
- [Validation Guide](../guides/validation.md)
