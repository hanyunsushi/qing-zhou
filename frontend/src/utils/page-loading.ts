import { nextTick, ref } from 'vue'

// 加载反馈：只收集当前页面准备期的请求，后续轮询和操作不重启切屏。
export const pageLoading = ref(true)
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

export function beginPageLoad() {
  if (token > 0) requests = new Set()
  token++
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
  notify()
  return true
}

export function cancelPageLoad(expected = token) {
  if (expected !== token) return
  token++
  requests = new Set()
  pageLoading.value = false
  notify()
}
