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
      <div className="flex flex-1 items-center border border-term-line bg-term-bg px-2 focus-within:border-term-green focus-within:shadow-term-glow">
        <span aria-hidden className="select-none pr-2 text-term-green">
          &gt;
        </span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="add a task_"
          aria-label="Task title"
          className="w-full bg-transparent py-2 text-sm text-term-text placeholder:text-term-dim focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="border border-term-green bg-term-green/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-term-green transition hover:bg-term-green/20 hover:shadow-term-glow focus:outline-none focus-visible:ring-1 focus-visible:ring-term-green disabled:opacity-40 disabled:shadow-none"
        disabled={!title.trim()}
      >
        [ Add ]
      </button>
    </form>
  )
}
