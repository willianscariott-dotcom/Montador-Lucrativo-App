import { useProfile } from '../../hooks/useProfile'
import { Phone, Mail, Crown, AlertCircle } from 'lucide-react'

export function SettingsTab() {
  const { data: profile } = useProfile()

  const items = [
    {
      icon: Phone,
      label: 'WhatsApp',
      value: profile?.phone ? `(${profile.phone.slice(0,2)}) ${profile.phone.slice(2,7)}-${profile.phone.slice(7)}` : 'Não cadastrado',
    },
    {
      icon: Mail,
      label: 'Email',
      value: profile?.email || 'Carregando...',
    },
  ]

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-bold text-slate-100">Ajustes</h2>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped overflow-hidden">
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className={`flex items-center gap-4 p-4 ${index < items.length - 1 ? 'border-b border-slate-700' : ''}`}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700">
                <Icon className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="font-medium text-slate-100">{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-amber-500/10">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-100">Plano {profile?.status || 'Trial'}</p>
            <p className="text-sm text-slate-400">
              {profile?.status === 'active' ? 'Assinatura ativa' : 'Período de teste'}
            </p>
          </div>
          {profile?.status !== 'active' && (
            <button className="h-10 px-4 text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 transition-all">
              Upgrade
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-blue-500/10">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-100">Sobre o App</p>
            <p className="text-sm text-slate-400">Montador Pro v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
