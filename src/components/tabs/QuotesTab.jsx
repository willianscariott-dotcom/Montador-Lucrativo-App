import { FileText, Plus, FileDown, Clock, ArrowUpRight } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth'

export function QuotesTab({ onNewQuote }) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

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

  const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`

  const statusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-emerald-500 bg-emerald-500/10'
      case 'rejected': return 'text-red-500 bg-red-500/10'
      case 'draft': return 'text-slate-400 bg-slate-700'
      default: return 'text-amber-500 bg-amber-500/10'
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
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-100">{quote.client_name}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColor(quote.status)}`}>
                      {quote.status === 'draft' ? 'Rascunho' : quote.status === 'approved' ? 'Aprovado' : quote.status === 'rejected' ? 'Recusado' : quote.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
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
              {quote.status === 'draft' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['quotes'] })
                    }}
                    className="flex-1 h-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Enviar ao Cliente
                  </button>
                  <button
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['quotes'] })
                    }}
                    className="h-10 px-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-100 bg-slate-700 border border-slate-600 rounded-industrial hover:bg-slate-600 transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
