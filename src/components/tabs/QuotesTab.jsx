import { useState } from 'react'
import { FileText, Plus, FileDown, Clock, ArrowUpRight, Pencil, Trash2, CheckCircle, MessageSquare } from 'lucide-react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth'
import { useProfile, useUpdateSettings } from '../../hooks/useProfile'
import { generateQuotePDF } from '../../lib/pdfGenerator'
import { openWhatsApp } from '../../lib/whatsapp'

export function QuotesTab({ onNewQuote }) {
  const user = useAuthStore((s) => s.user)
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const updateSettings = useUpdateSettings()

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const tenantId = user?.id
      if (!tenantId) return []
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })

  const updateQuoteStatus = useMutation({
    mutationFn: async ({ quoteId, status }) => {
      const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quoteId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes'] }),
  })

  const deleteQuote = useMutation({
    mutationFn: async (quoteId) => {
      await supabase.from('quote_items').delete().eq('quote_id', quoteId)
      const { error } = await supabase.from('quotes').delete().eq('id', quoteId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes'] }),
  })

  const handleMarkPaid = (quote) => {
    if (!window.confirm(`Confirmar pagamento do orçamento de ${quote.client_name} no valor de R$ ${Number(quote.total_amount).toFixed(2).replace('.', ',')}?`)) return

    updateQuoteStatus.mutate({ quoteId: quote.id, status: 'paid' })

    const settings = profile?.settings || {}
    const transactions = settings.transactions || []
    const newTx = {
      id: Date.now(),
      type: 'income',
      description: `Orçamento - ${quote.client_name}`,
      amount: Number(quote.total_amount),
      date: new Date().toISOString(),
      account: 'Carteira',
      category: 'Serviço Montagem',
      recurring: false,
      multiplier: 1,
      quote_id: quote.id,
    }
    updateSettings.mutate({ transactions: [...transactions, newTx] })
  }

  const handleMarkApproved = (quote) => {
    if (!window.confirm(`Marcar orçamento de ${quote.client_name} como aprovado?`)) return
    updateQuoteStatus.mutate({ quoteId: quote.id, status: 'approved' })
  }

  const handleDelete = (quote) => {
    if (!window.confirm('Excluir este orçamento? Esta ação não pode ser desfeita.')) return
    deleteQuote.mutate(quote.id)
  }

  const handlePDF = async (quote) => {
    try {
      const { data: items } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
      generateQuotePDF(quote, items || [], profile)
    } catch (err) {
      alert('Erro ao gerar PDF: ' + err.message)
    }
  }

  const handleWhatsApp = (quote) => {
    const phone = quote.client_phone || ''
    const msg = `Olá ${quote.client_name}! 👋\n\nSegue o orçamento Nº ${quote.id?.slice(0, 8).toUpperCase() || '--------'} no valor de *R$ ${Number(quote.total_amount).toFixed(2).replace('.', ',')}*.\n\nQualquer dúvida, estou à disposição!\n\nAtenciosamente,\nMontador Lucrativo`
    openWhatsApp(phone, msg)
  }

  const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`

  const statusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-emerald-400 bg-emerald-500/20'
      case 'approved': return 'text-emerald-500 bg-emerald-500/10'
      case 'rejected': return 'text-red-500 bg-red-500/10'
      case 'draft': return 'text-slate-400 bg-slate-700'
      default: return 'text-amber-500 bg-amber-500/10'
    }
  }

  const statusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'approved': return 'Aprovado'
      case 'rejected': return 'Recusado'
      case 'draft': return 'Rascunho'
      default: return status
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100">Orçamentos</h2>
        <button
          onClick={onNewQuote}
          className="h-12 px-4 flex items-center gap-2 text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo
        </button>
      </div>

      {isLoading ? (
        <div className="p-6 text-center bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
          <p className="text-slate-400">Carregando orçamentos...</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="p-6 text-center bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
          <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-industrial bg-slate-700">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <p className="mt-4 text-slate-400">Nenhum orçamento ainda</p>
          <p className="mt-1 text-sm text-slate-500">Clique em "Novo" para criar seu primeiro orçamento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <div key={quote.id} className="p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-slate-100">{quote.client_name}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColor(quote.status)}`}>
                      {statusLabel(quote.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {quote.client_document && (
                      <span>{quote.client_document}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-500">{formatCurrency(quote.total_amount)}</p>
                  <span className="text-xs text-slate-500">
                    #{quote.id?.slice(0, 8).toUpperCase() || '--------'}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap">
                {quote.status === 'draft' && (
                  <>
                    <button
                      onClick={() => handleWhatsApp(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-500 rounded-industrial shadow-stamped hover:bg-emerald-400 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handlePDF(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-100 bg-slate-700 border border-slate-600 rounded-industrial hover:bg-slate-600 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleMarkApproved(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleDelete(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-industrial hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {quote.status === 'approved' && (
                  <>
                    <button
                      onClick={() => handleWhatsApp(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-500 rounded-industrial shadow-stamped hover:bg-emerald-400 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handlePDF(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-100 bg-slate-700 border border-slate-600 rounded-industrial hover:bg-slate-600 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleMarkPaid(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-500 rounded-industrial shadow-stamped hover:bg-emerald-400 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar Pago
                    </button>
                  </>
                )}
                {quote.status === 'paid' && (
                  <>
                    <button
                      onClick={() => handlePDF(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-100 bg-slate-700 border border-slate-600 rounded-industrial hover:bg-slate-600 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-industrial hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {quote.status === 'rejected' && (
                  <>
                    <button
                      onClick={() => handleWhatsApp(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-500 rounded-industrial shadow-stamped hover:bg-emerald-400 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleDelete(quote)}
                      className="h-10 px-3 flex items-center justify-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-industrial hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}