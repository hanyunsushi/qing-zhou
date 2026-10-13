import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { ref } from 'vue'

const source = await readFile(new URL('../src/views/AdminPackages.vue', import.meta.url), 'utf8')

test('package cards use one operation geometry and replace arrows with accessible drag sorting', () => {
  assert.match(source, /class="list-card package-sort-card"/)
  assert.match(source, /:draggable="!reordering"/)
  assert.match(source, /@dragstart="handlePackageDragStart/)
  assert.match(source, /@pointerdown="startPackageTouchDrag/)
  assert.match(source, /@keydown="handlePackageSortKey/)
  assert.match(source, /\/api\/admin\/packages\/reorder/)
  assert.doesNotMatch(source, /function movePackage\(/)
  assert.match(source, /<n-button size="tiny" type="error" quaternary class="delete-button"[^>]*>删除<\/n-button>/)
})

test('package reorder commits complete order and restores it when persistence fails', async () => {
  const method = source.match(/async function reorderPackage\([\s\S]*?\n}\nfunction clearPackageDrag/)?.[0]?.replace(/\nfunction clearPackageDrag$/, '')
  assert.ok(method)
  const code = ts.transpileModule(method, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText
  const packages = ref([{ id: 1 }, { id: 2 }, { id: 3 }])
  const reordering = ref(false)
  const calls = []
  const messages = []
  let fail = false
  const handlers = runInNewContext(`${code}\n({ reorderPackage })`, {
    packages,
    reordering,
    message: { error: (value) => messages.push(value) },
    apiPost: async (path, body) => {
      calls.push({ path, body })
      if (fail) throw new Error('保存失败')
    },
  })

  await handlers.reorderPackage(1, 3, true)
  assert.deepEqual(Array.from(packages.value, (item) => item.id), [2, 3, 1])
  assert.equal(calls.at(-1).path, '/api/admin/packages/reorder')
  assert.deepEqual(Array.from(calls.at(-1).body.ids), [2, 3, 1])

  await handlers.reorderPackage(3, 2, false)
  assert.deepEqual(Array.from(packages.value, (item) => item.id), [3, 2, 1])

  const beforeFailure = Array.from(packages.value, (item) => item.id)
  fail = true
  await handlers.reorderPackage(3, 1, true)
  assert.deepEqual(Array.from(packages.value, (item) => item.id), beforeFailure)
  assert.equal(messages.at(-1), '保存失败')

  const callCount = calls.length
  await handlers.reorderPackage(2, 2, true)
  assert.equal(calls.length, callCount)
})
