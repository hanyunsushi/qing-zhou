import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { scopeMicrofrontendCss } from '../scripts/microfrontend-css-scope.mjs'
import { consolePublicNavigation } from '../src/runtime/console-navigation.ts'
import { consoleTopbarActions } from '../src/runtime/console-topbar.ts'
import { createConsoleActionBridge } from '../src/runtime/console-actions.ts'

test('side navigation contains business pages; authentication actions follow route, session and registration', () => {
  assert.deepEqual(consolePublicNavigation().map(item => item.path), ['/'])
  const paths = []
  const options = { authenticated: false, registrationOpen: true, path: '/', publicPage: true, navigate: path => paths.push(path) }
  const actions = consoleTopbarActions(options)
  assert.deepEqual(actions.map(item => item.label), ['登录', '注册'])
  actions.forEach(item => item.run())
  assert.deepEqual(paths, ['/login', '/register'])
  assert.deepEqual(consoleTopbarActions({ ...options, path: '/login' }).map(item => item.label), ['注册'])
  assert.deepEqual(consoleTopbarActions({ ...options, registrationOpen: false }).map(item => item.label), ['登录'])
  assert.deepEqual(consoleTopbarActions({ ...options, authenticated: true }).map(item => item.label), ['控制台'])
  assert.deepEqual(consoleTopbarActions({ ...options, authenticated: true, publicPage: false }), [])
})

test('page action replacement and delayed unregister preserve application controls and busy state', () => {
  let authenticated = false, published = [], called = []
  const bridge = createConsoleActionBridge(() => authenticated ? [] : [{ key: 'login', label: '登录', run: () => called.push('login') }], items => { published = items })
  const old = bridge.register(key => called.push('old:' + key))
  bridge.setActions([{ key: 'refresh', label: '刷新' }])
  bridge.dispatch('refresh'); bridge.dispatch('login')
  const current = bridge.register(key => called.push('new:' + key))
  bridge.setActions([{ key: 'create', label: '创建', loading: true }])
  old()
  assert.deepEqual(published.map(item => item.key), ['create', 'login'])
  bridge.dispatch('refresh'); bridge.dispatch('create')
  bridge.setActions([{ key: 'create', label: '创建' }]); bridge.dispatch('create')
  assert.deepEqual(called, ['old:refresh', 'login', 'new:create'])
  current(); assert.deepEqual(published.map(item => item.key), ['login'])
  authenticated = true; bridge.update(); bridge.dispatch('login')
  assert.deepEqual(published, [])
  assert.equal(called.length, 3)
})

test('Console CSS is scoped including root selectors and overlays, without rewriting Naive classes', () => {
  const css = scopeMicrofrontendCss(':root{--text:black}body{padding-right:var(--scrollbar-track-width)}.n-modal,.page{color:red}@media(max-width:768px){body{margin:0}}@keyframes pulse{to{opacity:0}}', 'kreeproxy')
  assert.match(css, /@scope \(\.console-kreeproxy-surface\)/)
  assert.match(css, /:scope\{--text:black\}/)
  assert.doesNotMatch(css, /padding-right/)
  assert.match(css, /\.n-modal,\.page/)
  assert.match(css, /@keyframes pulse\{to\{opacity:0\}\}/)
})

test('standalone and embedded history/chrome boundaries remain opt-in', () => {
  const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  assert.match(read('src/router/index.ts'), /embedded \? createMemoryHistory\('\/kreeproxy'\) : createWebHashHistory\(\)/)
  assert.match(read('src/App.vue'), /<PageScrollbar v-if="!embedded"/)
  assert.match(read('src/components/DashboardLayout.vue'), /<Teleport :to="topbarTarget/)
  assert.match(read('src/components/DashboardLayout.vue'), /v-if="!embedded \|\| topbarTarget"/)
  assert.match(read('src/runtime/microfrontend.ts'), /observer.disconnect\(\)/)
  assert.match(read('src/runtime/microfrontend.ts'), /disposePinia\(pinia\)/)
  assert.match(read('src/runtime/microfrontend.ts'), /context.onTopbarActions/)
})

test('the transition namespace remains a fixed overlay at the scope root', () => {
  const css = scopeMicrofrontendCss('.qz-shift5-route-transition{position:fixed!important;inset:0!important}.qz-shift5-route-transition.is-content{inset:auto!important}', 'kreeproxy')
  assert.match(css, /:scope\.qz-shift5-route-transition\{position:fixed!important;inset:0!important\}/)
  assert.match(css, /:scope\.qz-shift5-route-transition\.is-content\{inset:auto!important\}/)
})
