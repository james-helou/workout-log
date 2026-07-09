import { describe, expect, it } from 'vitest'
import { parseEntryInput, parseExerciseInput } from './validate'

describe('parseEntryInput', () => {
  it('accepts whole numbers', () => {
    expect(parseEntryInput('60', '8')).toEqual({ ok: true, weight: 60, reps: 8 })
  })

  it('accepts fractional weight', () => {
    expect(parseEntryInput('52.5', '8')).toEqual({ ok: true, weight: 52.5, reps: 8 })
  })

  it('trims surrounding whitespace', () => {
    expect(parseEntryInput(' 60 ', ' 8 ')).toEqual({ ok: true, weight: 60, reps: 8 })
  })

  it('rejects an empty weight', () => {
    expect(parseEntryInput('', '8')).toEqual({ ok: false, error: 'Enter a weight.' })
  })

  it('rejects an empty rep count', () => {
    expect(parseEntryInput('60', '')).toEqual({ ok: false, error: 'Enter a rep count.' })
  })

  it('rejects non-numeric weight', () => {
    expect(parseEntryInput('heavy', '8')).toEqual({ ok: false, error: 'Weight must be a number.' })
  })

  it('rejects zero weight', () => {
    expect(parseEntryInput('0', '8')).toEqual({ ok: false, error: 'Weight must be greater than zero.' })
  })

  it('rejects negative weight', () => {
    expect(parseEntryInput('-5', '8')).toEqual({ ok: false, error: 'Weight must be greater than zero.' })
  })

  it('rejects absurd weight', () => {
    expect(parseEntryInput('5000', '8')).toEqual({ ok: false, error: 'Weight must be 2000 lb or less.' })
  })

  it('rejects fractional reps', () => {
    expect(parseEntryInput('60', '8.5')).toEqual({ ok: false, error: 'Reps must be a whole number.' })
  })

  it('rejects zero reps', () => {
    expect(parseEntryInput('60', '0')).toEqual({ ok: false, error: 'Reps must be greater than zero.' })
  })

  it('rejects absurd reps', () => {
    expect(parseEntryInput('60', '5000')).toEqual({ ok: false, error: 'Reps must be 1000 or less.' })
  })

  it('rejects Infinity', () => {
    expect(parseEntryInput('Infinity', '8')).toEqual({ ok: false, error: 'Weight must be a number.' })
  })

  it('rejects non-numeric reps', () => {
    expect(parseEntryInput('60', 'ten')).toEqual({ ok: false, error: 'Reps must be a number.' })
  })

  it('rejects Infinity reps', () => {
    expect(parseEntryInput('60', 'Infinity')).toEqual({ ok: false, error: 'Reps must be a number.' })
  })
})

describe('parseExerciseInput', () => {
  it('accepts a name and a valid group', () => {
    expect(parseExerciseInput('Shoulder Press', 'shoulder')).toEqual({
      ok: true,
      name: 'Shoulder Press',
      muscleGroup: 'shoulder',
    })
  })

  it('trims the name', () => {
    expect(parseExerciseInput('  Row  ', 'back')).toEqual({
      ok: true,
      name: 'Row',
      muscleGroup: 'back',
    })
  })

  it('rejects a blank name', () => {
    expect(parseExerciseInput('   ', 'back')).toEqual({ ok: false, error: 'Enter an exercise name.' })
  })

  it('rejects an overlong name', () => {
    expect(parseExerciseInput('x'.repeat(81), 'back')).toEqual({
      ok: false,
      error: 'Name must be 80 characters or less.',
    })
  })

  it('rejects an unknown muscle group', () => {
    expect(parseExerciseInput('Row', 'forearms')).toEqual({ ok: false, error: 'Pick a muscle group.' })
  })
})
