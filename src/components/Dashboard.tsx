import { useTodos } from '../hooks/useTodos'
import { MeditationSection } from './MeditationSection'
import { ProgressBanner } from './ProgressBanner'
import { TodoSection } from './TodoSection'

export function Dashboard() {
  const { todos, addTodo, toggleTodo, deleteTodo, counts } = useTodos()

  return (
    <div className="crt-flicker min-h-screen bg-term-bg">
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
        <div className="border border-term-line bg-term-panel shadow-term">
          {/* Terminal window title bar */}
          <div className="flex items-center justify-between border-b border-term-line bg-term-raised px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-term-danger/80" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-term-amber/80" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-term-green/80" aria-hidden />
              <span className="ml-2 text-[11px] uppercase tracking-[0.22em] text-term-muted">
                mindfultasks &mdash; sys.monitor
              </span>
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-term-dim sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-term-green shadow-term-glow" aria-hidden />
              online
            </span>
          </div>

          <div className="space-y-6 p-4 sm:p-8">
            <header>
              <p className="text-[11px] uppercase tracking-[0.3em] text-term-dim">
                MindfulTasks Terminal v2.0 &middot; Phosphor Edition
              </p>
              <h1 className="cursor-blink mt-2 font-display text-5xl leading-none text-term-green text-glow sm:text-6xl">
                MindfulTasks
              </h1>
              <p className="mt-3 text-sm text-term-muted">
                <span className="text-term-green">visitor@mindfultasks</span>
                <span className="text-term-dim">:~$</span> ./dashboard --today
              </p>
            </header>

            <ProgressBanner
              total={counts.total}
              active={counts.active}
              completed={counts.completed}
            />

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

            <footer className="border-t border-term-line pt-4 text-center text-[11px] text-term-dim">
              &gt; state persisted to localStorage &middot; no server &middot; no account
            </footer>
          </div>
        </div>
      </div>

      <div className="crt-overlay" aria-hidden />
    </div>
  )
}
