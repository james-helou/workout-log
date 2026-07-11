'use client'

import { useActionState } from 'react'
import { createExercise, type ActionState } from '../actions'
import { MUSCLE_GROUPS } from '@/lib/types'

export function NewExerciseForm({ slug }: { slug: string }) {
  const action = createExercise.bind(null, slug)
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null)

  return (
    <form action={formAction} className="card">
      <label htmlFor="name">Exercise</label>
      <input
        id="name"
        name="name"
        type="text"
        autoComplete="off"
        autoCapitalize="words"
        maxLength={80}
        required
      />

      <label htmlFor="muscleGroup">Muscle group</label>
      <select id="muscleGroup" name="muscleGroup" defaultValue={MUSCLE_GROUPS[0]}>
        {MUSCLE_GROUPS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      {state?.error && <p className="error">{state.error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add exercise'}
      </button>
    </form>
  )
}
