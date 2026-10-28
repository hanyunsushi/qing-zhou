import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

let server, heatmap
before(async () => {
  server = await createServer({configFile:false, root:new URL('..',import.meta.url).pathname, cacheDir:'.vite-skyline-test', optimizeDeps:{noDiscovery:true,include:[]}, server:{middlewareMode:true,watch:null}})
  heatmap = await server.ssrLoadModule('/src/utils/heatmap-skyline.ts')
})
after(async () => server?.close())

test('availability folding retains each timestamp once and keeps servers separate', () => {
  const input = {state_count:4,servers:[{name:'first'},{name:'second'}],buckets:Array.from({length:48},(_,i)=>100000+i*1800),matrix:[Array.from({length:48},(_,i)=>i<4?i:0),Array(48).fill(2)]}
  const models = heatmap.availabilityModels(input)
  assert.equal(models.length,2)
  for(const row of models){assert.equal(row.model.columns,16);assert.equal(row.model.rows,3);assert.equal(row.model.cells.length,48);assert.equal(new Set(row.model.cells.map(c=>c.key)).size,48);assert.deepEqual(row.model.cells.map(c=>Number(c.key)),input.buckets)}
  assert.equal(models[0].model.cells[0].detail,'运行正常')
  assert.equal(models[1].model.cells[0].detail,'严重负载')
  assert.deepEqual(models[0].model.axes.x.ticks.map(t=>t.at),Array.from({length:16},(_,column)=>column+0.5))
  const timeLabels=models[0].model.axes.x.ticks.map(t=>t.label)
  assert.equal(new Set(timeLabels).size,timeLabels.length,'x-axis labels identify distinct times instead of repeating the date')
  assert.equal(models[0].model.axes.x.title,'时间')
  assert.equal(models[0].model.axes.y.title,'时间分组')
  assert.deepEqual(models[0].model.axes.y.ticks.map(t=>t.label),['1','2','3'])
  assert.deepEqual(models[0].model.cells.slice(0,4).map(c=>c.color),['#34c759','#ff8d28','#ff383c','#8e8e93'])
  assert.equal('colorRamp' in models[0].model,false,'availability uses only QingZhou native severity colors plus neutral missing data')
  assert.equal('colorProgress' in models[0].model.cells[0],false)
})
test('wide time ranges disambiguate repeated calendar-day ticks with time',()=>{
  const row=heatmap.availabilityModels({servers:[{name:'A'}],buckets:Array.from({length:48},(_,i)=>100000+i*3*3600),matrix:[Array(48).fill(0)]})[0]
  const labels=row.model.axes.x.ticks.map(t=>t.label)
  assert.equal(new Set(labels).size,labels.length)
  assert.match(labels[0],/\d{2}:\d{2}/)
})
test('unknown, absent and legacy offline values stay grey instead of becoming healthy tall bars', () => {
  for(const raw of [null,undefined,NaN,4,-1,'1'])assert.equal(heatmap.normalizeHeatState(raw),3)
  assert.equal(heatmap.normalizeHeatState(2,3),3)
  assert.equal(heatmap.normalizeHeatState(2,4),2)
  const row=heatmap.availabilityModels({state_count:4,servers:[{name:'A'}],buckets:[1,2,3,4],matrix:[[0,1,2,null]]})[0]
  assert.deepEqual(row.model.cells.map(c=>c.value),[0,1,2,null])
  assert.equal(row.model.cells[3].color,'#8e8e93')
  assert.ok(row.model.cells[3].height<row.model.cells[0].height)
})
test('activity missing differs from a measured zero; duplicate counts add and outside dates do not distort heights',()=>{
  const m=heatmap.contributionModel([{date:'2026-10-10',count:5},{date:'2026-10-10',count:3},{date:'2026-10-11',count:0},{date:'2020-01-01',count:100000},{date:'2026-10-12',count:NaN}],'2026-10-12')
  assert.equal(m.rows,7)
  assert.equal(m.cells.find(c=>c.key==='2026-10-10').value,8)
  assert.equal(m.cells.find(c=>c.key==='2026-10-11').value,0)
  assert.equal(m.cells.find(c=>c.key==='2026-10-12').value,null)
  assert.equal(m.cells.find(c=>c.key==='2026-10-10').height,6.4)
  assert.throws(()=>heatmap.contributionModel([],'2026-02-31'),/有效/)
  assert.equal(m.axes.x.title,'月份')
  assert.equal(m.axes.y.title,'星期')
  assert.ok(m.axes.x.ticks.some(t=>t.label.endsWith('月')))
})
test('availability has three native severity colors and a separate neutral missing sentinel',()=>{
  const states=heatmap.HEATMAP_STATES
  assert.deepEqual(states.slice(0,3).map(s=>s.color),['#34c759','#ff8d28','#ff383c'])
  assert.deepEqual(states.slice(0,3).map(s=>s.label),['运行正常','高负载','严重负载'])
  assert.equal(states[3].color,'#8e8e93')
  const model=heatmap.availabilityModels({state_count:4,servers:[{name:'A'}],buckets:[1,2,3,4],matrix:[[0,1,2,3]]})[0].model
  assert.equal('colorRamp' in model,false)
  assert.equal(model.cells[3].value,null)
})
test('flat projection, wave endpoints and hit detection retain a reversible scene',()=>{
  assert.deepEqual(heatmap.projectSkyline(heatmap.skylineCamera(0),2,3,0),[2,3])
  for(const column of [0,7,52]){assert.equal(heatmap.waveRise(0,column,53,6,7),0);assert.equal(heatmap.waveRise(1,column,53,6,7),1)}
  assert.equal(heatmap.insidePolygon([[0,0],[10,0],[10,10],[0,10]],5,5),true)
  assert.equal(heatmap.insidePolygon([[0,0],[10,0],[10,10],[0,10]],15,5),false)
})

test('reduced motion draws native status colors without a synthetic ramp and disposes resources',async()=>{
  const source=await readFile(new URL('../src/utils/skyline-renderer.ts',import.meta.url),'utf8')
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
  const frames=new Map(),listeners=new Map(),mediaListeners=new Set(),observers=[]
  let serial=0,draws=0,closedStrokes=0
  const axisLabels=[]
  let closed=false
  const context={beginPath(){closed=false},moveTo(){},lineTo(){},closePath(){closed=true},fill(){draws++},stroke(){if(closed)closedStrokes++},setTransform(){},clearRect(){},save(){},restore(){},translate(){},rotate(){},fillText(value){axisLabels.push(String(value))},measureText(value){return {width:String(value).length*6}}}
  const canvas={parentElement:{clientWidth:320},width:0,height:0,style:{},getContext(){return context},addEventListener(k,v){listeners.set(k,v)},removeEventListener(k){listeners.delete(k)}}
  class Observer{constructor(callback){this.callback=callback;this.disconnected=false;observers.push(this)}observe(){}disconnect(){this.disconnected=true}}
  const exports={}
  runInNewContext(code,{exports,require:()=>heatmap,matchMedia:()=>({matches:true,addEventListener(_,fn){mediaListeners.add(fn)},removeEventListener(_,fn){mediaListeners.delete(fn)}}),performance:{now:()=>0},requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial},cancelAnimationFrame:id=>frames.delete(id),devicePixelRatio:2,ResizeObserver:Observer,IntersectionObserver:Observer})
  const model=heatmap.availabilityModels({state_count:4,servers:[{name:'A'}],buckets:[1,2,3,4],matrix:[[0,1,2,3]]})[0].model
  const instance=exports.createSkylineRenderer(canvas,{model,view:'3d',ready:true,filter:null,onActive(){},onSelect(){}})
  observers[1].callback([{isIntersecting:true}])
  for(const [id,fn]of [...frames]){frames.delete(id);fn(16)}
  assert.equal(frames.size,0)
  assert.ok(draws>=12,'top and both side faces rendered without intermediate motion')
  assert.deepEqual(model.cells.map(cell=>cell.color),['#34c759','#ff8d28','#ff383c','#8e8e93'],'only native severity colors and the neutral missing-data color are present')
  assert.equal('colorRamp' in model,false)
  assert.equal(closedStrokes,0,'pillar faces are filled without stroked outlines')
  assert.ok(axisLabels.includes('时间') && axisLabels.includes('时间分组'),'axis titles remain visible in a narrow canvas')
  assert.ok(axisLabels.includes('1') && axisLabels.includes('3'),'narrow canvases retain y-axis tick labels')
  assert.match(source,/1\s*-\s*Math\.exp\(-dt\s*\*\s*6\)/,'hover feedback eases in over several frames rather than snapping')
  assert.equal(canvas.width,640)
  instance.dispose()
  assert.equal(listeners.size,0)
  assert.equal(mediaListeners.size,0)
  assert.ok(observers.every(o=>o.disconnected))
})

test('3D hover lift and color respond over multiple frames without outlining a pillar',async()=>{
  const source=await readFile(new URL('../src/utils/skyline-renderer.ts',import.meta.url),'utf8')
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
  const frames=new Map(),listeners=new Map(),observers=[]
  let serial=0,now=0,closed=false,closedStrokes=0,currentPath=[],fills=[],selectedHeights=[]
  const context={
    beginPath(){closed=false;currentPath=[]},moveTo(x,y){currentPath.push([x,y])},lineTo(x,y){currentPath.push([x,y])},closePath(){closed=true},
    fill(){fills.push({points:currentPath.map(p=>[...p]),style:this.fillStyle})},stroke(){if(closed)closedStrokes++},
    setTransform(){},clearRect(){},save(){},restore(){},translate(){},rotate(){},fillText(){},measureText(value){return {width:String(value).length*6}},
  }
  const canvas={parentElement:{clientWidth:360},width:0,height:0,style:{},getContext(){return context},addEventListener(k,v){listeners.set(k,v)},removeEventListener(k){listeners.delete(k)}}
  class Observer{constructor(callback){this.callback=callback;observers.push(this)}observe(){}disconnect(){}}
  const exports={}
  const rendererDependencies={...heatmap,projectSkyline(camera,x,y,z){if(Math.abs(x-.1)<1e-8&&Math.abs(y-.1)<1e-8)selectedHeights.push(z);return heatmap.projectSkyline(camera,x,y,z)}}
  runInNewContext(code,{exports,require:()=>rendererDependencies,matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial},cancelAnimationFrame:id=>frames.delete(id),devicePixelRatio:1,ResizeObserver:Observer,IntersectionObserver:Observer,getComputedStyle:()=>({fontFamily:'sans-serif'})})
  const model={columns:1,rows:1,cells:[{key:'one',column:0,row:0,label:'12:00',detail:'运行正常',value:0,height:.55,color:'#34c759',group:0}],axes:{x:{title:'时间',ticks:[{at:.5,label:'12:00'}]},y:{title:'时间分组',ticks:[{at:.5,label:'1'}]}}}
  exports.createSkylineRenderer(canvas,{model,view:'3d',ready:true,filter:null,onActive(){},onSelect(){}})
  observers[1].callback([{isIntersecting:true}])
  const advance=()=>{const entry=[...frames.entries()][0];assert.ok(entry,'animation should schedule a frame');frames.delete(entry[0]);now+=16;entry[1](now)}
  while(frames.size)advance()
  const before=selectedHeights.at(-1)
  selectedHeights=[]
  listeners.get('keydown')({key:'Home',preventDefault(){}})
  advance()
  const first=fills.at(-1),firstDelta=selectedHeights.at(-1)-before
  for(let i=0;i<40&&frames.size;i++)advance()
  const settled=fills.at(-1),fullDelta=selectedHeights.at(-1)-before
  assert.ok(fullDelta>0,'hover raises the selected pillar')
  assert.ok(firstDelta/fullDelta<.2,'first frame remains an intermediate state instead of snapping')
  assert.notEqual(first.style,settled.style,'hover color also interpolates over time')
  assert.equal(closedStrokes,0,'neither idle nor hovered pillars receive an outline stroke')
})

test('homepage keeps the most recent range when older requests finish late',async()=>{
  const source=await readFile(new URL('../src/views/Monitor.vue',import.meta.url),'utf8')
  const fn=source.slice(source.indexOf('async function loadHeatmap('),source.indexOf('function onWinResize()'))
  const code=ts.transpileModule(fn,{compilerOptions:{module:ts.ModuleKind.None,target:ts.ScriptTarget.ES2020}}).outputText
  const pending=[],heatRange={value:'24h'},heatData={value:null},heatError={value:''}
  const load=runInNewContext(code+'\nloadHeatmap',{heatRange,heatData,heatError,heatRequest:0,nextTick:()=>Promise.resolve(),moveHeatIndicatorToSelected(){},apiGet:path=>new Promise((resolve,reject)=>pending.push({path,resolve,reject}))})
  const flush=()=>new Promise(resolve=>setImmediate(resolve))
  const old=load('1h');await flush()
  const current=load('7d');await flush()
  pending[1].resolve({range:'7d',buckets:[7]});await current
  pending[0].resolve({range:'1h',buckets:[1]});await old
  assert.equal(heatRange.value,'7d')
  assert.equal(heatData.value.range,'7d')
  const failure=load('6h');await flush();pending[2].reject(new Error('offline'));await failure
  assert.equal(heatData.value.range,'7d','retain last valid data instead of replacing it with zeros')
  assert.match(heatError.value,/无法获取/)
})

test('homepage omits requested explanatory copy without removing drag affordances',async()=>{
  const availability=await readFile(new URL('../src/components/AvailabilityHeatmap.vue',import.meta.url),'utf8')
  const skyline=await readFile(new URL('../src/components/SkylineHeatmap.vue',import.meta.url),'utf8')
  const monitor=await readFile(new URL('../src/views/Monitor.vue',import.meta.url),'utf8')
  assert.doesNotMatch(availability,/高度表示状态级别|非负载百分比/)
  assert.match(skyline,/<span v-if="description" class="skyline-description">/)
  assert.doesNotMatch(monitor,/余额卡片可拖动排序/)
  assert.match(monitor,/upstream-drag-hint[\s\S]*?拖动调整余额顺序/)
  assert.match(monitor,/handleUpstreamDragStart/)
})
