// Export every logged set to a CSV file you can open in Excel or Google Sheets.
// This is your backup until the app has a backend.

import { db, todayAsString, type LoggedSet } from './db'
import { findExercise } from './plan'

const CSV_COLUMNS = ['date', 'exercise', 'exercise_id', 'set_number', 'weight_lb', 'reps', 'logged_at']

// Wraps a value in quotes if it contains a comma, quote, or line break,
// so values like "Curls, cable" don't break the columns.
function escapeCsvValue(value: string | number): string {
  const text = String(value)
  const needsQuotes = text.includes(',') || text.includes('"') || text.includes('\n')
  if (needsQuotes) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

export function buildCsv(sets: LoggedSet[]): string {
  // Oldest first, so the file reads like a training log
  const sortedSets = [...sets].sort((a, b) => a.loggedAt - b.loggedAt)

  // Number the sets 1, 2, 3... within each exercise on each date
  const setCounts = new Map<string, number>()

  const rows: string[] = [CSV_COLUMNS.join(',')]

  for (const set of sortedSets) {
    const countKey = `${set.date}|${set.exerciseId}`
    const setNumber = (setCounts.get(countKey) ?? 0) + 1
    setCounts.set(countKey, setNumber)

    // If an exercise was removed from plan.ts, fall back to its id
    const exerciseName = findExercise(set.exerciseId)?.name ?? set.exerciseId

    const row = [
      set.date,
      exerciseName,
      set.exerciseId,
      setNumber,
      set.weightLb,
      set.reps,
      new Date(set.loggedAt).toISOString(),
    ]
    rows.push(row.map(escapeCsvValue).join(','))
  }

  return rows.join('\n')
}

// Creates the file in memory and asks the browser to download it.
// Returns how many sets were exported.
export async function downloadWorkoutCsv(): Promise<number> {
  const allSets = await db.sets.toArray()
  const csvText = buildCsv(allSets)

  const file = new Blob([csvText], { type: 'text/csv;charset=utf-8' })
  const fileUrl = URL.createObjectURL(file)

  // A temporary invisible link, clicked from code, is the standard way to trigger a download
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = `workouts-${todayAsString()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(fileUrl) // free the memory
  return allSets.length
}
