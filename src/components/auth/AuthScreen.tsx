import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../lib/api'

type Mode = 'login' | 'register'

export function AuthScreen() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50/60 px-4 py-12">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-sage-800">MindfulTasks</h1>
          <p className="mt-2 text-sm text-sage-500">
            {mode === 'login'
              ? 'Sign in to your calm space.'
              : 'Create an account to get started.'}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-sage-100 bg-white p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-sage-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-200 bg-sage-50/50 px-3 py-2 text-sm text-sage-800 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
          />

          <label
            className="mt-4 block text-sm font-medium text-sage-700"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-200 bg-sage-50/50 px-3 py-2 text-sm text-sage-800 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
          />
          {mode === 'register' && (
            <p className="mt-1 text-xs text-sage-400">At least 8 characters.</p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-sage-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-600 focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-50"
          >
            {submitting
              ? 'Please wait…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-sage-500">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError(null)
            }}
            className="font-medium text-sage-700 underline underline-offset-2 hover:text-sage-800"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
