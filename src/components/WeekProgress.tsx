// The "this week" status bar on the home screen:
// one segment per training day, filled in once you've trained it this week.

import { TRAINING_PLAN } from '../data/plan'

type WeekProgressProps = {
  daysTrained: Set<string>
}

export function WeekProgress({ daysTrained }: WeekProgressProps) {
  const totalDays = TRAINING_PLAN.length
  const doneCount = TRAINING_PLAN.filter((day) => daysTrained.has(day.id)).length
  const remainingCount = totalDays - doneCount
  const allDone = remainingCount === 0

  let message = `${remainingCount} to go`
  if (allDone) {
    message = 'Week complete 🎉'
  } else if (doneCount === 0) {
    message = 'Fresh week. Let’s go!'
  }

  return (
    <section className="mx-4 mt-4 rounded-2xl bg-slate-900 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">This week</h2>
        <span className="text-sm text-slate-400">Resets Sunday</span>
      </div>

      <p className="mt-1 text-2xl font-bold text-white">
        {doneCount} of {totalDays}
        <span className={allDone ? 'ml-2 text-base font-semibold text-emerald-300' : 'ml-2 text-base font-medium text-slate-400'}>
          {message}
        </span>
      </p>

      <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}>
        {TRAINING_PLAN.map((day) => {
          const isDone = daysTrained.has(day.id)
          return (
            <div key={day.id} className="text-center">
              <div className={isDone ? 'h-2.5 rounded-full bg-emerald-500' : 'h-2.5 rounded-full bg-slate-700'} />
              <span className={isDone ? 'mt-1 block truncate text-[11px] text-emerald-300' : 'mt-1 block truncate text-[11px] text-slate-500'}>
                {day.name}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
