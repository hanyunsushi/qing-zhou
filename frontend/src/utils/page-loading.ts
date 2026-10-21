import { nextTick, onScopeDispose, ref, watch } from 'vue'

// 加载反馈：只收集当前页面准备期的请求，后续轮询和操作不重启切屏。
export const pageLoading = ref(true)
export const pageLoadingTarget = ref<HTMLElement | null>(null)
export const setPageLoadingTarget = (target: HTMLElement | null) => { pageLoadingTarget.value = target }
let token = 0
let revision = 0
let requests = new Set<symbol>()
const listeners = new Set<() => void>()

function notify() {
  revision++
  const pending = [...listeners]
  listeners.clear()
  pending.forEach(resolve => resolve())
}

export function beginPageLoad(target: HTMLElement | null = null) {
  if (token > 0) requests = new Set()
  token++
  pageLoadingTarget.value = target
  pageLoading.value = true
  notify()
  return token
}

export const currentPageLoad = () => token

export async function trackPageRequest<T>(run: () => Promise<T>): Promise<T> {
  if (!pageLoading.value) return run()
  const group = requests
  const id = Symbol()
  group.add(id)
  notify()
  try {
    return await run()
  } finally {
    group.delete(id)
    if (group === requests) notify()
  }
}

export function nextPagePaint() {
  return new Promise<void>(resolve => {
    const fallback = window.setTimeout(done, 50)
    const frame = requestAnimationFrame(done)
    function done() {
      window.clearTimeout(fallback)
      cancelAnimationFrame(frame)
      resolve()
    }
  })
}

export async function waitForPageRequests(expected = token, busy: () => boolean = () => false) {
  while (expected === token && pageLoading.value) {
    await nextTick()
    if (expected !== token) return false
    if (requests.size) {
      await new Promise<void>(resolve => listeners.add(resolve))
      continue
    }
    const version = revision
    await nextPagePaint()
    await nextPagePaint()
    if (version === revision && requests.size === 0 && !busy()) return expected === token
  }
  return expected === token
}

export function finishPageLoad(expected = token) {
  if (expected !== token) return false
  pageLoading.value = false
  pageLoadingTarget.value = null
  notify()
  return true
}

export function cancelPageLoad(expected = token) {
  if (expected !== token) return
  token++
  requests = new Set()
  pageLoading.value = false
  pageLoadingTarget.value = null
  notify()
}

type LoadingRect = { left: number; top: number; right: number; bottom: number }
// 加载反馈：只在目标区域与可见视口的交集中居中；保留的顶栏不能进入计算范围。
export function loadingRegionCenter(target: LoadingRect | null, viewport: LoadingRect, headerBottom = viewport.top) {
  const left = Math.max(viewport.left, target?.left ?? viewport.left)
  const right = Math.min(viewport.right, target?.right ?? viewport.right)
  const top = Math.max(viewport.top, target ? headerBottom : viewport.top, target?.top ?? viewport.top)
  const bottom = Math.min(viewport.bottom, target?.bottom ?? viewport.bottom)
  if (right <= left || bottom <= top) return { visibility: 'hidden' as const }
  return { left: `${(left + right) / 2}px`, top: `${(top + bottom) / 2}px`, visibility: 'visible' as const }
}

// 加载反馈：跟随当前加载壳的真实尺寸、滚动和手机可见视口；结束后释放监听与观察器。
export function usePageLoadingPosition(fallbackRegion: () => HTMLElement | null = () => null) {
  const position = ref<ReturnType<typeof loadingRegionCenter>>({ visibility: 'hidden' })
  let observer: ResizeObserver | undefined, frame = 0
  function region() {
    const target = pageLoadingTarget.value
    if (!target || !target.isConnected) return fallbackRegion()
    if (target.classList.contains('settings-main')) return target
    if (target.classList.contains('route-page-shell')) return target.closest<HTMLElement>('.layout-content') || target
    if (target.classList.contains('qz-shift5-page-shell')) return fallbackRegion()
    return target
  }
  function measure() {
    const viewport = window.visualViewport
    const left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0
    const bounds = { left, top, right: left + (viewport?.width ?? window.innerWidth), bottom: top + (viewport?.height ?? window.innerHeight) }
    const target = region()
    const header = target?.closest('.app-main')?.querySelector<HTMLElement>(':scope > .layout-header')
    const headerBottom = header?.getBoundingClientRect().bottom ?? top
    position.value = loadingRegionCenter(target?.getBoundingClientRect() ?? null, bounds, headerBottom)
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure() }) }
  function stop() {
    observer?.disconnect(); observer = undefined
    cancelAnimationFrame(frame); frame = 0
    window.removeEventListener('resize', schedule)
    document.removeEventListener('scroll', schedule, true)
    window.visualViewport?.removeEventListener('resize', schedule)
    window.visualViewport?.removeEventListener('scroll', schedule)
  }
  const unwatch = watch([pageLoading, pageLoadingTarget], () => {
    stop()
    if (!pageLoading.value) return
    measure()
    // 加载反馈：首次手机布局在同一轮Vue更新后复核，侧栏尺寸变化在绘制前直接重算。
    void nextTick(() => { if (pageLoading.value) measure() })
    const target = region()
    if (target) {
      observer = new ResizeObserver(measure)
      observer.observe(target)
      const header = target.closest('.app-main')?.querySelector<HTMLElement>(':scope > .layout-header')
      if (header) observer.observe(header)
    }
    window.addEventListener('resize', schedule, { passive: true })
    document.addEventListener('scroll', schedule, { passive: true, capture: true })
    window.visualViewport?.addEventListener('resize', schedule, { passive: true })
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true })
  }, { immediate: true, flush: 'sync' })
  onScopeDispose(() => { unwatch(); stop() })
  return position
}
