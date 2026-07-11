import Link from 'next/link'
import type { Range } from '@/lib/analytics'

const OPTIONS: { value: Range; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '90', label: '90d' },
  { value: '30', label: '30d' },
]

export function RangeToggle({ slug, current }: { slug: string; current: Range }) {
  return (
    <nav className="range-toggle" aria-label="Time range">
      {OPTIONS.map((o) => (
        <Link
          key={o.value}
          href={`/${slug}/analytics?range=${o.value}`}
          className={`range-opt${o.value === current ? ' active' : ''}`}
          aria-current={o.value === current ? 'page' : undefined}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  )
}
