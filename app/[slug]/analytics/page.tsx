import Link from 'next/link'
import { getAllExercisesWithEntries } from '@/lib/db'
import { est1RMSeries, exerciseGrowth, groupGrowth, parseRange } from '@/lib/analytics'
import { MUSCLE_GROUPS } from '@/lib/types'
import { TrendChart } from '@/components/trend-chart'
import { RangeToggle } from './range-toggle'

export const dynamic = 'force-dynamic'

function pct(value: number | null): { text: string; cls: string } {
  if (value === null) return { text: '—', cls: 'none' }
  const rounded = Math.round(value)
  const sign = rounded > 0 ? '+' : ''
  return { text: `${sign}${rounded}%`, cls: rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat' }
}

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ range?: string }>
}) {
  const { slug } = await params
  const { range: rawRange } = await searchParams
  const range = parseRange(rawRange)
  const now = new Date()

  const all = await getAllExercisesWithEntries()
  const groupsWithExercises = MUSCLE_GROUPS.map((group) => ({
    group,
    exercises: all.filter((e) => e.muscleGroup === group),
  })).filter((g) => g.exercises.length > 0)

  return (
    <div className="page">
      <header className="page-header">
        <Link href={`/${slug}`} className="back" aria-label="Back">
          &larr;
        </Link>
        <h1>Progress</h1>
      </header>

      <RangeToggle slug={slug} current={range} />

      <section className="group-cards">
        {groupsWithExercises.map(({ group, exercises }) => {
          const g = pct(groupGrowth(exercises, range, now))
          return (
            <div key={group} className="group-card">
              <span className="group-card-name">{group}</span>
              <span className={`growth ${g.cls}`}>{g.text}</span>
            </div>
          )
        })}
      </section>

      {groupsWithExercises.map(({ group, exercises }) => (
        <section key={group} className="group trend-section">
          <h2>{group}</h2>
          {exercises.map((ex) => {
            const series = est1RMSeries(ex.entries, range, now)
            const g = pct(exerciseGrowth(ex, range, now))
            return (
              <Link key={ex.id} href={`/${slug}/e/${ex.id}`} className="trend-row">
                <div className="trend-head">
                  <span className="trend-name">{ex.name}</span>
                  <span className={`growth ${g.cls}`}>{g.text}</span>
                </div>
                <TrendChart points={series} />
                {series.length < 2 && <p className="trend-hint">Log more to see your trend.</p>}
              </Link>
            )
          })}
        </section>
      ))}

      {groupsWithExercises.length === 0 && (
        <p className="empty">No exercises yet. Add some and log a few sessions to see progress.</p>
      )}
    </div>
  )
}
