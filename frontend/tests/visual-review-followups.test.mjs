import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8')

test('split dropdown uses wider independent segments and centers its arrow in the right segment', () => {
  const css = read('styles/global.css')
  const divider = css.match(/\.topbar-trigger-divider \{([^}]+)\}/)[1]
  assert.match(divider, /width: \.5px;/)
  assert.match(divider, /flex: 0 0 \.5px;/)
  assert.match(divider, /height: 32px;/)
  assert.match(divider, /opacity: \.22;/)
  assert.match(css, /\.topbar-split-label \{[^}]*min-width: 88px;[^}]*padding: 0 14px;/)
  assert.match(css, /\.topbar-split-toggle \{[^}]*width: 36px;[^}]*flex: 0 0 36px;[^}]*padding: 0;/)
  assert.match(css, /\.topbar-split-label,\s*\.topbar-split-toggle \{[^}]*display: grid;[^}]*place-items: center;/)
  assert.match(css, /\.topbar-split-toggle \.topbar-trigger-chevron \{ margin: 0; \}/)
  assert.match(css, /\.topbar-split-trigger > \.topbar-trigger-divider \{[^}]*margin: 0;/)
  assert.match(css, /@media \(hover: none\), \(pointer: coarse\) \{\s*\.topbar-split-trigger \{ height: 44px; \}\s*\.topbar-split-toggle \{ width: 44px; flex-basis: 44px; \}/)
  assert.match(css, /\.topbar-split-trigger \.topbar-trigger-chevron \{ transition: none; \}/)
})

test('customer and admin orders use the same rectangular status-tag geometry', () => {
  for (const file of ['UserOrders', 'AdminOrders']) {
    const source = read(`views/${file}.vue`)
    assert.match(source, /<n-tag :type="o.status === 'success' \? 'success' : 'warning'" :class="o.status === 'success' \? 'n-tag--success-type' : 'n-tag--warning-type'" :bordered="false">/)
    assert.doesNotMatch(source, /class="pill"|\.pill \{/)
    assert.match(source, /区分-状态牌/)
  }
})

test('secondary tabs reuse a single measured moving bar in the padded scroll-content coordinate system', () => {
  const css = read('styles/global.css')
  assert.match(css, /\.n-tabs\.route-switch-2 \.n-tabs-bar \{[^}]*display: block !important;[^}]*bottom: 0 !important;[^}]*height: 2px !important;/)
  assert.match(css, /transition: left \.24s cubic-bezier\(\.215,\.61,\.355,1\), max-width \.24s/)
  assert.match(css, /\.n-tabs\.route-switch-2 \.n-tabs-wrapper \{[^}]*padding-inline: 8px;[^}]*box-sizing: border-box;/)
  assert.doesNotMatch(css, /\.n-tabs\.route-switch-2 \.n-tabs-tab--active::after \{/)
})

test('resource percentages scale to the inner diameter while retaining the complete number and unit', () => {
  const gauge = read('components/ResourceGauge.vue')
  assert.match(gauge, /container-type: inline-size/)
  assert.match(gauge, /font-size: min\(13px, 16cqi\)/)
  assert.match(gauge, /\.gauge-val i \{ font-size: \.6923em/)
  assert.match(gauge, /dPercent.toFixed\(1\)/)
  assert.doesNotMatch(gauge, /\.gauge-val[^}]*overflow:\s*hidden/)
})
