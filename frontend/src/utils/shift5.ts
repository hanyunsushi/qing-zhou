import { queryWithinQingzhou } from '@/runtime/runtime-keys'
import { nextTick, onMounted, ref, watch, type Ref } from 'vue'
import { currentPageLoad, finishPageLoad, nextPagePaint, setPageLoadingTarget, waitForPageRequests } from './page-loading'

const OVERLAY_CLASS = 'qz-shift5-route-transition'
const PENDING_CLASS = 'qz-shift5-route-transition-pending'
const REDUCED_MOTION = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let overlay: HTMLDivElement | null = null
let animations: Animation[] = []
let transitionToken = 0
let leavePromise: Promise<void> | null = null
let activeScope: 'full' | 'content' | 'settings' = 'full'
let pendingRoot: HTMLElement | null = null
export const fullShellTransitionPending = ref(false)

// 组件绘制动画：新导航撤销旧动画；加载阶段没有切屏遮罩或离场运动。
export function resetShift5Transition() {
  transitionToken++
  animations.forEach(animation => { try { animation.cancel() } catch (_) { /* already settled */ } })
  animations = []
  overlay?.remove()
  overlay = null
  pendingRoot?.classList.remove('qz-shift5-enter-pending')
  pendingRoot = null
  fullShellTransitionPending.value = false
  document.documentElement.classList.remove(PENDING_CLASS)
  leavePromise = null
  activeScope = 'full'
}

export function prepareShift5Route(scope: 'full' | 'content' | 'settings') {
  activeScope = scope
}

function positionContentOverlay(node: HTMLDivElement, host: HTMLElement | null) {
  if ((!['content', 'settings'].includes(activeScope) && !globalThis.__QINGZHOU_MICROFRONTEND__) || !host) {
    node.classList.remove('is-content')
    node.style.removeProperty('top')
    node.style.removeProperty('left')
    node.style.removeProperty('width')
    node.style.removeProperty('height')
    return
  }
  const rect = host.getBoundingClientRect()
  node.classList.add('is-content')
  // 组件绘制动画 / 滚动边界：固定遮罩只覆盖可见交集，不能以整段内容高度撑出额外滚动空白。
  const headerBottom = host.closest('.app-main')?.querySelector('.layout-header')?.getBoundingClientRect().bottom ?? 0
  const top = Math.max(0, headerBottom, rect.top), left = Math.max(0, rect.left)
  node.style.setProperty('top', `${top}px`, 'important')
  node.style.setProperty('left', `${left}px`, 'important')
  node.style.setProperty('width', `${Math.max(0, Math.min(window.innerWidth, rect.right) - left)}px`, 'important')
  node.style.setProperty('height', `${Math.max(0, Math.min(window.innerHeight, rect.bottom) - top)}px`, 'important')
}

function ensureOverlay(stage: string, scopeHost: HTMLElement | null = null) {
  if (globalThis.__QINGZHOU_MICROFRONTEND__ && !scopeHost) scopeHost = queryWithinQingzhou<HTMLElement>('.qz-shift5-page-shell')
  if (overlay?.isConnected) {
    overlay.dataset.stage = stage
    positionContentOverlay(overlay, scopeHost)
    return overlay
  }
  overlay = document.createElement('div')
  overlay.className = globalThis.__QINGZHOU_MICROFRONTEND__ ? `${OVERLAY_CLASS} console-kreeproxy-surface` : OVERLAY_CLASS
  overlay.dataset.stage = stage
  overlay.setAttribute('aria-hidden', 'true')
  positionContentOverlay(overlay, scopeHost)
  document.body.appendChild(overlay)
  return overlay
}

function track(animation: Animation | null) {
  if (animation) animations.push(animation)
  return animation
}

function prepareEnter(root: HTMLElement | null) {
  setPageLoadingTarget(root)
  fullShellTransitionPending.value = activeScope === 'full' && !!root
  animations.forEach(animation => {
    try { animation.cancel() } catch (_) { /* animation already completed */ }
  })
  animations = []
  if (pendingRoot && pendingRoot !== root) pendingRoot.classList.remove('qz-shift5-enter-pending')
  pendingRoot = root
  root?.classList.add('qz-shift5-enter-pending')
}

function lockScope(scope: 'full' | 'content' | 'settings', host: HTMLElement | null) {
  if (!['content', 'settings'].includes(scope) || !host) return
  fullShellTransitionPending.value = false
  if (pendingRoot && pendingRoot !== host) pendingRoot.classList.remove('qz-shift5-enter-pending')
  pendingRoot = host
  host.classList.add('qz-shift5-enter-pending')
}

function finish(token: number) {
  if (token !== transitionToken) return
  animations.forEach(animation => {
    try { animation.cancel() } catch (_) { /* animation already completed */ }
  })
  animations = []
  if (overlay?.isConnected) overlay.remove()
  overlay = null
  activeScope = 'full'
  fullShellTransitionPending.value = false
  const revealedRoot = pendingRoot
  revealedRoot?.classList.remove('qz-shift5-enter-pending')
  pendingRoot = null
  document.documentElement.classList.remove(PENDING_CLASS)
  leavePromise = null
  // 组件绘制在页面揭示后开始，避免短动画全部发生在遮罩下面。
  revealedRoot?.dispatchEvent(new Event('qz-shift5-entered', { bubbles: true }))
}

function waitForReady(root: HTMLElement) {
  const fonts = document.fonts?.ready
    ? Promise.race([document.fonts.ready.catch(() => undefined), new Promise(resolve => window.setTimeout(resolve, 1800))])
    : Promise.resolve()
  const media = Array.from(root.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video')).slice(0, 8)
    .map(node => {
      if (node instanceof HTMLImageElement && node.complete) return Promise.resolve()
      if (node instanceof HTMLVideoElement && node.readyState >= 2) return Promise.resolve()
      const event = node instanceof HTMLImageElement ? 'load' : 'loadeddata'
      return new Promise<void>(resolve => {
        node.addEventListener(event, () => resolve(), { once: true })
        window.setTimeout(resolve, 1600)
      })
    })
  return Promise.all([fonts, Promise.all(media)]).then(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))
}

function collectBlocks(root: HTMLElement) {
  const isPageShell = root.classList.contains('route-page-shell') || root.classList.contains('qz-shift5-page-shell')
  const view = isPageShell && root.firstElementChild instanceof HTMLElement ? root.firstElementChild : root
  const monitorContent = view.querySelector<HTMLElement>(':scope > .monitor-content')
  const source = monitorContent || view
  const children = Array.from(source.children).filter(node => {
    if (!(node instanceof HTMLElement) || node.tagName === 'SVG') return false
    const style = getComputedStyle(node)
    return style.display !== 'none' && node.offsetWidth > 0 && node.offsetHeight > 0
  })
  return children.length ? children : [source]
}

function collectShift5TitleNodes(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(
    '.page-title, .hero-title, .page-sub, .hero-sub, .settings-section-head > h3, .settings-section-head > p',
  )).filter(node => {
    const style = getComputedStyle(node)
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0
  })
}

export function startShift5Leave(scope: 'full' | 'content' | 'settings' = 'full') {
  if (REDUCED_MOTION || leavePromise) return leavePromise || Promise.resolve()
  activeScope = scope
  const host = scope === 'content'
    ? queryWithinQingzhou<HTMLElement>('.route-page-shell')
    : scope === 'settings'
      ? queryWithinQingzhou<HTMLElement>('.settings-main')
      : null
  lockScope(scope, host)
  const current = ensureOverlay('leaving', host)
  track(current.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 189,
    easing: 'ease-out',
    fill: 'forwards',
  }))
  leavePromise = new Promise(resolve => window.setTimeout(resolve, 189))
  return leavePromise
}

export async function runShift5Enter(root: HTMLElement | null) {
  const token = ++transitionToken
  const loadToken = currentPageLoad()
  const busy = () => !!root?.querySelector('.n-spin-content--spinning, .n-button--loading, [aria-busy="true"]')
  prepareEnter(root)
  try {
    // 加载反馈 / 组件绘制动画：请求和媒体先落定；小点阵消失后才播放切屏。
    if (!await waitForPageRequests(loadToken, busy)) return
    if (root) await waitForReady(root)
    if (!await waitForPageRequests(loadToken, busy) || token !== transitionToken) return
    if (!finishPageLoad(loadToken)) return
    await nextTick()
    await nextPagePaint()
    if (token !== transitionToken) return
    if (!root || REDUCED_MOTION) {
      finish(token)
      return
    }
    await startShift5Leave(activeScope)
    if (token !== transitionToken) return
    const host = ['content', 'settings'].includes(activeScope) ? root : null
    const current = ensureOverlay('revealing', host)
    fullShellTransitionPending.value = false
    const blocks = collectBlocks(root)
    document.documentElement.classList.remove(PENDING_CLASS)
    root.classList.remove('qz-shift5-enter-pending')
    const titleNodes = collectShift5TitleNodes(root)
    const titleSet = new Set(titleNodes)
    track(current.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 189,
      easing: 'ease-out',
      fill: 'forwards',
    }))
    let revealDuration = 1386 + blocks.length * 38
    titleNodes.forEach((node, titleIndex) => {
      track(node.animate([
        { transform: 'translateY(100%)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ], {
        duration: 1008,
        delay: 176 + titleIndex * 16,
        easing: 'cubic-bezier(.16,1,.3,1)',
        fill: 'both',
      }))
    })
    revealDuration = Math.max(revealDuration, 1184 + Math.max(0, titleNodes.length - 1) * 16)
    blocks.forEach((block, index) => {
      // 玻璃文件夹卡片 / 组件绘制动画：揭示边界包含对象的模糊投影，终帧不把阴影裁成横线；原时长与组装动画保持。
      const hasFolder = block.classList.contains('gf-root') || !!block.querySelector('.gf-root')
      track(block.animate([
        { clipPath: hasFolder ? 'inset(-96px -96px calc(100% + 96px) -96px)' : 'inset(0 0 100% 0)' },
        { clipPath: hasFolder ? 'inset(-96px)' : 'inset(0 0 0% 0)' },
      ], {
        duration: 1008,
        delay: 50 + index * 38,
        easing: 'cubic-bezier(.16,1,.3,1)',
        fill: 'both',
      }))
      const textNodes = Array.from(block.querySelectorAll<HTMLElement>(':scope > h1, :scope > h2, :scope > h3, :scope > p, :scope > .page-title, :scope > .page-sub, :scope > .n-card-header')).filter(node => !titleSet.has(node))
      revealDuration = Math.max(revealDuration, 1184 + index * 38 + Math.max(0, textNodes.length - 1) * 16)
      textNodes.forEach((node, textIndex) => {
        track(node.animate([
          { transform: 'translateY(100%)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ], {
          duration: 1008,
          delay: 176 + index * 38 + textIndex * 16,
          easing: 'cubic-bezier(.16,1,.3,1)',
          fill: 'both',
        }))
      })
    })
    window.setTimeout(() => finish(token), revealDuration)
  } catch (_) {
    finishPageLoad(loadToken)
    finish(token)
  }
}

export function useShift5PageTransition(root: Ref<HTMLElement | null>, routeKey: () => string, enabled: () => boolean = () => true, enterOnMount = true) {
  // 组件绘制动画：挂载期的首个route key由父级整壳切换拥有，避免重复揭示子壳。
  const initialRouteKey = routeKey()
  let mounted = false
  let routeChangedBeforeMount = false
  let ignoredInitialRouteKey: string | null = null
  onMounted(() => {
    mounted = true
    if (routeChangedBeforeMount || routeKey() !== initialRouteKey) ignoredInitialRouteKey = routeKey()
    if (enterOnMount && enabled()) void runShift5Enter(root.value)
  })
  watch(routeKey, async () => {
    if (!mounted) {
      routeChangedBeforeMount = true
      return
    }
    const key = routeKey()
    if (ignoredInitialRouteKey === key) {
      ignoredInitialRouteKey = null
      return
    }
    ignoredInitialRouteKey = null
    await nextTick()
    if (enabled()) void runShift5Enter(root.value)
  })
}
