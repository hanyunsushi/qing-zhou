import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import {parse} from '@vue/compiler-sfc'
import ts from 'typescript'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
const bridge=read('src/components/KreeperSidebarMenu.vue')
function setup(props={}) {
 const events=[]
 const script=parse(bridge).descriptor.scriptSetup.content.replace(/^import .*$/gm,'')
 const js=ts.transpileModule(script,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext}}).outputText
 const api=runInNewContext(js+'\n;({toggle,select,keyboard,root,localKeys,matchingParents})',{
  defineProps:()=>props,withDefaults:(p,d)=>Object.assign(p,{defaultExpandedKeys:p.defaultExpandedKeys??d.defaultExpandedKeys()}),defineEmits:()=>((...e)=>events.push(e)),ref:value=>({value}),watch(){},onMounted(){},onBeforeUnmount(){},nextTick:fn=>fn(),
 })
 return {api,events,props}
}
test('actual desktop and mobile navigation use the source motion bridge with runtime dependencies',()=>{
 const layout=read('src/components/DashboardLayout.vue'),pkg=JSON.parse(read('package.json'))
 assert.equal((layout.match(/<KreeperSidebarMenu v-else/g)||[]).length,2)
 assert.doesNotMatch(layout,/<n-menu\b|projectKey=|:projects=/)
 assert.match(layout,/:collapsed="sidebarCollapsed"[\s\S]*:expanded-keys="sidebarExpandedKeys"/)
 assert.match(layout,/:default-expanded-keys="defaultExpandedKeys" @update:value="goAndClose"/)
 for(const dep of ['react','react-dom','framer-motion']) {assert.ok(pkg.dependencies[dep]);assert.ok(!pkg.devDependencies[dep])}
})
test('collapsed branch opens once and filter expansion never overwrites saved keys',()=>{
 const {api,events,props}=setup({collapsed:true,expandedKeys:['ag-node']})
 api.toggle({key:'ag-node'})
 assert.deepEqual(Array.from(events[0][1]),['ag-node'])
 props.collapsed=false;props.expandedKeys=['ag-node']
 api.toggle({key:'ag-node'});assert.deepEqual(Array.from(events[1][1]),[])
 const before=Array.from(api.localKeys.value)
 assert.deepEqual(Array.from(api.matchingParents([{key:'admin',children:[{key:'ag-node',children:[{key:'/admin/monitor'}]}]}])),['admin','ag-node'])
 assert.deepEqual(Array.from(api.localKeys.value),before)
 api.select({key:'/help'});assert.deepEqual(events.at(-1),['update:value','/help'])
})
test('keyboard skips disabled and exiting submenu rows and preserves branch navigation',()=>{
 const {api}=setup()
 const make=(opts={})=>({disabled:false,getClientRects:()=>[{}],closest:s=>s==='[data-motion-pop-id]'?null:null,focus(){this.focused=true},...opts})
 const first=make(),disabled=make({disabled:true}),exiting=make({closest:s=>s==='[data-motion-pop-id]'?{}:null}),last=make()
 api.root.value={querySelectorAll:()=>[first,disabled,exiting,last]}
 const event=(button,key)=>({key,target:{closest:()=>button},preventDefault(){},stopPropagation(){}})
 api.keyboard(event(first,'ArrowDown'));assert.equal(last.focused,true)
 api.keyboard(event(last,'Home'));assert.equal(first.focused,true)
 let clicked=0;first.getAttribute=()=> 'false';first.click=()=>clicked++
 api.keyboard(event(first,'ArrowRight'));assert.equal(clicked,1)
})
