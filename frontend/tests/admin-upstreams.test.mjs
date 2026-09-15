import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/views/AdminUpstreams.vue', import.meta.url), 'utf8')
const layout = await readFile(new URL('../src/components/DashboardLayout.vue', import.meta.url), 'utf8')
const router = await readFile(new URL('../src/router/index.ts', import.meta.url), 'utf8')

test('upstream management page keeps provider queries separate and exposes no saved credentials', () => {
  assert.match(source, /OCI Usage API/)
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
