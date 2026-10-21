---
title: Console Microfrontend Adapter
updated: 2026-10-20
sources:
  - internal/api/console_auth.go
  - internal/api/oauth.go
  - internal/api/console_auth_test.go
  - frontend/src/runtime/
  - frontend/src/router/index.ts
  - frontend/src/App.vue
  - frontend/vite.config.ts
  - frontend/scripts/microfrontend-css-scope.mjs
---

# Kreeproxy Console adapter

This is an opt-in independent ESM build for the separate Kreeper Console Host. The standalone build, business APIs and authorization remain owned by this repository. No production deployment is implied.

`frontend/src/runtime/microfrontend.ts` exports `mount`, returning `navigate`, `dispatchTopbarAction`, `logout` and `unmount`. The context supplies `initialPath`, `onNavigate`, `onTopbarActions` and optional `onSession`/`onNavigation`. Embedded routes use memory history; the Host owns browser history and prefixes. `console-actions.ts` registers real page callbacks and action state without changing standalone page visuals.

Native CSS `@scope` contains the build stylesheet. Root typography/tokens can reach owned overlays, but viewport layout does not. The scope is a style boundary, not a security sandbox. Build-time helpers stay local to each independent repository, with no dependency on the Host source tree.

The adapter publishes a credential-free independent auth snapshot. `composables/useSidebarNavigation.ts` exports the original menu factory and descriptors; both DashboardLayout and the MFE mount consume the same complete `allMenuOptions` tree, including admin-only branches. This publication no longer depends on mounting DashboardLayout. No QingZhou page visual tokens, menu declaration or content geometry are migrated. The ordinary router keeps Hash History. Embedded DashboardLayout and public AppHeader omit navigation; App omits its own PageScrollbar. Naive UI uses a dedicated runtime style target; generated styles are scoped and its overlay containers carry the application namespace. Shift5 lookups are limited to the mounted application and overlays do not cover Host navigation. Browser branding is not overwritten in embedded mode.

`console-navigation.ts` publishes the original public `/` server monitor outside DashboardLayout. The Host sidebar shows only home while anonymous and the original permission-filtered business tree while authenticated; public Key usage/model-plaza remain search/title descriptors with `sidebar:false`. The full filtered tree remains available for search and titles. `console-topbar.ts` supplies anonymous login and registration (only when `registration_open` permits it), hides the current auth-page shortcut and supplies a dashboard action on authenticated public pages. Routes and callbacks stay in this application. `createConsoleActionBridge` merges those controls with original page actions without letting old-page cleanup clear a replacement handler or application controls. The Host keeps its fixed topbar appearance; no second child header is rendered.

Public leaves carry `public: true`; the mount adapter merges authenticated menus only with a real application session and republishes on auth/config changes. Logged-in public pages publish the same complete original menu as dashboard pages, without temporary dashboard/admin shortcuts. Logout retains public entries and does not allow trailing protected menus to restore anonymous admin navigation.

The optional `onPageLayout` callback reports `page` for resolved standalone/authentication routes and `content` for the authenticated layout, using inherited route metadata. The Host keeps its header/sidebar and removes its own extra padding/max-width only for `page`. The MFE-only `runtime/page-layout.css` maps page minimum heights to the available content height and reuses AuthPage's existing 860px single-column declarations through the named `console-page` container. Monitor also reuses its original 1080/760/380px responsive rules against this container, avoiding six cramped cards beside a retained sidebar. App supplies the actual Host content area to the optional loading-position fallback; standalone calls still center on their own viewport. Monitor markup and styling remain unchanged; AuthPage keeps its existing fields, typography and spacing while retaining its left pane across authentication modes; the standalone build never imports this adapter stylesheet.

API calls and downloads prepend `/api/kreeproxy` to their original `/api/*` path. Expired sessions navigate the child router rather than changing the global hash. Request scope aborts on unmount; Pinia, page loading, transition observers and owned overlays are disposed without logging out. Nodes, users and servers register real topbar actions; other pages retain their existing internal controls.

Build: `cd frontend && npm run build:microfrontend`. Output is `frontend/dist/microfrontend/` with public `kreeproxy-microfrontend.js` and `qingzhou-frontend.css`. Build the ordinary application first when both output sets are needed, because its clean dist build removes the nested MFE output.

Release builds may set `CONSOLE_MFE_ASSET_BASE` and `CONSOLE_MFE_OUT_DIR` to pin assets to an immutable Console version and stage output outside the default dist. The artifact verifier follows the selected output directory. Both options apply only to the MFE branch; ordinary builds retain their original paths and router. The default brand icon and the backend's built-in `/kreeproxy-brand.png` fallback resolve through Vite's asset base, so it stays in the selected release while standalone still requests `/kreeproxy-brand.png`. The [Host release guide](/Users/hinaw/console-kreeper/.llm-wiki/guides/releases.md) owns packaging, provenance, activation and rollback.

## Optional application version

The mount context accepts optional `onVersion(version: string)` and `onVersionStatus(status)`; the returned handle exposes optional `checkVersion()`. Runtime reads the original `/api/health` version through the scoped API client and publishes it while active. Version must reflect the real upstream baseline, with build/commit provenance kept separately. Missing or failed health data never rejects mounting or substitutes frontend package metadata.

An authorized check uses the original `/api/admin/update/check`, retaining backend permissions and publishing checking/current/available/error plus the original latest version. Disposed mounts cannot publish late results. The Host's independent brand button only requests this read-only check; it does not install updates or borrow another application's identity. Standalone update workflow and APIs remain QingZhou-owned. Host geometry/lifecycle details are in its [route contract](/Users/hinaw/console-kreeper/.llm-wiki/architecture/route-and-shell-contract.md#console-home-brand-links-and-application-version); release receipts and actual upstream version are recorded in [authority](../../agent.md).

## Initial project readiness

Mount resolves the real public configuration before publishing the initial action/session set. The Host stages those events and current page handlers, then commits a complete topbar presentation; it keeps the operation group hidden/inert with preserved geometry while pending. This does not change original standalone authentication or handlers.

## Independent authentication in Console

Backend compatibility is implemented in `internal/api/console_auth.go`: an exact preserved Console Host selects its additional callback without changing the stored original callback, issuer or client. Both start and callback use that request-local configuration; the existing state configuration hash binds the selected redirect. Console business-session cookies are scoped by the backend to `/api/kreeproxy/` for issuance/deletion, while `__Host-` proof cookies retain Secure, no Domain and `Path=/`. The Console gateway must remove its earlier blanket cookie-path rewrite when deploying this backend. Registration and gateway instructions are owned by the [Host OIDC guide](/Users/hinaw/console-kreeper/.llm-wiki/guides/console-oidc.md). Local signed-provider tests cover Console/original account identity, unchanged settings, cross-origin state rejection and logout scope; they do not prove production Authentik login.

Embedded memory history uses `/kreeproxy` as its href base; internal child paths remain unchanged. The original auth store now returns its pending logout request while clearing local state immediately. The returned `logout` waits for that request, then replaces the child route with `/login`. The Host serializes this with unmount and clears only this project's menu snapshot. AI tokens and QingZhou HttpOnly cookies remain independent; no token or Cookie content is sent through the Host session descriptor.

The gateway and return-route handoffs belong to the [Host route contract](/Users/hinaw/console-kreeper/.llm-wiki/architecture/route-and-shell-contract.md). Local source-built backend acceptance does not prove production credentials, TLS or external IdP success.

## See Also

- [Project Authority](../../agent.md) — current verification and production boundary.
- [Wiki Index](../_index.md)

## Stable authentication modes

`App.rootViewKey` keeps login/register/forgot-password under the same `auth` key. `router.beforeEach` targets `.auth-form-stack` for transitions within that family; AuthPage hides/inerts only this preparing stack. The original request tracker controls completion and cancellation, and the global DotMatrix is centered in the visible form region. The left description/brand never enter full-shell pending. The aside has a stable viewport height, sticky top 0 standalone or top 64px in Console, so taller registration fields do not recenter the description. Original forms, reset-on-mode-change, validation, OAuth and registration/email switches remain authoritative.

## Signed-in sidebar visibility

The Host renders the published original permission/feature-filtered business tree after this application reports an authenticated session; static groups and nested routes are retained. Confirmed anonymous sessions show only the homepage. The Host preserves the original known menu across page switches and restores only a per-tab display snapshot on reload while this application independently checks its session; topbar/body preparation does not replace navigation with a loading row. Logout immediately removes protected sidebar entries, while explicitly public descriptors remain available to search/title resolution. Login, registration and account actions stay in the topbar. This is a Host presentation change, with no modification to this adapter's existing menu computations, router guards or backend authorization.

## Authentication failure feedback

The original backend is still called through `/api/kreeproxy`. Rejected login/register/recovery/OAuth-start submissions preserve the backend error and remain on the same form; they are not treated as an expired protected-page request. Other protected 401 responses retain the existing local-session clearing/login redirect.

`AuthPage.submitError` shows a persistent error NAlert with role=alert, keeps the supplied fields for correction/retry, and clears feedback on mode change or a new submit. It does not turn a 401 into success or change account/password validation. The original NMessageProvider's `to` points to the embedded style target; otherwise Teleport to body places messages outside the native CSS scope, stripping their fixed positioning and drawing them below the visible page. Standalone provider target remains unspecified. Request/response bodies and credentials are not logged.

## Original navigation and header controls

The optional `topbarTarget` and `onHeader({ mounted, title, ready? })` context preserve one Host header. `useConsoleHeader` leaves controls in their original application Vue/router/store context and isolates cleanup by owner symbol. `useConsoleLogout` requests the existing Host session queue; independent operation retains the original logout callback. Original menu icon renderers, sanitized custom SVG, disabled/default-expansion metadata are passed with the existing permission-filtered tree.

Shared sidebar Motion distinguishes initial disclosure from later insertion, preserving stagger/close animation while avoiding invisible `closed` rows after authentication or settings arrive. The Host uses real default expansion for new groups without overriding manual collapse. The canonical design-system component/specification and its delayed-menu showcase carry the same fix.

DashboardLayout and AppHeader Teleport their existing header-right controls, preserving distinct public/dashboard management and account menus. Original business menu declarations remain authoritative; the adapter now retains their Ionicons and default expansion. QingZhou page visuals and backend authentication are unchanged.


Nested sidebar hover now receives actual li children inside SharedLayoutBg through a forwarded ul ref; the Fragment-only wrapper no longer drops injected row events. Shared source is synchronized with Host/canonical, with original business tree and animation values retained. Source snapshots/runtime coverage are updated after individual review; current production boundaries belong to Project Authority.

## Application-owned navigation lifetime

`createSidebarNavigation(isAdmin)` retains the original menu arrays, groups, icon renderers, default expanded keys and role checks. DashboardLayout consumes that shared module for its native rendering and search; `runtime/microfrontend.ts` describes the same computed tree after its original session restoration and republishes on session changes. Native template/style and business route definitions are unchanged. Public homepage refresh therefore does not depend on an authenticated layout publisher. The Host's optional preparation row is an integration concern, not a new anonymous role or backend permission. Current verification and Console-only static deployment belong to [Project Authority](../../agent.md#console首页刷新菜单修正2026-10-19).


## Persistent Host navigation presentation

Console retains the last original permission-filtered menu during content/topbar preparation and restores its per-tab descriptor/SVG display snapshot across refresh. The original application session, router guards, feature checks and backend remain authoritative; confirmed anonymous/logout retract protected entries immediately. No username, token or session credential is stored by this navigation cache. This Host presentation policy does not move auth ownership into the shell.
