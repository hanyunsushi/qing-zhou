// 二级侧边栏：只编译附件原模板使用的Tailwind类，生成的CSS由Vue scoped隔离。
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createRequire } from 'node:module'
import { compile } from 'tailwindcss'
const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = await readFile(path.join(root, 'src/components/BranchedMenu.vue'), 'utf8')
const input = path.join(root, 'src/styles/branched-menu.input.css')
const compiler = await compile(await readFile(input, 'utf8'), {
  base: path.dirname(input),
  loadStylesheet: async (id, base) => {
    const file = require.resolve(id, { paths: [base] })
    return { path: file, base: path.dirname(file), content: await readFile(file, 'utf8') }
  },
})
const candidates = [...new Set([...source.matchAll(/\bclass="([^"]+)"/g)].flatMap(match => match[1].split(/\s+/)))]
await writeFile(path.join(root, 'src/styles/branched-menu.css'), compiler.build(candidates))
console.log('Compiled original BranchedMenu utilities (scoped stylesheet).')
