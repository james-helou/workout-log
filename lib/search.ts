/** Lowercase and drop everything but a–z0–9, so spacing/hyphens/case don't matter. */
export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** True if the normalized query is a subsequence of the normalized name. Empty query matches all. */
export function matches(name: string, query: string): boolean {
  const q = normalize(query)
  if (q === '') return true
  const n = normalize(name)
  let qi = 0
  for (let ni = 0; ni < n.length && qi < q.length; ni++) {
    if (n[ni] === q[qi]) qi++
  }
  return qi === q.length
}

export function filterByName<T extends { name: string }>(items: T[], query: string): T[] {
  return items.filter((item) => matches(item.name, query))
}
