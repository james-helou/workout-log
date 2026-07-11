import Link from 'next/link'
import { listExercisesWithLatest } from '@/lib/db'
import { formatRelative } from '@/lib/format'
import { ExerciseBrowser, type BrowserExercise } from './exercise-browser'

export const dynamic = 'force-dynamic'

export default async function HomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const exercises = await listExercisesWithLatest()
  const now = new Date()

  const rows: BrowserExercise[] = exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    latest: ex.latest ? `${ex.latest.weight} lb × ${ex.latest.reps}` : null,
    when: ex.latest ? formatRelative(ex.latest.loggedAt, now) : 'never',
  }))

  return (
    <div className="page">
      <header className="page-header">
        <h1>Log</h1>
        <Link href={`/${slug}/analytics`} className="btn-add" aria-label="Progress">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <rect x="2" y="10" width="3.5" height="8" rx="1" fill="currentColor" />
            <rect x="8.25" y="5" width="3.5" height="13" rx="1" fill="currentColor" />
            <rect x="14.5" y="2" width="3.5" height="16" rx="1" fill="currentColor" />
          </svg>
        </Link>
        <Link href={`/${slug}/new`} className="btn-add" aria-label="Add exercise">
          +
        </Link>
      </header>

      <ExerciseBrowser slug={slug} exercises={rows} />
    </div>
  )
}
