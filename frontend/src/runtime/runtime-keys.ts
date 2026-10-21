import type { InjectionKey } from 'vue'

export const qingzhouStyleTargetKey: InjectionKey<HTMLElement> = Symbol('qingzhou-styles')
export const qingzhouEmbeddedKey: InjectionKey<boolean> = Symbol('qingzhou-embedded')

declare global {
  var __QINGZHOU_MICROFRONTEND__: boolean | undefined
}

let navigateEmbedded: ((path: string) => void) | null = null
export function setEmbeddedNavigator(navigate: ((path: string) => void) | null) {
  navigateEmbedded = navigate
}
export function navigateWithinConsole(path: string) {
  navigateEmbedded?.(path)
}

export function queryWithinQingzhou<T extends Element = HTMLElement>(selector: string): T | null {
  const root = globalThis.__QINGZHOU_MICROFRONTEND__
    ? document.querySelector('.console-remote-mount[data-remote-project="kreeproxy"]') : document
  return root?.querySelector<T>(selector) ?? null
}

let requestScope: AbortController | null = null
export function beginEmbeddedRequests() { requestScope = new AbortController() }
export function endEmbeddedRequests() { requestScope?.abort(); requestScope = null }
export function embeddedRequestSignal(signal?: AbortSignal | null): AbortSignal | undefined {
  if (!requestScope) return signal ?? undefined
  return signal ? AbortSignal.any([signal, requestScope.signal]) : requestScope.signal
}
