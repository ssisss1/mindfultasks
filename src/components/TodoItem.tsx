import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-sage-100 bg-white px-3 py-2.5">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        className="h-4 w-4 shrink-0 rounded border-sage-300 accent-sage-500 text-sage-500 focus:ring-sage-300"
      />
      <span
        className={`flex-1 text-sm ${
          todo.completed ? 'text-sage-400 line-through' : 'text-sage-800'
        }`}
      >
        {todo.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-sage-400 transition hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
      >
        Delete
      </button>
    </li>
  )
}
