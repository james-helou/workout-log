import { describe, expect, it } from 'vitest'
import { buildChartGeometry } from './chart'
import type { SeriesPoint } from './analytics'

const p = (t: number, value: number): SeriesPoint => ({ date: new Date(t), value })

describe('buildChartGeometry', () => {
  const W = 300
  const H = 100
  const PAD = 10

  it('returns a single centered dot and no line for one point', () => {
    const g = buildChartGeometry([p(0, 50)], W, H, PAD)
    expect(g.dots).toHaveLength(1)
    expect(g.line).toBe('')
    expect(g.dots[0].y).toBeCloseTo(H / 2)
  })

  it('places the first point at the left pad and the last at the right pad', () => {
    const g = buildChartGeometry([p(0, 10), p(100, 20)], W, H, PAD)
    expect(g.dots[0].x).toBeCloseTo(PAD)
    expect(g.dots[g.dots.length - 1].x).toBeCloseTo(W - PAD)
  })

  it('maps the highest value to the top pad and the lowest to the bottom pad', () => {
    const g = buildChartGeometry([p(0, 10), p(1, 30), p(2, 20)], W, H, PAD)
    const ys = g.dots.map((d) => d.y)
    expect(Math.min(...ys)).toBeCloseTo(PAD)
    expect(Math.max(...ys)).toBeCloseTo(H - PAD)
  })

  it('draws a flat series at mid-height without dividing by zero', () => {
    const g = buildChartGeometry([p(0, 50), p(1, 50), p(2, 50)], W, H, PAD)
    for (const d of g.dots) expect(d.y).toBeCloseTo(H / 2)
    expect(g.line).toContain('M')
  })

  it('orders line points left to right', () => {
    const g = buildChartGeometry([p(0, 10), p(1, 20), p(2, 15)], W, H, PAD)
    const xs = g.dots.map((d) => d.x)
    expect(xs).toEqual([...xs].sort((a, b) => a - b))
  })

  it('builds an area path closed along the baseline', () => {
    const g = buildChartGeometry([p(0, 10), p(1, 20)], W, H, PAD)
    expect(g.area).toContain('Z')
  })

  it('returns empty geometry for no points', () => {
    const g = buildChartGeometry([], W, H, PAD)
    expect(g.dots).toEqual([])
    expect(g.line).toBe('')
    expect(g.area).toBe('')
  })
})
