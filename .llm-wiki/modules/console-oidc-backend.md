---
title: Console OIDC Backend
updated: 2026-10-19
sources:
  - internal/api/console_auth.go
  - internal/api/oauth.go
  - internal/api/auth.go
  - internal/api/helpers.go
  - internal/api/console_auth_test.go
---

# Independent original-site and Console authentication

`oauthConfigForRequest` returns a copy of the existing OAuth configuration. Only the exact preserved Host `console.kreeper.cc` (optionally port 443) selects `https://console.kreeper.cc/api/auth/oauth2/callback`; other hosts retain the stored original callback. Issuer, Client ID/Secret and identity bindings remain unchanged. Arbitrary Origin and forwarded-host headers cannot select a callback.

OAuth start and callback apply the same selection before hashing the configuration or exchanging the code. The state hash therefore rejects a flow crossing from the original origin into Console. Successful Console authentication returns to `/#/oauth2/callback` on the Console origin, where its existing frontend handoff selects the QingZhou application.

`authCookiePath` scopes Console `qz_token` issuance/deletion to `/api/kreeproxy/`. Original-site cookies remain at `/`. Browser-proof `__Host-` cookies remain Secure, HttpOnly, host-only and `Path=/`; the Console gateway must preserve those paths rather than rewrite every QingZhou cookie.

Append the Console callback as a Strict redirect URI in the existing Authentik Provider, keeping the original callback and client configuration. Deploy the backend together with its gateway cookie compatibility. Signed local provider tests cover both callbacks, unchanged identity/settings, browser proof, cross-origin state rejection, session scope and logout. A successful authorization start is not proof of an external login.

## See Also

- [System Overview](../architecture/overview.md)
- [Wiki Index](../_index.md)
- [Project Authority](../../agent.md)
