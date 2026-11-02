// The on-device database.
//
// IndexedDB is a database built into every browser. It keeps data on the
// phone between visits and works offline. Dexie is a small library that
// makes IndexedDB pleasant to use (think of it like a tiny ORM).

import Dexie, { type EntityTable } from 'dexie'

// One row per set you complete.
export type LoggedSet = {
  id?: number // filled in automatically by the database
  exerciseId: string // matches an id in plan.ts
  date: string // the workout day, as "YYYY-MM-DD"
  weightLb: number
  reps: number
  loggedAt: number // exact time saved (milliseconds), used to keep sets in order
}

class StrengthDatabase extends Dexie {
  sets!: EntityTable<LoggedSet, 'id'>

  constructor() {
    super('strength-app')

    // Version 1 of the schema. The string lists which fields are indexed
    // (searchable quickly). "++id" means an auto-incrementing primary key.
    // If you change this later, add a version(2) block instead of editing this one.
    this.version(1).stores({
      sets: '++id, exerciseId, date, [exerciseId+date]',
    })
  }
}

export const db = new StrengthDatabase()

// ---------- Date helper ----------

// Returns today's date as "YYYY-MM-DD" in the phone's local time zone.
// (new Date().toISOString() would use UTC, so an evening workout in
// Ontario would be saved under tomorrow's date.)
export function todayAsString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ---------- Queries ----------

export async function getSetsForExerciseOnDate(exerciseId: string, date: string): Promise<LoggedSet[]> {
  const sets = await db.sets.where({ exerciseId: exerciseId, date: date }).toArray()
  return sets.sort((a, b) => a.loggedAt - b.loggedAt)
}

export async function getAllSetsForExercise(exerciseId: string): Promise<LoggedSet[]> {
  const sets = await db.sets.where('exerciseId').equals(exerciseId).toArray()
  return sets.sort((a, b) => a.loggedAt - b.loggedAt)
}

// The sets from the most recent workout *before* the given date.
// This powers the "Last time" box on the logging screen.
export async function getPreviousSession(exerciseId: string, beforeDate: string): Promise<LoggedSet[]> {
  const allSets = await getAllSetsForExercise(exerciseId)
  const earlierSets = allSets.filter((set) => set.date < beforeDate)

  if (earlierSets.length === 0) {
    return []
  }

  const mostRecentDate = earlierSets[earlierSets.length - 1].date
  return earlierSets.filter((set) => set.date === mostRecentDate)
}

// ---------- Changes ----------

export async function addSet(exerciseId: string, weightLb: number, reps: number): Promise<void> {
  await db.sets.add({
    exerciseId: exerciseId,
    date: todayAsString(),
    weightLb: weightLb,
    reps: reps,
    loggedAt: Date.now(),
  })
}

export async function deleteSet(setId: number): Promise<void> {
  await db.sets.delete(setId)
}
