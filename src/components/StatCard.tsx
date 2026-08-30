interface StatCardProps {
  label: string
  value: number | string
  accent?: boolean
}

export function StatCard({ label, value, accent = false }: StatCardProps) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-center ${
        accent ? 'bg-sage-500 text-white' : 'bg-sage-50 text-sage-800'
      }`}
    >
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div
        className={`mt-0.5 text-xs font-medium uppercase tracking-wide ${
          accent ? 'text-sage-50' : 'text-sage-500'
        }`}
      >
        {label}
      </div>
    </div>
  )
}
