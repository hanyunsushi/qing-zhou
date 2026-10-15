import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { ref, computed } from 'vue'
import { createServer } from 'vite'

const source = readFileSync(new URL('../src/views/UserShop.vue', import.meta.url), 'utf8')
const folder = readFileSync(new URL('../src/components/GlassFolder.vue', import.meta.url), 'utf8')
let server, art
before(async () => {
  server = await createServer({ configFile: false, root: process.cwd(), server: { middlewareMode: true, watch: null }, optimizeDeps: { noDiscovery: true } })
  art = await server.ssrLoadModule('/src/utils/folder-art.ts')
})
after(async () => { await server?.close() })
function model(packages, points = 100) {
  let confirmation, attempts = [], failures = 0
  const body = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
  const compiled = ts.transpileModule(body, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
  const result = runInNewContext(compiled + '\n;({loadPackages,planFiles,trafficFiles,otherPackages,activeFolder,activeFolderPackages,setFolder,selectPackage,selectedPackage,chosenDays,canAfford,handleBuy,purchaseWithRetry,willQueue,heldActiveQueues,buying})', {
    ref, computed, nextTick: fn => fn(), onMounted() {}, useAuthStore: () => ({ user: { points }, async fetchMe() {} }),
    useMessage: () => ({ success() {}, error() {} }), useDialog: () => ({ warning(options) { confirmation = options } }),
    apiList: async path => path === '/api/user/packages' ? packages : [],
    apiPost: async (_path, data) => { attempts.push(data); if (failures-- > 0) throw new Error('network unavailable'); return {} },
    fmtTotal: bytes => String(bytes), yuan: points => String(points), crypto: { randomUUID: () => 'fixture-intent' },
  })
  return { ...result, confirmation: () => confirmation, attempts, failOnce() { failures = 1 } }
}
const pkg = (id, type = 'plan', extra = {}) => ({ id, name: `套餐${id}`, type, stock: -1, duration_days: 30, price_points: 10, traffic_bytes: 1024, ...extra })

test('shop folders retain all products, distinguish types and keep unknown entries visible', async () => {
  const m = model([pkg(1), pkg(2), pkg(3), pkg(4), pkg(5), pkg(6, 'traffic'), pkg(7, 'legacy')])
  await m.loadPackages()
  assert.equal(m.planFiles.value.length, 5)
  assert.equal(m.trafficFiles.value[0].id, 6)
  assert.equal(m.otherPackages.value[0].id, 7)
  m.setFolder('plan', true)
  assert.equal(m.activeFolder.value, 'plan')
  assert.equal(m.activeFolderPackages.value.length, 5)
  m.setFolder('traffic', true)
  assert.equal(m.activeFolder.value, 'traffic')
  assert.equal(m.activeFolderPackages.value.length, 1)
  m.selectPackage(1)
  assert.equal(m.selectedPackage.value.name, '套餐1')
  assert.equal(m.attempts.length, 0)
})
test('duration selection updates the real folder price, preserving stock and affordability', async () => {
  const m = model([pkg(1, 'plan', { options: [{ days: 30, price_points: 10 }, { days: 90, price_points: 150 }] }), pkg(2, 'traffic', { stock: 0 })])
  await m.loadPackages()
  assert.equal(m.planFiles.value[0].meta, '10 积分')
  m.chosenDays.value[1] = 90
  assert.equal(m.planFiles.value[0].meta, '150 积分')
  assert.equal(m.planFiles.value[0].value, 150)
  assert.equal(m.planFiles.value[0].unit, '积分')
  m.selectPackage(1)
  assert.equal(m.canAfford(m.selectedPackage.value), false)
  assert.equal(m.trafficFiles.value[0].meta, '已售罄')
  assert.equal(m.trafficFiles.value[0].value, undefined)
})
test('purchase still requires confirmation and preserves duration, queue copy and idempotent retry', async () => {
  const m = model([pkg(1, 'plan', { options: [{ days: 90, price_points: 10 }] })])
  await m.loadPackages(); m.selectPackage(1)
  m.heldActiveQueues.value.add('pkg:1')
  m.handleBuy(m.selectedPackage.value)
  assert.match(m.confirmation().content, /将排队/)
  assert.equal(m.confirmation().negativeText, '取消')
  assert.equal(m.attempts.length, 0)
  m.failOnce(); await m.confirmation().onPositiveClick()
  assert.equal(m.attempts.length, 2)
  assert.equal(m.attempts[0].duration_days, 90)
  assert.equal(m.attempts[0].idempotency_key, m.attempts[1].idempotency_key)
  assert.equal(m.buying.value, null)
})
test('glass folders preserve source geometry and exclude closed sheets from keyboard navigation', () => {
  assert.match(folder, /props.files.slice\(Math.min\(previewStart.value, maxPreviewStart.value\)/)
  assert.doesNotMatch(folder, /v-for="file in files"/)
  assert.match(folder, /class="gf-files" :inert="!open"/)
  assert.match(folder, /function wheelPreview\(event: WheelEvent\)/)
  assert.match(folder, /class="gf-interaction"/)
  assert.match(folder, /pointer-events: none;/)
  assert.doesNotMatch(folder, /class="gf-root"[^>]*@wheel=/)
  assert.match(folder, /event\.preventDefault\(\)/)
  assert.match(folder, /props.files.length <= 4/)
  assert.match(folder, /--gf-hinge: -11deg; --gf-lift: -34px/)
  assert.match(folder, /\.gf-root:not\(\[data-open\]\):has\(\.gf-interaction:hover\)/)
  assert.match(folder, /--gf-hinge: -24deg; --gf-lift: -96px/)
  assert.match(folder, /backdrop-filter: blur\(22px\) saturate\(1\.5\)/)
  assert.match(folder, /ResizeObserver/)
  assert.match(folder, /prefers-reduced-motion: reduce/)
  assert.doesNotMatch(source, /onAdd|Untitled/)
})
test('attachment artwork remains deterministic and produces nonblank RGBA across presets', () => {
  for (const recipe of Object.values(art.ART_PRESETS)) {
    const a = art.createArtJob(64, 48, recipe, 3), b = art.createArtJob(64, 48, recipe, 3)
    while (!a.step(4)) {} while (!b.step(4)) {}
    assert.deepEqual(a.pixels, b.pixels)
    assert.ok(new Set(a.pixels).size > 30)
    assert.equal(a.pixels[3], 255)
  }
  assert.equal(art.fanSlot(0, 4), -1)
  assert.equal(art.fanSlot(3, 4), 1)
  assert.equal(art.fanSlot(0, 1), 0)
})
