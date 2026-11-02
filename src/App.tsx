// The app shell: decides which screen to show.
//
// Navigation is just a piece of state describing the current screen.
// That's plenty for four screens; a router library can come later if needed.

import { useState } from 'react'
import { CalendarScreen } from './screens/CalendarScreen'
import { DayScreen } from './screens/DayScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LogScreen } from './screens/LogScreen'

type Screen =
  | { name: 'home' }
  | { name: 'day'; dayId: string }
  | { name: 'log'; dayId: string; exerciseId: string }
  | { name: 'history'; dayId: string; exerciseId: string }
  | { name: 'calendar' }

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  return (
    <main className="mx-auto min-h-screen max-w-md bg-slate-950 pb-10">
      {screen.name === 'home' && (
        <HomeScreen
          onSelectDay={(dayId) => setScreen({ name: 'day', dayId })}
          onOpenCalendar={() => setScreen({ name: 'calendar' })}
        />
      )}

      {screen.name === 'day' && (
        <DayScreen
          dayId={screen.dayId}
          onSelectExercise={(exerciseId) => setScreen({ name: 'log', dayId: screen.dayId, exerciseId })}
          onBack={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'log' && (
        <LogScreen
          // The key makes React start fresh (re-run the pre-fill) when you switch exercises.
          key={screen.exerciseId}
          exerciseId={screen.exerciseId}
          onShowHistory={() =>
            setScreen({ name: 'history', dayId: screen.dayId, exerciseId: screen.exerciseId })
          }
          onBack={() => setScreen({ name: 'day', dayId: screen.dayId })}
        />
      )}

      {screen.name === 'history' && (
        <HistoryScreen
          exerciseId={screen.exerciseId}
          onBack={() => setScreen({ name: 'log', dayId: screen.dayId, exerciseId: screen.exerciseId })}
        />
      )}

      {screen.name === 'calendar' && <CalendarScreen onBack={() => setScreen({ name: 'home' })} />}
    </main>
  )
}

export default App
