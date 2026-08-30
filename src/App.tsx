import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthScreen } from './components/auth/AuthScreen'
import { Dashboard } from './components/Dashboard'

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sage-50/60 text-sm text-sage-500">
        Loading…
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthScreen />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
