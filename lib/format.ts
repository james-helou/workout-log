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
