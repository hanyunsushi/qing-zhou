import { CHART_STATUS_COLORS } from './status-colors'

export type HeatmapView = '2d' | '3d'
export type HeatmapState = 0 | 1 | 2 | 3
export interface SkylineCell {
  key: string
  column: number
  row: number
  label: string
  detail: string
  value: number | null
  height: number
  color: string
  group: number
}
export interface SkylineAxisTick { at: number; label: string }
export interface SkylineAxis { title: string; ticks: SkylineAxisTick[] }
export interface SkylineModel {
  cells: SkylineCell[]
  columns: number
  rows: number
  axes?: { x?: SkylineAxis; y?: SkylineAxis }
}
export interface AvailabilityData {
  servers: { id?: number; name: string }[]
  buckets: number[]
  matrix: (number | null)[][]
  state_count?: number
  range?: string
  bucket_sec?: number
}
export const HEATMAP_STATES = [
  { label: '运行正常', color: CHART_STATUS_COLORS.success, height: 0.55 },
  { label: '高负载', color: CHART_STATUS_COLORS.warning, height: 2.2 },
  { label: '严重负载', color: CHART_STATUS_COLORS.error, height: 4.4 },
  { label: '离线 / 无数据', color: CHART_STATUS_COLORS.inactive, height: 0.12 },
] as const

export function normalizeHeatState(raw: unknown, stateCount = 4): HeatmapState {
  if (!Number.isInteger(raw) || ![0, 1, 2, 3].includes(raw as number)) return 3
  return stateCount < 4 && raw === 2 ? 3 : raw as HeatmapState
}
export function formatBucket(ts: number): string {
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(ts * 1000)
}
function formatAxisBucket(ts: number, spanSeconds: number, detailed = false) {
  const options: Intl.DateTimeFormatOptions = spanSeconds >= 86400
    ? detailed
      ? { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }
      : { month: '2-digit', day: '2-digit' }
    : detailed
      ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
      : { hour: '2-digit', minute: '2-digit', hour12: false }
  return new Intl.DateTimeFormat('zh-CN', options).format(ts * 1000)
}

// 区分-状态牌：每台服务器独立折叠时间桶；高度只编码状态级别，不捏造负载百分比。
export function availabilityModels(data: AvailabilityData) {
  return data.servers.map((server, serverIndex) => {
    const rows = Math.min(6, Math.max(1, data.buckets.length))
    const cells = data.buckets.map((ts, index): SkylineCell => {
      const state = normalizeHeatState(data.matrix[serverIndex]?.[index], data.state_count ?? 3)
      const item = HEATMAP_STATES[state]
      return { key: String(ts), column: Math.floor(index / rows), row: index % rows,
        label: formatBucket(ts), detail: item.label, value: state === 3 ? null : state,
        height: item.height, color: item.color, group: state }
    })
    const columns = Math.ceil(cells.length / rows)
    const axisSpan = data.buckets.length > 1
      ? Math.max(...data.buckets) - Math.min(...data.buckets)
      : 0
    const xTicks = Array.from({ length: columns }, (_, column) => {
      const cell = cells.find(item => item.column === column)
      return cell ? { at: column + 0.5, timestamp: Number(cell.key) } : null
    }).filter((tick): tick is { at: number; timestamp: number } => tick !== null)
    let axisLabels = xTicks.map(tick => formatAxisBucket(tick.timestamp, axisSpan))
    if (new Set(axisLabels).size !== axisLabels.length) {
      axisLabels = xTicks.map(tick => formatAxisBucket(tick.timestamp, axisSpan, true))
    }
    return { key: String(server.id ?? serverIndex), name: server.name,
      latest: cells[cells.length - 1], model: {
        cells, columns, rows,
        axes: { x: { title: '时间', ticks: xTicks.map((tick, index) => ({ at: tick.at, label: axisLabels[index]! })) }, y: { title: '桶序', ticks: Array.from({ length: rows }, (_, row) => ({ at: row + 0.5, label: String(row + 1) })) } },
      } }
  })
}

// 展示信息模块：活动量是连续数值，使用已核对的AWS蓝色刻度，不混入Apple状态色。
export const ACTIVITY_SCALE = ['#529ccb', '#3184c2', '#0273bb', '#015b9d', '#003c75'] as const
export function contributionModel(data: { date: string; count: number }[], endDate: string): SkylineModel {
  const DAY = 86400000
  const end = Date.parse(endDate + 'T00:00:00Z')
  if (!Number.isFinite(end) || new Date(end).toISOString().slice(0, 10) !== endDate) throw new Error('活动热力图需要有效的结束日期')
  let start = end - 364 * DAY
  start -= new Date(start).getUTCDay() * DAY
  const counts = new Map<string, number>()
  for (const day of data) {
    const timestamp = Date.parse(day.date + 'T00:00:00Z')
    if (/^\d{4}-\d{2}-\d{2}$/.test(day.date) && Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === day.date && Number.isFinite(day.count) && day.count >= 0) counts.set(day.date, (counts.get(day.date) ?? 0) + day.count)
  }
  const values = [...counts.entries()].filter(([date]) => date >= new Date(start).toISOString().slice(0, 10) && date <= endDate).map(([, count]) => count)
  const max = Math.max(0, ...values)
  const cells: SkylineCell[] = []
  for (let ts = start, i = 0; ts <= end; ts += DAY, i++) {
    const date = new Date(ts).toISOString().slice(0, 10)
    const value = counts.get(date) ?? null
    const group = value === null ? -1 : value === 0 ? 0 : Math.min(4, Math.ceil(value / (max || 1) * 4))
    cells.push({ key: date, column: Math.floor(i / 7), row: i % 7, label: date,
      detail: value === null ? '未提供数据' : `${value} 次活动`, value,
      height: value === null || value === 0 ? 0.12 : 0.4 + Math.pow(value / max, 0.85) * 6,
      color: group < 0 ? CHART_STATUS_COLORS.inactive : group === 0 ? '#e9edf2' : ACTIVITY_SCALE[group], group })
  }
  const columns = Math.ceil(cells.length / 7)
  const monthTicks: SkylineAxisTick[] = []
  let previousMonth = ''
  for (let column = 0; column < columns; column++) {
    const cell = cells[column * 7]
    if (!cell) continue
    const month = cell.label.slice(5, 7)
    if (month !== previousMonth) monthTicks.push({ at: column + 0.5, label: `${Number(month)}月` })
    previousMonth = month
  }
  const weekday = ['日', '一', '二', '三', '四', '五', '六']
  return { cells, columns, rows: 7, axes: {
    x: { title: '月份', ticks: monthTicks },
    y: { title: '星期', ticks: [0, 2, 4, 6].map(row => ({ at: row + 0.5, label: weekday[row]! })) },
  } }
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
export const easeCubic = (t: number) => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
export function skylineCamera(t: number, yawOffset = 0, elevationOffset = 0) {
  const yaw = clamp((Math.PI / 4 + yawOffset) * t, 0, Math.PI * 82 / 180)
  const elevation = Math.PI / 2 + (clamp(Math.PI * 34 / 180 + elevationOffset, Math.PI * 18 / 180, Math.PI * 62 / 180) - Math.PI / 2) * t
  return { cs: Math.cos(yaw), sn: Math.sin(yaw), se: Math.sin(elevation), ce: Math.cos(elevation) }
}
export function projectSkyline(camera: ReturnType<typeof skylineCamera>, x: number, y: number, z: number): [number, number] {
  return [x * camera.cs - y * camera.sn, (x * camera.sn + y * camera.cs) * camera.se - z * camera.ce]
}
export function waveRise(t: number, column: number, columns: number, row: number, rows: number) {
  const delay = column / Math.max(1, columns - 1) * 0.36 + row / Math.max(1, rows - 1) * 0.06
  const p = clamp((t - delay) / 0.58, 0, 1)
  return 1 - (1 - p) ** 3
}
export function insidePolygon(polygon: [number, number][], x: number, y: number) {
  let sign = 0
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]!, b = polygon[(i + 1) % polygon.length]!
    const cross = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])
    if (Math.abs(cross) < 1e-8) continue
    const s = Math.sign(cross)
    if (sign && sign !== s) return false
    sign = s
  }
  return sign !== 0
}
