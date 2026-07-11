import { describe, expect, it } from 'vitest'
import {
  est1RM,
  parseRange,
  filterEntriesByRange,
  growthPct,
  exerciseGrowth,
  groupGrowth,
  est1RMSeries,
} from './analytics'
import type { Entry, ExerciseWithEntries } from './types'

const NOW = new Date('2026-07-11T12:00:00Z')
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000)

function entry(partial: Partial<Entry>): Entry {
  return { id: 1, exerciseId: 1, weight: 100, reps: 1, loggedAt: NOW, ...partial }
}

describe('est1RM (Epley)', () => {
  it('equals the weight at one rep', () => {
    expect(est1RM(100, 1)).toBeCloseTo(100 * (1 + 1 / 30))
  })
  it('rewards more reps', () => {
    expect(est1RM(60, 8)).toBeCloseTo(76)
  })
  it('rewards more weight', () => {
    expect(est1RM(60, 10)).toBeCloseTo(80)
    expect(est1RM(65, 10)).toBeGreaterThan(est1RM(60, 10))
  })
})

describe('parseRange', () => {
  it('accepts the three valid values', () => {
    expect(parseRange('all')).toBe('all')
    expect(parseRange('30')).toBe('30')
    expect(parseRange('90')).toBe('90')
  })
  it('falls back to all for missing or garbage', () => {
    expect(parseRange(undefined)).toBe('all')
    expect(parseRange('')).toBe('all')
    expect(parseRange('year')).toBe('all')
  })
})

describe('filterEntriesByRange', () => {
  const entries = [entry({ loggedAt: daysAgo(100) }), entry({ loggedAt: daysAgo(45) }), entry({ loggedAt: daysAgo(5) })]
  it('all keeps everything', () => {
    expect(filterEntriesByRange(entries, 'all', NOW)).toHaveLength(3)
  })
  it('90 keeps entries within 90 days', () => {
    expect(filterEntriesByRange(entries, '90', NOW)).toHaveLength(2)
  })
  it('30 keeps entries within 30 days', () => {
    expect(filterEntriesByRange(entries, '30', NOW)).toHaveLength(1)
  })
})

describe('growthPct', () => {
  it('is null with fewer than two entries', () => {
    expect(growthPct([])).toBeNull()
    expect(growthPct([entry({ weight: 100, reps: 1 })])).toBeNull()
  })
  it('measures change in est-1RM from earliest to latest', () => {
    const e = [
      entry({ weight: 60, reps: 10, loggedAt: daysAgo(30) }),
      entry({ weight: 65, reps: 10, loggedAt: daysAgo(1) }),
    ]
    expect(growthPct(e)).toBeCloseTo(8.333, 2)
  })
  it('is negative when strength drops', () => {
    const e = [
      entry({ weight: 100, reps: 5, loggedAt: daysAgo(30) }),
      entry({ weight: 90, reps: 5, loggedAt: daysAgo(1) }),
    ]
    expect(growthPct(e)!).toBeLessThan(0)
  })
  it('does not depend on input order', () => {
    const asc = [entry({ weight: 60, reps: 10, loggedAt: daysAgo(30) }), entry({ weight: 65, reps: 10, loggedAt: daysAgo(1) })]
    const desc = [...asc].reverse()
    expect(growthPct(desc)).toBeCloseTo(growthPct(asc)!, 6)
  })
})

describe('exerciseGrowth (range-aware)', () => {
  const ex: ExerciseWithEntries = {
    id: 1,
    name: 'Bench',
    muscleGroup: 'chest',
    entries: [
      entry({ weight: 60, reps: 10, loggedAt: daysAgo(100) }),
      entry({ weight: 63, reps: 10, loggedAt: daysAgo(45) }),
      entry({ weight: 66, reps: 10, loggedAt: daysAgo(2) }),
    ],
  }
  it('uses the earliest entry within the range as the baseline', () => {
    expect(exerciseGrowth(ex, '30', NOW)).toBeNull()
    expect(exerciseGrowth(ex, '90', NOW)!).toBeGreaterThan(0)
    expect(exerciseGrowth(ex, 'all', NOW)!).toBeGreaterThan(exerciseGrowth(ex, '90', NOW)!)
  })
})

describe('groupGrowth', () => {
  const now = NOW
  const twoPoint = (name: string, w0: number, w1: number): ExerciseWithEntries => ({
    id: Math.random(), name, muscleGroup: 'chest',
    entries: [entry({ weight: w0, reps: 10, loggedAt: daysAgo(30) }), entry({ weight: w1, reps: 10, loggedAt: daysAgo(1) })],
  })
  const onePoint = (name: string): ExerciseWithEntries => ({
    id: Math.random(), name, muscleGroup: 'chest',
    entries: [entry({ weight: 100, reps: 10, loggedAt: daysAgo(1) })],
  })
  it('averages growth over qualifying exercises only', () => {
    const g = groupGrowth([twoPoint('Bench', 100, 110), twoPoint('Fly', 100, 120), onePoint('Press')], 'all', now)
    expect(g!).toBeGreaterThan(10)
    expect(g!).toBeLessThan(20)
  })
  it('is null when nothing qualifies', () => {
    expect(groupGrowth([onePoint('A'), onePoint('B')], 'all', now)).toBeNull()
    expect(groupGrowth([], 'all', now)).toBeNull()
  })
})

describe('est1RMSeries', () => {
  it('maps range-filtered entries to sorted {date,value} points', () => {
    const entries = [
      entry({ weight: 65, reps: 10, loggedAt: daysAgo(1) }),
      entry({ weight: 60, reps: 10, loggedAt: daysAgo(30) }),
    ]
    const series = est1RMSeries(entries, 'all', NOW)
    expect(series.map((p) => p.date.getTime())).toEqual([daysAgo(30).getTime(), daysAgo(1).getTime()])
    expect(series[0].value).toBeCloseTo(80)
    expect(series[1].value).toBeCloseTo(86.667, 2)
  })
})
