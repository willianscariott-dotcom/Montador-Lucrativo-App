import { useState } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { CatalogManager } from '../form/CatalogManager'
import { PricingSettings } from '../form/PricingSettings'
import { Phone, Mail, AlertCircle, Bookmark, Crown, Zap, ChevronRight, Clock, TrendingUp, Calculator } from 'lucide-react'

export function SettingsTab() {
  const { data: profile } = useProfile()
  const [showView, setShowView] = useState(null)

  if (showView === 'catalog') {
    return <CatalogManager onClose={() => setShowView(null)} />
  }

  if (showView === 'pricing') {
    return <PricingSettings onClose={() => setShowView(null)} />
  }

  const settings = profile?.settings || {}
  const pricing = settings.pricing || {}
  const catalogServices = profile?.settings?.catalogServices?.length || 0
  const catalogParts = profile?.settings?.catalogParts?.length || 0

  const calculateHourlyRate = () => {
    const das = Number(pricing.dasValue) || 0
    const proLabore = Number(pricing.proLabore) || 0
    const fixedCosts = Number(pricing.fixedCosts) || 0
    const profitMargin = Number(pricing.profitMargin) || 0
    const days = Number(pricing.workDays) || 22
    const hours = Number(pricing.workHours) || 8
    return days * hours > 0 ? (das + proLabore + fixedCosts) * (1 + profitMargin / 100) / (days * hours) : 0
  }

  const hourlyRate = calculateHourlyRate()

  const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <h2 className="text-lg font-bold text-slate-100">Ajustes</h2>

      <div className="bg-slate-800 border-2 border-amber-500 rounded-panel shadow-stamped p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-amber-500 uppercase tracking-wide">Ferramenta Principal</span>
        </div>

        <p className="text-sm text-slate-300 mb-4">
          Descubra o valor real da sua hora de trabalho e nunca mais tenha prejuízo.
        </p>

        <div className="bg-slate-950/50 border border-slate-700 rounded-industrial p-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Valor da sua hora</p>
            <p className="text-4xl font-bold text-amber-500">
              {hourlyRate > 0 ? formatCurrency(hourlyRate) : 'R$ 0,00'}
            </p>
            <p className="text-xs text-slate-500 mt-1">com lucro incluso</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-slate-700/50 rounded-industrial">
            <p className="text-lg font-bold text-slate-100">{Number(pricing.workDays) || 22}</p>
            <p className="text-xs text-slate-400">dias/mês</p>
          </div>
          <div className="text-center p-2 bg-slate-700/50 rounded-industrial">
            <p className="text-lg font-bold text-slate-100">{Number(pricing.workHours) || 8}h</p>
            <p className="text-xs text-slate-400">horas/dia</p>
          </div>
          <div className="text-center p-2 bg-slate-700/50 rounded-industrial">
            <p className="text-lg font-bold text-slate-100">{Number(pricing.profitMargin) || 0}%</p>
            <p className="text-xs text-slate-400">lucro</p>
          </div>
        </div>

        <button
          onClick={() => setShowView('pricing')}
          className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all"
        >
          <Calculator className="w-5 h-5" />
          {hourlyRate > 0 ? 'Editar Precificação' : 'Configurar Precificação'}
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 flex items-center justify-center rounded-industrial ${
            profile?.status === 'active' ? 'bg-amber-500/10' : 'bg-blue-500/10'
          }`}>
            <Crown className={`w-6 h-6 ${profile?.status === 'active' ? 'text-amber-500' : 'text-blue-400'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-100 capitalize">{profile?.status || 'Trial'}</p>
              {profile?.status !== 'active' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">Em Teste</span>
              )}
            </div>
            {profile?.status !== 'active' ? (
              <p className="text-sm text-slate-400">
                Aproveite o período de teste e configure sua precificação
              </p>
            ) : (
              <p className="text-sm text-emerald-500">Assinatura ativa - Acesso ilimitado</p>
            )}
          </div>
        </div>
        {profile?.status !== 'active' && (
          <button className="w-full mt-4 h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all">
            <TrendingUp className="w-5 h-5" />
            Fazer Upgrade
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setShowView('catalog')}
          className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-amber-500/10">
            <Bookmark className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-slate-100">Catálogo</p>
            <p className="text-sm text-slate-400">
              {catalogServices + catalogParts > 0
                ? `${catalogServices} serviços, ${catalogParts} peças`
                : 'Cadastre seus padrões'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>

        <div className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
          <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-slate-700">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-100">Tempo no App</p>
            <p className="text-sm text-slate-400">Membro desde {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'carregando...'}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-slate-700">
          <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700">
            <Phone className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">WhatsApp</p>
            <p className="font-medium text-slate-100">{profile?.phone ? `(${profile.phone.slice(0,2)}) ${profile.phone.slice(2,7)}-${profile.phone.slice(7)}` : 'Não cadastrado'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700">
            <Mail className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">Email</p>
            <p className="font-medium text-slate-100">{profile?.email || 'Carregando...'}</p>
          </div>
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
