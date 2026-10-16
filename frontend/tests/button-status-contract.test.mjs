import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { parse } from '@vue/compiler-dom'

const root = new URL('../src/', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const vueFiles = dir => readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? vueFiles(`${dir}${e.name}/`) : e.name.endsWith('.vue') ? [`${dir}${e.name}`] : [])

test('inactive tags share the same geometry and internal border radius as colored status tags', () => {
  const css = read('styles/global.css')
  const block = css.match(/\/\* 区分-状态牌：Apple[^]*?\n\}/)?.[0]
  assert.ok(block)
  assert.match(block, /\.n-tag\.n-tag--inactive-type/)
  for (const declaration of ['--n-border-radius: 6px !important;', 'border-radius: 6px !important;', 'padding: 3px 10px !important;', 'font-size: 13px !important;']) assert.ok(block.includes(declaration), declaration)
})

test('application buttons use the single highlighted arc variant while warning feedback keeps its semantic type', () => {
  const failures = []
  for (const file of vueFiles('')) {
    const src = read(file)
    const template = parseSfc(src).descriptor.template
    if (template) {
      const walk = node => {
        if (node.tag === 'n-button' && node.props.some(p => p.type === 6 && p.name === 'type' && p.value?.content === 'warning')) failures.push(file)
        for (const child of node.children || []) walk(child)
      }
      walk(parse(template.content))
    }
    for (const match of src.matchAll(/dialog\.warning\(\{([^]*?)(?=\bonPositiveClick\b|\bonNegativeClick\b|\n  \}\))/g)) {
      assert.match(match[1], /positiveButtonProps:\s*\{\s*type:\s*'primary'\s*\}/, file)
    }
  }
  assert.deepEqual(failures, [])
  assert.match(read('styles/global.css'), /\.n-dialog__action > \.n-button\.n-button--primary-type[^]*?--n-color-pressed: var\(--accent-arc-hover\)/)
  assert.doesNotMatch(read('styles/global.css'), /\.n-button\.n-button--warning-type/)
  assert.match(read('styles/global.css'), /\.n-tag\.n-tag--warning-type/)
})
