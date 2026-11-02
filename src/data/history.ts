// Turns a flat list of logged sets into one summary row per workout date,
// for the history table.

import type { LoggedSet } from './db'

export type SessionSummary = {
  date: string
  sets: LoggedSet[]
  bestSet: LoggedSet // heaviest weight; if tied, the one with the most reps
  totalVolumeLb: number // sum of weight × reps across all sets
}

function isBetterSet(candidate: LoggedSet, currentBest: LoggedSet): boolean {
  if (candidate.weightLb !== currentBest.weightLb) {
    return candidate.weightLb > currentBest.weightLb
  }
  return candidate.reps > currentBest.reps
}

export function summarizeByDate(sets: LoggedSet[]): SessionSummary[] {
  // Group the sets by date
  const setsByDate = new Map<string, LoggedSet[]>()
  for (const set of sets) {
    const existing = setsByDate.get(set.date) ?? []
    existing.push(set)
    setsByDate.set(set.date, existing)
  }

  // Build one summary per date
  const summaries: SessionSummary[] = []
  for (const [date, setsOnDate] of setsByDate) {
    let bestSet = setsOnDate[0]
    let totalVolumeLb = 0

    for (const set of setsOnDate) {
      if (isBetterSet(set, bestSet)) {
        bestSet = set
      }
      totalVolumeLb += set.weightLb * set.reps
    }

    summaries.push({ date, sets: setsOnDate, bestSet, totalVolumeLb })
  }

  // Newest workout first
  summaries.sort((a, b) => b.date.localeCompare(a.date))
  return summaries
}

// "2026-11-01" -> "Sun, Nov 1, 2026"
export function formatDateForDisplay(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const localDate = new Date(year, month - 1, day)
  return localDate.toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// 60 lb × 8 reps -> "60 × 8"
export function formatSet(set: LoggedSet): string {
  return `${set.weightLb} × ${set.reps}`
}
