import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/views/AdminUpstreams.vue', import.meta.url), 'utf8')
const monitor = await readFile(new URL('../src/views/Monitor.vue', import.meta.url), 'utf8')
const nodes = await readFile(new URL('../src/views/AdminNodes.vue', import.meta.url), 'utf8')
const layout = await readFile(new URL('../src/components/DashboardLayout.vue', import.meta.url), 'utf8')
const router = await readFile(new URL('../src/router/index.ts', import.meta.url), 'utf8')

test('upstream management page keeps provider queries separate and exposes no saved credentials', () => {
  assert.match(source, /OCI Usage API/)
  assert.match(source, /fmtBytes\(ociUsage\.remaining\)/)
  assert.match(source, /fmtBytes\(ociForm\.monthly_limit_bytes\)/)
  assert.match(source, /Cloudflare Analytics GraphQL/)
  assert.match(source, /\/api\/admin\/upstreams\/\$\{provider\}\/refresh/)
  assert.match(source, /private_key_set/)
  assert.match(source, /analytics_token_set/)
  assert.doesNotMatch(source, /v-model:value="ociForm\.private_key"[^>]+show-password/)
})

test('upstream management is above admin overview in operations navigation', () => {
  assert.ok(layout.indexOf("{ label: '上游管理'") < layout.indexOf("{ label: '管理概览'"))
  assert.match(router, /path: 'admin\/upstreams'/)
})

test('upstream cards persist drag order and the public monitor keeps balance data admin-only', () => {
  assert.match(source, /admin_upstream_balance_order/)
  assert.match(source, /draggable="true"/)
  assert.match(source, /handleProviderDrop/)
  assert.match(monitor, /auth\.isAdmin \? apiList<any>\('\/api\/admin\/monitor\/servers'\)/)
  assert.match(monitor, /\/api\/admin\/upstreams\/\$\{provider\}\/refresh/)
  assert.match(monitor, /handleUpstreamDrop/)
  assert.match(monitor, /fmtBytes\(item\.usage\?\.remaining \|\| 0\)/)
  assert.match(monitor, /fmtBytes\(item\.usage\.limit\)/)
  assert.match(monitor, /fmtBytes\(item\.usage\.used\)/)
})

test('node cards use drag-and-drop for the shared subscription order', () => {
  assert.match(nodes, /class="list-card node-sort-card"/)
  assert.match(nodes, /handleNodeDrop/)
  assert.match(nodes, /\/api\/admin\/nodes\/reorder/)
  assert.doesNotMatch(nodes, /前移（订阅\/列表更靠前）/)
  assert.doesNotMatch(nodes, /@click="moveNodeInGroup/)
})

test('sidebar uses the Cloudflare documentation sidebar treatment', () => {
  assert.match(layout, /\/\* 侧边栏 \*\//)
  assert.match(layout, /\.app-sider \{[\s\S]*?width: 300px;[\s\S]*?border-right: 1px solid var\(--border\);/)
  assert.match(layout, /\.sidebar-menu \{[\s\S]*?padding: 20px 16px 48px;/)
  assert.match(layout, /:deep\(\.n-menu-item-content\) \{[\s\S]*?min-height: 32px;[\s\S]*?padding: 4px 12px !important;/)
  assert.match(layout, /:deep\(\.n-menu-item-content:hover::before\),[\s\S]*?:deep\(\.n-menu-item-content--selected::before\)[\s\S]*?background: var\(--bg-soft\) !important;/)
  assert.match(layout, /:deep\(\.n-menu-item-content--selected::after\) \{ display: none; \}/)
})
