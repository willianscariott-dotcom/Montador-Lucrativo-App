import { useState, useCallback, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'
import { useProfile } from '../hooks/useProfile'
import { navItems } from './navItems'
import { HomeTab } from './tabs/HomeTab'
import { QuotesTab } from './tabs/QuotesTab'
import { ClientsTab } from './tabs/ClientsTab'
import { DocumentsTab } from './tabs/DocumentsTab'
import { SettingsTab } from './tabs/SettingsTab'
import { QuoteBuilder } from './form/QuoteBuilder'
import { Loader2 } from 'lucide-react'

const UnsavedContext = createContext({ hasUnsaved: false, setHasUnsaved: () => {} })

export function useUnsaved() {
  return useContext(UnsavedContext)
}

export default function Dashboard() {
  const setSession = useAuthStore((s) => s.setSession)
  const user = useAuthStore((s) => s.user)
  const [activeTab, setActiveTab] = useState('home')
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const handleBackFromQuoteBuilder = useCallback(() => {
    setHasUnsaved(false)
    setShowQuoteBuilder(false)
  }, [])

  const handleTabChange = useCallback((tab) => {
    if (hasUnsaved) {
      if (window.confirm('Você tem alterações não salvas. Deseja sair e perder os dados?')) {
        setHasUnsaved(false)
        setActiveTab(tab)
      }
    } else {
      setActiveTab(tab)
    }
  }, [hasUnsaved])

  if (showQuoteBuilder) {
    return (
      <UnsavedContext.Provider value={{ hasUnsaved, setHasUnsaved }}>
        <div className="flex flex-col min-h-screen bg-slate-900">
          <DashboardHeader user={user} onLogout={handleLogout} />
          <main className="flex-1 p-4 pb-24 overflow-y-auto">
            <QuoteBuilder onBack={handleBackFromQuoteBuilder} />
          </main>
          <BottomNav activeTab="quotes" onTabChange={handleTabChange} hasUnsaved={hasUnsaved} />
        </div>
      </UnsavedContext.Provider>
    )
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />
      case 'quotes':
        return <QuotesTab onNewQuote={() => setShowQuoteBuilder(true)} />
      case 'clients':
        return <ClientsTab />
      case 'documents':
        return <DocumentsTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <HomeTab />
    }
  }

  return (
    <UnsavedContext.Provider value={{ hasUnsaved, setHasUnsaved }}>
      <div className="flex flex-col min-h-screen bg-slate-900">
        <DashboardHeader user={user} onLogout={handleLogout} />

        <main className="flex-1 p-4 lg:p-6 pb-24 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {renderTab()}
          </div>
        </main>

        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} hasUnsaved={hasUnsaved} />
      </div>
    </UnsavedContext.Provider>
  )
}

function DashboardHeader({ user, onLogout }) {
  const { data: profile, isLoading } = useProfile()

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-slate-800 border-b border-slate-700 shadow-stamped">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-industrial bg-amber-500 shadow-stamped">
          <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 18a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v2H2V4h2ZM4 10v2H2v-2h2ZM4 16v2H2v-2h2ZM10 4v2H8V4h2ZM10 10v2H8v-2h2ZM10 16v2H8v-2h2ZM16 4v2h-2V4h2ZM16 10v2h-2v-2h2ZM16 16v2h-2v-2h2ZM20 4v2h-2V4h2ZM20 10v2h-2v-2h2ZM20 16v2h-2v-2h2Z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-100 leading-tight">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (profile?.settings?.nome || profile?.full_name || user?.email?.split('@')[0] || 'Montador Lucrativo')}
          </span>
          <span className="text-xs text-slate-400 capitalize">{profile?.status || 'Trial'}</span>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="h-10 px-4 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-industrial hover:text-slate-100 hover:border-slate-500 transition-colors"
      >
        Sair
      </button>
    </header>
  )
}

function BottomNav({ activeTab, onTabChange, hasUnsaved }) {
  const handleClick = (tab) => {
    if (hasUnsaved && tab !== activeTab) {
      if (!window.confirm('Você tem alterações não salvas. Deseja sair e perder os dados?')) {
        return
      }
    }
    onTabChange(tab)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] z-50">
      <div className="flex items-center justify-around max-w-7xl mx-auto h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors relative ${
                isActive ? 'text-amber-500' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="mt-1 text-xs font-medium">{item.label}</span>
              {hasUnsaved && item.id === 'quotes' && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
