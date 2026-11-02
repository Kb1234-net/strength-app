// First screen: pick which training day you're doing.
import { useState } from 'react'
import { downloadWorkoutCsv } from '../data/exportCsv'
import { Header } from '../components/Header'
import { TRAINING_PLAN } from '../data/plan'

type HomeScreenProps = {
  onSelectDay: (dayId: string) => void
}

export function HomeScreen({ onSelectDay }: HomeScreenProps) {

  const [exportMessage, setExportMessage] = useState('')
  async function handleExport() {
    const setCount = await downloadWorkoutCsv()
    setExportMessage(`Exported ${setCount} sets.`)
  }
  return (
    <>
      <Header title="Strength" subtitle="What are you training today?" />

      <div className="grid gap-3 p-4">
        {TRAINING_PLAN.map((day, index) => (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDay(day.id)}
            className="rounded-2xl bg-slate-800 p-5 text-left shadow-sm transition active:scale-[0.98] active:bg-slate-700"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Day {index + 1}
            </span>
            <span className="mt-1 block text-xl font-semibold text-white">{day.name}</span>
            <span className="mt-1 block text-sm text-slate-400">{day.exercises.length} exercises</span>
          </button>
        ))}
      </div>
         <div className="grid gap-3 px-4 pt-2">
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
