import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { ref } from 'vue'

test('mobile selection shares table keys and preserves other plan selections',()=>{
  const source=readFileSync(new URL('../src/views/UserSub.vue',import.meta.url),'utf8')
  const functions=source.slice(source.indexOf('function selectNode('),source.indexOf('async function toggleNode('))
  const selectedByPlan=ref({'other':['shared']})
  const {selectNode,selectPlanNodes}=runInNewContext(ts.transpileModule(functions,{compilerOptions:{target:ts.ScriptTarget.ESNext}}).outputText+'\n({selectNode,selectPlanNodes})',{selectedByPlan,Set})
  selectNode('main','shared',true);selectNode('main','shared',true);selectNode('main','second',true)
  assert.deepEqual([...selectedByPlan.value.main],['shared','second'])
  selectNode('main','shared',false)
  assert.deepEqual([...selectedByPlan.value.main],['second'])
  selectPlanNodes({planId:'main',nodes:[{key:'a'},{key:'b'}]},true)
  assert.deepEqual([...selectedByPlan.value.main],['a','b'])
  selectPlanNodes({planId:'main',nodes:[]},false)
  assert.deepEqual([...selectedByPlan.value.main],[])
  assert.deepEqual([...selectedByPlan.value.other],['shared'])
})
