// Cloudscape semantic status palette adapted for QingZhou.
// Information remains the product's Apple blue; chart series colors stay separate.
export const STATUS_COLORS = {
  success: '#00802f',
  warning: '#855900',
  error: '#db0000',
  info: '#007aff',
  inactive: '#656871',
} as const

export type StatusLevel = 'ok' | 'warn' | 'crit'

export function statusColorForPercent(value: number): string {
  return value >= 90 ? STATUS_COLORS.error : value >= 70 ? STATUS_COLORS.warning : STATUS_COLORS.success
}

export function statusColorForLevel(level: StatusLevel | string): string {
  return level === 'crit' ? STATUS_COLORS.error : level === 'warn' ? STATUS_COLORS.warning : STATUS_COLORS.success
}
