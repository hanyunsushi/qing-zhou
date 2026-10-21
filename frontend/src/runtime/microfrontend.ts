import { watchEffect, createApp, ref } from 'vue'
import { createPinia, disposePinia } from 'pinia'
import App from '@/App.vue'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import { apiGet } from '@/api'
import { createSidebarNavigation, describeNavigation } from '@/composables/useSidebarNavigation'
import { consolePublicNavigation } from './console-navigation'
import { consoleTopbarActions } from './console-topbar'
import { createQingZhouRouter } from '@/router'
import { qingzhouEmbeddedKey, qingzhouStyleTargetKey, setEmbeddedNavigator, beginEmbeddedRequests, endEmbeddedRequests } from './runtime-keys'
import { createConsoleActionBridge, consoleBridgeKey, type ConsoleAction, type ConsoleSession, type ConsoleNavigationItem } from './console-actions'
import { cancelPageLoad } from '@/utils/page-loading'
import { resetShift5Transition } from '@/utils/shift5'
import '@/styles/global.css'
import './page-layout.css'

export interface QingZhouMicrofrontendContext {
  onVersionStatus?: (status: {state: 'checking'|'current'|'available'|'error';latest?: string}) => void
  onVersion?: (version: string) => void
  onPageLayout?: (layout: 'page' | 'content') => void
  onSession?: (session: ConsoleSession) => void
  onNavigation?: (items: ConsoleNavigationItem[]) => void
  topbarTarget?: HTMLElement
  onHeader?: (header: { mounted: boolean; title: string; ready?: boolean }) => void
  initialPath: string
  onNavigate: (path: string) => void
  onTopbarActions: (actions: ConsoleAction[]) => void
}

export async function mount(container: HTMLElement, context: QingZhouMicrofrontendContext) {
  globalThis.__QINGZHOU_MICROFRONTEND__ = true
  beginEmbeddedRequests()
  container.classList.add('console-kreeproxy-surface')
  const styleTarget = document.createElement('div')
  const appRoot = document.createElement('div')
  container.append(styleTarget, appRoot)
  // Naive UI creates styles at runtime. Scope only its dedicated style target,
  // never patch document/head or the Host's styles.
  const scopeStyles = () => {
    styleTarget.querySelectorAll('style').forEach(style => {
      if (style.textContent && !style.textContent.startsWith('@scope')) {
        style.textContent = `@scope (.console-kreeproxy-surface) {${style.textContent}}`
      }
    })
  }
  const observer = new MutationObserver(scopeStyles)
  observer.observe(styleTarget, { childList: true, subtree: true, characterData: true })
  const router = createQingZhouRouter(true)
  const app = createApp(App)
  const pinia = createPinia()
  let disposed = false
  // 数字展示 / 提示信息：版本检查仍由原应用权限和后端负责，只读，不执行更新。
  async function checkVersion() {
    if (disposed || !auth.isAdmin) return
    context.onVersionStatus?.({state:'checking'})
    try {
      const info = await apiGet<{latest:string;update_available:boolean}>('/api/admin/update/check')
      if (!disposed) context.onVersionStatus?.({state:info.update_available ? 'available':'current',latest:info.latest})
    } catch { if (!disposed) context.onVersionStatus?.({state:'error'}) }
  }

  let stopSession = () => {}
  let ready = false
  app.use(pinia)
  const auth = useAuthStore(pinia)
  const config = useConfigStore(pinia)
  const { allMenuOptions } = createSidebarNavigation(() => auth.isAdmin)
  const publishNavigation = () => context.onNavigation?.([
    ...consolePublicNavigation(),
    ...(auth.isLoggedIn ? describeNavigation(allMenuOptions.value).filter(item => item.path !== '/') : []),
  ])
  app.provide(qingzhouEmbeddedKey, true)
  const headerMounted = ref(false)
  let headerOwner: symbol | null = null
  const actions = createConsoleActionBridge(() => headerMounted.value ? [] : consoleTopbarActions({
    authenticated: auth.isLoggedIn, registrationOpen: config.config.registration_open,
    path: router.currentRoute.value.path, publicPage: !router.currentRoute.value.meta.requiresAuth,
    navigate: path => router.push(path),
  }), items => { if (!disposed) context.onTopbarActions(items) })
  app.provide(qingzhouStyleTargetKey, styleTarget)
  app.provide(consoleBridgeKey, {
      requestLogout: () => window.dispatchEvent(new CustomEvent('console-session-action', { detail: { project: 'kreeproxy', key: 'logout' } })),
    topbarTarget: context.topbarTarget,
    setHeader: (owner, header) => {
      if (disposed || (!header && owner !== headerOwner)) return
      headerOwner = header ? owner : null
      headerMounted.value = header?.mounted ?? false
      context.onHeader?.(header ?? { mounted: false, title: '' })
      actions.update()
    },
    setNavigation: () => { if (!disposed) publishNavigation() },
    setActions: items => { if (!disposed) actions.setActions(items) },
    register: actions.register,
  })
  const removeNavigationBridge = router.afterEach((to, _from, failure) => {
    if (ready && !disposed && !failure) {
      context.onPageLayout?.(to.meta.requiresAuth ? 'content' : 'page')
      context.onNavigate(to.fullPath)
    }
  })
  setEmbeddedNavigator(path => { if (!disposed) void router.push(path) })
  app.use(router)

  const unmount = () => {
    if (disposed) return
    disposed = true
    stopSession()
    removeNavigationBridge()
    setEmbeddedNavigator(null)
    endEmbeddedRequests()
    app.unmount()
    disposePinia(pinia)
    cancelPageLoad()
    resetShift5Transition()
    observer.disconnect()
    container.replaceChildren()
    container.classList.remove('console-kreeproxy-surface')
    document.querySelectorAll('.console-kreeproxy-surface:not(.console-remote-mount)').forEach(node => node.remove())
    globalThis.__QINGZHOU_MICROFRONTEND__ = undefined
  }
  try {
    await router.replace(context.initialPath)
    await router.isReady()
    // 顶栏 / 加载反馈：先解析真实公开配置，登录和注册随同一组动作交给宿主。
    await config.fetchConfig()
    // 数字展示：来自当前青舟后端健康接口，不使用前端包版本替代。
    void apiGet<{ version?: string }>('/api/health').then(data => {
      if (!disposed && data?.version) context.onVersion?.(data.version)
    }).catch(() => { /* 版本读取失败不阻止原应用挂载。 */ })
    context.onPageLayout?.(router.currentRoute.value.meta.requiresAuth ? 'content' : 'page')
    stopSession = watchEffect(() => {
      context.onSession?.({ authenticated: auth.isLoggedIn, isAdmin: auth.isAdmin, username: auth.user?.username ?? '' })
      publishNavigation()
      actions.update()
    })
    app.mount(appRoot)
    scopeStyles()
    ready = true
    context.onNavigate(router.currentRoute.value.fullPath)
    return {
      navigate: async (path: string) => { await router.replace(path) },
      logout: async () => { await auth.logout(); await router.replace('/login') },
      checkVersion,
      dispatchTopbarAction: actions.dispatch,
      unmount,
    }
  } catch (error) {
    unmount()
    throw error
  }
}
