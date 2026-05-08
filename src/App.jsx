import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      setSession: (session) => set({ session, user: session?.user ?? null }),
    }),
    {
      name: 'montador-auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
)

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const setSession = useAuthStore((s) => s.setSession)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        setSession(data.session)
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        setSession(data.session)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-slate-950">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-industrial bg-amber-500 shadow-stamped">
            <svg className="w-8 h-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 18a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v2H2V4h2ZM4 10v2H2v-2h2ZM4 16v2H2v-2h2ZM10 4v2H8V4h2ZM10 10v2H8v-2h2ZM10 16v2H8v-2h2ZM16 4v2h-2V4h2ZM16 10v2h-2v-2h2ZM16 16v2h-2v-2h2ZM20 4v2h-2V4h2ZM20 10v2h-2v-2h2ZM20 16v2h-2v-2h2Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Montador Pro</h1>
          <p className="mt-2 text-sm text-slate-400">{isSignUp ? 'Crie sua conta' : 'Faça login'}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-14 px-4 text-base bg-slate-800 border border-slate-700 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-14 px-4 text-base bg-slate-800 border border-slate-700 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-industrial">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-slate-400 hover:text-amber-500 transition-colors"
          >
            {isSignUp ? 'Já tem conta? Entre' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const setSession = useAuthStore((s) => s.setSession)
  const user = useAuthStore((s) => s.user)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <header className="flex items-center justify-between h-14 px-4 bg-slate-800 border-b border-slate-700 shadow-stamped">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-industrial bg-amber-500">
            <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 18a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
            </svg>
          </div>
          <span className="font-bold text-slate-100">Montador Pro</span>
        </div>
        <button
          onClick={handleLogout}
          className="h-10 px-4 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-industrial hover:text-slate-100 hover:border-slate-500 transition-colors"
        >
          Sair
        </button>
      </header>

      <main className="flex-1 p-4 pb-24">
        <div className="max-w-md mx-auto">
          <div className="p-4 mb-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
            <p className="text-sm text-slate-400">Logado como</p>
            <p className="font-medium text-slate-100">{user?.email}</p>
          </div>

          <div className="p-6 text-center bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
            <p className="text-slate-400">Dashboard em construção</p>
            <p className="mt-2 text-sm text-slate-500">Funcionalidades Soon™</p>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around max-w-md mx-auto h-16">
          <button className="flex flex-col items-center justify-center w-16 h-full text-amber-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="mt-1 text-xs font-medium">Início</span>
          </button>
          <button className="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-100 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="mt-1 text-xs">Orçamentos</span>
          </button>
          <button className="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-100 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="mt-1 text-xs">Carteira</span>
          </button>
          <button className="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-100 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="mt-1 text-xs">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  const { session, setSession } = useAuthStore()
  const [loading, setLoading] = useState(true)

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
        {session ? <Dashboard /> : <LoginPage />}
      </div>
    </div>
  )
}
