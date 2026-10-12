<template>
  <!-- 展示信息模块 / 组件绘制动画：平面矩阵与立体投影共用一份数据，不切换或伪造图表。 -->
  <div class="skyline-heatmap">
    <div class="skyline-toolbar">
      <span class="skyline-description">{{ description }}</span>
      <!-- 路由切换组件：外16/内12/内距4，单跟随面选择矩阵或立体。 -->
      <div class="skyline-view route-switch" role="group" aria-label="热力图视图" @mouseleave="preview = null" @focusout="leaveViewFocus">
        <span class="skyline-view-indicator" :style="{ transform: `translateX(${(preview ?? view) === '3d' ? 100 : 0}%)` }" aria-hidden="true"/>
        <button type="button" :aria-pressed="view === '2d'" @mouseenter="preview = '2d'" @focus="preview = '2d'" @click="view = '2d'">矩阵</button>
        <button type="button" :aria-pressed="view === '3d'" @mouseenter="preview = '3d'" @focus="preview = '3d'" @click="view = '3d'">立体</button>
      </div>
    </div>
    <div class="skyline-stage">
      <canvas ref="canvas" tabindex="0" role="img" :aria-label="`${title}，${model.cells.length}个格子，${view === '3d' ? '立体' : '平面'}视图。横轴${model.axes?.x?.title ?? '列'}，纵轴${model.axes?.y?.title ?? '行'}。方向键浏览，Enter选择，Escape关闭提示。完整数据见下方。`" :style="{ touchAction: view === '3d' ? 'pan-y' : 'auto' }"/>
      <!-- 提示信息：正文插值防止HTML注入，提示限制在组件内并保留完整时间与状态。 -->
      <div v-if="active" class="skyline-tip" role="tooltip" :style="tipStyle"><strong>{{ active.label }}</strong><span>{{ active.detail }}</span></div>
    </div>
    <div class="skyline-footer">
      <span>{{ view === '3d' ? '拖动旋转 · 双击复位 · 方向键浏览' : '从上到下、从左到右按时间排列 · 方向键浏览' }}</span>
      <div v-if="legend.length" class="skyline-legend" role="group" aria-label="热力图图例" @mouseleave="filter = null">
        <button v-for="item in legend" :key="item.group" type="button" :aria-pressed="filter === item.group" @mouseenter="filter = item.group" @focus="filter = item.group" @blur="filter = null" @click="filter = filter === item.group ? null : item.group"><i :style="{ background: item.color }"/>{{ item.label }}</button>
      </div>
    </div>
    <details class="skyline-data"><summary>查看完整数据</summary><div class="skyline-table-scroll"><table><thead><tr><th>时间</th><th>数值 / 状态</th></tr></thead><tbody><tr v-for="cell in model.cells" :key="cell.key"><td>{{ cell.label }}</td><td>{{ cell.detail }}</td></tr></tbody></table></div></details>
    <span class="skyline-sr" aria-live="polite">{{ active ? active.label + '，' + active.detail : '' }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { createSkylineRenderer } from '../utils/skyline-renderer'
import type { HeatmapView, SkylineCell, SkylineModel } from '../utils/heatmap-skyline'
const props = withDefaults(defineProps<{ model: SkylineModel; title: string; description?: string; ready?: boolean; defaultView?: HeatmapView; legend?: { group: number; color: string; label: string }[] }>(), { ready: true, defaultView: '3d', description: '', legend: () => [] })
const emit = defineEmits<{ select: [cell: SkylineCell] }>()
const canvas = ref<HTMLCanvasElement | null>(null), view = ref<HeatmapView>(props.defaultView), active = ref<SkylineCell | null>(null), filter = ref<number | null>(null), position = ref<[number, number]>([0, 0])
const preview = ref<HeatmapView | null>(null)
function leaveViewFocus(event: FocusEvent) { if (!(event.relatedTarget instanceof Node) || !(event.currentTarget as HTMLElement).contains(event.relatedTarget)) preview.value = null }
const tipStyle = computed(() => ({ left: `clamp(8px, ${position.value[0]}px, calc(100% - 210px))`, top: `${Math.max(8, position.value[1] - 60)}px` }))
let renderer: ReturnType<typeof createSkylineRenderer> | null = null
function options() { return { model: props.model, view: view.value, ready: props.ready, filter: filter.value, onActive: (cell: SkylineCell | null, p?: [number, number]) => { active.value = cell; if (p) position.value = p }, onSelect: (cell: SkylineCell) => emit('select', cell) } }
onMounted(() => { if (canvas.value) renderer = createSkylineRenderer(canvas.value, options()) })
watch(() => [props.model, props.ready, view.value, filter.value], () => renderer?.update(options()), { deep: true })
onBeforeUnmount(() => renderer?.dispose())
</script>
<style scoped>
/* 展示信息模块：继承所属模块深度，Canvas与长数据表只在自身边界滚动。 */
.skyline-heatmap { min-width: 0; width: 100%; color: var(--text); font-family: var(--ff-body); }
.skyline-toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; }
.skyline-description { font-size: 12px; color: var(--text-3); flex: 1 1 180px; overflow-wrap: anywhere; line-height: 1.6; }
.skyline-stage { position: relative; width: 100%; min-width: 0; }
.skyline-stage canvas { display: block; width: 100%; max-width: 100%; height: 220px; border-radius: 8px; }
.skyline-stage canvas:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
/* 路由切换组件：使用既有16/12/4合同，按钮焦点独立于指示面。 */
.skyline-view { position: relative; display: inline-grid; grid-template-columns: repeat(2, 52px); padding: 4px; border-radius: 16px !important; background: var(--bg-subtle); isolation: isolate; }
.skyline-view-indicator { position: absolute; z-index: -1; left: 4px; top: 4px; bottom: 4px; width: 52px; border-radius: 12px; background: var(--card); transition: transform .24s cubic-bezier(.215,.61,.355,1); pointer-events: none; }
.skyline-view button { border: 0; border-radius: 12px; min-height: 32px; background: transparent; color: var(--text-2); font: 600 12px/20px var(--ff-body); cursor: pointer; padding: 6px 8px; }
.skyline-view button[aria-pressed=true] { color: var(--text); }
.skyline-view button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
/* 提示信息：组件内深色浮层18px角，标题、时间和状态可换行。 */
.skyline-tip { position: absolute; z-index: 2; pointer-events: none; width: max-content; max-width: min(210px, calc(100% - 16px)); padding: 8px 10px; border-radius: 18px; background: var(--text); color: white; font-size: 12px; line-height: 1.6; box-shadow: var(--shadow-flyout); overflow-wrap: anywhere; }
.skyline-tip strong,.skyline-tip span { display: block; }
.skyline-tip strong { font: 400 12px/1.6 var(--ff-mono); font-variant-numeric: tabular-nums; }
.skyline-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; font-size: 12px; color: var(--text-3); line-height: 1.6; }
/* 区分-状态牌 / 展示信息模块：图例色块只编码传入的状态或连续活动级别。 */
.skyline-legend { display: flex; flex-wrap: wrap; gap: 8px; }
.skyline-legend button { display: inline-flex; align-items: center; gap: 4px; border: 0; padding: 2px; background: transparent; font: inherit; color: inherit; cursor: pointer; border-radius: 4px; }
.skyline-legend button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.skyline-legend i { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 2px; }
.skyline-data { color: var(--text-3); font-size: 12px; margin-top: 10px; }
.skyline-data summary { cursor: pointer; }
.skyline-table-scroll { overflow: auto; max-height: 260px; margin-top: 8px; }
.skyline-data table { width: 100%; border-collapse: collapse; font-size: 12px; }
.skyline-data th,.skyline-data td { text-align: left; padding: 6px 10px; border-bottom: 1px solid var(--border); overflow-wrap: anywhere; }
.skyline-data td:first-child { font-family: var(--ff-mono); font-variant-numeric: tabular-nums; }
.skyline-sr { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
@media (max-width: 640px) { .skyline-toolbar { gap: 8px; } .skyline-description { flex-basis: 140px; } }
@media (prefers-reduced-motion: reduce) { .skyline-view-indicator { transition: none; } }
</style>
