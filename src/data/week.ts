// Weekly progress: which training days you've done this week.
// The week starts on Sunday, so everything resets automatically each Sunday.

import { db, todayAsString } from './db'
import { TRAINING_PLAN } from './plan'

// The most recent Sunday (or today, if today is Sunday), as "YYYY-MM-DD", in local time.
export function startOfWeekAsString(): string {
  const now = new Date()
  const daysSinceSunday = now.getDay() // 0 = Sunday, 1 = Monday, ...
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceSunday)

  const year = sunday.getFullYear()
  const month = String(sunday.getMonth() + 1).padStart(2, '0')
  const day = String(sunday.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// For sets saved before we started recording the training day:
// if an exercise belongs to exactly one day, we can tell which day it was.
// Shared exercises (like Lateral Raise) can't be matched, so they're skipped.
function guessDayFromExercise(exerciseId: string): string | undefined {
  const daysWithThisExercise = TRAINING_PLAN.filter((day) =>
    day.exercises.some((exercise) => exercise.id === exerciseId),
  )
  if (daysWithThisExercise.length === 1) {
    return daysWithThisExercise[0].id
  }
  return undefined
}

// The ids of training days with at least one set logged this week.
// Showing up and training the day counts, even if you skipped an exercise.
export async function getDaysTrainedThisWeek(): Promise<Set<string>> {
  const setsThisWeek = await db.sets
    .where('date')
    .between(startOfWeekAsString(), todayAsString(), true, true) // true, true = include both ends
    .toArray()

  const daysTrained = new Set<string>()
  for (const set of setsThisWeek) {
    const dayId = set.dayId ?? guessDayFromExercise(set.exerciseId)
    if (dayId) {
      daysTrained.add(dayId)
    }
  }
  return daysTrained
}
