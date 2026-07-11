import { neon } from '@neondatabase/serverless'
import type { Entry, Exercise, ExerciseWithLatest, MuscleGroup } from './types'

/**
 * Tests hit the Neon `workout_test` database; everything else hits `neondb`.
 *
 * The switch is `VITEST`, NOT `TEST_DATABASE_URL ?? DATABASE_URL`. Next.js loads
 * .env.local in dev, so TEST_DATABASE_URL is defined there too — a `??` would
 * silently point `npm run dev` at the database that tests TRUNCATE.
 */
const isTest = process.env.VITEST === 'true'
const connectionString = isTest ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(isTest ? 'TEST_DATABASE_URL is not set' : 'DATABASE_URL is not set')
}

const sql = neon(connectionString)

/** Postgres NUMERIC arrives as a string. Every read path must go through here. */
function toEntry(row: Record<string, unknown>): Entry {
  return {
    id: Number(row.id),
    exerciseId: Number(row.exercise_id),
    weight: Number(row.weight),
    reps: Number(row.reps),
    loggedAt: new Date(row.logged_at as string),
  }
}

function toExercise(row: Record<string, unknown>): Exercise {
  return {
    id: Number(row.id),
    name: row.name as string,
    muscleGroup: row.muscle_group as MuscleGroup,
  }
}

const UNIQUE_VIOLATION = '23505'

export async function addExercise(name: string, muscleGroup: MuscleGroup): Promise<Exercise> {
  try {
    const rows = await sql`
      INSERT INTO exercises (name, muscle_group)
      VALUES (${name}, ${muscleGroup}::muscle_group)
      RETURNING id, name, muscle_group
    `
    return toExercise(rows[0])
  } catch (err) {
    if ((err as { code?: string }).code === UNIQUE_VIOLATION) {
      throw new Error(`You already have a "${name}" under ${muscleGroup}.`)
    }
    throw err
  }
}

export async function getExercise(id: number): Promise<Exercise | null> {
  const rows = await sql`
    SELECT id, name, muscle_group FROM exercises WHERE id = ${id}
  `
  return rows.length > 0 ? toExercise(rows[0]) : null
}

export async function deleteExercise(id: number): Promise<void> {
  await sql`DELETE FROM exercises WHERE id = ${id}`
}

/**
 * Every exercise with its single most recent entry.
 */
export async function listExercisesWithLatest(): Promise<ExerciseWithLatest[]> {
  const rows = await sql`
    SELECT
      ex.id, ex.name, ex.muscle_group,
      e.id AS entry_id, e.exercise_id, e.weight, e.reps, e.logged_at
    FROM exercises ex
    LEFT JOIN LATERAL (
      SELECT id, exercise_id, weight, reps, logged_at
      FROM entries
      WHERE exercise_id = ex.id
      ORDER BY logged_at DESC, id DESC
      LIMIT 1
    ) e ON TRUE
    ORDER BY ex.name ASC
  `

  return rows.map((row) => ({
    ...toExercise(row),
    latest: row.entry_id === null ? null : toEntry({ ...row, id: row.entry_id }),
  }))
}

export async function getEntries(exerciseId: number): Promise<Entry[]> {
  const rows = await sql`
    SELECT id, exercise_id, weight, reps, logged_at
    FROM entries
    WHERE exercise_id = ${exerciseId}
    ORDER BY logged_at DESC, id DESC
  `
  return rows.map(toEntry)
}

export async function insertEntry(exerciseId: number, weight: number, reps: number): Promise<Entry> {
  const rows = await sql`
    INSERT INTO entries (exercise_id, weight, reps)
    VALUES (${exerciseId}, ${weight}, ${reps})
    RETURNING id, exercise_id, weight, reps, logged_at
  `
  return toEntry(rows[0])
}

/** Corrects a mistyped row. Deliberately does not touch logged_at. */
export async function updateEntry(id: number, weight: number, reps: number): Promise<void> {
  await sql`UPDATE entries SET weight = ${weight}, reps = ${reps} WHERE id = ${id}`
}

export async function deleteEntry(id: number): Promise<void> {
  await sql`DELETE FROM entries WHERE id = ${id}`
}
