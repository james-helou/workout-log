type Measured = { weight: number; reps: number }

/** Strips trailing zeros: 5 -> "5", 2.5 -> "2.5", 2.50 -> "2.5" */
function num(n: number): string {
  return String(Number(n.toFixed(2)))
}

function signed(n: number): string {
  return n > 0 ? `+${num(n)}` : `−${num(Math.abs(n))}`
}

/**
 * Describes the change from `previous` to `current`.
 * Returns null for a first-ever entry, or when nothing changed.
 */
export function formatDelta(current: Measured, previous: Measured | null): string | null {
  if (!previous) return null

  const dWeight = current.weight - previous.weight
  const dReps = current.reps - previous.reps

  const parts: string[] = []
  if (dWeight !== 0) parts.push(`${signed(dWeight)} lb`)
  if (dReps !== 0) parts.push(`${signed(dReps)} ${Math.abs(dReps) === 1 ? 'rep' : 'reps'}`)

  return parts.length > 0 ? parts.join(', ') : null
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/** Compact elapsed time: "just now", "5m ago", "3h ago", "3d ago", "1w ago". */
export function formatRelative(then: Date, now: Date): string {
  const ms = now.getTime() - then.getTime()

  if (ms < MINUTE) return 'just now'
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)}m ago`
  if (ms < DAY) return `${Math.floor(ms / HOUR)}h ago`
  if (ms < WEEK) return `${Math.floor(ms / DAY)}d ago`
  return `${Math.floor(ms / WEEK)}w ago`
}
