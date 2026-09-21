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
