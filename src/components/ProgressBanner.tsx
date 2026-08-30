interface ProgressBannerProps {
  total: number
  active: number
  completed: number
}

const CELLS = 24

export function ProgressBanner({ total, active, completed }: ProgressBannerProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  const filled = Math.round((percent / 100) * CELLS)

  const message =
    total === 0
      ? 'Add a task to begin your day.'
      : active === 0
        ? 'All tasks complete — well done.'
        : `${active} task${active === 1 ? '' : 's'} still to go.`

  return (
    <section className="border border-term-line bg-term-panel shadow-term">
      <header className="flex items-center justify-between border-b border-term-line bg-term-raised px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-term-amber text-glow-amber">
          SYS &middot; Daily Progress
        </span>
        <span className="text-[11px] uppercase tracking-[0.15em] text-term-muted">
          {completed}/{total} done
        </span>
      </header>

      <div className="p-4 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <span className="font-display text-5xl leading-none tabular-nums text-term-green text-glow">
            {percent}%
          </span>
          <span className="pb-1 text-xs text-term-muted">{message}</span>
        </div>

        <div
          className="mt-4 flex gap-[3px]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Today's task progress"
        >
          {Array.from({ length: CELLS }).map((_, index) => (
            <span
              key={index}
              className={`h-3 flex-1 ${
                index < filled
                  ? 'bg-term-green shadow-[0_0_6px_rgba(77,255,136,0.7)]'
                  : 'bg-term-line/40'
              }`}
            />
          ))}
        </div>

        <p className="mt-2 text-[11px] text-term-dim">
          &gt; {completed} of {total} tasks completed
        </p>
      </div>
    </section>
  )
}
