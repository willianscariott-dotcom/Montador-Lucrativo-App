import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth'
import { Check, Crown, Zap, Shield, FileText, ChevronRight } from 'lucide-react'

export function UpgradePlan({ onBack }) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [processing, setProcessing] = useState(false)

  const plans = [
    {
      id: 'monthly',
      name: 'Mensal',
      price: '29,90',
      period: 'por mês',
      features: [
        'Acesso ilimitado a orçamentos',
        'Catálogo de serviços e peças',
        'Motor de precificação',
        'Geração de PDFs premium',
        'Sistema de indicação',
      ],
      highlight: false,
    },
    {
      id: 'yearly',
      name: 'Anual',
      price: '197,40',
      period: 'por ano',
      monthly: '16,45',
      savings: '46%',
      features: [
        'Tudo do plano Mensal',
        'Economia de R$ 161,40',
        'Suporte prioritário',
        'Novas funcionalidades em primeira mão',
        'Dashboard financeiro completo',
      ],
      highlight: true,
    },
  ]

  const upgradeMutation = useMutation({
    mutationFn: async (planId) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', user?.id)

      if (error) throw error
      return planId
    },
    onMutate: () => {
      setProcessing(true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      if (onBack) onBack()
    },
    onSettled: () => {
      setProcessing(false)
    },
  })

  const handleSelectPlan = (planId) => {
    upgradeMutation.mutate(planId)
  }

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-300 rotate-180" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Escolha seu Plano</h2>
          <p className="text-sm text-slate-400">Desbloqueie todo o potencial do Montador Pro</p>
        </div>
      </div>

      <div className="bg-slate-800 border-2 border-amber-500 rounded-panel shadow-stamped p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-amber-500 uppercase tracking-wide">Oferta Especial</span>
        </div>
        <p className="text-sm text-slate-300">
          Desbloqueie todas as funcionalidades premium do Montador Pro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-panel shadow-stamped overflow-hidden ${
              plan.highlight
                ? 'bg-slate-800 border-2 border-amber-500'
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            {plan.highlight && (
              <div className="bg-amber-500 px-4 py-2">
                <p className="text-sm font-bold text-slate-950 text-center">MELHOR CUSTO-BENEFÍCIO</p>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                {plan.highlight ? (
                  <Crown className="w-5 h-5 text-amber-500" />
                ) : (
                  <Shield className="w-5 h-5 text-slate-400" />
                )}
                <h3 className={`font-bold text-lg ${plan.highlight ? 'text-amber-500' : 'text-slate-100'}`}>
                  {plan.name}
                </h3>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-100">R$ {plan.price}</span>
                  <span className="text-sm text-slate-400">{plan.period}</span>
                </div>
                {plan.monthly && (
                  <p className="text-sm text-slate-400 mt-1">R$ {plan.monthly}/mês</p>
                )}
                {plan.savings && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-500 rounded-industrial">
                    Economia de {plan.savings}
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-amber-500' : 'text-emerald-500'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={processing}
                className={`w-full h-14 flex items-center justify-center gap-2 text-base font-bold rounded-industrial shadow-stamped transition-all disabled:opacity-50 ${
                  plan.highlight
                    ? 'text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600'
                    : 'text-slate-100 bg-slate-700 border border-slate-600 hover:bg-slate-600'
                }`}
              >
                {processing ? 'Processando...' : plan.highlight ? 'Assinar Annual' : 'Assinar Mensal'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-800 border border-slate-700 rounded-panel p-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400" />
          <p className="text-sm text-slate-400">
            Todos os planos incluem 14 dias de teste gratuito. Cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  )
}
