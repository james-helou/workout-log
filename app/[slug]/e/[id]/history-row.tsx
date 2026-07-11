'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { editEntry, removeEntry, type ActionState } from '../../actions'
import type { Entry } from '@/lib/types'

export function HistoryRow({
  slug,
  exerciseId,
  entry,
  delta,
  dateLabel,
}: {
  slug: string
  exerciseId: number
  entry: Entry
  delta: string | null
  dateLabel: string
}) {
  const [editing, setEditing] = useState(false)
  const action = editEntry.bind(null, slug, exerciseId, entry.id)
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null)

  // Close the inline editor once a save completes without an error. revalidatePath
  // refreshes the row's data but does NOT remount this client component, so its
  // `editing` state has to be reset explicitly on the pending→idle edge.
  const wasPending = useRef(false)
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) setEditing(false)
    wasPending.current = pending
  }, [pending, state])

  if (!editing) {
    return (
      <li className="history-row">
        <span className="history-date">{dateLabel}</span>
        <span className="history-value">
          {entry.weight} lb &times; {entry.reps}
        </span>
        <span className="history-delta">{delta}</span>
        <button type="button" className="btn-quiet" onClick={() => setEditing(true)}>
          edit
        </button>
      </li>
    )
  }

  return (
    <li className="history-row editing">
      <form action={formAction} className="history-edit">
        <input
          name="weight"
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          defaultValue={entry.weight}
          aria-label="Weight"
          required
        />
        <input
          name="reps"
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          defaultValue={entry.reps}
          aria-label="Reps"
          required
        />
        <button type="submit" disabled={pending}>
          save
        </button>
        <button type="button" className="btn-quiet" onClick={() => setEditing(false)}>
          cancel
        </button>
      </form>

      <form action={removeEntry.bind(null, slug, exerciseId, entry.id)}>
        <button type="submit" className="btn-danger">
          delete
        </button>
      </form>

      {state?.error && <p className="error">{state.error}</p>}
    </li>
  )
}
