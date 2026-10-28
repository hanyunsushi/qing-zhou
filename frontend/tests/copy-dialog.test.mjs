import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import postcss from 'postcss'

const read = path => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8')
const css = read('styles/global.css')
const rules = postcss.parse(css)
const declarations = selector => {
  const result = {}
  rules.walkRules(rule => {
    if (rule.selector !== selector && !rule.selectors.includes(selector)) return
    rule.walkDecls(decl => { result[decl.prop] = decl.value })
  })
  return result
}

test('Dialog ghost cancel uses the shared neutral arc contract without changing autofocus', () => {
  const selector = '.n-button.n-button--default-type:where(:not(.n-button--secondary):not(.action-button)):where(:not(.n-button--ghost), .n-dialog__action > .n-button--ghost):has(> .n-button__border)'
  const base = declarations(selector)
  assert.equal(base['border-radius'], 'var(--r-control)')
  assert.equal(base['--n-border-focus'], '0 solid transparent')
  assert.equal(base['--n-border-pressed'], '0 solid transparent')
  assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':hover'))
  assert.match(read('views/UserShop.vue'), /标准默认弧边按钮 \/ 高亮弧边按钮：[\s\S]*negativeText: '取消'/)
})

test('joined copy fields share heights and preserve readonly and copy business handlers', () => {
  assert.equal(declarations('.n-input-group.copy-field')['--copy-field-height'], '44px')
  assert.match(css, /\.n-input-group\.copy-field \{ --copy-field-height: var\(--button-height\); align-items: center; isolation: isolate; \}/)
  assert.equal(declarations('.n-input-group.copy-field > .n-input')['--n-height'], 'var(--copy-field-height)')
  assert.equal(declarations('.n-input-group.copy-field > .n-button').height, 'var(--copy-field-height)')
  assert.match(read('views/UserSub.vue'), /<n-input :value="selectedSubscriptionURL" readonly[^>]*\/>\s*<n-button type="primary" @click="copy\(selectedSubscriptionURL\)">复制/)
})

test('copy button hover and press change colors only with a fixed keyboard focus cue', () => {
  const base = declarations('.n-input-group.copy-field > .n-button')
  assert.equal(base['--n-color-pressed'], 'var(--n-color-hover)')
  assert.equal(base['--n-border-pressed'], 'var(--n-border-hover)')
  assert.equal(base['--n-text-color-pressed'], 'var(--n-text-color-hover)')
  assert.equal(declarations('.n-input-group.copy-field').isolation, 'isolate')
  assert.equal(base['z-index'], '1')
  const states = declarations('.n-input-group.copy-field > .n-button,\n.n-input-group.copy-field > .n-button:is(.n-button--default-type, .n-button--primary-type):not(.n-button--disabled):is(:hover, :focus, :focus-visible, :active, .n-button--pressed)')
  assert.equal(states.transform, 'none')
  assert.equal(states['box-shadow'], 'none')
  assert.doesNotMatch(states.transition, /box-shadow|transform/)
  assert.match(css, /\.n-input-group\.copy-field > \.n-button > :is\(\.n-button__border, \.n-button__state-border\) \{ box-shadow: none !important; transition: border-color var\(--button-hover-duration\) var\(--button-hover-easing\) !important; \}/)
  const focus = declarations('.n-input-group.copy-field > .n-button:not(.n-button--disabled):focus-visible')
  assert.equal(focus.outline, '2px solid var(--copy-focus-color)')
  assert.equal(focus['outline-offset'], '-3px')
  assert.equal(base['--copy-focus-color'], 'var(--accent)')
  assert.equal(declarations('.n-input-group.copy-field > .n-button.n-button--primary-type')['--copy-focus-color'], '#fff')
})
