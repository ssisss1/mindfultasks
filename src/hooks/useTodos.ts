import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { migrateLocalTodos } from '../lib/migrateLocalTodos'
import type { Todo } from '../types'

/**
 * Server-backed todo list with optimistic updates. The public shape matches the
 * original localStorage hook so the UI components are unchanged.
 */
export function useTodos(enabled: boolean) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { todos: list } = await api.get<{ todos: Todo[] }>('/todos')
      setTodos(list)
      setError(null)
    } catch {
      setError('Could not load your tasks.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    ;(async () => {
      await migrateLocalTodos().catch(() => 0)
      if (!cancelled) await load()
    })()
    return () => {
      cancelled = true
    }
  }, [enabled, load])

  const addTodo = useCallback(async (title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const tempId = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`
    const optimistic: Todo = {
      id: tempId,
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    }
    setTodos((prev) => [optimistic, ...prev])
    try {
      const { todo } = await api.post<{ todo: Todo }>('/todos', { title: trimmed })
      setTodos((prev) => prev.map((t) => (t.id === tempId ? todo : t)))
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== tempId))
      setError('Could not add that task.')
    }
  }, [])

  const toggleTodo = useCallback(
    async (id: string) => {
      const current = todos.find((t) => t.id === id)
      if (!current) return
      const next = !current.completed
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: next } : t)),
      )
      try {
        await api.patch(`/todos/${id}`, { completed: next })
      } catch {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: current.completed } : t)),
        )
        setError('Could not update that task.')
      }
    },
    [todos],
  )

  const deleteTodo = useCallback(
    async (id: string) => {
      const snapshot = todos
      setTodos((prev) => prev.filter((t) => t.id !== id))
      try {
        await api.delete(`/todos/${id}`)
      } catch {
        setTodos(snapshot)
        setError('Could not delete that task.')
      }
    },
    [todos],
  )

  const counts = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length
    return { total: todos.length, completed, active: todos.length - completed }
  }, [todos])

  return { todos, counts, loading, error, addTodo, toggleTodo, deleteTodo, reload: load }
}
