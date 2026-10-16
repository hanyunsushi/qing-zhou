import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const css = readFileSync(new URL('src/styles/global.css', root), 'utf8')
function capRatio(buffer) {
  const tables = new Map()
  for (let i = 0; i < buffer.readUInt16BE(4); i++) {
    const start = 12 + 16 * i
    tables.set(buffer.toString('ascii', start, start + 4), buffer.readUInt32BE(start + 8))
  }
  return buffer.readInt16BE(tables.get('OS/2') + 88) / buffer.readUInt16BE(tables.get('head') + 18)
}

function lineMetrics(buffer) {
  let head, hhea
  for (let i = 0; i < buffer.readUInt16BE(4); i++) {
    const start = 12 + 16 * i
    const name = buffer.toString('ascii', start, start + 4)
    if (name === 'head') head = buffer.readUInt32BE(start + 8)
    if (name === 'hhea') hhea = buffer.readUInt32BE(start + 8)
  }
  const em = buffer.readUInt16BE(head + 18)
  return { ascent: buffer.readInt16BE(hhea + 4) / em, descent: -buffer.readInt16BE(hhea + 6) / em }
}

test('numeric font faces share body ascent/descent after optical scaling so mixed text keeps its baseline and line height', () => {
  const body = lineMetrics(readFileSync(new URL('public/fonts/inter/Inter-Variable.ttf', root)))
  const faces = css.match(/@font-face \{[^}]*font-family: 'Courier Prime'[^}]*\}/g)
  assert.equal(faces.length, 2)
  for (const face of faces) {
    const value = descriptor => {
      const match = face.match(new RegExp(`${descriptor}: ([\\d.]+)%`))
      assert.ok(match, `missing ${descriptor}`)
      return Number(match[1]) / 100
    }
    assert.ok(Math.abs(value('ascent-override') * value('size-adjust') - body.ascent) < 0.00001)
    assert.ok(Math.abs(value('descent-override') * value('size-adjust') - body.descent) < 0.00001)
    assert.equal(value('line-gap-override'), 0)
  }
})

test('the shared numeric font is shipped and calibrated to body cap height without overriding component font sizes', () => {
  const bodyRatio = capRatio(readFileSync(new URL('public/fonts/inter/Inter-Variable.ttf', root)))
  assert.match(css, /--ff-mono: "Courier Prime", ui-monospace/)
  for (const [file, weight] of [['Regular', 400], ['Bold', 700]]) {
    const ratio = capRatio(readFileSync(new URL(`public/fonts/courier-prime/CourierPrime-${file}.ttf`, root)))
    assert.ok(Math.abs(ratio * 1.2553 - bodyRatio) < 0.0001)
    assert.match(css, new RegExp(`CourierPrime-${file}\\.ttf[^\\n]*font-weight: ${weight};[^\\n]*size-adjust: 125\\.53%`))
  }
  assert.match(readFileSync(new URL('public/fonts/courier-prime/OFL.txt', root), 'utf8'), /SIL Open Font License/)
  const utility = css.match(/:where\(\.numeric, \.mono, \.tabular-nums\) \{([^}]+)\}/)[1]
  assert.doesNotMatch(utility, /font-size:|line-height:|transform:|zoom:/)
})
