import { Users } from 'lucide-react'

export function ClientsTab() {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-lg font-bold text-slate-100 mb-4">Clientes</h2>

      <div className="p-6 text-center bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-industrial bg-slate-700">
          <Users className="w-6 h-6 text-slate-400" />
        </div>
        <p className="mt-4 text-slate-400">Nenhum cliente cadastrado</p>
        <p className="mt-1 text-sm text-slate-500">Clientes serão adicionados nos orçamentos</p>
      </div>
    </div>
  )
}
