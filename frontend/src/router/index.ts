import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { prepareShift5Route, resetShift5Transition } from '@/utils/shift5'
import { beginPageLoad, cancelPageLoad, currentPageLoad, finishPageLoad, waitForPageRequests } from '@/utils/page-loading'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/oauth2/callback', name: 'oauth-callback', component: () => import('@/views/OAuthCallback.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/AuthPage.vue'), meta: { authPage: true } },
    { path: '/register', name: 'register', component: () => import('@/views/AuthPage.vue'), meta: { authPage: true } },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('@/views/AuthPage.vue'), meta: { authPage: true } },
    {
      path: '/',
      name: 'monitor',
      component: () => import('@/views/Monitor.vue'),
    },
    {
      path: '/',
      component: () => import('@/components/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/UserDashboard.vue') },
        { path: 'sub', name: 'sub', component: () => import('@/views/UserSub.vue') },
        { path: 'shop', name: 'shop', component: () => import('@/views/UserShop.vue') },
        { path: 'orders', name: 'orders', component: () => import('@/views/UserOrders.vue') },
        { path: 'points', name: 'points', component: () => import('@/views/UserPoints.vue') },
        { path: 'notices', name: 'notices', component: () => import('@/views/UserNotices.vue') },
        { path: 'help', name: 'help', component: () => import('@/views/UserHelp.vue') },
        { path: 'account', name: 'account', component: () => import('@/views/UserAccount.vue') },
        { path: 'admin', name: 'admin', component: () => import('@/views/AdminOverview.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/upstreams', name: 'admin-upstreams', component: () => import('@/views/AdminUpstreams.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/users', name: 'admin-users', component: () => import('@/views/AdminUsers.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/packages', name: 'admin-packages', component: () => import('@/views/AdminPackages.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/user-groups', name: 'admin-user-groups', component: () => import('@/views/AdminUserGroups.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/nodes', name: 'admin-nodes', component: () => import('@/views/AdminNodes.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/singbox', name: 'admin-singbox', component: () => import('@/views/AdminSingbox.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/certs', name: 'admin-certs', component: () => import('@/views/AdminCerts.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/orders', name: 'admin-orders', component: () => import('@/views/AdminOrders.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/servers', name: 'admin-servers', component: () => import('@/views/AdminServers.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/monitor', name: 'admin-monitor', component: () => import('@/views/AdminMonitor.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/monitor/:id', name: 'admin-monitor-detail', component: () => import('@/views/AdminMonitorDetail.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/settings', name: 'admin-settings', component: () => import('@/views/AdminSettings.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/reg-codes', name: 'admin-regcodes', component: () => import('@/views/AdminRegCodes.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/api-tokens', name: 'admin-api-tokens', component: () => import('@/views/AdminAPITokens.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/announcements', name: 'admin-announcements', component: () => import('@/views/AdminAnnouncements.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/manual-notifications', name: 'admin-manual-notifications', component: () => import('@/views/AdminManualNotifications.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/help', name: 'admin-help', component: () => import('@/views/AdminHelp.vue'), meta: { requiresAdmin: true } },
        { path: 'admin/update', name: 'admin-update', component: () => import('@/views/AdminUpdate.vue'), meta: { requiresAdmin: true } },
      ],
    },
  ],
})

const loadTokens = new WeakMap<object, number>()
const authRouteNames = new Set(['login', 'register', 'forgot-password'])
const sameAuthShell = (to: { name?: unknown }, from: { name?: unknown }) =>
  authRouteNames.has(String(from.name)) && authRouteNames.has(String(to.name))

router.beforeEach(async (to, from) => {
  // 加载反馈 / 组件绘制动画：取消旧切屏，先准备权限、模块和目标页请求。
  resetShift5Transition()
  // 加载反馈：保留布局时立即在内容区定位；同页设置分区只以右侧主体为加载区域。
  const settingsSection = from.name === 'admin-settings' && to.name === 'admin-settings' && from.path === to.path
  // 首页监控和认证后的控制台都使用根路径，不能仅凭 matched[0] 判成同一常驻壳。
  const retainedLayout = from.name !== 'monitor' && to.name !== 'monitor'
    && from.matched.length > 1 && to.matched.length > 1 && from.matched[0] === to.matched[0]
  const loadingTarget = settingsSection ? document.querySelector<HTMLElement>('.settings-main')
    : retainedLayout ? document.querySelector<HTMLElement>('.layout-content') : null
  loadTokens.set(to, beginPageLoad(loadingTarget))
  if (to.name === 'oauth-callback') return
  const auth = useAuthStore()

  // 等待 auth 初始化完成（首次加载时由 HttpOnly cookie 恢复会话）。
  if (!auth.loaded) {
    await auth.init()
  }

  if (to.name === 'monitor' && to.query.login === '1') {
    return { name: 'login', query: to.query.redirect ? { redirect: String(to.query.redirect) } : undefined }
  }
  if (to.meta.authPage && auth.isLoggedIn) return { name: 'dashboard' }

  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
  const requiresAdmin = to.matched.some(r => r.meta.requiresAdmin)

  if (requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (requiresAdmin && !auth.isAdmin) {
    return { name: 'monitor' }
  }

})

router.beforeResolve((to, from) => {
  // 组件绘制动画：这里只选择切屏区域，不在页面加载时播放离场动画。
  const settingsSectionChange = from.name === 'admin-settings'
    && to.name === 'admin-settings'
    && from.path === to.path
    && from.query.section !== to.query.section
  if (from.name && to.fullPath !== from.fullPath && to.name !== 'oauth-callback' && !sameAuthShell(to, from)) {
    const sameDashboardShell = from.name !== 'monitor' && to.name !== 'monitor'
      && from.matched.length > 1
      && to.matched.length > 1
      && from.matched[0] === to.matched[0]
    prepareShift5Route(settingsSectionChange ? 'settings' : sameDashboardShell ? 'content' : 'full')
  }
})

router.afterEach((to, from, failure) => {
  const token = loadTokens.get(to)
  if (token === undefined || token !== currentPageLoad()) return
  if (failure) {
    cancelPageLoad(token)
    resetShift5Transition()
  } else if (to.name === 'oauth-callback' || sameAuthShell(to, from) || to.fullPath === from.fullPath) {
    void waitForPageRequests(token).then(ready => { if (ready) finishPageLoad(token) })
  }
})

router.onError((_error, to) => {
  const token = loadTokens.get(to)
  if (token === undefined || token !== currentPageLoad()) return
  cancelPageLoad(token)
  resetShift5Transition()
})

export default router
