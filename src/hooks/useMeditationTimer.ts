import { useCallback, useEffect, useRef, useState } from 'react'
import type { MeditationStatus } from '../types'

export const DURATION_OPTIONS = [1, 5, 10, 15] as const
export type DurationMinutes = (typeof DURATION_OPTIONS)[number]

export function useMeditationTimer(defaultMinutes: DurationMinutes = 5) {
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(defaultMinutes)
  const [remaining, setRemaining] = useState(defaultMinutes * 60)
  const [status, setStatus] = useState<MeditationStatus>('idle')
  const intervalRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => clearTimer, [])

  useEffect(() => {
    if (status !== 'running') return

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          setStatus('completed')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [status])

  const start = useCallback(() => {
    if (remaining <= 0) return
    setStatus('running')
  }, [remaining])

  const pause = useCallback(() => {
    setStatus((prev) => (prev === 'running' ? 'paused' : prev))
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setStatus('idle')
    setRemaining(durationMinutes * 60)
  }, [durationMinutes])

  const selectDuration = useCallback((minutes: DurationMinutes) => {
    clearTimer()
    setDurationMinutes(minutes)
    setStatus('idle')
    setRemaining(minutes * 60)
  }, [])

  const totalSeconds = durationMinutes * 60
  const progress = totalSeconds === 0 ? 0 : (totalSeconds - remaining) / totalSeconds

  return {
    durationMinutes,
    remaining,
    status,
    progress,
    start,
    pause,
    reset,
    selectDuration,
  }
}
