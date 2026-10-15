<template>
  <!-- 玻璃文件夹卡片：独立对象面保留来源形状/玻璃/翻盖；文件列表由调用方控制。 -->
  <section ref="root" class="gf-root" :data-tone="tone" :data-open="open || undefined"
    :data-entered="entered || undefined" :style="{ '--gf-scale': scale }">
    <div class="gf-object" :style="{ height: `${386 * scale}px` }">
      <!-- 玻璃文件夹卡片：只有实际文件夹与纸页舞台承接悬浮、点击外部判断和滚轮预览；上方展开留白不承接交互。 -->
      <div ref="interactive" class="gf-interaction" @pointermove="move" @pointerleave="leave" @wheel="wheelPreview">
        <div class="gf-stage" :style="{ transform: `scale(${scale})` }">
        <div class="gf-tilt">
          <div class="gf-shadow" aria-hidden="true" />
          <div class="gf-back" :style="{ clipPath: `path('${BACK_PATH}')` }" aria-hidden="true">
            <FolderArtCanvas v-if="art !== 'none'" class="gf-art" :art="art" :seed="seed" :width="364" :height="296" />
            <div class="gf-back-sheen" />
          </div>
          <svg class="gf-rim gf-back-rim" viewBox="0 0 340 272" aria-hidden="true"><path :d="BACK_PATH" /></svg>
          <div class="gf-front" :style="{ clipPath: `path('${FRONT_PATH}')` }">
            <div class="gf-tint" aria-hidden="true" /><div class="gf-spec" aria-hidden="true" />
            <svg class="gf-rim gf-front-rim" viewBox="0 0 340 198" aria-hidden="true">
              <defs><linearGradient :id="rimId" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95" /><stop offset=".35" stop-color="#fff" stop-opacity=".35" /><stop offset="1" stop-color="#fff" stop-opacity=".12" /></linearGradient></defs>
              <path :d="FRONT_PATH" :stroke="`url(#${rimId})`" />
            </svg>
            <button ref="trigger" type="button" class="gf-hit" :aria-expanded="open" :aria-controls="previewId"
              :aria-label="`${open ? '收起' : '打开'}${label}，${files.length}件商品`" @click="toggle(!open)" />
            <div class="gf-label"><span class="gf-title">{{ label }}</span><span :key="files.length" class="gf-meta"><span class="numeric">{{ files.length }}</span> 件商品</span></div>
          </div>
          <!-- 玻璃文件夹卡片：最多四页扇形预览；滚轮在有更多纸页时切换预览，不滚动页面。 -->
          <div :id="previewId" class="gf-files" :inert="!open" role="list" :aria-label="`${label}预览`">
            <div v-for="(file, index) in previewFiles" :key="file.id" role="listitem" class="gf-sheet-slot">
              <button type="button" class="gf-sheet" :style="sheetStyle(index, file)" :aria-label="`查看${file.name}`" :title="file.name" @click="emit('select', file.id)">
                <span class="gf-lines" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                <span class="gf-sheet-head"><span class="gf-sheet-name">{{ file.name }}</span><span class="gf-sheet-meta"><template v-if="file.value != null"><span class="numeric">{{ file.value }}</span> {{ file.unit }}</template><template v-else>{{ file.meta }}</template></span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, useId, watch, onMounted, onBeforeUnmount } from 'vue'
import FolderArtCanvas from './FolderArtCanvas.vue'
import { fanSlot, hashString, rng, type FolderArt } from '../utils/folder-art'

export interface GlassFolderFile { id: string | number; name: string; meta?: string; value?: string | number; unit?: string }
const props = withDefaults(defineProps<{ label: string; files: GlassFolderFile[]; art?: FolderArt; seed?: number; tone?: 'light' | 'dark'; open?: boolean; appearDelay?: number }>(), { art: 'aurora', seed: 3, tone: 'light', open: false, appearDelay: 0 })
const emit = defineEmits<{ 'update:open': [open: boolean]; select: [id: string | number] }>()
const root = ref<HTMLElement | null>(null), interactive = ref<HTMLElement | null>(null), trigger = ref<HTMLButtonElement | null>(null)
const entered = ref(false), scale = ref(1)
const uid = useId(), rimId = `gf-rim-${uid}`, previewId = `gf-preview-${uid}`
const previewStart = ref(0)
const maxPreviewStart = computed(() => Math.max(0, props.files.length - 4))
const previewFiles = computed(() => props.files.slice(Math.min(previewStart.value, maxPreviewStart.value), Math.min(previewStart.value, maxPreviewStart.value) + 4))
const BACK_PATH = 'M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z'
const FRONT_PATH = 'M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z'
function sheetStyle(index: number, file: GlassFolderFile) {
  const jitter = rng(hashString(String(file.id) + file.name))
  return { '--gf-slot': fanSlot(index, previewFiles.value.length), '--gf-depth': previewFiles.value.length - 1 - index,
    '--gf-jx': `${((jitter() - .5) * 10).toFixed(2)}px`, '--gf-jr': `${((jitter() - .5) * 3.2).toFixed(2)}deg`, zIndex: index + 1 }
}
let resize: ResizeObserver | undefined, intersection: IntersectionObserver | undefined
let timer: ReturnType<typeof setTimeout> | undefined, frame = 0, px = 0, py = 0
let reduced: MediaQueryList | undefined
function writePointer() { frame = 0; root.value?.style.setProperty('--gf-px', String(px)); root.value?.style.setProperty('--gf-py', String(py)) }
function move(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || matchMedia('(hover: none)').matches || reduced?.matches || !interactive.value) return
  const rect = interactive.value.getBoundingClientRect()
  px = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
  py = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
  if (!frame) frame = requestAnimationFrame(writePointer)
}
function leave() { px = 0; py = 0; if (!frame) frame = requestAnimationFrame(writePointer) }
function toggle(open: boolean) { emit('update:open', open) }
function wheelPreview(event: WheelEvent) {
  if (props.files.length <= 4) return
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
  if (!delta) return
  event.preventDefault()
  event.stopPropagation()
  previewStart.value = Math.max(0, Math.min(maxPreviewStart.value, previewStart.value + (delta > 0 ? 1 : -1)))
}
watch(() => props.open, (open, wasOpen) => {
  if (open && !wasOpen) previewStart.value = 0
})
watch(() => props.files.length, () => {
  previewStart.value = Math.min(previewStart.value, maxPreviewStart.value)
})
function escape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.open || !interactive.value?.contains(document.activeElement)) return
  toggle(false); trigger.value?.focus()
}
function outside(event: PointerEvent) {
  if (!props.open || interactive.value?.contains(event.target as Node)) return
  // 浮层查看商品时文件夹仍保持展开，关闭详情后保留原浏览位置。
  if ((event.target as Element).closest('[data-folder-gallery], .n-modal-container, .n-dialog')) return
  toggle(false)
}
function motionChanged() { if (reduced?.matches) { entered.value = true; leave() } }
onMounted(() => {
  reduced = matchMedia('(prefers-reduced-motion: reduce)')
  reduced.addEventListener('change', motionChanged)
  resize = new ResizeObserver(entries => { scale.value = Math.min(1, entries[0].contentRect.width / 340) })
  if (root.value) resize.observe(root.value)
  if (reduced.matches || !('IntersectionObserver' in window)) entered.value = true
  else {
    intersection = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      intersection?.disconnect(); timer = setTimeout(() => { entered.value = true }, props.appearDelay)
    }, { threshold: .25 })
    if (root.value) intersection.observe(root.value)
  }
  document.addEventListener('keydown', escape); document.addEventListener('pointerdown', outside)
})
onBeforeUnmount(() => {
  resize?.disconnect(); intersection?.disconnect(); clearTimeout(timer); cancelAnimationFrame(frame)
  reduced?.removeEventListener('change', motionChanged)
  document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside)
})
</script>
<style scoped>
/* 玻璃文件夹卡片：来源形状、玻璃与翻盖专项，不受普通卡片平面化影响。 */

.gf-root {
  --gf-px: 0;
  --gf-py: 0;
  --gf-ease: cubic-bezier(.2, .8, .2, 1);
  --gf-spring: cubic-bezier(.34, 1.36, .5, 1);
  --gf-hinge: 0deg;
  --gf-lift: 42px;
  --gf-spread: 0px;
  --gf-fan: 0deg;
  --gf-stack: 15px;
  --gf-ink: #141416;
  --gf-ink-soft: rgba(20, 20, 22, .55);
  position: relative;
  display: inline-block;
  flex: none;
  vertical-align: top;
  font-family: var(--ff-body);
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
  pointer-events: none;
}
.gf-root[data-tone="dark"] { --gf-ink: #f5f5f7; --gf-ink-soft: rgba(245, 245, 247, .58); }
/* 玻璃文件夹卡片：闭合对象才预展开悬浮；展开后保持开合态，避免鼠标停留覆盖完整弹出位移。 */
.gf-root:not([data-open]):has(.gf-interaction:hover), .gf-root:not([data-open]):has(.gf-interaction:focus-within) { --gf-hinge: -11deg; --gf-lift: -34px; --gf-spread: 8px; --gf-fan: 1.4deg; --gf-stack: 10px; }
.gf-root[data-open] { --gf-hinge: -24deg; --gf-lift: -96px; --gf-spread: 40px; --gf-fan: 5deg; --gf-stack: 30px; }

.gf-interaction {
  position: absolute;
  left: 0;
  top: calc(114px * var(--gf-scale));
  width: 100%;
  height: calc(272px * var(--gf-scale));
  /* 玻璃文件夹卡片：包装层不形成透明命中面，事件只从实际后板、前盖和纸页按钮冒泡。 */
  pointer-events: none;
}
.gf-stage {
  position: absolute;
  left: 0;
  top: 0;
  width: 340px;
  height: 272px;
  transform-origin: 0 0;
}
.gf-tilt {
  position: absolute;
  inset: 0;
  transform: perspective(1400px) rotateX(calc(var(--gf-py) * -3deg)) rotateY(calc(var(--gf-px) * 4deg));
  transition: transform .9s var(--gf-ease);
}

.gf-shadow {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: -6px;
  height: 60px;
  border-radius: 40px;
  background: rgba(16, 18, 24, .34);
  filter: blur(22px);
  transform: translateX(calc(var(--gf-px) * -8px));
  transition: transform .9s var(--gf-ease), opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-shadow { background: rgba(0, 0, 0, .62); }

.gf-back {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f3f3f4 0%, #e3e3e6 100%);
  pointer-events: auto;
}
.gf-root[data-tone="dark"] .gf-back { background: linear-gradient(180deg, #2a2a2e 0%, #121214 100%); }
.gf-art {
  position: absolute;
  left: -12px;
  top: -12px;
  max-width: none;
  object-fit: cover;
  transform: translate(calc(var(--gf-px) * -7px), calc(var(--gf-py) * -6px)) scale(1.02);
  transition: transform 1.1s var(--gf-ease), opacity 1.2s var(--gf-ease), filter 1.2s var(--gf-ease);
}
canvas.gf-art { opacity: 0; filter: blur(14px) saturate(.6); }
canvas.gf-art[data-ready] { opacity: 1; filter: none; }
.gf-back-sheen {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .22) 0%, rgba(255, 255, 255, 0) 22%),
    radial-gradient(120% 80% at 80% 0%, rgba(255, 255, 255, .16), rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}

.gf-rim {
  position: absolute;
  left: 0;
  top: 0;
  max-width: none;
  overflow: visible;
  pointer-events: none;
  fill: none;
}
.gf-back-rim { width: 340px; height: 272px; }
.gf-back-rim path { stroke: rgba(255, 255, 255, .45); stroke-width: 1; }
.gf-root[data-tone="dark"] .gf-back-rim path { stroke: rgba(255, 255, 255, .16); }

/* ---- files ---------------------------------------------------------------- */
.gf-files {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  /* nothing hangs out of the bottom of the pocket, however tall the stack */
  clip-path: inset(-400px -400px 10px -400px);
}
.gf-sheet-slot { display: contents; }
.gf-sheet {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  left: 34px;
  top: 96px;
  width: 272px;
  height: 184px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f2f2f0 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .9),
    0 0 0 .5px rgba(0, 0, 0, .1),
    0 10px 26px -8px rgba(10, 12, 20, .28);
  transform-origin: 50% 100%;
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1))
    rotate(calc(var(--gf-jr) + var(--gf-slot) * var(--gf-fan)));
  transition:
    transform .75s var(--gf-spring) calc(var(--gf-depth) * 40ms),
    box-shadow .4s var(--gf-ease),
    translate .9s var(--gf-ease),
    opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-sheet { background: linear-gradient(180deg, #2c2c30 0%, #1c1c1f 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .14), 0 0 0 .5px rgba(255, 255, 255, .08), 0 12px 28px -8px rgba(0, 0, 0, .7); }
.gf-root[data-open] .gf-sheet:hover,
.gf-root[data-open] .gf-sheet:focus-visible {
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1 - 18px))
    rotate(calc(var(--gf-slot) * var(--gf-fan) * .6));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(0, 0, 0, .1), 0 22px 40px -12px rgba(10, 12, 20, .42);
  transition-delay: 0s;
}
.gf-sheet:focus-visible { outline: 2px solid #4c8dff; outline-offset: 2px; }
.gf-sheet-head {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 11px;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  white-space: nowrap;
}
.gf-sheet-name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12.5px;
  font-weight: 560;
  letter-spacing: 0;
  color: #18181b;
}
.gf-sheet-meta {
  flex: none;
  font-family: var(--ff-body);
  font-size: 10px;
  letter-spacing: 0;
  color: rgba(24, 24, 27, .5);
}
.gf-root[data-tone="dark"] .gf-sheet-name { color: #fafafa; }
.gf-root[data-tone="dark"] .gf-sheet-meta { color: rgba(250, 250, 250, .66); }
.gf-lines {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 40px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.gf-lines i {
  display: block;
  height: 5px;
  border-radius: 3px;
  background: rgba(24, 24, 27, .08);
}
.gf-lines i:nth-child(1) { width: 86%; }
.gf-lines i:nth-child(2) { width: 92%; }
.gf-lines i:nth-child(3) { width: 64%; }
.gf-lines i:nth-child(4) { width: 88%; }
.gf-lines i:nth-child(5) { width: 42%; }
.gf-lines i:first-child { height: 9px; margin-bottom: 4px; background: rgba(24, 24, 27, .14); }
.gf-root[data-tone="dark"] .gf-lines i { background: rgba(255, 255, 255, .08); }
.gf-root[data-tone="dark"] .gf-lines i:first-child { background: rgba(255, 255, 255, .16); }

/* ---- front glass ----------------------------------------------------------- */
.gf-front {
  position: absolute;
  left: 0;
  top: 74px;
  width: 340px;
  height: 198px;
  z-index: 10;
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  backdrop-filter: blur(22px) saturate(1.5);
  transform-origin: 50% 100%;
  transform: perspective(760px) rotateX(var(--gf-hinge));
  transition: transform .8s var(--gf-spring), translate 1s var(--gf-ease), opacity 1s var(--gf-ease);
  pointer-events: auto;
}
.gf-tint {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .16) 0%, rgba(255, 255, 255, .5) 42%, rgba(252, 252, 252, .93) 100%);
}
.gf-root[data-tone="dark"] .gf-tint {
  background: linear-gradient(180deg, rgba(18, 18, 20, .18) 0%, rgba(14, 14, 16, .62) 46%, rgba(8, 8, 10, .94) 100%);
}
.gf-spec {
  position: absolute;
  inset: 0;
  background: radial-gradient(260px 200px at calc(50% + var(--gf-px) * 46%) calc(30% + var(--gf-py) * 40%), rgba(255, 255, 255, .5), rgba(255, 255, 255, 0) 70%);
  mix-blend-mode: soft-light;
  opacity: .9;
  transition: background-position .6s var(--gf-ease);
  pointer-events: none;
}
.gf-root[data-tone="dark"] .gf-spec { mix-blend-mode: screen; opacity: .16; }
.gf-front-rim { width: 340px; height: 198px; }
.gf-front-rim path { stroke-width: 2.4; transition: stroke-width .3s var(--gf-ease); }
.gf-root[data-tone="dark"] .gf-front-rim { opacity: .55; }

.gf-hit {
  all: unset;
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: pointer;
}
.gf-hit:focus-visible ~ .gf-label .gf-title { text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }
.gf-front:has(.gf-hit:focus-visible) .gf-front-rim path { stroke-width: 5; }

.gf-label {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 200px;
  pointer-events: none;
  color: var(--gf-ink);
}
.gf-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gf-meta {
  font-family: var(--ff-body);
  font-size: 12px;
  letter-spacing: 0;
  color: var(--gf-ink-soft);
  white-space: nowrap;
  animation: gf-roll .5s var(--gf-ease) both;
}
@keyframes gf-roll {
  from { opacity: 0; translate: 0 7px; filter: blur(3px); }
  to { opacity: 1; translate: 0 0; filter: blur(0); }
}

/* ---- entrance: the folder assembles itself ---------------------------------- */
.gf-root:not([data-entered]) .gf-back,
.gf-root:not([data-entered]) .gf-back-rim { translate: 0 22px; opacity: 0; }
.gf-root:not([data-entered]) .gf-sheet { translate: 0 -120px; opacity: 0; }
.gf-root:not([data-entered]) .gf-front { translate: 0 46px; opacity: 0; }
.gf-root:not([data-entered]) .gf-shadow { opacity: 0; }
.gf-back, .gf-back-rim { transition: translate 1s var(--gf-ease), opacity .9s var(--gf-ease); }
.gf-root[data-entered] .gf-sheet { transition-delay: calc(var(--gf-depth) * 40ms), 0s, calc(.18s + var(--gf-depth) * 90ms), calc(.18s + var(--gf-depth) * 90ms); }
.gf-root[data-entered] .gf-front { transition-delay: 0s, .42s, .42s; }

@media (prefers-reduced-motion: reduce) {
  .gf-root *, .gf-root *::before, .gf-root *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation: none !important;
  }
  .gf-tilt { transform: none; }
}

/* 玻璃文件夹卡片：340px对象按容器等比适配，114px顶部留出完整展开空间。 */
.gf-root { width: 100%; max-width: 340px; min-width: 0; }
.gf-object { position: relative; width: 100%; }
.gf-label { left: 28px; bottom: 32px; }
.gf-title { font-family: var(--ff-heading); }
/* 数字展示：数值用数字字族，中文单位和状态保持正文。 */
.numeric { font-family: var(--ff-mono); font-variant-numeric: tabular-nums; }
.gf-sheet-meta { max-width: 116px; overflow: hidden; text-overflow: ellipsis; }
@media (hover: none) { .gf-root:not([data-open]) { --gf-hinge: 0deg; --gf-lift: 42px; --gf-spread: 0px; --gf-fan: 0deg; --gf-stack: 15px; } }
@media (prefers-reduced-motion: reduce) { .gf-root:not([data-open]) { --gf-hinge: 0deg; --gf-lift: 42px; --gf-spread: 0px; --gf-fan: 0deg; --gf-stack: 15px; } .gf-root[data-open] .gf-sheet:is(:hover, :focus-visible) { transition: none; } }

</style>
