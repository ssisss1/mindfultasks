import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 border border-term-line bg-term-raised px-3 py-2.5 transition hover:border-term-dim">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        className="relative h-4 w-4 shrink-0 cursor-pointer appearance-none border border-term-dim bg-term-bg after:absolute after:inset-0 after:grid after:place-items-center after:text-[11px] after:font-bold after:leading-none after:text-term-green after:content-[''] checked:border-term-green checked:bg-term-green/20 checked:shadow-term-glow checked:after:content-['x'] focus-visible:outline focus-visible:outline-1 focus-visible:outline-term-green"
      />
      <span
        className={`flex-1 text-sm ${
          todo.completed ? 'text-term-dim line-through' : 'text-term-text'
        }`}
      >
        {todo.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
        className="shrink-0 border border-term-line px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-term-muted transition hover:border-term-danger hover:text-term-danger hover:shadow-[0_0_10px_rgba(255,95,86,0.35)] focus:outline-none focus-visible:ring-1 focus-visible:ring-term-danger"
      >
        Del
      </button>
    </li>
  )
}
