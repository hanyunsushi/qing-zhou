import postcss from 'postcss'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Only the opt-in Console build uses native CSS scopes. Standalone CSS is untouched.
export function scopeMicrofrontendCss(css, project) {
  const root = postcss.parse(css)
  const rules = []
  root.walkRules(rule => rules.push(rule))
  for (const rule of rules) {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) continue
    rule.selectors = rule.selectors.map(selector => selector
      .replace(/(^|[\s>+~,(])(?::root|html|body|#app)(?=[\s.#:[>+~),]|$)/g, '$1:scope')
      .replace(/:scope\s+:scope/g, ':scope'))
    // The Host, not each embedded page, owns the viewport scrollbar gutter.
    if (rule.selectors.includes(':scope')) {
      rule.walkDecls('padding-right', declaration => {
        if (declaration.value.includes('--scrollbar-track-width')) declaration.remove()
      })
    }
    // Root geometry belongs only to the content mount. A Teleport namespace
    // inherits tokens/type, not body's 100vh, padding or background box.
    const roots = rule.selectors.filter(selector => /^:scope[^\s>+~,]*$/.test(selector))
    if (roots.length) {
      const inherited = property => property.startsWith('--') || /^(font(?:-.+)?|color|line-height|letter-spacing|text-rendering|color-scheme|direction|-webkit-font-smoothing)$/.test(property)
      const geometry = rule.cloneBefore({ selectors: roots.map(selector => selector.replace(':scope', ':scope.console-remote-mount')) })
      geometry.walkDecls(declaration => { if (inherited(declaration.prop) || /^(?:(?:min-|max-)?(?:height|width)|display|position|inset|isolation|overflow(?:-.+)?|margin(?:-.+)?|padding(?:-.+)?)$/.test(declaration.prop)) declaration.remove() })
      if (!geometry.nodes.length) geometry.remove()
      const typography = rule.cloneBefore({ selectors: roots })
      typography.walkDecls(declaration => { if (!inherited(declaration.prop)) declaration.remove() })
      if (!typography.nodes.length) typography.remove()
      const remaining = rule.selectors.filter(selector => !roots.includes(selector))
      if (remaining.length) rule.selectors = remaining
      else rule.remove()
    }
  }
  // 组件绘制动画：body上的独立命名空间本身也是遮罩；@scope内普通选择器不命中scope root。
  root.walkRules(rule => {
    rule.selectors = rule.selectors.map(selector => selector.replace(/^\.qz-shift5-route-transition(?=[.\s:]|$)/, ':scope.qz-shift5-route-transition'))
  })
  const scope = postcss.atRule({ name: 'scope', params: `(.console-${project}-surface)` })
  const output = postcss.root()
  // Font registration is global; retain original font names and sources.
  for (const node of [...root.nodes]) {
    if (node.type === 'atrule' && /^(font-face|charset|import)$/i.test(node.name)) output.append(node)
    else scope.append(node)
  }
  output.append(scope)
  return output.toString()
}

export function microfrontendCssScopePlugin(project) {
  return {
    name: `microfrontend-css-scope-${project}`,
    apply: 'build',
    enforce: 'post',
    // Vite 5's cssCodeSplit:false emits the aggregate CSS after user
    // generateBundle hooks. Process the final files, not an incomplete bundle.
    async writeBundle(options) {
      if (!options.dir) return
      for (const filename of await readdir(options.dir, { recursive: true })) {
        if (!filename.endsWith('.css')) continue
        const file = path.join(options.dir, filename)
        const css = await readFile(file, 'utf8')
        if (!css.includes(`@scope (.console-${project}-surface)`)) {
          await writeFile(file, scopeMicrofrontendCss(css, project))
        }
      }
    },
  }
}

// Sub2API's existing Teleports keep using body when built/run independently.
export function microfrontendTeleportTransform(project) {
  return node => {
    if (node.type !== 1 || node.tag.toLowerCase() !== 'teleport') return
    for (const property of node.props) {
      if (property.type === 6 && property.name === 'to' && property.value?.content === 'body') {
        property.value.content = `#console-${project}-overlays`
      }
    }
  }
}
