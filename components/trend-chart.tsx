import { buildChartGeometry } from '@/lib/chart'
import type { SeriesPoint } from '@/lib/analytics'

const VIEW_W = 320
const VIEW_H = 96
const PAD = 10

/**
 * Responsive est-1RM trend line. Fixed viewBox scaled uniformly (meet) to the
 * container width via CSS width:100%/height:auto — proportional, round dots, no
 * horizontal overflow on a phone.
 */
export function TrendChart({ points }: { points: SeriesPoint[] }) {
  const g = buildChartGeometry(points, VIEW_W, VIEW_H, PAD)

  if (points.length === 0) {
    return <p className="trend-empty">No data in range.</p>
  }

  return (
    <svg
      className="trend-chart"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Estimated 1-rep-max trend"
    >
      {g.area && <path className="trend-area" d={g.area} />}
      {g.line && <path className="trend-line" d={g.line} fill="none" />}
      {g.dots.map((d, i) => (
        <circle key={i} className="trend-dot" cx={d.x} cy={d.y} r={3} />
      ))}
    </svg>
  )
}
