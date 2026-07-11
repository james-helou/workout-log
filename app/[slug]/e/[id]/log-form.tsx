'use client'

import { useActionState } from 'react'
import { logEntry, type ActionState } from '../../actions'

export function LogForm({
  slug,
  exerciseId,
  defaultWeight,
  defaultReps,
}: {
  slug: string
  exerciseId: number
  defaultWeight: number | null
  defaultReps: number | null
}) {
  const action = logEntry.bind(null, slug, exerciseId)
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null)

  return (
    <form action={formAction} className="card log-form">
      <div className="field-pair">
        <div className="field">
          <label htmlFor="weight">Weight</label>
          <input
            id="weight"
            name="weight"
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            defaultValue={defaultWeight ?? ''}
            required
          />
          <span className="unit">lb</span>
        </div>

        <div className="field">
          <label htmlFor="reps">Reps</label>
          <input
            id="reps"
            name="reps"
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            defaultValue={defaultReps ?? ''}
            required
          />
        </div>
      </div>

      {state?.error && <p className="error">{state.error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
