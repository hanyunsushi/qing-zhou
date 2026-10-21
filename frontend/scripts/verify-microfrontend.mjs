import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.env.CONSOLE_MFE_OUT_DIR ? pathToFileURL(path.resolve(process.env.CONSOLE_MFE_OUT_DIR) + path.sep) : new URL('../dist/microfrontend/', import.meta.url)
const css = fs.readFileSync(new URL('qingzhou-frontend.css', root), 'utf8')
if (!css.includes('@scope (.console-kreeproxy-surface)')) throw new Error('Microfrontend stylesheet is not isolated')
const entry = fs.readFileSync(new URL('kreeproxy-microfrontend.js', root), 'utf8')
if (!entry.includes('mount')) throw new Error('Public mount export is missing')
for (const filename of fs.readdirSync(root).filter(name => name.endsWith('.js'))) {
  if (fs.readFileSync(new URL(filename, root), 'utf8').includes('process.env.NODE_ENV')) throw new Error(`Unresolved browser environment in ${filename}`)
}
console.log('Kreeproxy microfrontend artifact: scoped CSS, ESM entry and browser environment verified')
