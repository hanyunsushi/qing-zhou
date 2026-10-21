import { inject, onBeforeUnmount, watchEffect, type InjectionKey, type VNodeChild } from 'vue'

export interface ConsoleAction {
  key: string
  label: string
  icon?: 'language' | 'book'
  variant?: 'standard' | 'primary'
  disabled?: boolean
  loading?: boolean
}
export interface ConsoleActionBinding extends Omit<ConsoleAction, 'disabled' | 'loading'> {
  run: () => unknown
  disabled?: () => boolean
  loading?: () => boolean
}
export interface ConsoleSession {
  authenticated: boolean
  isAdmin: boolean
  username: string
}
export interface ConsoleNavigationItem {
  key: string
  label: string
  path?: string
  group?: boolean
  public?: boolean
  sidebar?: boolean
  expanded?: boolean
  icon?: () => VNodeChild
  disabled?: boolean
  children?: ConsoleNavigationItem[]
}

export interface ConsoleBridge {
  requestLogout?: () => void
  topbarTarget?: HTMLElement
  setHeader?: (owner: symbol, header: { mounted: boolean; title: string; ready?: boolean } | null) => void
  setNavigation: (items: ConsoleNavigationItem[]) => void
  setActions: (actions: ConsoleAction[]) => void
  register: (handler: (key: string) => void) => () => void
}
export const consoleBridgeKey: InjectionKey<ConsoleBridge> = Symbol('console-bridge')

// 顶栏：应用入口与当前页面动作合并；旧页面卸载不能清掉新页面或应用入口。
export function createConsoleActionBridge(applicationActions: () => ConsoleActionBinding[], publish: (actions: ConsoleAction[]) => void) {
  let pageActions: ConsoleAction[] = []
  let pageHandler: ((key: string) => void) | null = null
  const update = () => publish([
    ...pageActions,
    ...applicationActions().map(({ run: _run, disabled, loading, ...action }) => ({
      ...action, disabled: disabled?.(), loading: loading?.(),
    })),
  ])
  return {
    update,
    setActions(actions: ConsoleAction[]) { pageActions = actions; update() },
    register(handler: (key: string) => void) {
      pageHandler = handler
      return () => {
        if (pageHandler !== handler) return
        pageHandler = null
        pageActions = []
        update()
      }
    },
    dispatch(key: string) {
      const action = applicationActions().find(item => item.key === key)
      if (action) {
        if (!action.disabled?.() && !action.loading?.()) void action.run()
      } else if (pageActions.some(item => item.key === key && !item.disabled && !item.loading)) {
        pageHandler?.(key)
      }
    },
  }
}

// 顶栏 / 普通按钮：只向宿主注册描述和原业务回调，不改变独立页面视觉。
export function useConsoleActions(actions: ConsoleActionBinding[]) {
  const bridge = inject(consoleBridgeKey, null)
  if (!bridge) return
  const unregister = bridge.register(key => {
    const action = actions.find(item => item.key === key)
    if (action && !action.disabled?.() && !action.loading?.()) void action.run()
  })
  watchEffect(() => bridge.setActions(actions.map(({ run: _run, disabled, loading, ...action }) => ({
    ...action, disabled: disabled?.(), loading: loading?.(),
  }))))
  onBeforeUnmount(unregister)
}

// 多项目路由导航：复用应用现有菜单结果；同源ESM保留原图标渲染函数，不读取业务凭据。
export function useConsoleNavigation(items: () => ConsoleNavigationItem[]) {
  const bridge = inject(consoleBridgeKey, null)
  if (bridge) watchEffect(() => bridge.setNavigation(items()))
}

// 顶栏：原控件Teleport到唯一Shell，仍在原应用上下文中处理账户/公告/订阅；旧组件卸载不清除新组件。
export function useConsoleHeader(title: () => string, ready: () => boolean = () => true) {
  const bridge = inject(consoleBridgeKey, null)
  const owner = Symbol('console-header')
  if (bridge?.topbarTarget) {
    watchEffect(() => bridge.setHeader?.(owner, { mounted: true, title: title(), ready: ready() }))
    onBeforeUnmount(() => bridge.setHeader?.(owner, null))
  }
  return bridge?.topbarTarget
}

// 顶栏：原退出入口交给Host既有会话队列，避免切项目时卸载中断撤销请求；独立站仍执行原回调。
export function useConsoleLogout() {
  const bridge = inject(consoleBridgeKey, null)
  return () => {
    if (!bridge?.requestLogout) return false
    bridge.requestLogout()
    return true
  }
}
