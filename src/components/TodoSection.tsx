import { Card } from './Card'
import { StatCard } from './StatCard'
import { TodoInput } from './TodoInput'
import { TodoItem } from './TodoItem'
import type { Todo } from '../types'

interface TodoSectionProps {
  todos: Todo[]
  counts: { total: number; active: number; completed: number }
  onAdd: (title: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoSection({
  todos,
  counts,
  onAdd,
  onToggle,
  onDelete,
}: TodoSectionProps) {
  return (
    <Card
      title="Task Queue"
      subtitle="capture what matters, one small step at a time"
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
        {todos.length === 0 ? (
          <li className="border border-dashed border-term-line px-3 py-6 text-center text-xs text-term-dim">
            &gt; no tasks in queue &mdash; add one above
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
