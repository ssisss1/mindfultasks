import { api } from './api'
import type { Todo } from '../types'

const LEGACY_KEY = 'mindfultasks.todos'

let inFlight: Promise<number> | null = null

/**
 * One-time move of pre-account todos from localStorage into the signed-in
 * account. Safe to call repeatedly and concurrently — the work runs at most
 * once per page load, and the key is cleared once done.
 * Returns the number of todos migrated.
 */
export function migrateLocalTodos(): Promise<number> {
  if (!inFlight) inFlight = runMigration()
  return inFlight
}

async function runMigration(): Promise<number> {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(LEGACY_KEY)
  } catch {
    return 0
  }
  if (!raw) return 0

  let legacy: Array<{ title?: string; completed?: boolean }> = []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) legacy = parsed
  } catch {
    legacy = []
  }

  const clear = () => {
    try {
      localStorage.removeItem(LEGACY_KEY)
    } catch {
      /* ignore */
    }
  }

  if (legacy.length === 0) {
    clear()
    return 0
  }

  // Legacy list was newest-first; insert oldest-first so order is preserved.
  let migrated = 0
  for (const item of [...legacy].reverse()) {
    const title = item?.title?.trim()
    if (!title) continue
    try {
      const { todo } = await api.post<{ todo: Todo }>('/todos', { title })
      if (item.completed) {
        await api.patch(`/todos/${todo.id}`, { completed: true })
      }
      migrated += 1
    } catch {
      /* skip this one, keep going */
    }
  }

  clear()
  return migrated
}
