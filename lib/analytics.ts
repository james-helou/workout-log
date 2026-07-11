import type { Entry, ExerciseWithEntries } from './types'

export type Range = 'all' | '30' | '90'

/** Epley estimated 1-rep max: weight × (1 + reps/30). At one rep this is weight × 31/30. */
export function est1RM(weight: number, reps: number): number {
  return weight * (1 + reps / 30)
}

export function parseRange(raw: string | undefined): Range {
  return raw === '30' || raw === '90' ? raw : 'all'
}

export function filterEntriesByRange(entries: Entry[], range: Range, now: Date): Entry[] {
  if (range === 'all') return entries
  const days = range === '30' ? 30 : 90
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000
  return entries.filter((e) => e.loggedAt.getTime() >= cutoff)
}

function sortedByDate(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime())
}

/**
 * Percent change in est-1RM from the earliest to the latest entry.
 * Null with fewer than two entries. Assumes weight > 0 (enforced by the schema),
 * so the earliest est-1RM is never zero.
 */
export function growthPct(entries: Entry[]): number | null {
  if (entries.length < 2) return null
  const sorted = sortedByDate(entries)
  const earliest = est1RM(sorted[0].weight, sorted[0].reps)
  const latest = est1RM(sorted[sorted.length - 1].weight, sorted[sorted.length - 1].reps)
  return ((latest - earliest) / earliest) * 100
}

export function exerciseGrowth(ex: ExerciseWithEntries, range: Range, now: Date): number | null {
  return growthPct(filterEntriesByRange(ex.entries, range, now))
}

/** Equal-weighted mean of the growth of exercises that qualify (>=2 entries in range). */
export function groupGrowth(exercises: ExerciseWithEntries[], range: Range, now: Date): number | null {
  const growths = exercises
    .map((ex) => exerciseGrowth(ex, range, now))
    .filter((g): g is number => g !== null)
  if (growths.length === 0) return null
  return growths.reduce((a, b) => a + b, 0) / growths.length
}

export type SeriesPoint = { date: Date; value: number }

/** Range-filtered est-1RM points, sorted oldest→newest, for charting. */
export function est1RMSeries(entries: Entry[], range: Range, now: Date): SeriesPoint[] {
  return sortedByDate(filterEntriesByRange(entries, range, now)).map((e) => ({
    date: e.loggedAt,
    value: est1RM(e.weight, e.reps),
  }))
}
