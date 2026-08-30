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
    <Card title="Meditation" subtitle="Take a short pause to reset your focus.">
      <div className="flex flex-wrap justify-center gap-2">
        {DURATION_OPTIONS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => selectDuration(minutes as DurationMinutes)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              durationMinutes === minutes
                ? 'bg-sage-500 text-white'
                : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
            }`}
          >
            {minutes} min
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
              stroke="#e3ece6"
              strokeWidth="10"
            />
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="#548065"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-semibold tabular-nums text-sage-800">
              {formatTime(remaining)}
            </span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wide text-sage-400">
              {status === 'idle' && 'Ready'}
              {status === 'running' && 'Breathe'}
              {status === 'paused' && 'Paused'}
              {status === 'completed' && 'Done'}
            </span>
          </div>
        </div>

        {isCompleted && (
          <p className="mt-4 rounded-lg bg-sage-50 px-4 py-2 text-sm font-medium text-sage-700">
            Meditation complete
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={start}
            disabled={isRunning || isCompleted}
            className="rounded-lg bg-sage-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-sage-600 focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-40"
          >
            Start
          </button>
          <button
            type="button"
            onClick={pause}
            disabled={!isRunning}
            className="rounded-lg border border-sage-300 px-5 py-2 text-sm font-medium text-sage-700 transition hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-sage-200 disabled:opacity-40"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-sage-300 px-5 py-2 text-sm font-medium text-sage-700 transition hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-sage-200"
          >
            Reset
          </button>
        </div>
      </div>
    </Card>
  )
}
