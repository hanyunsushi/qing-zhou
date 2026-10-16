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
  const context = { route, ref, watch, nextTick, onMounted: fn => mounted.push(fn), runShift5Enter: root => entered.push(root) }
  const source = read('../src/utils/shift5.ts')
  const hook = source.slice(source.indexOf('export function useShift5PageTransition'))
  context.useShift5PageTransition = runInNewContext(transpile(hook) + '\nuseShift5PageTransition', context)
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
  assert.deepEqual(entered, ['whole-settings-page'])

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
