import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEntries, getExercise } from '@/lib/db'
import { formatDelta } from '@/lib/format'
import { HistoryRow } from './history-row'
import { LogForm } from './log-form'
import { removeExercise } from '../../actions'

export const dynamic = 'force-dynamic'

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const exerciseId = Number(id)

  if (!Number.isInteger(exerciseId)) notFound()

  const exercise = await getExercise(exerciseId)
  if (!exercise) notFound()

  const entries = await getEntries(exerciseId) // newest first
  const latest = entries[0] ?? null

  return (
    <div className="page">
      <header className="page-header">
        <Link href={`/${slug}`} className="back">
          &larr;
        </Link>
        <h1>{exercise.name}</h1>
      </header>

      <LogForm
        slug={slug}
        exerciseId={exerciseId}
        defaultWeight={latest?.weight ?? null}
        defaultReps={latest?.reps ?? null}
      />

      {entries.length === 0 ? (
        <p className="empty">No entries yet. Log your first set above.</p>
      ) : (
        <ul className="history">
          {entries.map((entry, i) => {
            const previous = entries[i + 1] ?? null
            return (
              <HistoryRow
                key={entry.id}
                slug={slug}
                exerciseId={exerciseId}
                entry={entry}
                delta={formatDelta(entry, previous)}
                dateLabel={dateFormat.format(entry.loggedAt)}
              />
            )
          })}
        </ul>
      )}

      <form action={removeExercise.bind(null, slug, exerciseId)} className="danger-zone">
        <button type="submit" className="btn-danger">
          Delete this exercise
        </button>
      </form>
    </div>
  )
}
