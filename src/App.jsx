import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/auth'
import { LoginPage } from './components/Auth'
import { SignupPage } from './components/Auth'
import Dashboard from './components/Dashboard'

export default function App() {
  const { session, setSession } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [authView, setAuthView] = useState('login')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-0 sm:max-h-[90vh] bg-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)] sm:rounded-panel overflow-hidden">
        {session ? (
          <Dashboard />
        ) : authView === 'login' ? (
          <LoginPage onSwitch={() => setAuthView('signup')} />
        ) : (
          <SignupPage onSwitch={() => setAuthView('login')} />
        )}
      </div>
    </div>
  )
}
