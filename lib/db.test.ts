import { neon } from '@neondatabase/serverless'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import {
  addExercise,
  deleteEntry,
  deleteExercise,
  getAllExercisesWithEntries,
  getEntries,
  getExercise,
  insertEntry,
  listExercisesWithLatest,
  updateEntry,
} from './db'

const sql = neon(process.env.TEST_DATABASE_URL!)

beforeEach(async () => {
  await sql`TRUNCATE exercises, entries RESTART IDENTITY CASCADE`
})

afterAll(async () => {
  await sql`TRUNCATE exercises, entries RESTART IDENTITY CASCADE`
})

describe('addExercise', () => {
  it('creates an exercise and returns it', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    expect(ex).toMatchObject({ name: 'Shoulder Press', muscleGroup: 'shoulder' })
    expect(ex.id).toBeGreaterThan(0)
  })

  it('rejects a duplicate name within the same group', async () => {
    await addExercise('Shoulder Press', 'shoulder')
    await expect(addExercise('Shoulder Press', 'shoulder')).rejects.toThrow(/already have/i)
  })

  it('allows the same name under a different group', async () => {
    await addExercise('Press', 'shoulder')
    await expect(addExercise('Press', 'chest')).resolves.toBeTruthy()
  })
})

describe('insertEntry', () => {
  it('appends rather than overwriting when logged twice', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    await insertEntry(ex.id, 55, 10)
    await insertEntry(ex.id, 60, 8)

    const entries = await getEntries(ex.id)
    expect(entries).toHaveLength(2)
  })

  it('returns weight as a number, not a string', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    const entry = await insertEntry(ex.id, 52.5, 8)
    expect(entry.weight).toBe(52.5)
    expect(typeof entry.weight).toBe('number')
  })

  it('preserves fractional weight through a round trip', async () => {
    const ex = await addExercise('Curl', 'bicep')
    await insertEntry(ex.id, 52.5, 8)
    const [entry] = await getEntries(ex.id)
    expect(entry.weight).toBe(52.5)
  })
})

describe('getEntries', () => {
  it('returns newest first', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    await insertEntry(ex.id, 55, 10)
    await insertEntry(ex.id, 60, 8)

    const entries = await getEntries(ex.id)
    expect(entries.map((e) => e.weight)).toEqual([60, 55])
  })

  it('breaks a same-timestamp tie by id, newest id first', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    const ts = '2026-01-01T00:00:00Z'
    // Same logged_at on both rows: ordering must fall to the id DESC tiebreak.
    await sql`INSERT INTO entries (exercise_id, weight, reps, logged_at) VALUES (${ex.id}, 55, 10, ${ts})`
    await sql`INSERT INTO entries (exercise_id, weight, reps, logged_at) VALUES (${ex.id}, 60, 8, ${ts})`

    const entries = await getEntries(ex.id)
    expect(entries.map((e) => e.reps)).toEqual([8, 10]) // the later-inserted (higher id) row first
  })

  it('returns an empty array for a never-logged exercise', async () => {
    const ex = await addExercise('Face Pull', 'shoulder')
    expect(await getEntries(ex.id)).toEqual([])
  })

  it('returns loggedAt as a Date', async () => {
    const ex = await addExercise('Curl', 'bicep')
    await insertEntry(ex.id, 30, 10)
    const [entry] = await getEntries(ex.id)
    expect(entry.loggedAt).toBeInstanceOf(Date)
  })
})

describe('listExercisesWithLatest', () => {
  it('attaches only the most recent entry', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    await insertEntry(ex.id, 55, 10)
    await insertEntry(ex.id, 60, 8)

    const all = await listExercisesWithLatest()
    const found = all.find((e) => e.id === ex.id)!
    expect(found.latest).toMatchObject({ weight: 60, reps: 8 })
  })

  it('coerces the latest fractional weight to a number', async () => {
    const ex = await addExercise('Curl', 'bicep')
    await insertEntry(ex.id, 52.5, 8)

    const all = await listExercisesWithLatest()
    const found = all.find((e) => e.id === ex.id)!
    expect(found.latest!.weight).toBe(52.5)
    expect(typeof found.latest!.weight).toBe('number')
  })

  it('reports null for a never-logged exercise', async () => {
    await addExercise('Face Pull', 'shoulder')
    const all = await listExercisesWithLatest()
    expect(all[0].latest).toBeNull()
  })

  it('returns every exercise regardless of entries', async () => {
    await addExercise('Face Pull', 'shoulder')
    const ex = await addExercise('Curl', 'bicep')
    await insertEntry(ex.id, 30, 10)

    expect(await listExercisesWithLatest()).toHaveLength(2)
  })
})

describe('updateEntry', () => {
  it('corrects one row without touching its timestamp', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    const entry = await insertEntry(ex.id, 600, 8) // fat-fingered

    await updateEntry(entry.id, 60, 12)

    const [fixed] = await getEntries(ex.id)
    expect(fixed.weight).toBe(60)
    expect(fixed.reps).toBe(12) // reps write, not just weight
    expect(fixed.loggedAt.getTime()).toBe(entry.loggedAt.getTime())
  })

  it('leaves sibling rows alone', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    const first = await insertEntry(ex.id, 55, 10)
    await insertEntry(ex.id, 600, 8)

    const entries = await getEntries(ex.id)
    await updateEntry(entries[0].id, 60, 8)

    const after = await getEntries(ex.id)
    expect(after[1]).toMatchObject({ id: first.id, weight: 55, reps: 10 })
  })
})

describe('deleteEntry', () => {
  it('removes only the named row', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    const keep = await insertEntry(ex.id, 55, 10)
    const drop = await insertEntry(ex.id, 600, 8)

    await deleteEntry(drop.id)

    const entries = await getEntries(ex.id)
    expect(entries).toHaveLength(1)
    expect(entries[0].id).toBe(keep.id)
  })
})

describe('deleteExercise', () => {
  it('cascades to its entries', async () => {
    const ex = await addExercise('Shoulder Press', 'shoulder')
    await insertEntry(ex.id, 55, 10)

    await deleteExercise(ex.id)

    expect(await getExercise(ex.id)).toBeNull()
    const rows = await sql`SELECT * FROM entries WHERE exercise_id = ${ex.id}`
    expect(rows).toHaveLength(0)
  })
})

describe('getExercise', () => {
  it('returns null for an unknown id', async () => {
    expect(await getExercise(999_999)).toBeNull()
  })
})

describe('getAllExercisesWithEntries', () => {
  it('returns every exercise with its entries oldest-first and numeric weights', async () => {
    const a = await addExercise('Bench Press', 'chest')
    const b = await addExercise('Face Pull', 'shoulder') // no entries
    await insertEntry(a.id, 60, 10)
    await insertEntry(a.id, 52.5, 8)

    const all = await getAllExercisesWithEntries()
    expect(all).toHaveLength(2)

    const bench = all.find((e) => e.id === a.id)!
    expect(bench.entries).toHaveLength(2)
    expect(bench.entries[0].loggedAt.getTime()).toBeLessThanOrEqual(bench.entries[1].loggedAt.getTime())
    expect(typeof bench.entries.find((e) => e.reps === 8)!.weight).toBe('number')
    expect(bench.entries.find((e) => e.reps === 8)!.weight).toBe(52.5)

    const facePull = all.find((e) => e.id === b.id)!
    expect(facePull.entries).toEqual([])
  })

  it('returns an empty array when there are no exercises', async () => {
    expect(await getAllExercisesWithEntries()).toEqual([])
  })
})
