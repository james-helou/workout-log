import { describe, expect, it } from 'vitest'
import { formatDelta, formatRelative } from './format'

describe('formatDelta', () => {
  it('returns null when there is no previous entry', () => {
    expect(formatDelta({ weight: 55, reps: 10 }, null)).toBeNull()
  })

  it('reports a weight increase', () => {
    expect(formatDelta({ weight: 60, reps: 8 }, { weight: 55, reps: 8 })).toBe('+5 lb')
  })

  it('reports a rep decrease', () => {
    expect(formatDelta({ weight: 55, reps: 8 }, { weight: 55, reps: 10 })).toBe('−2 reps')
  })

  it('reports weight and reps together, weight first', () => {
    expect(formatDelta({ weight: 60, reps: 8 }, { weight: 55, reps: 10 })).toBe('+5 lb, −2 reps')
  })

  it('returns null when nothing changed', () => {
    expect(formatDelta({ weight: 55, reps: 8 }, { weight: 55, reps: 8 })).toBeNull()
  })

  it('uses a singular noun for a one-rep change', () => {
    expect(formatDelta({ weight: 55, reps: 9 }, { weight: 55, reps: 8 })).toBe('+1 rep')
  })

  it('formats fractional weight without trailing zeros', () => {
    expect(formatDelta({ weight: 52.5, reps: 8 }, { weight: 50, reps: 8 })).toBe('+2.5 lb')
  })
})

describe('formatRelative', () => {
  const now = new Date('2026-07-09T12:00:00Z')
  const ago = (ms: number) => new Date(now.getTime() - ms)

  const MIN = 60_000
  const HOUR = 60 * MIN
  const DAY = 24 * HOUR

  it('renders the last minute as "just now"', () => {
    expect(formatRelative(ago(30_000), now)).toBe('just now')
  })

  it('renders minutes', () => {
    expect(formatRelative(ago(5 * MIN), now)).toBe('5m ago')
  })

  it('renders hours', () => {
    expect(formatRelative(ago(3 * HOUR), now)).toBe('3h ago')
  })

  it('renders days', () => {
    expect(formatRelative(ago(3 * DAY), now)).toBe('3d ago')
  })

  it('renders weeks once past seven days', () => {
    expect(formatRelative(ago(9 * DAY), now)).toBe('1w ago')
  })

  it('keeps using weeks past a year rather than switching units', () => {
    expect(formatRelative(ago(400 * DAY), now)).toBe('57w ago')
  })

  it('truncates rather than rounds, so 47h is not "2d"', () => {
    expect(formatRelative(ago(47 * HOUR), now)).toBe('1d ago')
  })
})
