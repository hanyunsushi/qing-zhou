import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8')
const layoutSources = await Promise.all([
  readFile(new URL('../src/views/AdminUsers.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/views/AdminUserGroups.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/views/AdminPackages.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/views/AdminUpstreams.vue', import.meta.url), 'utf8'),
])

test('shared button tokens keep destructive and ordinary actions in one geometry', () => {
  assert.match(css, /--button-height: 32px;[\s\S]*?--button-font-size: 13px;[\s\S]*?--button-line-height: 20px;[\s\S]*?--button-padding-inline: 10px;/)
  assert.match(css, /\.n-button \{[\s\S]*?height: var\(--button-height\) !important;[\s\S]*?padding: 0 var\(--button-padding-inline\) !important;[\s\S]*?font-weight: 500 !important;/)
  assert.match(css, /\.n-button\.delete-button \{[\s\S]*?height: var\(--button-height\);[\s\S]*?min-height: var\(--button-height\);[\s\S]*?padding: 0 var\(--button-padding-inline\) !important;/)
  assert.match(css, /@media \(pointer: coarse\) \{[\s\S]*?\.n-button \{ --button-height: 44px; min-width: 44px; \}/)
})

test('production operation tracks center mixed button variants', () => {
  assert.match(layoutSources[0], /\.uc-foot \{ display: flex; gap: 6px; align-items: center;/)
  assert.match(layoutSources[1], /<div class="lc-foot" style="flex-wrap:wrap;">[\s\S]*?class="delete-button"/)
  assert.match(layoutSources[2], /<div class="lc-foot" style="flex-wrap:wrap;">[\s\S]*?class="package-drag-handle"/)
  assert.match(layoutSources[3], /\.provider-actions \{ display: flex; align-items: center;/)
})
