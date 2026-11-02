// Second screen: the exercises for one training day.
// Shows how many sets you've already logged today for each one.

import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from '../components/Header'
import { db, todayAsString } from '../data/db'
import { findDay } from '../data/plan'

type DayScreenProps = {
  dayId: string
  onSelectExercise: (exerciseId: string) => void
  onBack: () => void
}

export function DayScreen({ dayId, onSelectExercise, onBack }: DayScreenProps) {
  const day = findDay(dayId)

  // useLiveQuery re-runs automatically whenever the database changes,
  // so the counts update as soon as you log a set.
  const todaysSets = useLiveQuery(() => db.sets.where('date').equals(todayAsString()).toArray(), []) ?? []

  if (!day) {
    return <Header title="Day not found" onBack={onBack} />
  }

  return (
    <>
      <Header title={day.name} subtitle="Tap an exercise to log your sets" onBack={onBack} />

      <ul className="grid gap-3 p-4">
        {day.exercises.map((exercise) => {
          const setsDoneToday = todaysSets.filter((set) => set.exerciseId === exercise.id).length
          const isComplete = setsDoneToday >= exercise.targetSets

          return (
            <li key={exercise.id}>
              <button
                type="button"
                onClick={() => onSelectExercise(exercise.id)}
                className="flex w-full items-center justify-between rounded-2xl bg-slate-800 p-4 text-left transition active:scale-[0.98] active:bg-slate-700"
              >
                <span>
                  <span className="block text-lg font-semibold text-white">{exercise.name}</span>
                  <span className="block text-sm text-slate-400">
                    {exercise.targetSets} sets × {exercise.targetReps} reps
                  </span>
                </span>

                <span
                  className={
                    isComplete
                      ? 'rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300'
                      : 'rounded-full bg-slate-700 px-3 py-1 text-sm font-semibold text-slate-300'
                  }
                >
                  {isComplete ? '✓ Done' : `${setsDoneToday}/${exercise.targetSets}`}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
