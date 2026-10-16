import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import test from 'node:test'
import { parse } from '@vue/compiler-sfc'

const root = new URL('../', import.meta.url)
const read = name => readFileSync(new URL(name, root), 'utf8')
const original = read('tests/fixtures/BranchedMenu.source.vue')
const component = read('src/components/BranchedMenu.vue')
// Only the user-authorized changes: project default colors and iconless default items.
const expected = original
  .replace(/import \{\n  CursorPointer01Icon,[\s\S]*?\} from '@hugeicons\/core-free-icons';\n/, '')
  .replace(/, icon: \w+ as IconArray(?= \})/g, '')
  .replace("color: '#f5f5f5'", "color: 'var(--text)'")
  .replace("accentColor: '#f5f5f5'", "accentColor: 'var(--accent)'")
  .replace("lineColor: '#3f3f46'", "lineColor: 'var(--border)'")
const reference = parse(expected).descriptor
const actual = parse(component).descriptor
const settings = read('src/views/AdminSettings.vue')

test('source script changes are limited to project colors and iconless defaults', () => {
  assert.equal(actual.scriptSetup.content, reference.scriptSetup.content)
})
test('SVG paths and entire source template remain byte-for-byte unchanged', () => {
  assert.equal(actual.template.content, reference.template.content)
})
test('authorized source variant stays intact; only scoped stylesheet appended', () => {
  assert.ok(component.startsWith(expected))
  assert.equal(actual.styles.length, 1)
  assert.equal(actual.styles[0].src, '../styles/branched-menu.css')
  assert.equal(actual.styles[0].scoped, true)
  assert.doesNotMatch(actual.scriptSetup.content.match(/const DEFAULT_ITEMS:[\s\S]*?const PAD/)[0], /icon:/)
  for (const token of ['--text','--accent','--border']) assert.ok(component.includes(`var(${token})`))
})
test('geometry/draw/marker parameters and select/toggle events remain the source API', () => {
  for (const key of ['items','defaultOpen','defaultActive','color','accentColor','lineColor','width','rowHeight','indent','trunk','radius','lineWidth','fontSize','drawDuration','foldDuration','className']) {
    assert.match(actual.scriptSetup.content, new RegExp(`${key}\\?:`))
  }
  assert.match(component, /select: \[value: string, item:/)
  assert.match(component, /toggle: \[index: number, open: boolean\]/)
  assert.doesNotMatch(component, /modelValue|bm-progress|conic-gradient/)
})
test('original circular SVG arcs, round caps and stroke-dash animation are preserved', () => {
  assert.match(component, /A \$\{r.value\} \$\{r.value\} 0 0 0/)
  assert.match(component, /stroke-linecap:round/)
  assert.match(component, /strokeDasharray: length\(k\)/)
  assert.match(component, /strokeDashoffset: kid.value === active \? 0 : length\(k\)/)
})
test('style compilation remains local, not a global Tailwind reset', () => {
  const input = read('src/styles/branched-menu.input.css')
  const css = read('src/styles/branched-menu.css')
  assert.match(input, /@source "..\/components\/BranchedMenu.vue"/)
  assert.match(css, /stroke-dashoffset/)
  assert.match(css, /prefers-reduced-motion/)
  assert.doesNotMatch(read('src/main.ts'), /tailwind/)
  assert.ok(!existsSync(new URL('src/utils/branched-menu.ts', root)))
})
test('settings only use original public props/events; routing/search remain external', () => {
  assert.match(settings, /:default-active="activeSectionId" :default-open="settingsMenuDefaultOpen"/)
  assert.match(settings, /@select="onSettingsMenuSelect"/)
  assert.match(settings, /router.replace\(\{ query \}\)/)
  assert.match(settings, /没有匹配的设置/)
  assert.match(settings, /settingsMenuKey.value\+\+/)
})
