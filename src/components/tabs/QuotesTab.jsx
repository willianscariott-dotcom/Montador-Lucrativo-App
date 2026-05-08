import { FileText, Plus } from 'lucide-react'

export function QuotesTab() {
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100">Orçamentos</h2>
        <button className="h-12 px-4 flex items-center gap-2 text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all">
          <Plus className="w-5 h-5" />
          Novo
        </button>
      </div>

      <div className="p-6 text-center bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-industrial bg-slate-700">
          <FileText className="w-6 h-6 text-slate-400" />
        </div>
        <p className="mt-4 text-slate-400">Nenhum orçamento ainda</p>
        <p className="mt-1 text-sm text-slate-500">Clique em "Novo" para criar seu primeiro orçamento</p>
      </div>
    </div>
  )
}
