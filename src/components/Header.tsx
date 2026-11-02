// The bar at the top of every screen: an optional back button and a title.

type HeaderProps = {
  title: string
  subtitle?: string
  onBack?: () => void
}

export function Header({ title, subtitle, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur px-4 pt-6 pb-4 border-b border-slate-800">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-2 text-sm font-medium text-emerald-400 active:text-emerald-300"
        >
          ← Back
        </button>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </header>
  )
}
