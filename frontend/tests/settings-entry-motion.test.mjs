import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { effectScope, nextTick, reactive, ref, watch } from 'vue'

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8')
const transpile = source => ts.transpileModule(source.replace(/^export /gm, ''), {
  compilerOptions: { target: ts.ScriptTarget.ESNext },
}).outputText
const flush = async () => { await nextTick(); await new Promise(resolve => setImmediate(resolve)) }

test('settings entry is owned by the whole route shell; only later section changes animate the main pane', async () => {
  const mounted = [], entered = [], scope = effectScope()
  const route = reactive({ name: 'admin-settings', path: '/admin/settings', fullPath: '/admin/settings?section=access' })
  const rootShell = ref('whole-application-shell')
  route.matched = [{ name: undefined }]
  const context = { route, rootShell, ref, watch, nextTick, onMounted: fn => mounted.push(fn), runShift5Enter: root => entered.push(root) }
  const source = read('../src/utils/shift5.ts')
  const hook = source.slice(source.indexOf('export function useShift5PageTransition'))
  context.useShift5PageTransition = runInNewContext(transpile(hook) + '\nuseShift5PageTransition', context)
  const app = read('../src/App.vue')
  const appHook = app.slice(app.indexOf('const authRouteNames ='), app.indexOf('const themeOverrides:'))
  scope.run(() => runInNewContext(transpile(appHook), context))
  const layout = read('../src/components/DashboardLayout.vue')
  const setup = layout.slice(layout.indexOf('const routeShell ='), layout.indexOf('const { isScrolled }'))
  const pageRoot = scope.run(() => runInNewContext(transpile(setup) + '\nrouteShell', context))
  const mainRoot = ref('settings-main')
  context.settingsMain = mainRoot
  const settings = read('../src/views/AdminSettings.vue')
  const settingsHook = settings.match(/useShift5PageTransition\(settingsMain[^\n]+/)[0]
  let settingsScope = effectScope()
  settingsScope.run(() => runInNewContext(settingsHook, context))
  pageRoot.value = 'whole-settings-page'

  mounted.forEach(fn => fn())
  assert.deepEqual(entered, ['whole-application-shell'])

  entered.length = 0
  route.fullPath = '/admin/settings?section=telegram'
  await flush()
  assert.deepEqual(entered, ['settings-main'])

  entered.length = 0
  settingsScope.stop()
  route.name = 'admin-nodes'; route.path = '/admin/nodes'; route.fullPath = '/admin/nodes'
  await flush()
  assert.deepEqual(entered, ['whole-settings-page'])

  entered.length = 0
  route.name = 'admin-settings'; route.path = '/admin/settings'; route.fullPath = '/admin/settings?section=backup'
  settingsScope = effectScope()
  settingsScope.run(() => runInNewContext(settingsHook, context))
  mounted.at(-1)()
  await flush()
  assert.deepEqual(entered, ['whole-settings-page'])
  settingsScope.stop()
  scope.stop()
})

test('initial unresolved route and later whole-shell navigation have distinct entry ownership', async () => {
  const mounted=[], entered=[], scope=effectScope()
  const route=reactive({name:undefined, matched:[]})
  const rootShell=ref('whole-shell')
  const context={route,rootShell,ref,watch,nextTick,onMounted:fn=>mounted.push(fn),runShift5Enter:root=>entered.push(root)}
  const source=read('../src/utils/shift5.ts')
  context.useShift5PageTransition=runInNewContext(transpile(source.slice(source.indexOf('export function useShift5PageTransition')))+'\nuseShift5PageTransition',context)
  const app=read('../src/App.vue'),hook=app.slice(app.indexOf('const authRouteNames ='),app.indexOf('const themeOverrides:'))
  scope.run(()=>runInNewContext(transpile(hook),context))
  mounted.forEach(fn=>fn())
  assert.deepEqual(entered,[])
  route.name='dashboard';route.matched=[{}]
  await flush();assert.deepEqual(entered,['whole-shell'])
  entered.length=0
  route.name='sub'
  await flush();assert.deepEqual(entered,[])
  route.name='monitor';route.matched=[{name:'monitor'}]
  await flush();assert.deepEqual(entered,['whole-shell'])
  entered.length=0
  route.name='dashboard';route.matched=[{}]
  await flush();assert.deepEqual(entered,['whole-shell'])
  scope.stop()
})

test('full-shell loading hides the router view in its first render while leaving the loader outside', () => {
  const app = read('../src/App.vue')
  const css = read('../src/styles/global.css')
  assert.match(app, /class="qz-shift5-page-shell" :class="\{ 'qz-shift5-full-shell-pending': \(pageLoading && \(!pageLoadingTarget \|\| pageLoadingTarget === rootShell\)\) \|\| fullShellTransitionPending \}"/)
  assert.match(app, /import \{ fullShellTransitionPending, useShift5PageTransition \} from '@\/utils\/shift5'/)
  assert.match(app, /import \{ pageLoading, pageLoadingTarget, usePageLoadingPosition \} from '@\/utils\/page-loading'/)
  assert.match(app, /<\/router-view>[\s\S]*?<PageScrollbar \/>[\s\S]*?<DotMatrixLoader v-if="pageLoading"/)
  assert.match(css, /\.qz-shift5-full-shell-pending > \* \{ visibility: hidden !important; \}/)
})

test('home monitor to dashboard is a full-shell transition even though both routes use root paths', () => {
  const router = read('../src/router/index.ts')
  assert.match(router, /const retainedLayout = from\.name !== 'monitor' && to\.name !== 'monitor'/)
  assert.match(router, /const sameDashboardShell = from\.name !== 'monitor' && to\.name !== 'monitor'/)
})

test('nested transition hooks ignore a route update consumed by the parent shell during initial mount', async () => {
  const mounted = [], entered = [], scope = effectScope()
  const route = reactive({ key: 'monitor' })
  const root = ref('dashboard-content')
  const context = { route, root, ref, watch, nextTick, onMounted: fn => mounted.push(fn), runShift5Enter: node => entered.push(node) }
  const source = read('../src/utils/shift5.ts')
  context.useShift5PageTransition = runInNewContext(transpile(source.slice(source.indexOf('export function useShift5PageTransition'))) + '\nuseShift5PageTransition', context)
  scope.run(() => context.useShift5PageTransition(root, () => route.key, () => true, false))

  route.key = 'dashboard'
  await flush()
  assert.deepEqual(entered, [])
  mounted.forEach(fn => fn())
  await flush()
  assert.deepEqual(entered, [])

  route.key = 'sub'
  await flush()
  assert.deepEqual(entered, ['dashboard-content'])
  scope.stop()
})

test('full-shell visibility lock survives loader removal until the reveal overlay takes over', () => {
  const shift = read('../src/utils/shift5.ts')
  assert.match(shift, /export const fullShellTransitionPending = ref\(false\)/)
  assert.match(shift, /fullShellTransitionPending\.value = activeScope === 'full' && !!root/)
  assert.match(shift, /const current = ensureOverlay\('revealing', host\)\s*fullShellTransitionPending\.value = false/)
  assert.match(shift, /function finish\(token: number\)[\s\S]*?fullShellTransitionPending\.value = false/)
})
