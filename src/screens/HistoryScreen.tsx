// Fourth screen: your history for one exercise, as a table by date.

import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from '../components/Header'
import { getAllSetsForExercise } from '../data/db'
import { formatDateForDisplay, formatSet, summarizeByDate } from '../data/history'
import { findExercise } from '../data/plan'

type HistoryScreenProps = {
  exerciseId: string
  onBack: () => void
}

export function HistoryScreen({ exerciseId, onBack }: HistoryScreenProps) {
  const exercise = findExercise(exerciseId)
  const allSets = useLiveQuery(() => getAllSetsForExercise(exerciseId), [exerciseId]) ?? []
  const sessions = summarizeByDate(allSets)

  return (
    <>
      <Header title={exercise?.name ?? 'History'} subtitle="Newest first" onBack={onBack} />

      <div className="p-4">
        {sessions.length === 0 ? (
          <p className="rounded-2xl bg-slate-900 p-4 text-slate-400">Nothing logged yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Best</th>
                  <th className="px-3 py-3 font-semibold">Sets (lb × reps)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sessions.map((session) => (
                  <tr key={session.date} className="align-top">
                    <td className="whitespace-nowrap px-3 py-3 text-slate-300">
                      {formatDateForDisplay(session.date)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-emerald-300">
                      {formatSet(session.bestSet)}
                    </td>
                    <td className="px-3 py-3 text-slate-300">
                      {session.sets.map((set) => formatSet(set)).join(', ')}
                      <span className="mt-1 block text-xs text-slate-500">
                        Volume: {session.totalVolumeLb.toLocaleString()} lb
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
