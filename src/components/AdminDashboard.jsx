import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'
import { X, Users, Wallet, ShieldCheck, Loader2, ChevronRight, Crown, RefreshCw, Eye } from 'lucide-react'

export function AdminDashboard() {
  const { session } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [wallets, setWallets] = useState([])
  const [activeView, setActiveView] = useState('users')
  const [processingId, setProcessingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProfileAndData()
  }, [])

  const navigate = useNavigate()

  async function loadProfileAndData() {
    const { data: { user } } = await supabase.auth.getSession()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData || profileData.role !== 'admin') {
      setLoading(false)
      return
    }

    setProfile(profileData)
    await loadUsers()
    await loadWallets()
    setLoading(false)
  }

  async function loadUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
  }

  async function loadWallets() {
    const { data } = await supabase
      .from('wallets')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    setWallets(data || [])
  }

  async function handleUpdateStatus(userId, newStatus) {
    setProcessingId(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (!error) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      }
    } finally {
      setProcessingId(null)
    }
  }

  async function handleProcessWithdrawal(walletId) {
    setProcessingId(walletId)
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ status: 'completed' })
        .eq('id', walletId)

      if (!error) {
        setWallets(prev => prev.map(w => w.id === walletId ? { ...w, status: 'completed' } : w))
      }
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Acesso Restrito</h2>
        <p className="text-slate-400 mb-6">Esta area e exclusiva para administradores.</p>
        <button
          onClick={() => navigate('/')}
          className="h-14 px-6 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors"
        >
          Voltar ao App
        </button>
      </div>
    )
  }

  const filteredUsers = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingWallets = wallets.filter(w => w.status === 'pending')

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="flex items-center justify-between h-14 px-4 bg-slate-800 border-b border-slate-700 shadow-stamped">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-slate-100">Painel Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="h-10 px-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-industrial hover:bg-slate-600 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={loadUsers}
            className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      <nav className="flex items-center gap-1 p-2 bg-slate-800 border-b border-slate-700">
        <button
          onClick={() => setActiveView('users')}
          className={`flex-1 h-11 flex items-center justify-center gap-2 text-sm font-medium rounded-industrial transition-all ${
            activeView === 'users'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuarios
        </button>
        <button
          onClick={() => setActiveView('wallets')}
          className={`flex-1 h-11 flex items-center justify-center gap-2 text-sm font-medium rounded-industrial transition-all relative ${
            activeView === 'wallets'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Saques
          {pendingWallets.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
              {pendingWallets.length}
            </span>
          )}
        </button>
      </nav>

      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {activeView === 'users' && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full h-12 pl-10 pr-4 text-sm bg-slate-800 border border-slate-700 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-panel p-3">
              <p className="text-xs text-slate-400">Total de usuarios</p>
              <p className="text-2xl font-bold text-amber-500">{users.length}</p>
            </div>

            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-slate-800 border border-slate-700 rounded-panel p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-100 truncate">{user.full_name || 'Sem nome'}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-slate-500">{user.phone}</p>
                    )}
                  </div>
                  <span className={`shrink-0 px-2 py-1 text-xs font-medium rounded-industrial capitalize ${
                    user.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.status || 'trial'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-industrial ${
                      user.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {user.role || 'user'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.status !== 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(user.id, 'active')}
                        disabled={processingId === user.id}
                        className="h-9 px-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-industrial hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      >
                        {processingId === user.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Crown className="w-3 h-3" />
                        )}
                        Ativar Premium
                      </button>
                    )}
                    {user.status === 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(user.id, 'trial')}
                        disabled={processingId === user.id}
                        className="h-9 px-3 flex items-center justify-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-industrial hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {processingId === user.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        Revogar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'wallets' && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-panel p-3">
              <p className="text-xs text-slate-400">Solicitacoes pendentes</p>
              <p className="text-2xl font-bold text-amber-500">{pendingWallets.length}</p>
            </div>

            {wallets.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-panel p-8 text-center">
                <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhuma solicitacao de saque</p>
              </div>
            ) : (
              wallets.map((wallet) => (
                <div key={wallet.id} className="bg-slate-800 border border-slate-700 rounded-panel p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">{wallet.profiles?.full_name || 'Usuario'}</p>
                        <p className="text-xs text-slate-500">{wallet.profiles?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-industrial capitalize ${
                      wallet.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : wallet.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {wallet.status || 'pending'}
                    </span>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-700 rounded-industrial p-3 mb-3">
                    <p className="text-xs text-slate-400 mb-1">Valor do saque</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      R$ {Number(wallet.amount || 0).toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>Solicitado em {new Date(wallet.created_at).toLocaleDateString('pt-BR')}</span>
                    {wallet.method && <span>Metodo: {wallet.method}</span>}
                  </div>

                  {wallet.status === 'pending' && (
                    <button
                      onClick={() => handleProcessWithdrawal(wallet.id)}
                      disabled={processingId === wallet.id}
                      className="w-full h-12 flex items-center justify-center gap-2 text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors disabled:opacity-50"
                    >
                      {processingId === wallet.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      Processar Saque
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] z-50">
        <div className="flex items-center justify-around max-w-7xl mx-auto h-16">
          <button
            onClick={() => setActiveView('users')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              activeView === 'users' ? 'text-amber-500' : 'text-slate-400'
            }`}
          >
            <Users className="w-6 h-6" strokeWidth={activeView === 'users' ? 2.5 : 2} />
            <span className="mt-1 text-xs font-medium">Usuarios</span>
          </button>
          <button
            onClick={() => setActiveView('wallets')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors relative ${
              activeView === 'wallets' ? 'text-amber-500' : 'text-slate-400'
            }`}
          >
            <Wallet className="w-6 h-6" strokeWidth={activeView === 'wallets' ? 2.5 : 2} />
            <span className="mt-1 text-xs font-medium">Saques</span>
            {pendingWallets.length > 0 && (
              <span className="absolute top-1 right-2 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
                {pendingWallets.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  )
}