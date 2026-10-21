import test from 'node:test'
import assert from 'node:assert/strict'
import { ref } from 'vue'
import { createSidebarNavigation, describeNavigation } from '../src/composables/useSidebarNavigation.ts'

test('shared menu is complete without mounting a page and follows the original role', () => {
 const admin = ref(true)
 const { allMenuOptions } = createSidebarNavigation(() => admin.value)
 const paths = () => {
  const flatten = items => items.flatMap(item => [item.path, ...flatten(item.children ?? [])]).filter(Boolean)
  return flatten(describeNavigation(allMenuOptions.value))
 }
 const full = paths()
 assert.ok(full.includes('/dashboard'))
 assert.ok(full.includes('/shop'))
 assert.ok(full.includes('/admin/users'))
 assert.ok(full.includes('/admin/settings'))
 assert.deepEqual(paths(), full)
 admin.value = false
 assert.ok(paths().includes('/dashboard'))
 assert.ok(paths().includes('/shop'))
 assert.ok(!paths().some(path => path.startsWith('/admin')))
 admin.value = true
 assert.deepEqual(paths(), full)
})
