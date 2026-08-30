import { useTodos } from '../hooks/useTodos'
import { MeditationSection } from './MeditationSection'
import { ProgressBanner } from './ProgressBanner'
import { TodoSection } from './TodoSection'

export function Dashboard() {
  const { todos, addTodo, toggleTodo, deleteTodo, counts } = useTodos()

  return (
    <div className="min-h-screen bg-sage-50/60">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-sage-800 sm:text-4xl">
            MindfulTasks
          </h1>
          <p className="mt-2 text-sage-500">
            A calm space to organise your day and take a mindful break.
          </p>
        </header>

        <div className="mb-6">
          <ProgressBanner
            total={counts.total}
            active={counts.active}
            completed={counts.completed}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TodoSection
            todos={todos}
            counts={counts}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
          <MeditationSection />
        </div>

        <footer className="mt-10 text-center text-xs text-sage-400">
          Your tasks are saved locally in this browser.
        </footer>
      </div>
    </div>
  )
}
