import { useWallet, useQuoteStats } from '../../hooks/useProfile'
import { Wallet, TrendingUp, FileText, CheckCircle } from 'lucide-react'

export function HomeTab() {
  const { data: wallet } = useWallet()
  const { data: stats } = useQuoteStats()

  const cards = [
    {
      label: 'Saldo Disponível',
      value: wallet?.balance ? `R$ ${Number(wallet.balance).toFixed(2).replace('.', ',')}` : 'R$ 0,00',
      icon: Wallet,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Total Ganho',
      value: wallet?.total_earned ? `R$ ${Number(wallet.total_earned).toFixed(2).replace('.', ',')}` : 'R$ 0,00',
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Orçamentos',
      value: stats ? String(stats.draft + stats.sent + stats.approved) : '0',
      icon: FileText,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Aprovados',
      value: stats ? String(stats.approved) : '0',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-bold text-slate-100">Resumo Financeiro</h2>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-industrial ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="mt-3 text-xl font-bold text-slate-100">{card.value}</p>
              <p className="text-xs text-slate-400">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <h3 className="font-bold text-slate-100">Status dos Orçamentos</h3>
        <div className="mt-3 space-y-2">
          <StatusRow label="Rascunhos" value={stats?.draft || 0} color="bg-slate-500" />
          <StatusRow label="Enviados" value={stats?.sent || 0} color="bg-blue-400" />
          <StatusRow label="Aprovados" value={stats?.approved || 0} color="bg-emerald-500" />
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className="font-bold text-slate-100">{value}</span>
    </div>
  )
}
