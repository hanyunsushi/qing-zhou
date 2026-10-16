import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { parse } from '@vue/compiler-sfc'

const source = readFileSync(new URL('../src/components/TopbarHoverMenu.vue', import.meta.url), 'utf8')
const script = parse(source).descriptor.scriptSetup.content.replace(/^import .*$/gm, '').replace(/^export /gm, '')
const compiled = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.None } }).outputText.replace(/^export \{\};?$/gm, '')

function fixture(splitLabel = '点击下拉') {
  const props = { options: [], open: false, splitLabel }, watchers = [], mounted = [], disposed = [], events = [], listeners = new Map()
  const target = prefix => ({
    addEventListener: (name, fn) => listeners.set(`${prefix}:${name}`, fn),
    removeEventListener: name => listeners.delete(`${prefix}:${name}`),
  })
  const model = runInNewContext(compiled + '\n({handleTriggerEnter,openSplitHover,toggleSplitClick,handlePointerLeave,handleFocusOut,handleOutsidePointer,closeMenu,selectOption,splitMode,rootRef})', {
    defineProps: () => props, withDefaults: p => p,
    defineEmits: () => (event, key) => {
      events.push([event, key])
      if (event === 'open' || event === 'close') {
        props.open = event === 'open'
        watchers.forEach(fn => fn(props.open))
      }
    },
    ref: value => ({ value }), watch: (_get, callback) => watchers.push(callback), nextTick: async () => {},
    onMounted: fn => mounted.push(fn), onBeforeUnmount: fn => disposed.push(fn),
    window: { ...target('window'), requestAnimationFrame: () => 1, cancelAnimationFrame() {} },
    document: target('document'),
  })
  mounted.forEach(fn => fn())
  return { ...model, props, events, listeners, disposed, closeFromParent: () => { props.open = false; watchers.forEach(fn => fn(false)) } }
}

test('left hover opens, right/root hover does not; leaving hover closes', () => {
  const menu = fixture()
  menu.handleTriggerEnter()
  assert.equal(menu.props.open, false)
  menu.openSplitHover({ pointerType: 'mouse' })
  assert.equal(menu.props.open, true)
  assert.equal(menu.splitMode.value, 'hover')
  const bridge = {}
  menu.rootRef.value = { contains: target => target === bridge }
  menu.handlePointerLeave({ relatedTarget: bridge })
  assert.equal(menu.props.open, true, 'returning through the menu bridge stays inside the hover boundary')
  menu.handlePointerLeave()
  assert.equal(menu.props.open, false)
})

test('right click pins the same menu and toggles closed without hover or focus reopening', () => {
  const menu = fixture()
  menu.toggleSplitClick()
  assert.equal(menu.props.open, true)
  menu.handlePointerLeave()
  menu.openSplitHover({ pointerType: 'mouse' })
  assert.equal(menu.splitMode.value, 'click')
  menu.toggleSplitClick()
  menu.handleTriggerEnter()
  assert.equal(menu.props.open, false)
})

test('hover can hand over to click; mutual-parent closure clears a stale pinned mode', () => {
  const menu = fixture()
  menu.openSplitHover()
  menu.toggleSplitClick()
  assert.equal(menu.splitMode.value, 'click')
  menu.closeFromParent()
  assert.equal(menu.splitMode.value, null)
  menu.openSplitHover()
  menu.handlePointerLeave()
  assert.equal(menu.props.open, false)
})

test('touch does not hover-open; tap/keyboard fallback opens and outside/Escape/focus-out close', () => {
  const menu = fixture(), inside = {}
  menu.rootRef.value = { contains: node => node === inside }
  menu.openSplitHover({ pointerType: 'touch' })
  assert.equal(menu.props.open, false)
  menu.openSplitHover({ type: 'click' })
  assert.equal(menu.props.open, true)
  menu.handleOutsidePointer({ target: inside })
  assert.equal(menu.props.open, true)
  menu.handleOutsidePointer({ target: {} })
  assert.equal(menu.props.open, false)
  menu.toggleSplitClick()
  menu.closeMenu()
  assert.equal(menu.props.open, false)
  menu.toggleSplitClick()
  menu.handleFocusOut({ relatedTarget: null })
  assert.equal(menu.props.open, false)
})

test('ordinary topbar menus preserve hover/leave and selection and dispose outside listeners', () => {
  const menu = fixture('')
  menu.handleTriggerEnter()
  assert.equal(menu.props.open, true)
  menu.handlePointerLeave()
  assert.equal(menu.props.open, false)
  menu.selectOption('计算服务')
  assert.deepEqual(menu.events.at(-1), ['select', '计算服务'])
  assert.equal(menu.listeners.size, 2)
  menu.disposed.forEach(fn => fn())
  assert.equal(menu.listeners.size, 0)
})

test('split regions are sibling native buttons with keyboard focus and a single existing arrow', () => {
  const template = parse(source).descriptor.template.content
  assert.match(template, /class="topbar-split-label"[\s\S]*?@pointerenter="openSplitHover"[\s\S]*?@focus="openSplitHover"/)
  assert.match(template, /class="topbar-split-toggle"[\s\S]*?@click="toggleSplitClick"/)
  assert.match(template, /@keydown.esc="closeMenu"/)
  assert.equal((template.match(/class="topbar-trigger-chevron"/g) || []).length, 1)
  assert.doesNotMatch(template, /<svg\b/)
})
