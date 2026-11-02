// Third screen: log weight × reps for one exercise.
// Shows what you did last time, so you know whether to go up in weight.

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from '../components/Header'
import { addSet, deleteSet, getPreviousSession, getSetsForExerciseOnDate, todayAsString } from '../data/db'
import { formatDateForDisplay, formatSet } from '../data/history'
import { findExercise } from '../data/plan'

type LogScreenProps = {
  exerciseId: string
  dayId: string
  onShowHistory: () => void
  onBack: () => void
}

const WEIGHT_STEP_LB = 5
const REPS_STEP = 1

export function LogScreen({ exerciseId, dayId, onShowHistory, onBack }: LogScreenProps) {
  const exercise = findExercise(exerciseId)
  const today = todayAsString()

  const todaysSets = useLiveQuery(() => getSetsForExerciseOnDate(exerciseId, today), [exerciseId, today])
  const previousSession = useLiveQuery(() => getPreviousSession(exerciseId, today), [exerciseId, today])

  // The inputs are kept as text so the field can be empty while typing.
  const [weightText, setWeightText] = useState('')
  const [repsText, setRepsText] = useState('')
  const [hasPrefilled, setHasPrefilled] = useState(false)

  // Pre-fill the inputs once, when the screen first loads:
  // use your last set from today if there is one, otherwise your first set from last time.
  useEffect(() => {
    if (hasPrefilled || todaysSets === undefined || previousSession === undefined) {
      return
    }

    const lastSetToday = todaysSets[todaysSets.length - 1]
    const firstSetLastTime = previousSession[0]
    const startingSet = lastSetToday ?? firstSetLastTime

    if (startingSet) {
      setWeightText(String(startingSet.weightLb))
      setRepsText(String(startingSet.reps))
    } else if (exercise) {
      setRepsText(String(exercise.targetReps))
    }
    setHasPrefilled(true)
  }, [hasPrefilled, todaysSets, previousSession, exercise])

  if (!exercise) {
    return <Header title="Exercise not found" onBack={onBack} />
  }

  const weight = Number(weightText)
  const reps = Number(repsText)
  const canSave = weightText !== '' && repsText !== '' && weight >= 0 && reps > 0

  async function handleSaveSet() {
    if (!canSave) {
      return
    }
    // Inputs are deliberately NOT cleared: your next set is usually the same weight.
    await addSet(exerciseId, dayId, weight, reps)
  }

  function adjustWeight(change: number) {
    const newWeight = Math.max(0, (Number(weightText) || 0) + change)
    setWeightText(String(newWeight))
  }

  function adjustReps(change: number) {
    const newReps = Math.max(0, (Number(repsText) || 0) + change)
    setRepsText(String(newReps))
  }

  const setsLoggedToday = todaysSets ?? []

  return (
    <>
      <Header
        title={exercise.name}
        subtitle={`Target: ${exercise.targetSets} sets × ${exercise.targetReps} reps`}
        onBack={onBack}
      />

      <div className="grid gap-4 p-4">
        {/* ----- Last time ----- */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last time</h2>
          {previousSession && previousSession.length > 0 ? (
            <>
              <p className="mt-1 text-sm text-slate-400">{formatDateForDisplay(previousSession[0].date)}</p>
              <p className="mt-2 text-lg font-medium text-white">
                {previousSession.map((set) => formatSet(set)).join('  ·  ')}
              </p>
            </>
          ) : (
            <p className="mt-2 text-slate-400">No history yet. Today sets your baseline.</p>
          )}
        </section>

        {/* ----- Entry ----- */}
        <section className="rounded-2xl bg-slate-800 p-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Weight (lb)"
              value={weightText}
              onChange={setWeightText}
              onDecrease={() => adjustWeight(-WEIGHT_STEP_LB)}
              onIncrease={() => adjustWeight(WEIGHT_STEP_LB)}
              inputMode="decimal"
            />
            <NumberField
              label="Reps"
              value={repsText}
              onChange={setRepsText}
              onDecrease={() => adjustReps(-REPS_STEP)}
              onIncrease={() => adjustReps(REPS_STEP)}
              inputMode="numeric"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveSet}
            disabled={!canSave}
            className="mt-4 w-full rounded-xl bg-emerald-500 py-4 text-lg font-bold text-slate-950 transition active:scale-[0.98] active:bg-emerald-400 disabled:opacity-40"
          >
            + Log set {setsLoggedToday.length + 1}
          </button>
        </section>

        {/* ----- Today's sets ----- */}
        <section>
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Today · {setsLoggedToday.length}/{exercise.targetSets} sets
          </h2>
          <ul className="mt-2 grid gap-2">
            {setsLoggedToday.map((set, index) => (
              <li key={set.id} className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
                <span className="text-slate-400">Set {index + 1}</span>
                <span className="text-lg font-semibold text-white">
                  {set.weightLb} lb × {set.reps}
                </span>
                <button
                  type="button"
                  onClick={() => set.id !== undefined && deleteSet(set.id)}
                  className="text-sm text-rose-400 active:text-rose-300"
                  aria-label={`Delete set ${index + 1}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>

        <button
          type="button"
          onClick={onShowHistory}
          className="rounded-xl border border-slate-700 py-3 font-semibold text-emerald-400 active:bg-slate-800"
        >
          View history →
        </button>
      </div>
    </>
  )
}

// ---------- A number input with big − / + buttons for gym-friendly tapping ----------

type NumberFieldProps = {
  label: string
  value: string
  onChange: (newValue: string) => void
  onDecrease: () => void
  onIncrease: () => void
  inputMode: 'decimal' | 'numeric'
}

function NumberField({ label, value, onChange, onDecrease, onIncrease, inputMode }: NumberFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="mt-1 flex items-center gap-1">
        <button
          type="button"
          onClick={onDecrease}
          className="h-12 w-10 rounded-lg bg-slate-700 text-xl font-bold text-white active:bg-slate-600"
        >
          −
        </button>
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full min-w-0 rounded-lg bg-slate-950 text-center text-xl font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={onIncrease}
          className="h-12 w-10 rounded-lg bg-slate-700 text-xl font-bold text-white active:bg-slate-600"
        >
          +
        </button>
      </div>
    </label>
  )
}
