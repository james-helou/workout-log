import Link from 'next/link'
import type { Range } from '@/lib/analytics'

const OPTIONS: { value: Range; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '90', label: '90d' },
  { value: '30', label: '30d' },
]

export function RangeToggle({ slug, current }: { slug: string; current: Range }) {
  return (
    <div className="range-toggle" role="tablist" aria-label="Time range">
      {OPTIONS.map((o) => (
        <Link
          key={o.value}
          href={`/${slug}/analytics?range=${o.value}`}
          className={`range-opt${o.value === current ? ' active' : ''}`}
          aria-selected={o.value === current}
          role="tab"
        >
          {o.label}
        </Link>
      ))}
    </div>
  )
}
