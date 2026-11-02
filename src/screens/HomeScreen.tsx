// First screen: pick which training day you're doing.

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from '../components/Header'
import { WeekProgress } from '../components/WeekProgress'
import { downloadWorkoutCsv } from '../data/exportCsv'
import { TRAINING_PLAN } from '../data/plan'
import { getDaysTrainedThisWeek } from '../data/week'

type HomeScreenProps = {
  onSelectDay: (dayId: string) => void
  onOpenCalendar: () => void
}

export function HomeScreen({ onSelectDay, onOpenCalendar }: HomeScreenProps) {
  const [exportMessage, setExportMessage] = useState('')
  const daysTrainedThisWeek = useLiveQuery(getDaysTrainedThisWeek, []) ?? new Set<string>()

  async function handleExport() {
    const setCount = await downloadWorkoutCsv()
    setExportMessage(`Exported ${setCount} sets.`)
  }

  return (
    <>
      <Header title="Strength" subtitle="What are you training today?" />

      <WeekProgress daysTrained={daysTrainedThisWeek} />

      <div className="grid gap-3 p-4">
        {TRAINING_PLAN.map((day, index) => {
          const doneThisWeek = daysTrainedThisWeek.has(day.id)

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.id)}
              className={
                doneThisWeek
                  ? 'rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-left transition active:scale-[0.98]'
                  : 'rounded-2xl bg-slate-800 p-5 text-left shadow-sm transition active:scale-[0.98] active:bg-slate-700'
              }
            >
              <span className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Day {index + 1}
                </span>
                {doneThisWeek && (
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                    ✓ Done this week
                  </span>
                )}
              </span>
              <span className={doneThisWeek ? 'mt-1 block text-xl font-semibold text-emerald-100' : 'mt-1 block text-xl font-semibold text-white'}>
                {day.name}
              </span>
              <span className="mt-1 block text-sm text-slate-400">{day.exercises.length} exercises</span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 px-4 pt-2">
        <button
          type="button"
          onClick={onOpenCalendar}
          className="rounded-xl border border-slate-700 py-3 font-semibold text-emerald-400 active:bg-slate-800"
        >
          📅 Consistency calendar
        </button>

        <button
          type="button"
          onClick={handleExport}
          className="rounded-xl border border-slate-700 py-3 font-semibold text-slate-300 active:bg-slate-800"
        >
          ⬇ Export my data (CSV)
        </button>
        {exportMessage && <p className="text-center text-sm text-slate-400">{exportMessage}</p>}
      </div>
    </>
  )
}
