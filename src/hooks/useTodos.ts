import { useMemo } from 'react'
import type { Todo } from '../types'
import { useLocalStorage } from './useLocalStorage'

const STORAGE_KEY = 'mindfultasks.todos'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEY, [])

  const addTodo = (title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setTodos((prev) => [
      { id: createId(), title: trimmed, completed: false, createdAt: Date.now() },
      ...prev,
    ])
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const counts = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length
    return {
      total: todos.length,
      completed,
      active: todos.length - completed,
    }
  }, [todos])

  return { todos, addTodo, toggleTodo, deleteTodo, counts }
}
