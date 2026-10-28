import { svgSymbols, type SvgSymbolName } from './svg-symbols'

// 卡片SVG：候选使用MIT Ionicons真实默认/实心配对；选中状态由原承载组件控制。
export const interfaceSymbols = {
  "cpu": {
    "name": "HardwareChipOutline",
    "filledName": "HardwareChip"
  },
  "memory": {
    "name": "LayersOutline",
    "filledName": "Layers"
  },
  "subscription": {
    "name": "LinkOutline",
    "filledName": "Link"
  },
  "shop": {
    "name": "CartOutline",
    "filledName": "Cart"
  },
  "orders": {
    "name": "ReceiptOutline",
    "filledName": "Receipt"
  },
  "points": {
    "name": "WalletOutline",
    "filledName": "Wallet"
  },
  "announcements": {
    "name": "MegaphoneOutline",
    "filledName": "Megaphone"
  },
  "users": {
    "name": "PeopleOutline",
    "filledName": "People"
  },
  "groups": {
    "name": "PeopleCircleOutline",
    "filledName": "PeopleCircle"
  },
  "packages": {
    "name": "ArchiveOutline",
    "filledName": "Archive"
  },
  "key": {
    "name": "KeyOutline",
    "filledName": "Key"
  },
  "notifications": {
    "name": "NotificationsOutline",
    "filledName": "Notifications"
  },
  "cloud": {
    "name": "CloudOutline",
    "filledName": "Cloud"
  },
  "time": {
    "name": "TimeOutline",
    "filledName": "Time"
  },
  "add": {
    "name": "AddCircleOutline",
    "filledName": "AddCircle"
  },
  "delete": {
    "name": "TrashOutline",
    "filledName": "Trash"
  },
  "edit": {
    "name": "CreateOutline",
    "filledName": "Create"
  },
  "download": {
    "name": "DownloadOutline",
    "filledName": "Download"
  },
  "upload": {
    "name": "CloudUploadOutline",
    "filledName": "CloudUpload"
  },
  "logout": {
    "name": "LogOutOutline",
    "filledName": "LogOut"
  },
  "online": {
    "name": "CheckmarkCircleOutline",
    "filledName": "CheckmarkCircle"
  },
  "server": {
    "name": "ServerOutline",
    "filledName": "Server"
  },
  "disk": {
    "name": "AlbumsOutline",
    "filledName": "Albums"
  },
  "overview": {
    "name": "StatsChartOutline",
    "filledName": "StatsChart"
  },
  "control": {
    "name": "GridOutline",
    "filledName": "Grid"
  },
  "explorer": {
    "name": "FileTrayStackedOutline",
    "filledName": "FileTrayStacked"
  },
  "data": {
    "name": "ListCircleOutline",
    "filledName": "ListCircle"
  },
  "settings": {
    "name": "SettingsOutline",
    "filledName": "Settings"
  },
  "document": {
    "name": "DocumentTextOutline",
    "filledName": "DocumentText"
  },
  "money": {
    "name": "CashOutline",
    "filledName": "Cash"
  },
  "inventory": {
    "name": "SpeedometerOutline",
    "filledName": "Speedometer"
  },
  "receipts": {
    "name": "CardOutline",
    "filledName": "Card"
  },
  "source": {
    "name": "FileTrayOutline",
    "filledName": "FileTray"
  },
  "information": {
    "name": "ChatboxEllipsesOutline",
    "filledName": "ChatboxEllipses"
  },
  "search": {
    "name": "SearchCircleOutline",
    "filledName": "SearchCircle"
  },
  "success": {
    "name": "ShieldCheckmarkOutline",
    "filledName": "ShieldCheckmark"
  },
  "warning": {
    "name": "AlertCircleOutline",
    "filledName": "AlertCircle"
  },
  "refresh": {
    "name": "RefreshCircleOutline",
    "filledName": "RefreshCircle"
  },
  "account": {
    "name": "PersonCircleOutline",
    "filledName": "PersonCircle"
  },
  "menu": {
    "name": "ListCircleOutline",
    "filledName": "ListCircle"
  },
  "back": {
    "name": "ChevronBackCircleOutline",
    "filledName": "ChevronBackCircle"
  },
  "expand": {
    "name": "ChevronDownCircleOutline",
    "filledName": "ChevronDownCircle"
  },
  "forward": {
    "name": "ChevronForwardCircleOutline",
    "filledName": "ChevronForwardCircle"
  },
  "date": {
    "name": "CalendarOutline",
    "filledName": "Calendar"
  },
  "dictionary": {
    "name": "BookOutline",
    "filledName": "Book"
  },
  "close": {
    "name": "CloseCircleOutline",
    "filledName": "CloseCircle"
  },
  "home": {
    "name": "HomeOutline",
    "filledName": "Home"
  }
} as const satisfies Record<string, { name: SvgSymbolName; filledName: SvgSymbolName }>
export type InterfaceSymbolName = keyof typeof interfaceSymbols
export function resolveInterfaceSymbol(name: InterfaceSymbolName, filled = false) {
  const pair = interfaceSymbols[name]
  const symbolName = filled ? pair.filledName : pair.name
  return { name: symbolName, symbol: svgSymbols[symbolName] }
}
