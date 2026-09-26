<template>
  <div class="app-shell" :class="{ mobile: isMobile }">
    <!-- 桌面侧边栏 -->
    <aside v-if="!isMobile" class="app-sider sidebar-surface" :class="{ 'is-collapsed': sidebarCollapsed }">
      <div class="sidebar-brand" @click="router.push('/')">
        <!-- Logo -->
        <div class="sidebar-logo"><BrandMark :size="40" /></div>
        <div class="brand-copy">
          <span class="brand-text">{{ config.config.site_name || 'Kreeproxy' }}</span>
          <span class="brand-caption">服务控制台</span>
        </div>
      </div>
      <nav id="desktop-sidebar-nav" class="sidebar-menu">
        <!-- 填写框 -->
        <div class="sidebar-filter">
          <input v-model="sidebarQuery" type="search" placeholder="筛选导航" aria-label="筛选导航" autocomplete="off" @keydown.esc="sidebarQuery = ''" />
          <kbd v-if="!sidebarQuery" aria-hidden="true">/</kbd>
        </div>
        <n-menu :value="activeKey" :options="menuOptions" :default-expanded-keys="defaultExpandedKeys" :indent="18" :node-props="menuNodeProps" @update:value="handleMenuSelect" />
      </nav>
      <!-- 侧边栏折叠按钮：桌面切换完整导航与图标轨道，移动端继续使用抽屉；桌面与移动 Drawer 共用同一 footer 样式。 -->
      <div class="sidebar-footer">
        <button
          class="sidebar-collapse-button"
          type="button"
          :aria-label="sidebarCollapsed ? '展开侧栏' : '收起侧栏'"
          :aria-expanded="!sidebarCollapsed"
          aria-controls="desktop-sidebar-nav"
          :title="sidebarCollapsed ? '展开侧栏' : '收起侧栏'"
          @click="toggleSidebar"
        >
          <span class="sidebar-collapse-mark" aria-hidden="true">
            <n-icon :size="14"><component :is="sidebarCollapsed ? ChevronForwardOutline : ChevronBackOutline" /></n-icon>
            <n-icon :size="14"><component :is="sidebarCollapsed ? ChevronForwardOutline : ChevronBackOutline" /></n-icon>
          </span>
          <span v-if="!sidebarCollapsed">收起侧栏</span>
        </button>
      </div>
    </aside>

    <!-- 移动端抽屉 -->
    <n-drawer v-model:show="drawerShow" placement="left" :width="300" :block-scroll="true"
              class="mobile-sidebar-drawer-root" content-class="mobile-sidebar-drawer">
      <n-drawer-content :native-scrollbar="true" body-content-style="padding:0;">
        <div class="sidebar-surface mobile-sidebar">
          <div class="sidebar-brand" @click="goAndClose('/')">
            <!-- Logo -->
            <div class="sidebar-logo"><BrandMark :size="40" /></div>
            <div class="brand-copy">
              <span class="brand-text">{{ config.config.site_name || 'Kreeproxy' }}</span>
              <span class="brand-caption">服务控制台</span>
            </div>
          </div>
          <nav id="mobile-sidebar-nav" class="sidebar-menu">
            <!-- 填写框 -->
            <div class="sidebar-filter">
              <input v-model="sidebarQuery" type="search" placeholder="筛选导航" aria-label="筛选导航" autocomplete="off" @keydown.esc="sidebarQuery = ''" />
              <kbd v-if="!sidebarQuery" aria-hidden="true">/</kbd>
            </div>
            <n-menu :value="activeKey" :options="menuOptions" :default-expanded-keys="defaultExpandedKeys" :indent="18" :node-props="menuNodeProps" @update:value="goAndClose" />
          </nav>
          <!-- 侧边栏折叠按钮：移动端沿用同一 footer 几何，收起即关闭 Drawer。 -->
          <div class="sidebar-footer">
            <button
              class="sidebar-collapse-button"
              type="button"
              aria-label="收起侧栏"
              aria-expanded="true"
              aria-controls="mobile-sidebar-nav"
              title="收起侧栏"
              @click="drawerShow = false"
            >
              <span class="sidebar-collapse-mark" aria-hidden="true">
                <n-icon :size="14"><ChevronBackOutline /></n-icon>
                <n-icon :size="14"><ChevronBackOutline /></n-icon>
              </span>
              <span>收起侧栏</span>
            </button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- 主区 -->
    <div class="app-main">
      <header class="layout-header" :class="{ 'is-scrolled': isScrolled, 'is-menu-open': openMenu !== null }">
        <div class="header-left">
          <!-- 悬浮菜单按钮：复用 Sub2 竖屏侧栏按钮的路径、尺寸与透明状态。 -->
          <button v-if="isMobile" class="icon-btn app-header-menu-toggle" @click="drawerShow = true" aria-label="菜单">
            <svg class="app-header-menu-toggle-icon" aria-hidden="true" fill="none" viewBox="0 0 32 32" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path stroke-dasharray="12 63" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22" />
              <path d="M7 16 27 16" />
            </svg>
          </button>
          <span class="header-title">{{ currentTitle }}</span>
        </div>
        <!-- 填写框 -->
        <div v-if="!isMobile" class="header-search">
          <n-icon class="header-search-icon" :size="17"><SearchOutline /></n-icon>
          <n-auto-complete
            v-model:value="searchQuery"
            :options="searchOptions"
            placeholder="搜索功能"
            clear-after-select
            @select="handleSearchSelect"
            @keydown.enter="openFirstSearchResult"
          />
          <kbd>Ctrl K</kbd>
        </div>
        <div class="header-right">
          <template v-if="auth.isAdmin && !isMobile">
            <TopbarHoverMenu :open="openMenu === 'admin'" :options="adminQuickMenu" @open="setMenuOpen('admin', true)" @close="setMenuOpen('admin', false)" @select="handleAdminSelect">
              <template #trigger>
              <!-- 悬浮下拉菜单：管理入口复制 Sub2 语言切换的控件几何。 -->
              <n-button quaternary size="small" class="dashboard-dropdown-trigger topbar-language-reference-trigger" :aria-expanded="openMenu === 'admin'" aria-haspopup="menu">管理</n-button>
              </template>
            </TopbarHoverMenu>
          </template>
          <!-- 悬浮下拉菜单：控制台账户入口采用共享的触发器悬浮几何。 -->
          <TopbarHoverMenu :open="openMenu === 'account'" :options="userMenu" @open="setMenuOpen('account', true)" @close="setMenuOpen('account', false)" @select="handleUserSelect">
            <template #trigger>
            <n-button quaternary size="small" class="account-button dashboard-dropdown-trigger topbar-language-reference-trigger topbar-account-trigger" :aria-expanded="openMenu === 'account'" aria-haspopup="menu">
              <svg class="topbar-account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.25"/><path d="M5.9 19c.75-3.35 2.8-5.1 6.1-5.1s5.35 1.75 6.1 5.1"/></svg>
              <span v-if="!isMobile" class="account-name">{{ auth.user?.username }}</span>
            </n-button>
            </template>
          </TopbarHoverMenu>
        </div>
      </header>
      <main class="layout-content">
        <router-view v-slot="{ Component, route: viewRoute }">
          <div ref="routeShell" :key="viewRoute.path" class="route-page-shell">
            <component :is="Component" :key="viewRoute.path" />
          </div>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NDrawer, NDrawerContent, NButton, NIcon, NMenu, NAutoComplete } from 'naive-ui'
import type { MenuGroupOption, MenuOption } from 'naive-ui'
import {
  SpeedometerOutline, LinkOutline, CartOutline,
  ReceiptOutline, WalletOutline, MegaphoneOutline, BookOutline,
  PersonOutline, PeopleOutline, PeopleCircleOutline, ArchiveOutline, ServerOutline,
  SettingsOutline, KeyOutline, NotificationsOutline, DocumentTextOutline,
  PulseOutline, HardwareChipOutline, HomeOutline, LogOutOutline, CloudDownloadOutline, CloudOutline,
  ShieldCheckmarkOutline, SearchOutline, ChevronBackOutline, ChevronForwardOutline
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import BrandMark from './BrandMark.vue'
import TopbarHoverMenu from './TopbarHoverMenu.vue'
import { openHelp } from '@/utils/help'
import { useMutualHoverMenu } from '@/utils/topbar-menu'
import { useShift5PageTransition } from '@/utils/shift5'
import { useTopbarScrollState } from '@/utils/topbar-glass'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const config = useConfigStore()

const activeKey = computed(() => route.path)
const searchQuery = ref('')
const sidebarQuery = ref('')
const sidebarCollapsed = ref(false)
const routeShell = ref<HTMLElement | null>(null)
useShift5PageTransition(routeShell, () => route.fullPath, () => route.name !== 'admin-settings')
const { isScrolled } = useTopbarScrollState()

// ---- 响应式：移动端判定 ----
const isMobile = ref(false)
const drawerShow = ref(false)

function checkMobile() {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches
  if (!isMobile.value) drawerShow.value = false
}
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => window.removeEventListener('resize', checkMobile))

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

function groupLabel(text: string) {
  return () => h('span', { class: 'menu-group-label' }, text)
}

type SidebarMenuOption = (MenuOption | MenuGroupOption) & { sidebarLabel?: string }

// 侧边栏菜单归类级别：一级归类只作为静态分组标题，不显示 SVG、箭头或层级竖线。
function menuSection(key: string, label: string, children: MenuOption[]): SidebarMenuOption {
  return { type: 'group', key, label: groupLabel(label), children, sidebarLabel: label }
}

function menuNodeProps(option: MenuOption | MenuGroupOption) {
  const label = typeof option.label === 'string' ? option.label : ''
  return sidebarCollapsed.value && label ? { title: label } : {}
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 侧边栏菜单归类级别：二级菜单项，直接挂在一级归类下，保留 SVG 图标。
const userMenuItems: MenuOption[] = [
  { label: '控制台', key: '/dashboard', icon: renderIcon(SpeedometerOutline) },
  { label: '订阅管理', key: '/sub', icon: renderIcon(LinkOutline) },
]

// 侧边栏菜单归类级别：二级菜单项，直接挂在一级归类下，保留 SVG 图标。
const shopItems: MenuOption[] = [
  { label: '订阅套餐', key: '/shop', icon: renderIcon(CartOutline) },
  { label: '订单记录', key: '/orders', icon: renderIcon(ReceiptOutline) },
  { label: '积分明细', key: '/points', icon: renderIcon(WalletOutline) },
]

// 侧边栏菜单归类级别：二级菜单项；信息下另有三级管理后台归类。
const infoLeafItems: MenuOption[] = [
  { label: '公告通知', key: '/notices', icon: renderIcon(MegaphoneOutline) },
  { label: '帮助中心', key: '/help', icon: renderIcon(BookOutline) },
  { label: '账户设置', key: '/account', icon: renderIcon(PersonOutline) },
]

// 侧边栏菜单归类级别：三级归类下的页面项，继续保留 SVG 图标。
const adminOpsItems: MenuOption[] = [
  { label: '上游管理', key: '/admin/upstreams', icon: renderIcon(CloudOutline) },
  { label: '管理概览', key: '/admin', icon: renderIcon(SpeedometerOutline) },
  { label: '用户管理', key: '/admin/users', icon: renderIcon(PeopleOutline) },
  { label: '用户组', key: '/admin/user-groups', icon: renderIcon(PeopleCircleOutline) },
  { label: '套餐管理', key: '/admin/packages', icon: renderIcon(ArchiveOutline) },
  { label: '订单管理', key: '/admin/orders', icon: renderIcon(ReceiptOutline) },
  { label: '注册码', key: '/admin/reg-codes', icon: renderIcon(KeyOutline) },
  { label: 'API Token', key: '/admin/api-tokens', icon: renderIcon(KeyOutline) },
]
const adminNodeItems: MenuOption[] = [
  { label: '节点管理', key: '/admin/nodes', icon: renderIcon(ServerOutline) },
  { label: 'sing-box', key: '/admin/singbox', icon: renderIcon(HardwareChipOutline) },
  { label: '证书管理', key: '/admin/certs', icon: renderIcon(ShieldCheckmarkOutline) },
  { label: '服务器', key: '/admin/servers', icon: renderIcon(ServerOutline) },
  { label: '监控管理', key: '/admin/monitor', icon: renderIcon(PulseOutline) },
]
const adminSysItems: MenuOption[] = [
  { label: '公告管理', key: '/admin/announcements', icon: renderIcon(NotificationsOutline) },
  { label: '手动通知', key: '/admin/manual-notifications', icon: renderIcon(MegaphoneOutline) },
  { label: '帮助文档', key: '/admin/help', icon: renderIcon(DocumentTextOutline) },
  { label: '系统设置', key: '/admin/settings', icon: renderIcon(SettingsOutline) },
  { label: '在线更新', key: '/admin/update', icon: renderIcon(CloudDownloadOutline) },
]

// 侧边栏菜单归类级别：二级菜单项与三级归类均保留 SVG 图标；账户设置和管理后台归入信息。
const infoItems = computed<MenuOption[]>(() => [
  ...infoLeafItems,
  ...(auth.isAdmin ? [{
    label: '管理后台', key: 'admin-root', icon: renderIcon(SettingsOutline), children: [
      // 侧边栏菜单归类级别：三级归类，保留 SVG 图标和展开箭头。
      { label: '运营', key: 'ag-ops', icon: renderIcon(PulseOutline), children: adminOpsItems },
      { label: '节点服务', key: 'ag-node', icon: renderIcon(ServerOutline), children: adminNodeItems },
      { label: '内容系统', key: 'ag-sys', icon: renderIcon(DocumentTextOutline), children: adminSysItems },
    ],
  }] : []),
])

const allMenuOptions = computed<MenuOption[]>(() => {
  // 侧边栏菜单归类级别：一级归类标题使用静态 group，避免一级菜单产生箭头、竖线和伸缩。
  const items: MenuOption[] = [
    { label: '首页', key: '/', icon: renderIcon(HomeOutline) },
    menuSection('g-common', '常用', userMenuItems),
    menuSection('g-shop', '商城', shopItems),
    menuSection('g-info', '信息', infoItems.value),
  ]
  return items
})

const defaultExpandedKeys = ['admin-root', 'ag-ops', 'ag-node', 'ag-sys']

function filterMenuOptions(options: MenuOption[], query: string): MenuOption[] {
  if (!query) return options
  return options.flatMap((option) => {
    const sidebarOption = option as SidebarMenuOption
    const label = (sidebarOption.sidebarLabel || (typeof option.label === 'string' ? option.label : '')).toLowerCase()
    const children = option.children ? filterMenuOptions(option.children, query) : []
    if (!label.includes(query) && !children.length) return []
    if (!option.children || label.includes(query)) return [option]
    return [{ ...option, children }]
  })
}

const menuOptions = computed(() => filterMenuOptions(allMenuOptions.value, sidebarQuery.value.trim().toLowerCase()))

const titleMap: Record<string, string> = {
  '/': '首页', '/dashboard': '控制台', '/sub': '订阅管理', '/shop': '订阅套餐',
  '/orders': '订单记录', '/points': '积分明细', '/notices': '公告通知', '/help': '帮助中心', '/account': '账户设置',
  '/admin': '管理概览', '/admin/upstreams': '上游管理', '/admin/users': '用户管理', '/admin/user-groups': '用户组', '/admin/packages': '套餐管理', '/admin/nodes': '节点管理',
  '/admin/singbox': 'sing-box', '/admin/certs': '证书管理', '/admin/orders': '订单管理', '/admin/servers': '服务器', '/admin/monitor': '监控管理',
  '/admin/settings': '系统设置', '/admin/reg-codes': '注册码', '/admin/api-tokens': 'API Token', '/admin/announcements': '公告管理', '/admin/manual-notifications': '手动通知', '/admin/help': '帮助文档',
  '/admin/update': '在线更新',
}
const currentTitle = computed(() => titleMap[route.path] || config.config.site_name || 'Kreeproxy')

const searchItems = computed(() => {
  const items = [
    { label: '首页', value: '/' },
    ...userMenuItems.map(item => ({ label: String(item.label), value: String(item.key) })),
    ...shopItems.map(item => ({ label: String(item.label), value: String(item.key) })),
    ...infoItems.value
      .filter(item => item.key !== 'admin-root')
      .map(item => ({ label: String(item.label), value: String(item.key) })),
  ]
  if (auth.isAdmin) {
    items.push(
      ...adminOpsItems.map(item => ({ label: String(item.label), value: String(item.key) })),
      ...adminNodeItems.map(item => ({ label: String(item.label), value: String(item.key) })),
      ...adminSysItems.map(item => ({ label: String(item.label), value: String(item.key) })),
    )
  }
  return items
})

const searchOptions = computed(() => {
  const query = (searchQuery.value || '').trim().toLowerCase()
  if (!query) return []
  return searchItems.value
    .filter(item => item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query))
    .slice(0, 8)
})

const userMenu = [
  { label: '退出登录', key: 'logout', icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }) },
]
const adminQuickMenu = [
  { label: '上游管理', key: '/admin/upstreams' },
  { label: '管理概览', key: '/admin' },
  { label: '用户管理', key: '/admin/users' },
  { label: '系统设置', key: '/admin/settings' },
]
type HeaderMenu = 'admin' | 'account'
// 悬浮下拉菜单：共享一个打开状态，忽略旧菜单迟到的关闭事件，避免切换闪烁。
const { openMenu, setMenuOpen, closeMenu } = useMutualHoverMenu<HeaderMenu>()
// 悬浮下拉菜单：共享一个打开状态，忽略旧菜单迟到的关闭事件，避免切换闪烁。

function handleMenuSelect(key: string) {
  if (key === 'admin-root') return
  if (key === '/help') openHelp(config.config, router)
  else router.push(key)
}
function goAndClose(key: string) {
  if (key === 'admin-root') return
  drawerShow.value = false
  if (key === '/help') openHelp(config.config, router)
  else router.push(key)
}
function handleUserSelect(key: string) {
  closeMenu()
  if (key === 'logout') { auth.logout(); router.push('/') }
}
function handleAdminSelect(key: string) {
  closeMenu()
  router.push(key)
}
function handleSearchSelect(path: string) {
  searchQuery.value = ''
  if (path === '/help') openHelp(config.config, router)
  else router.push(path)
}
function openFirstSearchResult() {
  const first = searchOptions.value[0]
  if (first) handleSearchSelect(first.value)
}

function focusSearch(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    document.querySelector<HTMLInputElement>('.header-search input')?.focus()
  }
}

function focusSidebarFilter(event: KeyboardEvent) {
  if (event.key !== '/') return
  const active = document.activeElement as HTMLElement | null
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return
  event.preventDefault()
  document.querySelector<HTMLInputElement>('.sidebar-filter input')?.focus()
}

onMounted(() => window.addEventListener('keydown', focusSearch))
onUnmounted(() => window.removeEventListener('keydown', focusSearch))
onMounted(() => window.addEventListener('keydown', focusSidebarFilter))
onUnmounted(() => window.removeEventListener('keydown', focusSidebarFilter))
</script>

<style scoped>
/* 侧边栏 */
.app-shell { display: flex; min-height: 100vh; background: var(--bg); }
.sidebar-surface {
  --sidebar-bg: var(--bg);
  --sidebar-fg: oklch(21% 0 0);
  --sidebar-card: var(--bg);
  --sidebar-muted: oklch(55.6% 0 0);
  --sidebar-hover: #f0f0f0;
  --sidebar-selected: #f0f0f0;
  --sidebar-border: oklch(92% 0 0);
  --sidebar-brand: oklch(68.7% .208 38.8);
  --sidebar-ring: oklch(14.5% 0 0 / .35);
  --sidebar-content-gap: 20px;
  background: var(--sidebar-bg);
  color: var(--sidebar-fg);
  display: flex; flex-direction: column; contain: inline-size;
}
.app-sider {
  /* QingZhou desktop rail: 16.5rem; the mobile drawer remains 300px. */
  box-sizing: border-box; width: 16.5rem; min-width: 16.5rem; max-width: 16.5rem; flex: 0 0 16.5rem; flex-shrink: 0; overflow: hidden;
  /* 侧边栏分界线：沿用折叠区顶部的中性边线。 */
  border-right: 1px solid var(--sidebar-border);
  position: sticky; top: 0; height: 100vh;
  transition: width .22s ease, min-width .22s ease, max-width .22s ease, flex-basis .22s ease;
}
.app-sider.is-collapsed { width: 72px; min-width: 72px; max-width: 72px; flex-basis: 72px; }
.mobile-sidebar {
  width: 100%; height: 100%; min-height: 100%;
}
.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  min-height: 64px; padding: 10px 16px;
  cursor: pointer;
}
.sidebar-logo {
  width: 40px; height: 40px; display: grid; place-items: center;
  flex-shrink: 0;
}
.brand-copy { min-width: 0; display: flex; flex-direction: column; line-height: 20px; }
.brand-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--ff-heading); font-size: 16px; line-height: 20px; font-weight: 500; letter-spacing: 0; }
.brand-caption { margin-top: 2px; color: var(--text-3); font-size: 12px; line-height: 16px; font-weight: 400; letter-spacing: 0; }
.app-sider.is-collapsed .sidebar-brand { justify-content: center; gap: 0; padding-inline: 15px; }
.app-sider.is-collapsed .brand-copy { width: 0; max-width: 0; overflow: hidden; opacity: 0; pointer-events: none; }
.sidebar-filter { position: relative; flex: 0 0 auto; margin: 20px 0; }
/* 填写框 */
.sidebar-filter input {
  width: 100%; height: 34px; padding: 6px 36px 6px 12px;
  border: 1px solid var(--sidebar-border); border-radius: 8px;
  background: var(--sidebar-card); color: var(--sidebar-fg);
  font: 400 14px/20px var(--ff); outline: none;
  transition: color .25s var(--ease-standard), background-color .25s var(--ease-standard), border-color .25s var(--ease-standard), box-shadow .25s var(--ease-standard);
}
.sidebar-filter input::before, .sidebar-filter input::after { transition: inherit; }
/* 筛选框不显示浏览器原生的搜索清除叉号，清空仍由 Esc 和输入编辑完成。 */
.sidebar-filter input[type="search"]::-webkit-search-cancel-button,
.sidebar-filter input[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
.sidebar-filter input::placeholder { color: var(--sidebar-muted); }
.sidebar-filter input:focus-visible { border-color: var(--accent); background: var(--sidebar-card); outline: 0; box-shadow: inset 0 0 0 1px var(--accent); }
.sidebar-filter kbd {
  position: absolute; top: 50%; right: 8px; display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; transform: translateY(-50%);
  padding: 0 4px; border: 1px solid var(--sidebar-border); border-radius: 8px;
  background: oklch(98.5% 0 0); color: var(--sidebar-muted);
  font: 600 11px/1 var(--ff-mono); pointer-events: none;
}
.sidebar-menu {
  /* stable scrollbar-gutter 已占用右侧轨道，因此只保留左侧 16px 内容内轨。 */
  box-sizing: border-box; flex: 1 1 auto; min-height: 0; width: 100%; min-width: 0; max-width: 100%; overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable; contain: inline-size; padding: 0 0 var(--sidebar-content-gap) 16px;
  scrollbar-width: auto; scrollbar-color: auto;
}
/* 侧边栏：菜单承接剩余空间，内容不足时只扩大菜单空白，不改变折叠按钮高度。 */
.mobile-sidebar .sidebar-menu { flex: 1 1 auto; }
.app-sider.is-collapsed .sidebar-menu { padding: 8px 8px var(--sidebar-content-gap); }
.app-sider.is-collapsed .sidebar-filter { display: none; }
.sidebar-menu::-webkit-scrollbar { width: auto; height: auto; }
.sidebar-menu::-webkit-scrollbar-track { background: revert; }
.sidebar-menu::-webkit-scrollbar-thumb { background: revert; border: revert; background-clip: revert; border-radius: revert; }

.app-main { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 100vh; background: var(--bg); }
.layout-header {
  /* Dashboard chrome is nested beside the sidebar; keep it inside .app-main.
     A viewport width here hides the right-side account controls whenever the
     document has a scrollbar or Naive UI temporarily locks the page. */
  width: 100%; max-width: 100%;
  height: 64px; display: grid; grid-template-columns: minmax(140px, 1fr) minmax(280px, 480px) minmax(140px, 1fr);
  align-items: center; gap: 24px; padding: 0 24px;
  background: var(--topbar-background);
  /* 顶栏分界线：与页面一级布局使用同一中性边线。 */
  border-bottom: 1px solid var(--topbar-divider);
  backdrop-filter: var(--topbar-backdrop-filter);
  -webkit-backdrop-filter: var(--topbar-backdrop-filter);
  /* The menu panel must sit above the fixed page scrollbar stacking context. */
  position: sticky; top: 0; z-index: 130;
  transition: background-color .24s cubic-bezier(.4, 0, .6, 1), border-color .24s cubic-bezier(.4, 0, .6, 1);
}
.layout-header.is-scrolled {
  background: var(--topbar-scrim-background-fallback);
  backdrop-filter: var(--topbar-backdrop-filter);
  -webkit-backdrop-filter: var(--topbar-backdrop-filter);
}
.layout-header.is-menu-open {
  background: var(--topbar-background);
  backdrop-filter: var(--topbar-backdrop-filter);
  -webkit-backdrop-filter: var(--topbar-backdrop-filter);
}
@supports (backdrop-filter: initial) {
  .layout-header { background: var(--topbar-scrim-background); }
}
.header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.header-title { font-weight: 650; font-size: 16px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* 填写框 */
.header-search { position: relative; width: 100%; }
.header-search-icon { position: absolute; left: 13px; top: 50%; z-index: 2; transform: translateY(-50%); color: var(--text-2); pointer-events: none; }
.header-search :deep(.n-input) { height: 36px; border-radius: var(--r) !important; box-shadow: none; transition: color .25s var(--ease-standard), background-color .25s var(--ease-standard), border-color .25s var(--ease-standard), box-shadow .25s var(--ease-standard) !important; }
.header-search :deep(.n-input.n-input--focus) { background: var(--card) !important; box-shadow: none !important; }
.header-search :deep(.n-input-wrapper) { padding-left: 39px !important; padding-right: 68px !important; }
.header-search :deep(.n-input__input-el) { padding: 0 !important; }
.header-search kbd {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;
  padding: 1px 6px; border: 1px solid var(--border); border-bottom-color: var(--border-strong);
  border-radius: var(--r); background: var(--bg-subtle); color: var(--text-3); font: 10px/16px var(--ff);
}
.header-right { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-shrink: 0; }
.account-button { color: var(--text-2) !important; }
.account-button:hover { color: var(--text) !important; }
/* 账户头像图标：保留独立的方形底，不参与触发器背景切换。 */
.account-button .user-avatar { border-radius: 8px !important; }
.user-avatar {
  width: 27px; height: 27px; flex: 0 0 27px; box-sizing: border-box; display: inline-grid; place-items: center; border-radius: 8px !important;
  background: var(--bg-soft);
  color: var(--text-2); border: 1px solid var(--border);
  box-shadow: none;
}
.user-avatar svg { width: 16px; height: 16px; display: block; }
.app-shell.mobile .account-button { width: 34px; padding: 3px !important; }
.icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 42px; height: 42px; flex: 0 0 42px; padding: 10px;
  border: 0; border-radius: 8px; background: transparent;
  color: var(--text-3); cursor: pointer;
  transition: color .16s ease, background-color .16s ease, box-shadow .16s ease, transform .12s ease;
}
.app-header-menu-toggle { border-color: transparent; background: transparent; box-shadow: none; }
.app-header-menu-toggle:hover { border-color: transparent; background: transparent; box-shadow: none; color: var(--text); }
.app-header-menu-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; background: transparent; box-shadow: none; }
.app-header-menu-toggle-icon { display: block; width: 22px; height: 22px; flex: 0 0 22px; }

.layout-content { flex: 1; padding: 22px 28px 40px; max-width: 1360px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.route-page-shell { animation: none; }

/* 移动端 */
.app-shell.mobile .layout-header { display: flex; justify-content: space-between; width: 100%; max-width: 100%; padding: 0 12px; }
.app-shell.mobile .layout-content { padding: 14px 12px; }

/* 分组标签样式 */
:deep(.menu-group-label) {
  font-size: 13px; font-weight: 600; color: var(--sidebar-muted);
  letter-spacing: 0; text-transform: uppercase; opacity: 1;
}
:deep(.n-menu-item-group-title) {
  margin-top: 12px; padding: 0 12px 4px !important;
  font-size: 11px; font-weight: 500; letter-spacing: .05em;
  text-transform: uppercase; color: var(--sidebar-muted) !important; opacity: 1;
}
:deep(.n-menu) { width: 100%; min-width: 0; max-width: 100%; overflow: hidden; contain: inline-size; background: transparent !important; color: var(--sidebar-fg); font-size: 13px; }
:deep(.n-menu-item) { width: 100%; min-width: 0; max-width: 100%; height: 32px !important; margin: 0 0 2px; overflow: hidden; }
:deep(.n-menu-item-content) {
  box-sizing: border-box; display: grid; grid-template-columns: 24px minmax(0,1fr) 16px; width: 100%; min-width: 0; max-width: 100%; min-height: 32px !important; height: 32px !important; margin: 0; padding: 6px 12px !important;
  position: relative; z-index: 0; overflow: hidden;
  border-radius: 8px !important; color: var(--sidebar-muted); font-size: 13px; font-weight: 500; line-height: 20px;
  transition: color .15s ease, background-color .15s ease, outline-color .15s ease !important;
}
:deep(.n-menu-item-content::before) {
  left: 0 !important; right: 0 !important; top: 0 !important; bottom: 0 !important; border-radius: 8px !important; background: transparent !important;
}
:deep(.n-menu-item-content:hover), :deep(.n-menu-item-content--selected) { background: transparent !important; }
:deep(.n-menu-item-content:hover::before) { background: var(--sidebar-hover) !important; }
:deep(.n-menu-item-content--selected::before), :deep(.n-menu-item-content--child-active::before) { background: var(--sidebar-selected) !important; }
:deep(.n-menu-item-content:hover .n-menu-item-content-header),
:deep(.n-menu-item-content--selected .n-menu-item-content-header),
:deep(.n-menu-item-content--child-active .n-menu-item-content-header) {
  color: var(--sidebar-fg) !important;
}
:deep(.n-menu-item-content--selected .n-menu-item-content-header),
:deep(.n-menu-item-content--child-active .n-menu-item-content-header) { font-weight: 600; }
:deep(.n-menu-item-content:focus-visible) { outline: 2px solid var(--sidebar-ring); outline-offset: -2px; }
:deep(.n-menu-item-content--selected::after) { display: none; }
:deep(.n-menu-item-content-header),
:deep(.n-menu-item-content__icon),
:deep(.n-menu-item-content__arrow) { position: relative; z-index: 2; }
:deep(.n-menu-item-content .n-menu-item-content__icon) { width: 16px !important; height: 16px !important; margin-right: 8px !important; color: var(--sidebar-muted); font-size: 16px !important; }
:deep(.n-menu-item-content--selected .n-menu-item-content__icon),
:deep(.n-menu-item-content--child-active .n-menu-item-content__icon) { color: var(--accent) !important; }
:deep(.n-menu-item-content--selected .n-menu-item-content__icon .n-icon),
:deep(.n-menu-item-content--child-active .n-menu-item-content__icon .n-icon) { color: var(--accent) !important; }
:deep(.n-menu-item-content--selected .n-menu-item-content__icon .n-icon svg),
:deep(.n-menu-item-content--child-active .n-menu-item-content__icon .n-icon svg) { color: var(--accent) !important; }
:deep(.n-menu-item-content-header) { min-width: 0; max-width: 100%; overflow: hidden; overflow-wrap: anywhere; white-space: normal; text-overflow: ellipsis; }
:deep(.n-menu-item-content__arrow) {
  display: inline-flex; align-items: center; justify-content: center; align-self: center; justify-self: center; width: 16px; height: 20px; margin: 0; color: var(--sidebar-muted); opacity: .5; transform: rotate(-90deg) !important; transform-origin: center;
  transition: transform .25s cubic-bezier(.87, 0, .13, 1), color .25s cubic-bezier(.87, 0, .13, 1) !important;
}
.app-sider.is-collapsed :deep(.n-menu-item-content) { grid-template-columns: minmax(0, 1fr); justify-items: center; padding: 6px 0 !important; }
.app-sider.is-collapsed :deep(.n-menu-item-content-header) {
  position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important;
  overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important;
}
.app-sider.is-collapsed :deep(.n-menu-item-content__arrow) { display: none !important; }
.app-sider.is-collapsed :deep(.n-menu-item-group-title) { height: 8px; min-height: 8px; margin: 6px 0 2px !important; padding: 0 !important; overflow: hidden; opacity: 0; }
.app-sider.is-collapsed :deep(.n-menu-item-content .n-menu-item-content__icon) { margin: 0 !important; }
:deep(.n-submenu[aria-expanded="false"] > .n-menu-item > .n-menu-item-content .n-menu-item-content__arrow) { transform: rotate(-90deg) !important; }
:deep(.n-submenu[aria-expanded="true"] > .n-menu-item > .n-menu-item-content .n-menu-item-content__arrow) { transform: rotate(0deg) !important; }
.sidebar-footer { flex: 0 0 64px; box-sizing: border-box; height: 64px; min-height: 64px; max-height: 64px; padding: calc(var(--sidebar-content-gap) - 1px) 16px 12px; border-top: 1px solid var(--sidebar-border); }
.app-sider.is-collapsed .sidebar-footer { padding: calc(var(--sidebar-content-gap) - 1px) 8px 12px; }
.sidebar-collapse-button {
  display: flex; align-items: center; justify-content: flex-start; gap: 8px; width: 100%; min-width: 0; height: 32px; padding: 0 12px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sidebar-muted); font: 500 13px/20px var(--ff); text-align: left; cursor: pointer;
  transition: color .15s ease, background-color .15s ease, outline-color .15s ease;
}
.sidebar-collapse-button:hover { background: var(--sidebar-hover); color: var(--sidebar-fg); }
.sidebar-collapse-button:focus-visible { outline: 2px solid var(--sidebar-ring); outline-offset: -2px; }
.sidebar-collapse-mark { display: inline-flex; align-items: center; flex: 0 0 18px; width: 18px; height: 20px; }
.sidebar-collapse-mark :deep(.n-icon + .n-icon) { margin-left: -8px; }
.app-sider.is-collapsed .sidebar-collapse-button { justify-content: center; padding: 0; }
:deep(.n-drawer) {
  border-right: 0;
  border-radius: 0 !important;
  box-shadow: none !important;
}
:deep(.n-drawer-content) {
  background: var(--bg);
  border-radius: 0 !important;
}

/* 侧边栏：移动 Drawer 被 Teleport 到 body，使用全局类保持与桌面侧边栏一致。 */
:global(.mobile-sidebar-drawer-root) {
  border-radius: 0 !important;
  box-shadow: none !important;
}
:global(.mobile-sidebar-drawer) {
  width: 300px !important;
  height: 100% !important;
  overflow: hidden !important;
  border-right: 0;
  border-radius: 0 !important;
  background: var(--bg);
}
:global(.mobile-sidebar-drawer .n-drawer-content) {
  height: 100% !important;
  background: var(--bg);
  border-radius: 0 !important;
}
:global(.mobile-sidebar-drawer .n-drawer-body-content-wrapper) {
  height: 100% !important;
  overflow: hidden !important;
  padding: 0 !important;
}
:global(.mobile-sidebar-drawer .mobile-sidebar) {
  height: 100% !important;
  min-height: 100% !important;
}
@media (max-width: 1080px) {
  .layout-header { grid-template-columns: minmax(120px, .8fr) minmax(220px, 380px) minmax(120px, .8fr); gap: 14px; }
}
</style>
