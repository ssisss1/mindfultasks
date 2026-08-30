interface StatCardProps {
  label: string
  value: number | string
  accent?: boolean
}

export function StatCard({ label, value, accent = false }: StatCardProps) {
  return (
    <div
      className={`border px-3 py-3 text-center ${
        accent
          ? 'border-term-amber bg-term-amber/10'
          : 'border-term-line bg-term-raised'
      }`}
    >
      <div
        className={`font-display text-3xl leading-none tabular-nums ${
          accent ? 'text-term-amber text-glow-amber' : 'text-term-green text-glow'
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1 text-[10px] uppercase tracking-[0.22em] ${
          accent ? 'text-term-amber/80' : 'text-term-muted'
        }`}
      >
        {label}
      </div>
    </div>
  )
}
