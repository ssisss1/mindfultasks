import { useAuth } from '../context/AuthContext'
import { useMeditationStats } from '../hooks/useMeditationStats'
import { useQuote } from '../hooks/useQuote'
import { useTodos } from '../hooks/useTodos'
import { MeditationSection } from './MeditationSection'
import { ProgressBanner } from './ProgressBanner'
import { QuoteCard } from './QuoteCard'
import { TodoSection } from './TodoSection'

export function Dashboard() {
  const { user, logout } = useAuth()
  const { todos, counts, loading, error, addTodo, toggleTodo, deleteTodo } =
    useTodos(true)
  const { stats, logSession } = useMeditationStats(true)
  const { quote } = useQuote(true)

  return (
    <div className="min-h-screen bg-sage-50/60">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-sage-800 sm:text-4xl">
              MindfulTasks
            </h1>
            <p className="mt-2 text-sage-500">
              A calm space to organise your day and take a mindful break.
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="text-sage-500">{user?.email}</p>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-1 rounded-lg border border-sage-200 px-3 py-1 font-medium text-sage-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-sage-200"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="mb-6">
          <ProgressBanner
            total={counts.total}
            active={counts.active}
            completed={counts.completed}
          />
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <TodoSection
            todos={todos}
            counts={counts}
            loading={loading}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />

          <div className="space-y-6">
            <MeditationSection onSessionComplete={logSession} />
            {stats && (
              <p className="text-center text-sm text-sage-500">
                {stats.last7Days.sessions === 0
                  ? 'No meditation sessions in the last 7 days yet.'
                  : `${stats.last7Days.sessions} session${
                      stats.last7Days.sessions === 1 ? '' : 's'
                    } · ${stats.last7Days.minutes} min in the last 7 days`}
              </p>
            )}
            {quote && <QuoteCard text={quote.text} author={quote.author} />}
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-sage-400">
          Signed in as {user?.email} — your tasks are saved to your account.
        </footer>
      </div>
    </div>
  )
}
