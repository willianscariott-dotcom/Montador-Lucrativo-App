import { useProfile } from '../../hooks/useProfile'
import { useWallet } from '../../hooks/useProfile'
import { Gift, Copy, Share2, Users, TrendingUp, ChevronRight } from 'lucide-react'
import { openWhatsApp, messageTemplates } from '../../lib/whatsapp'
import { useState } from 'react'

export function ReferralDashboard({ onBack }) {
  const { data: profile } = useProfile()
  const { data: wallet } = useWallet()
  const [copied, setCopied] = useState(false)

  const referralCode = profile?.phone || profile?.id?.slice(0, 8).toUpperCase() || 'MONTADOR'
  const inviteLink = `${window.location.origin}?ref=${profile?.id || referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    const message = messageTemplates.referral(profile?.full_name || 'um amigo', referralCode)
    openWhatsApp('', message)
  }

  const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`

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
          <h2 className="text-xl font-bold text-slate-100">Indique e Ganhe</h2>
          <p className="text-sm text-slate-400">Convidar amigos para recompensas</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-800 border-2 border-amber-500 rounded-panel shadow-stamped p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-amber-500 uppercase tracking-wide">Programa de Indicação</span>
          </div>

          <p className="text-sm text-slate-300 mb-4">
            Indique um amigo e ganhe recompensas quando ele assinar o Montador Lucrativo. Cada indicacao e valida para bonus no seu saldo.
          </p>

          <div className="bg-slate-950/50 border border-slate-700 rounded-industrial p-4 mb-4">
            <p className="text-xs text-slate-400 mb-1">Seu Código de Convite</p>
            <p className="text-2xl font-bold text-amber-500 tracking-wider">{referralCode}</p>
          </div>

          <div className="bg-slate-950/50 border border-slate-700 rounded-industrial p-3 mb-4">
            <p className="text-xs text-slate-500 mb-1">Link de convite</p>
            <p className="text-sm text-slate-300 truncate">{inviteLink}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 transition-all"
            >
              <Copy className="w-5 h-5" />
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="h-14 px-6 flex items-center justify-center gap-2 text-base font-bold text-slate-100 bg-emerald-500 rounded-industrial shadow-stamped hover:bg-emerald-400 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-emerald-500/10">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Saldo de Recompensas</p>
              <p className="text-2xl font-bold text-emerald-500">{formatCurrency(wallet?.balance)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-slate-700/50 rounded-industrial">
              <p className="text-lg font-bold text-slate-100">{wallet?.total_earned || 0}</p>
              <p className="text-xs text-slate-400">Total Ganho</p>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-industrial">
              <p className="text-lg font-bold text-slate-100">-</p>
              <p className="text-xs text-slate-400">Indicações</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">Resgates em breve</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-amber-500/10">
              <Users className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-100">Como funciona?</p>
              <p className="text-sm text-slate-400 mt-1">
                1. Compartilhe seu código com amigos<br />
                2. Eles se cadastram no Montador Pro<br />
                3. Você ganha bônus ao了他们 activarem
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
