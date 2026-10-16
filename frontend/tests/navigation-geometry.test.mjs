import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('dropdown chevrons rotate a centered drawing inside a fixed layout box', () => {
  const css = read('src/styles/global.css')
  assert.match(css, /\.topbar-trigger-chevron \{[^}]*width: 10px;[^}]*height: 10px;[^}]*flex: 0 0 10px;[^}]*mask:[^;]+;[^}]*transform: rotate\(0deg\);/)
  assert.match(css, /\.topbar-trigger-chevron\.is-open \{ transform: rotate\(180deg\); \}/)
  assert.doesNotMatch(css, /\.topbar-trigger-chevron[^}]*translateY/)
})

test('dashboard search yields space to its intrinsic action column and icon-only controls hide arrows', () => {
  const layout = read('src/components/DashboardLayout.vue')
  assert.match(layout, /grid-template-columns: minmax\(120px, 1fr\) minmax\(0, 400px\) max-content;/)
  assert.match(layout, /\.header-search \{[^}]*min-width: 0;/)
  assert.match(layout, /\.app-shell\.mobile \.account-button :deep\(\.topbar-trigger-chevron\) \{ display: none; \}/)
})

test('secondary tabs draw their baseline in the same scrolling row as the active underline', () => {
  const css = read('src/styles/global.css')
  assert.match(css, /\.n-tabs\.route-switch-2 \.n-tabs-wrapper \{[^}]*position: relative;[^}]*min-width: 100%;/)
  assert.match(css, /\.n-tabs\.route-switch-2 \.n-tabs-wrapper::after \{[^}]*bottom: 0;/)
  assert.match(css, /\.n-tabs\.route-switch-2 \.n-tabs-nav-scroll-content \{[^}]*border-bottom: 0 !important;/)
  assert.doesNotMatch(css, /\.n-tabs\.route-switch-2 \.n-tabs-nav::after/)
  assert.doesNotMatch(css, /\.n-tabs\.route-switch-2 \.n-tabs-nav-scroll-wrapper \{[^}]*height: 40px;/)
})
