import { h, computed } from 'vue'
import { NIcon, type MenuOption, type MenuGroupOption } from 'naive-ui'
import type { ConsoleNavigationItem } from '@/runtime/console-actions'
import {
  SpeedometerOutline, LinkOutline, CartOutline, ReceiptOutline, WalletOutline, MegaphoneOutline, BookOutline,
  PersonOutline, PeopleOutline, PeopleCircleOutline, ArchiveOutline, ServerOutline, SettingsOutline, KeyOutline,
  NotificationsOutline, DocumentTextOutline, PulseOutline, HardwareChipOutline, HomeOutline, CloudDownloadOutline,
  CloudOutline, ShieldCheckmarkOutline,
} from '@vicons/ionicons5'
function renderIcon(icon: any) { return () => h(NIcon, null, { default: () => h(icon) }) }
function groupLabel(text: string) {
  return () => h('span', { class: 'menu-group-label', title: text }, [
    h('i', { class: 'menu-group-dot', 'aria-hidden': 'true' }),
    h('span', { class: 'menu-group-text' }, text),
  ])
}

export type SidebarMenuOption = (MenuOption | MenuGroupOption) & { sidebarLabel?: string }

// 侧边栏 / 菜单归类级别：一级为静态标题；收起时以中性圆点标记分组，不提供导航动作。
function menuSection(key: string, label: string, children: MenuOption[]): SidebarMenuOption {
  return { type: 'group', key, label: groupLabel(label), children, sidebarLabel: label }
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

// 侧边栏菜单归类级别：信息下只保留普通二级菜单项。
const infoLeafItems: MenuOption[] = [
  { label: '公告通知', key: '/notices', icon: renderIcon(MegaphoneOutline) },
  { label: '帮助中心', key: '/help', icon: renderIcon(BookOutline) },
  { label: '账户设置', key: '/account', icon: renderIcon(PersonOutline) },
]

// 侧边栏菜单归类级别：管理后台二级归类下的三级页面项，继续保留 SVG 图标。
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


// 多项目路由导航：菜单来源独立于页面挂载，首页与控制台复用同一权限树。
export function createSidebarNavigation(isAdmin: () => boolean) {
// 侧边栏菜单归类级别：管理后台是独立一级分组，运营/节点服务/内容系统为二级归类。
const adminItems = computed<MenuOption[]>(() => isAdmin() ? [
  { label: '运营', key: 'ag-ops', icon: renderIcon(PulseOutline), children: adminOpsItems },
  { label: '节点服务', key: 'ag-node', icon: renderIcon(ServerOutline), children: adminNodeItems },
  { label: '内容系统', key: 'ag-sys', icon: renderIcon(DocumentTextOutline), children: adminSysItems },
] : [])

const infoItems = computed<MenuOption[]>(() => infoLeafItems)

const allMenuOptions = computed<MenuOption[]>(() => {
  // 侧边栏菜单归类级别：一级归类标题使用静态 group，避免一级菜单产生箭头、竖线和伸缩。
  const items: MenuOption[] = [
    { label: '首页', key: '/', icon: renderIcon(HomeOutline) },
    menuSection('g-common', '常用', userMenuItems),
    menuSection('g-shop', '商城', shopItems),
    menuSection('g-info', '信息', infoItems.value),
    menuSection('g-admin', '管理后台', adminItems.value),
  ]
  return items
})


 return { userMenuItems, shopItems, infoItems, adminOpsItems, adminNodeItems, adminSysItems, allMenuOptions }
}
export const defaultExpandedKeys = ['ag-ops', 'ag-node', 'ag-sys']

// 多项目路由导航：直接发布原权限过滤后的完整树，青舟本身视觉及菜单声明不变。
export function describeNavigation(options: MenuOption[]): ConsoleNavigationItem[] {
  return options.filter(option => option.show !== false && option.type !== 'divider').map(option => ({
    key: String(option.key), label: String(option.sidebarLabel ?? option.label ?? ''),
    path: String(option.key).startsWith('/') ? String(option.key) : undefined,
    group: option.type === 'group', icon: option.icon, disabled: option.disabled,
    expanded: defaultExpandedKeys.includes(String(option.key)),
    children: option.children ? describeNavigation(option.children) : undefined,
  })).filter(option => !option.children || option.children.length)
}
