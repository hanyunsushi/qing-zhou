import { clamp, easeCubic, insidePolygon, projectSkyline, skylineCamera, waveRise, type HeatmapView, type SkylineCell, type SkylineModel } from './heatmap-skyline'

type Point = [number, number]
export interface SkylineOptions {
  model: SkylineModel
  view: HeatmapView
  ready: boolean
  filter: number | null
  onActive: (cell: SkylineCell | null, position?: Point) => void
  onSelect: (cell: SkylineCell) => void
}

// 组件绘制动画：共享平面/立体场景、完整坐标轴，并以连续插值响应悬浮。
export function createSkylineRenderer(canvas: HTMLCanvasElement, options: SkylineOptions) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { update: (_options: SkylineOptions) => {}, dispose: () => {} }
  let cfg = options, width = 0, height = 0, t = 0, frame = 0, last = 0
  let seen = false, yaw = 0, elevation = 0, yawGoal = 0, elevationGoal = 0
  let activeKey: string | null = null, activeIndex = -1
  let drag: { x: number; y: number; yaw: number; elevation: number; moved: boolean } | null = null
  let polygons: { cell: SkylineCell; faces: Point[][]; top: Point[] }[] = []
  const heights = new Map<string, number>()
  const colors = new Map<string, number[]>()
  const hover = new Map<string, number>()
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  let reduced = motion.matches
  function rgb(color: string) { return [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)) }
  function syncCells() {
    const keys = new Set(cfg.model.cells.map(c => c.key))
    for (const key of heights.keys()) if (!keys.has(key)) { heights.delete(key); colors.delete(key); hover.delete(key) }
    for (const cell of cfg.model.cells) {
      if (!heights.has(cell.key)) heights.set(cell.key, cell.height)
      if (!colors.has(cell.key)) colors.set(cell.key, rgb(cell.color))
      if (!hover.has(cell.key)) hover.set(cell.key, 0)
    }
    activeIndex = cfg.model.cells.findIndex(c => c.key === activeKey)
    if (activeIndex < 0) { activeKey = null; cfg.onActive(null) }
  }
  function kick() { if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick) } }
  function target() { return cfg.ready && seen && cfg.view === '3d' ? 1 : 0 }
  function colorStyle(cell: SkylineCell, shade: number, active = 0, source = colors.get(cell.key) ?? rgb(cell.color)) {
    const muted = cfg.filter !== null && cell.group !== cfg.filter
    return `rgb(${source.map(channel => {
      const quiet = muted ? channel * .24 + 255 * .76 : channel
      const highlighted = quiet + (22 - quiet) * active * .16
      return Math.round(highlighted * shade)
    }).join(',')})`
  }
  function face(points: Point[], fill: string) {
    ctx!.beginPath(); points.forEach(([x, y], index) => index ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y)); ctx!.closePath()
    ctx!.fillStyle = fill; ctx!.fill()
  }
  function drawAxes(cam: ReturnType<typeof skylineCamera>, scale: number, ox: number, oy: number) {
    const axes = cfg.model.axes
    if (!axes) return
    const screen = (x: number, y: number) => {
      const point = projectSkyline(cam, x, y, 0)
      return [point[0] * scale + ox, point[1] * scale + oy] as Point
    }
    const front = cfg.model.rows
    const origin = screen(0, front), end = screen(cfg.model.columns, front)
    const yStart = screen(0, 0), yEnd = screen(0, cfg.model.rows)
    ctx!.save()
    ctx!.strokeStyle = 'rgba(99,99,102,.42)'
    ctx!.lineWidth = 1
    ctx!.beginPath(); ctx!.moveTo(...origin); ctx!.lineTo(...end); ctx!.moveTo(...yStart); ctx!.lineTo(...yEnd); ctx!.stroke()
    const family = typeof getComputedStyle === 'function' ? getComputedStyle(canvas).fontFamily : 'sans-serif'
    ctx!.font = `11px ${family}`
    ctx!.fillStyle = 'rgba(72,72,74,.82)'
    ctx!.textBaseline = 'middle'
    const xTicks = (axes.x?.ticks ?? []).map(tick => ({ tick, axis: screen(tick.at, front), label: screen(tick.at, front + .34), width: ctx!.measureText(tick.label).width }))
      .sort((a, b) => a.label[0] - b.label[0])
    let lastRight = -Infinity
    ctx!.textAlign = 'center'
    ctx!.textBaseline = 'top'
    for (const item of xTicks) {
      const [x, y] = item.axis
      ctx!.strokeStyle = 'rgba(99,99,102,.48)'
      const tickEnd = screen(item.tick.at, front + .12)
      ctx!.beginPath(); ctx!.moveTo(x, y); ctx!.lineTo(...tickEnd); ctx!.stroke()
      const left = item.label[0] - item.width / 2, right = item.label[0] + item.width / 2
      if (left < 2 || right > width - 2 || left < lastRight + 5) continue
      lastRight = right
      ctx!.fillText(item.tick.label, item.label[0], item.label[1])
    }
    ctx!.textBaseline = 'middle'
    ctx!.textAlign = 'right'
    for (const tick of axes.y?.ticks ?? []) {
      const p = screen(-.22, tick.at), axis = screen(0, tick.at), tickEnd = screen(-.12, tick.at)
      ctx!.fillText(tick.label, p[0] - 3, p[1])
      ctx!.strokeStyle = 'rgba(99,99,102,.48)'
      ctx!.beginPath(); ctx!.moveTo(...axis); ctx!.lineTo(...tickEnd); ctx!.stroke()
    }
    ctx!.globalAlpha = 1
    ctx!.font = `10px ${family}`
    ctx!.fillStyle = 'rgba(72,72,74,.82)'
    if (axes.y?.title) {
      ctx!.save(); ctx!.translate(12, height / 2); ctx!.rotate(-Math.PI / 2)
      ctx!.textAlign = 'center'; ctx!.textBaseline = 'middle'; ctx!.fillText(axes.y.title, 0, 0); ctx!.restore()
    }
    if (axes.x?.title) {
      ctx!.textAlign = 'center'; ctx!.textBaseline = 'bottom'; ctx!.fillText(axes.x.title, width / 2, height - 4)
    }
    ctx!.restore()
  }
  function draw() {
    if (!width || !cfg.model.cells.length) { ctx!.clearRect(0, 0, canvas.width, canvas.height); return }
    const e = easeCubic(t), cam = skylineCamera(e, yaw, elevation)
    const rows = Math.max(1, cfg.model.rows)
    const flatHeight = clamp(width * rows / Math.max(1, cfg.model.columns) * .62, 150, 260)
    const targetHeight = clamp(width * .48, 220, 360)
    const newHeight = Math.round(flatHeight + (targetHeight - flatHeight) * e)
    if (height !== newHeight) { height = newHeight; canvas.style.height = `${height}px` }
    const dpr = Math.min(2, devicePixelRatio || 1)
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
    }
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0); ctx!.clearRect(0, 0, width, height)
    const world = cfg.model.cells.map(cell => {
      const rise = waveRise(t, cell.column, cfg.model.columns, cell.row, rows)
      const active = hover.get(cell.key) ?? 0
      const z = (heights.get(cell.key) ?? cell.height) * rise + .7 * e * active
      const x = cell.column + .1, y = cell.row + .1, w = .8
      const top = [[x, y, z], [x + w, y, z], [x + w, y + w, z], [x, y + w, z]].map(p => projectSkyline(cam, p[0]!, p[1]!, p[2]!))
      const a = projectSkyline(cam, x, y + w, 0), b = projectSkyline(cam, x + w, y + w, 0), c = projectSkyline(cam, x + w, y, 0)
      return { cell, top, faces: [top, [a, b, top[2]!, top[3]!], [c, b, top[2]!, top[1]!]], depth: cell.column * cam.sn + cell.row * cam.cs }
    }).sort((a, b) => a.depth - b.depth)
    const points = world.flatMap(box => box.faces.flat())
    const minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]))
    const minY = Math.min(...points.map(p => p[1])), maxY = Math.max(...points.map(p => p[1]))
    const axes = cfg.model.axes
    const family = typeof getComputedStyle === 'function' ? getComputedStyle(canvas).fontFamily : 'sans-serif'
    ctx!.font = `11px ${family}`
    const xLabels = (axes?.x?.ticks ?? []).map(tick => ({ point: projectSkyline(cam, tick.at, rows + .34, 0), width: ctx!.measureText(tick.label).width }))
    const yLabels = (axes?.y?.ticks ?? []).map(tick => ({ point: projectSkyline(cam, -.22, tick.at, 0), width: ctx!.measureText(tick.label).width }))
    const safe = { left: axes?.y?.title ? 30 : 8, right: 8, top: 8, bottom: axes?.x?.title ? 26 : 8 }
    const innerWidth = Math.max(1, width - safe.left - safe.right), innerHeight = Math.max(1, height - safe.top - safe.bottom)
    let scale = Math.min(innerWidth / Math.max(1, maxX - minX), innerHeight / Math.max(1, maxY - minY))
    function labelBounds(atScale: number) {
      let left = minX * atScale, right = maxX * atScale, top = minY * atScale, bottom = maxY * atScale
      for (const item of xLabels) {
        const x = item.point[0] * atScale, y = item.point[1] * atScale
        left = Math.min(left, x - item.width / 2); right = Math.max(right, x + item.width / 2)
        top = Math.min(top, y); bottom = Math.max(bottom, y + 13)
      }
      for (const item of yLabels) {
        const x = item.point[0] * atScale, y = item.point[1] * atScale
        left = Math.min(left, x - item.width - 3); right = Math.max(right, x - 3)
        top = Math.min(top, y - 7); bottom = Math.max(bottom, y + 7)
      }
      return { left, right, top, bottom, width: right - left, height: bottom - top }
    }
    let bounds = labelBounds(scale)
    for (let i = 0; i < 5; i++) {
      const fit = Math.min(innerWidth / Math.max(1, bounds.width), innerHeight / Math.max(1, bounds.height), 1)
      if (fit > .999) break
      scale *= fit * .995
      bounds = labelBounds(scale)
    }
    bounds = labelBounds(scale)
    const ox = safe.left + (innerWidth - bounds.width) / 2 - bounds.left
    const oy = safe.top + (innerHeight - bounds.height) / 2 - bounds.top
    const screen = (p: Point): Point => [p[0] * scale + ox, p[1] * scale + oy]
    polygons = world.map(box => ({ cell: box.cell, faces: box.faces.map(f => f.map(screen)), top: box.top.map(screen) }))
    for (const box of polygons) {
      const active = hover.get(box.cell.key) ?? 0
      if (e > .001) {
        face(box.faces[1]!, colorStyle(box.cell, .84, active))
        face(box.faces[2]!, colorStyle(box.cell, .68, active))
      }
      face(box.top, colorStyle(box.cell, 1, active))
    }
    drawAxes(cam, scale, ox, oy)
    if (activeIndex >= 0) {
      const box = polygons.find(p => p.cell.key === activeKey)
      if (box) cfg.onActive(box.cell, [box.top.reduce((sum, p) => sum + p[0], 0) / 4, Math.min(...box.top.map(p => p[1]))])
    }
    canvas.style.cursor = cfg.view === '3d' ? drag?.moved ? 'grabbing' : 'grab' : 'pointer'
  }
  function tick(now: number) {
    frame = 0
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now
    let moving = false
    const goal = target(), step = reduced ? 1 : dt / 1.3
    if (t !== goal) { t = goal > t ? Math.min(goal, t + step) : Math.max(goal, t - step); moving = true }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 12)
    for (const [current, next, assign] of [[yaw, yawGoal, (v: number) => { yaw = v }], [elevation, elevationGoal, (v: number) => { elevation = v }]] as const) {
      if (Math.abs(next - current) > .0001) { assign(current + (next - current) * k); moving = true } else assign(next)
    }
    const hoverK = reduced ? 1 : 1 - Math.exp(-dt * 6)
    for (const cell of cfg.model.cells) {
      const current = heights.get(cell.key) ?? cell.height
      if (Math.abs(current - cell.height) > .001) { heights.set(cell.key, current + (cell.height - current) * k); moving = true } else heights.set(cell.key, cell.height)
      const color = colors.get(cell.key)!, goalColor = rgb(cell.color)
      for (let i = 0; i < 3; i++) {
        if (Math.abs(color[i]! - goalColor[i]!) > .4) { color[i] = color[i]! + (goalColor[i]! - color[i]!) * k; moving = true } else color[i] = goalColor[i]!
      }
      const currentHover = hover.get(cell.key) ?? 0, nextHover = cell.key === activeKey ? 1 : 0
      if (Math.abs(currentHover - nextHover) > .003) { hover.set(cell.key, currentHover + (nextHover - currentHover) * hoverK); moving = true } else hover.set(cell.key, nextHover)
    }
    draw(); if (moving && !reduced) frame = requestAnimationFrame(tick)
  }
  function hit(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top
    const box = [...polygons].reverse().find(p => p.faces.some(f => insidePolygon(f, x, y)))
    setActive(box?.cell.key ?? null)
  }
  function setActive(key: string | null) {
    activeKey = key; activeIndex = cfg.model.cells.findIndex(cell => cell.key === key)
    if (!key) cfg.onActive(null)
    kick()
  }
  function onDown(event: PointerEvent) {
    if (cfg.view === '3d') { drag = { x: event.clientX, y: event.clientY, yaw: yawGoal, elevation: elevationGoal, moved: false }; canvas.setPointerCapture(event.pointerId) }
  }
  function onMove(event: PointerEvent) {
    if (drag) {
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y
      if (Math.hypot(dx, dy) > 5) drag.moved = true
      if (drag.moved) { yawGoal = clamp(drag.yaw + dx * .006, -.64, .64); elevationGoal = clamp(drag.elevation - dy * .005, -.26, .48); setActive(null); kick(); return }
    }
    if (event.pointerType === 'mouse') hit(event)
  }
  function onUp(event: PointerEvent) {
    if (!drag?.moved) { hit(event); const cell = cfg.model.cells[activeIndex]; if (cell) cfg.onSelect(cell) }
    drag = null; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
  }
  function onCancel() { drag = null; setActive(null) }
  function onLeave() { if (!drag) setActive(null) }
  function resetOrbit() { yawGoal = 0; elevationGoal = 0; kick() }
  function onKey(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape', 'Enter', ' '].includes(event.key)) return
    event.preventDefault()
    if (event.key === 'Escape') { setActive(null); return }
    const cells = cfg.model.cells
    if (!cells.length) return
    if (event.key === 'Enter' || event.key === ' ') { if (cells[activeIndex]) cfg.onSelect(cells[activeIndex]!); return }
    let index = activeIndex < 0 ? 0 : activeIndex
    const current = cells[index]!
    if (event.key === 'Home') index = 0
    else if (event.key === 'End') index = cells.length - 1
    else if (activeIndex >= 0) {
      const column = current.column + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0)
      const row = current.row + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0)
      const next = cells.findIndex(cell => cell.column === column && cell.row === row)
      if (next >= 0) index = next
    }
    setActive(cells[index]!.key)
  }
  function onMotion() { reduced = motion.matches; if (reduced) { t = target(); yaw = yawGoal; elevation = elevationGoal; for (const c of cfg.model.cells) { heights.set(c.key, c.height); colors.set(c.key, rgb(c.color)); hover.set(c.key, c.key === activeKey ? 1 : 0) } } kick() }
  const resize = new ResizeObserver(() => { const next = Math.round(canvas.parentElement?.clientWidth ?? 0); if (next !== width) { width = next; kick() } })
  resize.observe(canvas.parentElement!)
  const intersection = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { seen = true; if (reduced) t = target(); kick(); intersection.disconnect() }
  }, { threshold: .25 })
  intersection.observe(canvas)
  const handlers = { pointerdown: onDown, pointermove: onMove, pointerup: onUp, pointercancel: onCancel, pointerleave: onLeave, dblclick: resetOrbit, keydown: onKey, blur: onLeave }
  Object.entries(handlers).forEach(([type, handler]) => canvas.addEventListener(type, handler as EventListener))
  motion.addEventListener('change', onMotion)
  syncCells(); width = Math.round(canvas.parentElement?.clientWidth ?? 0); kick()
  return {
    update(next: SkylineOptions) { cfg = next; syncCells(); if (cfg.view === '2d') { yawGoal = 0; elevationGoal = 0 }; if (reduced) t = target(); kick() },
    dispose() { if (frame) cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect(); motion.removeEventListener('change', onMotion); Object.entries(handlers).forEach(([type, handler]) => canvas.removeEventListener(type, handler as EventListener)) },
  }
}
