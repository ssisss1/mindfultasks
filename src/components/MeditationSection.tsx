import { Card } from './Card'
import {
  DURATION_OPTIONS,
  useMeditationTimer,
  type DurationMinutes,
} from '../hooks/useMeditationTimer'

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function MeditationSection() {
  const {
    durationMinutes,
    remaining,
    status,
    progress,
    start,
    pause,
    reset,
    selectDuration,
  } = useMeditationTimer(5)

  const isRunning = status === 'running'
  const isCompleted = status === 'completed'

  return (
    <Card title="Meditation" subtitle="take a short pause to reset your focus">
      <div className="flex flex-wrap justify-center gap-2">
        {DURATION_OPTIONS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => selectDuration(minutes as DurationMinutes)}
            className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
              durationMinutes === minutes
                ? 'border-term-green bg-term-green/15 text-term-green shadow-term-glow'
                : 'border-term-line text-term-muted hover:border-term-dim hover:text-term-text'
            }`}
          >
            {minutes}:00
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div className="relative h-52 w-52">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="#14351f"
              strokeWidth="5"
            />
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="#4dff88"
              strokeWidth="5"
              strokeLinecap="butt"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              style={{ filter: 'drop-shadow(0 0 6px rgba(77,255,136,0.7))' }}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-6xl leading-none tabular-nums text-term-green text-glow">
              {formatTime(remaining)}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-term-muted">
              {status === 'idle' && '> ready'}
              {status === 'running' && '> breathe'}
              {status === 'paused' && '> paused'}
              {status === 'completed' && '> done'}
            </span>
          </div>
        </div>

        {isCompleted && (
          <p className="mt-4 border border-term-amber bg-term-amber/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-term-amber text-glow-amber">
            &gt;&gt; Meditation complete
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={start}
            disabled={isRunning || isCompleted}
            className="border border-term-green bg-term-green/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-term-green transition hover:bg-term-green/20 hover:shadow-term-glow focus:outline-none focus-visible:ring-1 focus-visible:ring-term-green disabled:opacity-40 disabled:shadow-none"
          >
            [ Start ]
          </button>
          <button
            type="button"
            onClick={pause}
            disabled={!isRunning}
            className="border border-term-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-term-muted transition hover:border-term-dim hover:text-term-text focus:outline-none focus-visible:ring-1 focus-visible:ring-term-dim disabled:opacity-40"
          >
            [ Pause ]
          </button>
          <button
            type="button"
            onClick={reset}
            className="border border-term-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-term-muted transition hover:border-term-dim hover:text-term-text focus:outline-none focus-visible:ring-1 focus-visible:ring-term-dim"
          >
            [ Reset ]
          </button>
        </div>
      </div>
    </Card>
  )
}
