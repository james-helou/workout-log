export const MUSCLE_GROUPS = [
  'shoulder',
  'chest',
  'back',
  'bicep',
  'tricep',
  'core',
  'legs',
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

export type Exercise = {
  id: number
  name: string
  muscleGroup: MuscleGroup
}

export type Entry = {
  id: number
  exerciseId: number
  weight: number
  reps: number
  loggedAt: Date
}

/** An exercise plus its single most recent entry, or null if never logged. */
export type ExerciseWithLatest = Exercise & {
  latest: Entry | null
}

/** An exercise with its full entry history, oldest first. */
export type ExerciseWithEntries = Exercise & {
  entries: Entry[]
}
