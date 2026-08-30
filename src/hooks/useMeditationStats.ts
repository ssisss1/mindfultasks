import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

interface Stats {
  last7Days: { sessions: number; minutes: number }
  allTime: { sessions: number }
}

export function useMeditationStats(enabled: boolean) {
  const [stats, setStats] = useState<Stats | null>(null)

  const load = useCallback(async () => {
    try {
      setStats(await api.get<Stats>('/meditation/stats'))
    } catch {
      /* keep previous */
    }
  }, [])

  useEffect(() => {
    if (enabled) void load()
  }, [enabled, load])

  const logSession = useCallback(
    async (durationMinutes: number) => {
      try {
        await api.post('/meditation/sessions', { durationMinutes })
        await load()
      } catch {
        /* non-critical */
      }
    },
    [load],
  )

  return { stats, logSession, refresh: load }
}
