import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const layout = readFileSync(new URL('../src/components/DashboardLayout.vue', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')

test('desktop brand and topbar share a stable height and divider', () => {
  assert.match(css, /--app-header-height: 64px;/)
  const brand = layout.match(/\.app-sider \.sidebar-brand \{([^}]+)\}/)?.[1]
  const header = layout.match(/\.layout-header \{([^}]+)\}/)?.[1]
  assert.ok(brand)
  assert.ok(header)
  assert.match(brand, /box-sizing: border-box;/)
  assert.match(brand, /flex: 0 0 var\(--app-header-height\);/)
  for (const rule of [brand, header]) {
    assert.match(rule, /height: var\(--app-header-height\);/)
    assert.match(rule, /border-bottom: 1px solid var\(--topbar-divider\);/)
  }
})

test('desktop divider does not add a border to the mobile drawer brand', () => {
  const sharedBrand = layout.match(/\n\.sidebar-brand \{([^}]+)\}/)?.[1]
  assert.ok(sharedBrand)
  assert.doesNotMatch(sharedBrand, /border-bottom/)
  assert.doesNotMatch(layout, /\.mobile-sidebar \.sidebar-brand \{[^}]*border-bottom/)
})
