import Link from 'next/link'
import { listExercisesWithLatest } from '@/lib/db'
import { formatRelative } from '@/lib/format'
import { MUSCLE_GROUPS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const exercises = await listExercisesWithLatest()
  const now = new Date()

  return (
    <div className="page">
      <header className="page-header">
        <h1>Log</h1>
        <Link href={`/${slug}/new`} className="btn-add" aria-label="Add exercise">
          +
        </Link>
      </header>

      {MUSCLE_GROUPS.map((group) => {
        const inGroup = exercises.filter((e) => e.muscleGroup === group)

        return (
          <section key={group} className="group">
            <h2>{group}</h2>

            {inGroup.length === 0 ? (
              <p className="empty">Nothing here yet.</p>
            ) : (
              <ul className="exercise-list">
                {inGroup.map((ex) => (
                  <li key={ex.id}>
                    <Link href={`/${slug}/e/${ex.id}`} className="exercise-row">
                      <span className="exercise-name">{ex.name}</span>
                      {ex.latest ? (
                        <>
                          <span className="exercise-latest">
                            {ex.latest.weight} lb &times; {ex.latest.reps}
                          </span>
                          <span className="exercise-when">
                            {formatRelative(ex.latest.loggedAt, now)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="exercise-latest">&mdash;</span>
                          <span className="exercise-when">never</span>
                        </>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
