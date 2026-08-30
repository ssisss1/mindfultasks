import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

interface Quote {
  text: string
  author: string
}

export function useQuote(enabled: boolean) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<Quote>('/quote')
      setQuote({ text: data.text, author: data.author })
    } catch {
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) void load()
  }, [enabled, load])

  return { quote, loading, refresh: load }
}
