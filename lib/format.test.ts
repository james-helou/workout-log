import { describe, expect, it } from 'vitest'
import { formatDelta } from './format'

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
