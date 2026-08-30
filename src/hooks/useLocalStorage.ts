import { useEffect, useState } from 'react'

/**
 * A small wrapper around useState that keeps the value in sync with localStorage.
 * Falls back gracefully when storage is unavailable or holds invalid JSON.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write errors (e.g. storage disabled or quota exceeded).
    }
  }, [key, value])

  return [value, setValue] as const
}
