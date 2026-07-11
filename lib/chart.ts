import type { SeriesPoint } from './analytics'

export type Dot = { x: number; y: number }
export type ChartGeometry = {
  width: number
  height: number
  line: string
  area: string
  dots: Dot[]
}

/**
 * Maps est-1RM points into a width×height box with `pad` inset on all sides.
 * X spreads evenly by index (oldest left, newest right); Y scales between the
 * series min and max. Flat series sits at mid-height. Pure geometry — the SVG
 * element scales this box responsively to its container.
 */
export function buildChartGeometry(points: SeriesPoint[], width: number, height: number, pad: number): ChartGeometry {
  if (points.length === 0) {
    return { width, height, line: '', area: '', dots: [] }
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min

  const innerW = width - pad * 2
  const innerH = height - pad * 2

  const dots: Dot[] = points.map((point, i) => {
    const x = points.length === 1 ? width / 2 : pad + (innerW * i) / (points.length - 1)
    const t = span === 0 ? 0.5 : (point.value - min) / span
    const y = pad + innerH * (1 - t)
    return { x, y }
  })

  if (dots.length < 2) {
    return { width, height, line: '', area: '', dots }
  }

  const line = dots.map((d, i) => `${i === 0 ? 'M' : 'L'}${d.x.toFixed(2)},${d.y.toFixed(2)}`).join(' ')
  const baseline = height - pad
  const area =
    `M${dots[0].x.toFixed(2)},${baseline.toFixed(2)} ` +
    dots.map((d) => `L${d.x.toFixed(2)},${d.y.toFixed(2)}`).join(' ') +
    ` L${dots[dots.length - 1].x.toFixed(2)},${baseline.toFixed(2)} Z`

  return { width, height, line, area, dots }
}
