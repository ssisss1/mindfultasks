import { useState, type FormEvent } from 'react'

interface TodoInputProps {
  onAdd: (title: string) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onAdd(title)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add a task for today..."
        aria-label="Task title"
        className="flex-1 rounded-lg border border-sage-200 bg-sage-50/50 px-3 py-2 text-sm text-sage-800 placeholder:text-sage-400 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
      />
      <button
        type="submit"
        className="rounded-lg bg-sage-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-600 focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-50"
        disabled={!title.trim()}
      >
        Add
      </button>
    </form>
  )
}
