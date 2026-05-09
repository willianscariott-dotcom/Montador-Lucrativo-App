import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth'
import { useProfile } from '../../hooks/useProfile'
import { useUnsaved } from '../Dashboard'
import { generateQuotePDF } from '../../lib/pdfEngine'
import { Plus, Trash2, Save, Download, ArrowLeft, Wrench, Package, X, Bookmark } from 'lucide-react'

const emptyItem = {
  type: 'service',
  description: '',
  quantity: 1,
  unit_price: '',
}

export function QuoteBuilder({ onBack }) {
  const user = useAuthStore((s) => s.user)
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const { setHasUnsaved } = useUnsaved()

  const [clientName, setClientName] = useState('')
  const [clientDocument, setClientDocument] = useState('')
  const [items, setItems] = useState([{ ...emptyItem }])
  const [saving, setSaving] = useState(false)
  const [catalogModal, setCatalogModal] = useState({ open: false, index: null })
  const [catalogTab, setCatalogTab] = useState('services')

  const catalogServices = profile?.settings?.catalogServices || []
  const catalogParts = profile?.settings?.catalogParts || []

  useEffect(() => {
    const hasData = items.some((i) => i.description || i.unit_price) || clientName
    setHasUnsaved(hasData)
  }, [items, clientName, setHasUnsaved])

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }])

  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index))

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const openCatalogModal = (index) => setCatalogModal({ open: true, index })
  const closeCatalogModal = () => setCatalogModal({ open: false, index: null })

  const selectCatalogItem = (item) => {
    if (catalogModal.index !== null) {
      updateItem(catalogModal.index, 'description', item.name)
      updateItem(catalogModal.index, 'unit_price', item.basePrice)
      if (catalogTab === 'services') {
        updateItem(catalogModal.index, 'type', 'service')
      } else {
        updateItem(catalogModal.index, 'type', 'material')
      }
    }
    closeCatalogModal()
  }

  const total = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const price = Number(item.unit_price) || 0
    return sum + qty * price
  }, 0)

  const servicesTotal = items
    .filter((i) => i.type === 'service')
    .reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0)

  const materialsTotal = items
    .filter((i) => i.type === 'material')
    .reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0)

  const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`

  const saveQuote = useMutation({
    mutationFn: async () => {
      if (!clientName.trim()) throw new Error('Nome do cliente é obrigatório')

      const validItems = items.filter((i) => i.description.trim() && i.unit_price)
      if (validItems.length === 0) throw new Error('Adicione pelo menos um item')

      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          client_name: clientName.trim(),
          client_document: clientDocument.trim() || null,
          total_amount: total,
          status: 'draft',
        })
        .select()
        .single()

      if (quoteError) throw quoteError

      const itemsToInsert = validItems.map((item) => ({
        quote_id: quote.id,
        type: item.type,
        description: item.description.trim(),
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
      }))

      const { error: itemsError } = await supabase.from('quote_items').insert(itemsToInsert)
      if (itemsError) throw itemsError

      return quote
    },
    onMutate: async () => {
      setSaving(true)
      await queryClient.cancelQueries({ queryKey: ['quote-stats'] })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-stats'] })
    },
    onSettled: () => {
      setSaving(false)
    },
  })

  const handleSave = async () => {
    try {
      const quote = await saveQuote.mutateAsync()
      await queryClient.invalidateQueries({ queryKey: ['quotes'] })
      setHasUnsaved(false)
      alert(`Orçamento salvo com sucesso!`)
      onBack()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSaveAndDownload = async () => {
    try {
      const quote = await saveQuote.mutateAsync()

      const { data: savedItems } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)

      generateQuotePDF(quote, savedItems || [], profile)
      setHasUnsaved(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCancel = () => {
    if (items.some((i) => i.description || i.unit_price) || clientName) {
      if (window.confirm('Descartar orçamento?')) {
        setHasUnsaved(false)
        onBack()
      }
    } else {
      onBack()
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleCancel}
          className="w-12 h-12 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h2 className="text-xl font-bold text-slate-100">Novo Orçamento</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4 mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Dados do Cliente</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-300">Nome *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome completo do cliente"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-300">CPF/CNPJ</label>
                <input
                  type="text"
                  value={clientDocument}
                  onChange={(e) => setClientDocument(e.target.value)}
                  placeholder="Documento do cliente (opcional)"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Resumo</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Serviços</span>
                <span className="text-sm text-slate-200">{formatCurrency(servicesTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Materiais</span>
                <span className="text-sm text-slate-200">{formatCurrency(materialsTotal)}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-700 flex justify-between">
                <span className="font-bold text-slate-100">TOTAL</span>
                <span className="text-xl font-bold text-emerald-500">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase">Itens do Orçamento</h3>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-3 bg-slate-700/50 border border-slate-600 rounded-industrial">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="w-8 h-8 flex items-center justify-center rounded-industrial bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block mb-1 text-xs text-slate-400">Tipo</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateItem(index, 'type', 'service')}
                              className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-industrial border transition-colors ${
                                item.type === 'service'
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                                  : 'bg-slate-800 border-slate-600 text-slate-400'
                              }`}
                            >
                              <Wrench className="w-4 h-4" />
                              <span className="text-xs font-medium">Serviço</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateItem(index, 'type', 'material')}
                              className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-industrial border transition-colors ${
                                item.type === 'material'
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                                  : 'bg-slate-800 border-slate-600 text-slate-400'
                              }`}
                            >
                              <Package className="w-4 h-4" />
                              <span className="text-xs font-medium">Material</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block mb-1 text-xs text-slate-400">Descrição</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="Descrição do item"
                              className="flex-1 h-10 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            <button
                              onClick={() => {
                                setCatalogTab(item.type === 'service' ? 'services' : 'parts')
                                openCatalogModal(index)
                              }}
                              className="w-10 h-10 flex items-center justify-center rounded-industrial bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                            >
                              <Bookmark className="w-4 h-4 text-amber-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-slate-400">Qtd</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full h-10 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-slate-400">Valor Unit. (R$)</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        className="w-full h-10 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="mt-2 text-right">
                    <span className="text-xs text-slate-400">Subtotal: </span>
                    <span className="text-sm font-bold text-amber-500">
                      {formatCurrency((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="w-full mt-3 h-12 flex items-center justify-center gap-2 text-sm font-medium text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-industrial hover:bg-amber-500/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar Item
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={handleSaveAndDownload}
              disabled={saving}
              className="h-14 px-6 flex items-center justify-center gap-2 text-base font-bold text-slate-100 bg-slate-700 border border-slate-600 rounded-industrial hover:bg-slate-600 transition-all disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {catalogModal.open && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md sm:max-w-lg bg-slate-800 border border-slate-700 rounded-panel max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="font-bold text-slate-100">Selecionar do Catálogo</h3>
              <button
                onClick={closeCatalogModal}
                className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            <div className="flex gap-2 p-4 border-b border-slate-700">
              <button
                onClick={() => setCatalogTab('services')}
                className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-industrial text-sm font-medium transition-colors ${
                  catalogTab === 'services'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                <Wrench className="w-4 h-4" /> Serviços
              </button>
              <button
                onClick={() => setCatalogTab('parts')}
                className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-industrial text-sm font-medium transition-colors ${
                  catalogTab === 'parts'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                <Package className="w-4 h-4" /> Peças
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {catalogTab === 'services' && catalogServices.length === 0 && (
                <p className="text-center text-slate-400 py-8">Nenhum serviço no catálogo</p>
              )}
              {catalogTab === 'parts' && catalogParts.length === 0 && (
                <p className="text-center text-slate-400 py-8">Nenhuma peça no catálogo</p>
              )}
              {(catalogTab === 'services' ? catalogServices : catalogParts).map((item, index) => (
                <button
                  key={item.id || index}
                  onClick={() => selectCatalogItem(item)}
                  className="w-full flex items-center justify-between p-3 mb-2 bg-slate-700 border border-slate-600 rounded-industrial hover:bg-slate-600 transition-colors"
                >
                  <span className="text-sm text-slate-100">{item.name}</span>
                  <span className="text-sm font-bold text-amber-500">{formatCurrency(Number(item.basePrice))}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
