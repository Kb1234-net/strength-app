// Consistency calendar: a month view with every workout day filled in.

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from '../components/Header'
import { db, todayAsString } from '../data/db'

type CalendarScreenProps = {
  onBack: () => void
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// 2026, 10 (November, because JavaScript months start at 0), 5 -> "2026-11-05"
function toDateString(year: number, monthIndex: number, day: number): string {
  const month = String(monthIndex + 1).padStart(2, '0')
  const dayText = String(day).padStart(2, '0')
  return `${year}-${month}-${dayText}`
}

// Builds the grid for one month: empty slots before the 1st, then each day number.
// For example, if the 1st is a Wednesday: [null, null, null, 1, 2, 3, ...]
function buildMonthGrid(year: number, monthIndex: number): (number | null)[] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day)
  }
  return cells
}

export function CalendarScreen({ onBack }: CalendarScreenProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [monthIndex, setMonthIndex] = useState(now.getMonth())

  // Every distinct date that has at least one logged set.
  // uniqueKeys() reads only the date index, so this stays fast as data grows.
  const workoutDateList = useLiveQuery(async () => {
    const keys = await db.sets.orderBy('date').uniqueKeys()
    return keys.map((key) => String(key))
  }, [])
  const workoutDates = new Set(workoutDateList ?? [])

  const today = todayAsString()
  const monthPrefix = toDateString(year, monthIndex, 1).slice(0, 7) // "2026-11"
  const workoutsThisMonth = [...workoutDates].filter((date) => date.startsWith(monthPrefix)).length
  const monthTitle = new Date(year, monthIndex, 1).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })

  const isViewingCurrentMonth = year === now.getFullYear() && monthIndex === now.getMonth()

  function goToPreviousMonth() {
    if (monthIndex === 0) {
      setYear(year - 1)
      setMonthIndex(11)
    } else {
      setMonthIndex(monthIndex - 1)
    }
  }

  function goToNextMonth() {
    if (monthIndex === 11) {
      setYear(year + 1)
      setMonthIndex(0)
    } else {
      setMonthIndex(monthIndex + 1)
    }
  }

  return (
    <>
      <Header title="Consistency" subtitle="Every day you showed up" onBack={onBack} />

      <div className="grid gap-4 p-4">
        {/* ----- Month summary ----- */}
        <section className="rounded-2xl bg-slate-800 p-4 text-center">
          <p className="text-4xl font-bold text-emerald-300">{workoutsThisMonth}</p>
          <p className="mt-1 text-sm text-slate-400">
            {workoutsThisMonth === 1 ? 'workout' : 'workouts'} in {monthTitle}
          </p>
          <p className="mt-2 text-xs text-slate-500">All time: {workoutDates.size}</p>
        </section>

        {/* ----- Month navigation ----- */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg px-4 py-2 text-xl text-emerald-400 active:bg-slate-800"
            aria-label="Previous month"
          >
            ‹
          </button>
          <h2 className="text-lg font-semibold text-white">{monthTitle}</h2>
          <button
            type="button"
            onClick={goToNextMonth}
            disabled={isViewingCurrentMonth}
            className="rounded-lg px-4 py-2 text-xl text-emerald-400 active:bg-slate-800 disabled:opacity-30"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {/* ----- Calendar grid ----- */}
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="pb-1 text-center text-xs font-semibold text-slate-500">
              {label}
            </div>
          ))}

          {buildMonthGrid(year, monthIndex).map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />
            }

            const date = toDateString(year, monthIndex, day)
            const trainedThisDay = workoutDates.has(date)
            const isToday = date === today

            let cellStyle = 'bg-slate-900 text-slate-500'
            if (trainedThisDay) {
              cellStyle = 'bg-emerald-500 font-bold text-slate-950'
            }
            if (isToday && !trainedThisDay) {
              cellStyle = 'bg-slate-900 text-white ring-2 ring-emerald-500/60'
            }

            return (
              <div key={date} className={`flex aspect-square items-center justify-center rounded-lg text-sm ${cellStyle}`}>
                {day}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
