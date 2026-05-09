import { useState } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { CatalogManager } from '../form/CatalogManager'
import { Phone, Mail, Crown, AlertCircle, Bookmark, ChevronRight } from 'lucide-react'

export function SettingsTab() {
  const { data: profile } = useProfile()
  const [showCatalog, setShowCatalog] = useState(false)

  if (showCatalog) {
    return (
      <div className="max-w-md mx-auto">
        <CatalogManager onClose={() => setShowCatalog(false)} />
      </div>
    )
  }

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

  const catalogServices = profile?.settings?.catalogServices?.length || 0
  const catalogParts = profile?.settings?.catalogParts?.length || 0

  return (
    <div className="max-w-7xl mx-auto space-y-4">
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

      <button
        onClick={() => setShowCatalog(true)}
        className="w-full flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-amber-500/10">
          <Bookmark className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-slate-100">Catálogo</p>
          <p className="text-sm text-slate-400">
            {catalogServices + catalogParts > 0
              ? `${catalogServices} serviços, ${catalogParts} peças`
              : 'Cadastre serviços e peças padrão'}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </button>

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
