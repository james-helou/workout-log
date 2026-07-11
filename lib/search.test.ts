import { describe, expect, it } from 'vitest'
import { normalize, matches, filterByName } from './search'

describe('normalize', () => {
  it('lowercases and strips non-alphanumerics', () => {
    expect(normalize('Incline-DB Press!')).toBe('inclinedbpress')
    expect(normalize('  Shoulder   Press ')).toBe('shoulderpress')
  })
})

describe('matches', () => {
  it('matches everything on an empty query', () => {
    expect(matches('Bench Press', '')).toBe(true)
    expect(matches('Bench Press', '   ')).toBe(true)
  })
  it('is case and spacing insensitive', () => {
    expect(matches('Incline Dumbbell Press', 'incline db')).toBe(true)
    expect(matches('Incline Dumbbell Press', 'INCLINEDB')).toBe(true)
  })
  it('matches a subsequence (forgives dropped letters)', () => {
    expect(matches('Shoulder Press', 'shpress')).toBe(true)
    expect(matches('Rope Hammer Curl', 'rhc')).toBe(true)
  })
  it('rejects characters not present in order', () => {
    expect(matches('Bench Press', 'squat')).toBe(false)
    expect(matches('Bench Press', 'presb')).toBe(false)
  })
})

describe('filterByName', () => {
  const items = [{ name: 'Bench Press' }, { name: 'Incline Dumbbell Press' }, { name: 'Squat' }]
  it('returns matches only', () => {
    expect(filterByName(items, 'press').map((i) => i.name)).toEqual(['Bench Press', 'Incline Dumbbell Press'])
  })
  it('returns all on empty query', () => {
    expect(filterByName(items, '')).toHaveLength(3)
  })
  it('returns none when nothing matches', () => {
    expect(filterByName(items, 'deadlift')).toEqual([])
  })
})
