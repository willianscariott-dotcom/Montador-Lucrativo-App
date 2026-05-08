import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'

export default function Dashboard() {
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
