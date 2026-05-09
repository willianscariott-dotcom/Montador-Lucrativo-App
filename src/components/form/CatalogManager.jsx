import { useState } from 'react'
import { useProfile, useUpdateSettings } from '../../hooks/useProfile'
import { Plus, Trash2, Wrench, Package, Bookmark, X } from 'lucide-react'

const emptyService = { id: Date.now(), name: '', basePrice: '' }
const emptyPart = { id: Date.now(), name: '', basePrice: '' }

export function CatalogManager({ onClose }) {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()

  const settings = profile?.settings || {}
  const services = settings.catalogServices || []
  const parts = settings.catalogParts || []

  const [activeTab, setActiveTab] = useState('services')
  const [localServices, setLocalServices] = useState(services)
  const [localParts, setLocalParts] = useState(parts)
  const [saving, setSaving] = useState(false)

  const addService = () => setLocalServices((prev) => [...prev, { ...emptyService, id: Date.now() }])
  const removeService = (id) => setLocalServices((prev) => prev.filter((s) => s.id !== id))
  const updateService = (id, field, value) => {
    setLocalServices((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const addPart = () => setLocalParts((prev) => [...prev, { ...emptyPart, id: Date.now() }])
  const removePart = (id) => setLocalParts((prev) => prev.filter((p) => p.id !== id))
  const updatePart = (id, field, value) => {
    setLocalParts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings.mutateAsync({
        catalogServices: localServices.filter((s) => s.name.trim() && s.basePrice),
        catalogParts: localParts.filter((p) => p.name.trim() && p.basePrice),
      })
      if (onClose) onClose()
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        {onClose && (
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-100">Catálogo</h2>
          <p className="text-sm text-slate-400">Cadastre seus serviços e peças padrão</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-industrial font-medium text-sm transition-colors ${
            activeTab === 'services'
              ? 'bg-amber-500 text-slate-950 shadow-stamped'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <Wrench className="w-5 h-5" />
          Serviços
        </button>
        <button
          onClick={() => setActiveTab('parts')}
          className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-industrial font-medium text-sm transition-colors ${
            activeTab === 'parts'
              ? 'bg-amber-500 text-slate-950 shadow-stamped'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <Package className="w-5 h-5" />
          Peças
        </button>
      </div>

      {activeTab === 'services' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-400">Serviços Padrão</h3>
            <button
              onClick={addService}
              className="h-10 px-3 flex items-center gap-1.5 text-sm font-medium text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-industrial hover:bg-amber-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
          {localServices.length === 0 && (
            <div className="p-6 text-center bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
              <Bookmark className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="text-slate-400">Nenhum serviço cadastrado</p>
              <p className="text-xs text-slate-500 mt-1">Clique em Adicionar para começar</p>
            </div>
          )}
          {localServices.map((service, index) => (
            <div key={service.id} className="p-3 bg-slate-800 border border-slate-700 rounded-industrial">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">#{index + 1}</span>
                <button
                  onClick={() => removeService(service.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-industrial bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => updateService(service.id, 'name', e.target.value)}
                  placeholder="Nome do serviço (ex: Instalação de torneira)"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <input
                  type="number"
                  value={service.basePrice}
                  onChange={(e) => updateService(service.id, 'basePrice', e.target.value)}
                  placeholder="Valor base (R$)"
                  min="0"
                  step="0.01"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'parts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-400">Peças Frequentes</h3>
            <button
              onClick={addPart}
              className="h-10 px-3 flex items-center gap-1.5 text-sm font-medium text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-industrial hover:bg-amber-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
          {localParts.length === 0 && (
            <div className="p-6 text-center bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
              <Bookmark className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="text-slate-400">Nenhuma peça cadastrada</p>
              <p className="text-xs text-slate-500 mt-1">Clique em Adicionar para começar</p>
            </div>
          )}
          {localParts.map((part, index) => (
            <div key={part.id} className="p-3 bg-slate-800 border border-slate-700 rounded-industrial">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">#{index + 1}</span>
                <button
                  onClick={() => removePart(part.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-industrial bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={part.name}
                  onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                  placeholder="Nome da peça (ex: Vedação 3/4)"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <input
                  type="number"
                  value={part.basePrice}
                  onChange={(e) => updatePart(part.id, 'basePrice', e.target.value)}
                  placeholder="Valor unitário (R$)"
                  min="0"
                  step="0.01"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-16 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Catálogo'}
          </button>
        </div>
      </div>
    </div>
  )
}
