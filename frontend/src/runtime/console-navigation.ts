import type { ConsoleNavigationItem } from './console-actions'

// 多项目路由导航：侧栏只发布业务页面；登录和注册属于顶栏操作。
export function consolePublicNavigation(): ConsoleNavigationItem[] {
  return [{ key: 'monitor', label: '服务器监控', path: '/', public: true }]
}
