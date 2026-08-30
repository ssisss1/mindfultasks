import { Card } from './Card'
import { StatCard } from './StatCard'
import { TodoInput } from './TodoInput'
import { TodoItem } from './TodoItem'
import type { Todo } from '../types'

interface TodoSectionProps {
  todos: Todo[]
  counts: { total: number; active: number; completed: number }
  loading?: boolean
  onAdd: (title: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoSection({
  todos,
  counts,
  loading = false,
  onAdd,
  onToggle,
  onDelete,
}: TodoSectionProps) {
  return (
    <Card
      title="Today's Tasks"
      subtitle="Capture what matters, one small step at a time."
    >
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Active" value={counts.active} />
        <StatCard label="Done" value={counts.completed} accent />
      </div>

      <div className="mt-6">
        <TodoInput onAdd={onAdd} />
      </div>

      <ul className="mt-4 space-y-2">
        {loading && todos.length === 0 ? (
          <li className="rounded-lg border border-dashed border-sage-200 px-3 py-6 text-center text-sm text-sage-400">
            Loading your tasks…
          </li>
        ) : todos.length === 0 ? (
          <li className="rounded-lg border border-dashed border-sage-200 px-3 py-6 text-center text-sm text-sage-400">
            No tasks yet. Add your first one above.
          </li>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))
        )}
      </ul>
    </Card>
  )
}
