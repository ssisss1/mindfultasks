interface ProgressBannerProps {
  total: number
  active: number
  completed: number
}

export function ProgressBanner({ total, active, completed }: ProgressBannerProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  const message =
    total === 0
      ? 'Add a task to begin your day.'
      : active === 0
        ? 'All tasks complete — well done.'
        : `${active} task${active === 1 ? '' : 's'} still to go.`

  return (
    <div className="rounded-2xl bg-sage-600 p-6 text-white shadow-sm sm:p-8">
      <p className="text-sm font-medium text-sage-100">Today's progress</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <span className="text-4xl font-semibold tabular-nums">{percent}%</span>
        <span className="pb-1 text-sm text-sage-100">{message}</span>
      </div>
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-sage-500/60">
        <div
          className="h-full rounded-full bg-white transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-sage-100">
        {completed} of {total} tasks completed
      </p>
    </div>
  )
}
