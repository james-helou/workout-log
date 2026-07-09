import { MUSCLE_GROUPS, type MuscleGroup } from './types'

export type EntryInput =
  | { ok: true; weight: number; reps: number }
  | { ok: false; error: string }

export type ExerciseInput =
  | { ok: true; name: string; muscleGroup: MuscleGroup }
  | { ok: false; error: string }

const MAX_WEIGHT = 2000
const MAX_REPS = 1000
const MAX_NAME = 80

/**
 * Number() accepts '0x10', '1e3', and 'Infinity'. A human logging a lift types
 * none of those. Optional leading '-' is allowed through so that a negative
 * value reports "must be greater than zero" rather than "must be a number".
 */
const DECIMAL = /^-?\d+(\.\d+)?$/

/** weight is stored as NUMERIC(6,2); more precision than that is silently rounded by Postgres. */
function tooPrecise(raw: string): boolean {
  const dot = raw.indexOf('.')
  return dot !== -1 && raw.length - dot - 1 > 2
}

export function parseEntryInput(rawWeight: string, rawReps: string): EntryInput {
  const w = rawWeight.trim()
  const r = rawReps.trim()

  if (w === '') return { ok: false, error: 'Enter a weight.' }
  if (r === '') return { ok: false, error: 'Enter a rep count.' }

  if (!DECIMAL.test(w)) return { ok: false, error: 'Weight must be a number.' }
  if (tooPrecise(w)) return { ok: false, error: 'Weight can have at most 2 decimal places.' }
  const weight = Number(w)
  if (weight <= 0) return { ok: false, error: 'Weight must be greater than zero.' }
  if (weight > MAX_WEIGHT) return { ok: false, error: `Weight must be ${MAX_WEIGHT} lb or less.` }

  if (!DECIMAL.test(r)) return { ok: false, error: 'Reps must be a number.' }
  const reps = Number(r)
  if (!Number.isInteger(reps)) return { ok: false, error: 'Reps must be a whole number.' }
  if (reps <= 0) return { ok: false, error: 'Reps must be greater than zero.' }
  if (reps > MAX_REPS) return { ok: false, error: `Reps must be ${MAX_REPS} or less.` }

  return { ok: true, weight, reps }
}

function isMuscleGroup(v: string): v is MuscleGroup {
  return (MUSCLE_GROUPS as readonly string[]).includes(v)
}

export function parseExerciseInput(rawName: string, rawGroup: string): ExerciseInput {
  const name = rawName.trim()

  if (name === '') return { ok: false, error: 'Enter an exercise name.' }
  if (name.length > MAX_NAME) return { ok: false, error: `Name must be ${MAX_NAME} characters or less.` }
  const group = rawGroup.trim()
  if (!isMuscleGroup(group)) return { ok: false, error: 'Pick a muscle group.' }

  return { ok: true, name, muscleGroup: group }
}
