'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as db from '@/lib/db'
import { parseEntryInput, parseExerciseInput } from '@/lib/validate'

export type ActionState = { error: string } | null

function assertSlug(slug: string): void {
  if (!process.env.SECRET_SLUG || slug !== process.env.SECRET_SLUG) {
    throw new Error('Not found')
  }
}

export async function logEntry(
  slug: string,
  exerciseId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  assertSlug(slug)

  const parsed = parseEntryInput(
    String(formData.get('weight') ?? ''),
    String(formData.get('reps') ?? ''),
  )
  if (!parsed.ok) return { error: parsed.error }

  await db.insertEntry(exerciseId, parsed.weight, parsed.reps)
  revalidatePath(`/${slug}`)
  revalidatePath(`/${slug}/e/${exerciseId}`)
  return null
}

export async function editEntry(
  slug: string,
  exerciseId: number,
  entryId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  assertSlug(slug)

  const parsed = parseEntryInput(
    String(formData.get('weight') ?? ''),
    String(formData.get('reps') ?? ''),
  )
  if (!parsed.ok) return { error: parsed.error }

  await db.updateEntry(entryId, parsed.weight, parsed.reps)
  revalidatePath(`/${slug}`)
  revalidatePath(`/${slug}/e/${exerciseId}`)
  return null
}

export async function removeEntry(slug: string, exerciseId: number, entryId: number): Promise<void> {
  assertSlug(slug)
  await db.deleteEntry(entryId)
  revalidatePath(`/${slug}`)
  revalidatePath(`/${slug}/e/${exerciseId}`)
}

export async function removeExercise(slug: string, exerciseId: number): Promise<void> {
  assertSlug(slug)
  await db.deleteExercise(exerciseId)
  revalidatePath(`/${slug}`)
  redirect(`/${slug}`)
}

export async function createExercise(
  slug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  assertSlug(slug)

  const parsed = parseExerciseInput(
    String(formData.get('name') ?? ''),
    String(formData.get('muscleGroup') ?? ''),
  )
  if (!parsed.ok) return { error: parsed.error }

  try {
    await db.addExercise(parsed.name, parsed.muscleGroup)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Could not add that exercise.' }
  }

  revalidatePath(`/${slug}`)
  redirect(`/${slug}`)
}
