// 区分-状态牌：Apple semantic status palette adapted for QingZhou.
export const STATUS_COLORS = {
  success: '#34c759',
  warning: '#ff9500',
  error: '#ff3b30',
  info: '#007aff',
  inactive: '#8e8e93',
} as const

// 区分-状态牌：浅底状态牌及状态文字使用可读性更高的深色文字变体；
// 图表、进度条和热力图仍使用上面的原始 Apple 实色。
export const STATUS_TEXT_COLORS = {
  success: '#12A652',
  warning: '#E37100',
  error: '#DD3730',
  info: '#0066CC',
  inactive: '#828282',
} as const

// 区分-状态牌：status-encoded charts and meters intentionally reuse the same
// Apple semantic colors; categorical chart series remain independent.
export const CHART_STATUS_COLORS = {
  success: STATUS_COLORS.success,
  warning: STATUS_COLORS.warning,
  error: STATUS_COLORS.error,
  inactive: STATUS_COLORS.inactive,
} as const

export type StatusLevel = 'ok' | 'warn' | 'crit'

function colorForPercent(palette: typeof STATUS_COLORS | typeof CHART_STATUS_COLORS, value: number): string {
  return value >= 90 ? palette.error : value >= 70 ? palette.warning : palette.success
}

function colorForLevel(palette: typeof STATUS_COLORS | typeof CHART_STATUS_COLORS, level: StatusLevel | string): string {
  return level === 'crit' ? palette.error : level === 'warn' ? palette.warning : palette.success
}

export function statusColorForPercent(value: number): string {
  return colorForPercent(STATUS_COLORS, value)
}

export function statusColorForLevel(level: StatusLevel | string): string {
  return colorForLevel(STATUS_COLORS, level)
}

// 区分-状态牌：status-encoded meters use the shared Apple palette; ordinary
// categorical chart series continue to use their own chart palette.
export function chartColorForPercent(value: number): string {
  return colorForPercent(CHART_STATUS_COLORS, value)
}

export function chartColorForLevel(level: StatusLevel | string): string {
  return colorForLevel(CHART_STATUS_COLORS, level)
}
