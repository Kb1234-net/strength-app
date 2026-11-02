// Your weekly training plan.
// To change an exercise, its target sets, or its target reps, edit this file.
//
// Each exercise has a stable "id". Logged sets are saved against that id,
// so renaming an exercise's display "name" is safe, but changing its "id"
// would disconnect it from its history.

export type PlannedExercise = {
  id: string
  name: string
  targetSets: number
  targetReps: number
}

export type TrainingDay = {
  id: string
  name: string
  exercises: PlannedExercise[]
}

export const TRAINING_PLAN: TrainingDay[] = [
  {
    id: 'chest-shoulders',
    name: 'Chest & Shoulders',
    exercises: [
      { id: 'shoulder-press', name: 'Shoulder Press', targetSets: 4, targetReps: 8 },
      { id: 'lateral-raise', name: 'Lateral Raise', targetSets: 4, targetReps: 8 },
      { id: 'pec-fly', name: 'Pectoral Fly', targetSets: 4, targetReps: 8 },
      { id: 'chest-press', name: 'Chest Press', targetSets: 4, targetReps: 8 },
    ],
  },
  {
    id: 'back',
    name: 'Back',
    exercises: [
      { id: 'lat-pulldown', name: 'Lat Pulldown', targetSets: 4, targetReps: 10 },
      { id: 'seated-row', name: 'Seated Row', targetSets: 4, targetReps: 10 },
      { id: 'barbell-shrug', name: 'Barbell Shrugs', targetSets: 4, targetReps: 10 },
      { id: 'iso-pulldown', name: 'Iso Pulldown', targetSets: 4, targetReps: 10 },
    ],
  },
  {
    id: 'legs',
    name: 'Legs',
    exercises: [
      // Leg extension and seated leg curl are listed separately so their
      // weights don't get mixed together in your history.
      { id: 'leg-extension', name: 'Leg Extension', targetSets: 4, targetReps: 10 },
      { id: 'seated-leg-curl', name: 'Seated Leg Curl', targetSets: 4, targetReps: 10 },
      { id: 'standing-calf-raise', name: 'Standing Calf Raise', targetSets: 4, targetReps: 10 },
      { id: 'hip-abduction', name: 'Hip Abduction', targetSets: 4, targetReps: 10 },
    ],
  },
  {
    id: 'arms',
    name: 'Arms',
    exercises: [
      { id: 'bicep-curl', name: 'Bicep Curls', targetSets: 4, targetReps: 8 },
      // Same id as on Chest & Shoulders day, so both days share one history.
      { id: 'lateral-raise', name: 'Lateral Raise', targetSets: 4, targetReps: 8 },
      { id: 'tricep-extension', name: 'Tricep Extension', targetSets: 4, targetReps: 8 },
      { id: 'hammer-curl', name: 'Hammer Curls', targetSets: 4, targetReps: 8 },
    ],
  },
]

export function findDay(dayId: string): TrainingDay | undefined {
  return TRAINING_PLAN.find((day) => day.id === dayId)
}

export function findExercise(exerciseId: string): PlannedExercise | undefined {
  for (const day of TRAINING_PLAN) {
    const match = day.exercises.find((exercise) => exercise.id === exerciseId)
    if (match) {
      return match
    }
  }
  return undefined
}
