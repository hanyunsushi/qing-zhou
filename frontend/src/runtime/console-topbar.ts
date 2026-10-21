import type { ConsoleActionBinding } from './console-actions'

// 顶栏 / 普通按钮 / 强调按钮：入口归属当前应用，注册沿用原配置与路由。
export function consoleTopbarActions(options: {
  authenticated: boolean
  registrationOpen: boolean
  path: string
  publicPage: boolean
  navigate: (path: string) => unknown
}): ConsoleActionBinding[] {
  const { authenticated, registrationOpen, path, publicPage, navigate } = options
  if (authenticated) return publicPage ? [{ key: 'console.dashboard', label: '控制台', run: () => navigate('/dashboard') }] : []
  return [
    ...(path !== '/login' ? [{ key: 'console.login', label: '登录', variant: 'primary' as const, run: () => navigate('/login') }] : []),
    ...(registrationOpen && path !== '/register' ? [{ key: 'console.register', label: '注册', run: () => navigate('/register') }] : []),
  ]
}
