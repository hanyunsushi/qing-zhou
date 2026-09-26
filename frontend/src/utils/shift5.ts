import { nextTick, onMounted, watch, type Ref } from 'vue'

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

function positionContentOverlay(node: HTMLDivElement, host: HTMLElement | null) {
  if (!['content', 'settings'].includes(activeScope) || !host) {
    node.classList.remove('is-content')
    node.style.removeProperty('top')
    node.style.removeProperty('left')
    node.style.removeProperty('width')
    node.style.removeProperty('height')
    return
  }
  const rect = host.getBoundingClientRect()
  node.classList.add('is-content')
  node.style.top = `${rect.top}px`
  node.style.left = `${rect.left}px`
  node.style.width = `${rect.width}px`
  node.style.height = `${rect.height}px`
}

function ensureOverlay(stage: string, scopeHost: HTMLElement | null = null) {
  if (overlay?.isConnected) {
    overlay.dataset.stage = stage
    positionContentOverlay(overlay, scopeHost)
    return overlay
  }
  overlay = document.createElement('div')
  overlay.className = OVERLAY_CLASS
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
  pendingRoot?.classList.remove('qz-shift5-enter-pending')
  pendingRoot = null
  document.documentElement.classList.remove(PENDING_CLASS)
  leavePromise = null
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
    ? document.querySelector<HTMLElement>('.route-page-shell')
    : scope === 'settings'
      ? document.querySelector<HTMLElement>('.settings-main')
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
  prepareEnter(root)
  const host = ['content', 'settings'].includes(activeScope) ? root : null
  const current = ensureOverlay('revealing', host)
  if (!root || REDUCED_MOTION) {
    finish(token)
    return
  }
  try {
    await waitForReady(root)
    if (token !== transitionToken) return
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
      track(block.animate([
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)' },
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
    finish(token)
  }
}

export function useShift5PageTransition(root: Ref<HTMLElement | null>, routeKey: () => string, enabled: () => boolean = () => true, enterOnMount = true) {
  onMounted(() => { if (enterOnMount && enabled()) void runShift5Enter(root.value) })
  watch(routeKey, async () => {
    await nextTick()
    if (enabled()) void runShift5Enter(root.value)
  })
}
