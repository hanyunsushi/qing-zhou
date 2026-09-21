import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const frontendRoot = new URL('..', import.meta.url)
const read = (path) => readFileSync(new URL(path, frontendRoot), 'utf8')

test('Cloudscape visual tokens keep the existing Vue component system', () => {
  const globalCss = read('src/styles/global.css')
  const app = read('src/App.vue')

  for (const token of ['--accent: #0972d3', '--success: #037f0c', '--danger: #d91515', '--chart-1: #688ae8', '--chart-8: #096f64']) {
    assert.match(globalCss, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  assert.match(app, /primaryColor: '#0972d3'/)
  assert.match(app, /fontFamily: '"Amazon Ember"/)
  assert.doesNotMatch(app, /@cloudscape-design\/components/)
})

test('Cloudscape chart palette is applied to representative user and admin charts', () => {
  for (const path of ['src/views/AdminOverview.vue', 'src/components/AdminUsageReport.vue', 'src/views/UserPoints.vue', 'src/views/UserOrders.vue']) {
    const source = read(path)
    assert.match(source, /#688ae8/)
    assert.match(source, /#2ea597/)
    assert.match(source, /#c33d69/)
    assert.match(source, /#dedee3/)
  }
})

test('monitor summary cards use the Sub2API channel-card hover contract', () => {
  const source = read('src/views/Monitor.vue')
  assert.match(source, /\.summary-card \{[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease; transform: none; opacity: 1;/)
  assert.match(source, /\.summary-card:hover, \.summary-card:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
  assert.match(source, /Sub2API 渠道状态卡片合同/)
})
