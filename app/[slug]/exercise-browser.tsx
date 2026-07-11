'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MUSCLE_GROUPS, type MuscleGroup } from '@/lib/types'
import { filterByName } from '@/lib/search'

export type BrowserExercise = {
  id: number
  name: string
  muscleGroup: MuscleGroup
  latest: string | null
  when: string
}

export function ExerciseBrowser({ slug, exercises }: { slug: string; exercises: BrowserExercise[] }) {
  const [query, setQuery] = useState('')
  const filtered = filterByName(exercises, query)
  const searching = query.trim() !== ''

  return (
    <>
      <input
        className="search-input"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search exercises"
      />

      {searching && filtered.length === 0 && <p className="empty">No exercises match.</p>}

      {MUSCLE_GROUPS.map((group) => {
        const inGroup = filtered.filter((e) => e.muscleGroup === group)
        if (searching && inGroup.length === 0) return null

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
                      <span className="exercise-latest">{ex.latest ?? '—'}</span>
                      <span className="exercise-when">{ex.when}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </>
  )
}
