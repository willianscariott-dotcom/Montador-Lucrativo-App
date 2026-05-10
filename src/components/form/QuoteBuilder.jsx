import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../hooks/useProfile'
import { useUnsaved } from '../Dashboard'
import { generateQuotePDF } from '../../lib/pdfGenerator'
import { useQuoteEditStore } from '../../store/quoteEdit'
import { Plus, Trash2, Save, Download, ArrowLeft, Wrench, Package, X, Bookmark, Calendar } from 'lucide-react'

const DEFAULT_SERVICES = [
  'Montagem Roupeiro', 'Montagem Comoda', 'Montagem Cozinha', 'Montagem Balcao',
  'Montagem Painel', 'Instalacao TV', 'Cama Casal', 'Cama Solteiro', 'Berco',
]

const DEFAULT_PARTS = [
  'Dobradicas', 'Corredicas Ocultas', 'Corredicas Telescopicas', 'Parafusos',
  'Buchas', 'Puxador', 'Trilho Aluminio',
]

const emptyItem = {
  type: 'service',
  description: '',
  details: '',
  quantity: 1,
  unit_price: '',
}

export function QuoteBuilder({ onBack }) {
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const { setHasUnsaved } = useUnsaved()
  const editingQuote = useQuoteEditStore((s) => s.editingQuote)
  const editingItems = useQuoteEditStore((s) => s.editingItems)
  const clearEditingQuote = useQuoteEditStore((s) => s.clearEditingQuote)

  const [clientName, setClientName] = useState('')
  const [clientDocument, setClientDocument] = useState('')
  const [items, setItems] = useState([{ ...emptyItem }])
  const [saving, setSaving] = useState(false)
  const [catalogModal, setCatalogModal] = useState({ open: false, index: null })
  const [catalogTab, setCatalogTab] = useState('services')

  useEffect(() => {
    if (editingQuote) {
      setClientName(editingQuote.client_name || '')
      setClientDocument(editingQuote.client_document || '')
      if (editingItems && editingItems.length > 0) {
        setItems(editingItems.map((item) => ({
          type: item.type || 'service',
          description: item.description || '',
          details: item.details || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || '',
        })))
      }
    } else {
      setClientName('')
      setClientDocument('')
      setItems([{ ...emptyItem }])
    }
  }, [editingQuote, editingItems])

  const userServices = profile?.settings?.meusServicos || []
  const userParts = profile?.settings?.minhasPecas || []
  const catalogServices = profile?.settings?.catalogServices || []
  const catalogParts = profile?.settings?.catalogParts || []
  const allServiceOptions = [...DEFAULT_SERVICES, ...userServices].sort()
  const allPartOptions = [...DEFAULT_PARTS, ...userParts].sort()
  const hourlyRate = (() => {
    const das = Number(pricing.dasValue) || 0
    const proLabore = Number(pricing.proLabore) || 0
    const fixedCosts = Number(pricing.fixedCosts) || 0
    const profitMargin = Number(pricing.profitMargin) || 0
    const days = Number(pricing.workDays) || 22
    const hours = Number(pricing.workHours) || 8
    return days * hours > 0 ? (das + proLabore + fixedCosts) * (1 + profitMargin / 100) / (days * hours) : 0
  })()

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

      const validItems = items.filter((i) => i.description?.trim() && i.unit_price && Number(i.unit_price) > 0)
      if (validItems.length === 0) throw new Error('Adicione pelo menos um item com descrição e valor')

      const totalAmount = validItems.reduce((sum, item) => sum + (Number(item.quantity) || 1) * (Number(item.unit_price) || 0), 0)

      const { data: { session } } = await supabase.auth.getSession()
      const tenantId = session?.user?.id
      if (!tenantId) throw new Error('Usuário não autenticado')

      if (editingQuote) {
        const { error: quoteError } = await supabase
          .from('quotes')
          .update({
            client_name: clientName.trim(),
            client_document: clientDocument.trim() || null,
            total_amount: totalAmount,
          })
          .eq('id', editingQuote.id)

        if (quoteError) throw quoteError

        await supabase.from('quote_items').delete().eq('quote_id', editingQuote.id)

        const itemsToInsert = validItems.map((item) => ({
          quote_id: editingQuote.id,
          tenant_id: tenantId,
          type: item.type,
          description: item.description.trim(),
          details: item.details || null,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
        }))
        const { error: itemsError } = await supabase.from('quote_items').insert(itemsToInsert)
        if (itemsError) throw itemsError

        clearEditingQuote()
        return { ...editingQuote, client_name: clientName.trim(), client_document: clientDocument.trim(), total_amount: totalAmount }
      }

      const quotePayload = {
        tenant_id: tenantId,
        client_name: clientName.trim(),
        client_document: clientDocument.trim() || null,
        total_amount: totalAmount,
        status: 'draft',
      }

      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert(quotePayload)
        .select()
        .single()

      if (quoteError) throw quoteError

      const itemsToInsert = validItems.map((item) => ({
        quote_id: quote.id,
        tenant_id: tenantId,
        type: item.type,
        description: item.description.trim(),
        details: item.details || null,
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
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
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
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Adicionar Item ao Orcamento</h3>
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
                              <span className="text-xs font-medium">Servico</span>
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
                          <label className="block mb-1 text-xs text-slate-400">Servico/Item</label>
                          <div className="flex gap-2">
                            <select
                              value={item.description}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === '__custom__') {
                                  updateItem(index, 'description', '')
                                } else {
                                  updateItem(index, 'description', val)
                                }
                              }}
                              className="flex-1 h-10 px-2 text-xs bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
                            >
                              <option value="">Selecione...</option>
                              {item.type === 'service' ? (
                                <>
                                  {allServiceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                                  <option value="__custom__">+ Avulso...</option>
                                </>
                              ) : (
                                <>
                                  {allPartOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                                  <option value="__custom__">+ Avulso...</option>
                                </>
                              )}
                            </select>
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
                    {(item.description === '__custom__' || !item.description) && (
                      <div className="sm:col-span-2">
                        <label className="block mb-1 text-xs text-slate-400">Descricao (digite manualmente)</label>
                        <input
                          type="text"
                          value={item.description === '__custom__' ? '' : item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Digite a descricao do item"
                          className="w-full h-10 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <label className="block mb-1 text-xs text-slate-400">Detalhes/Especificacao (Opcional)</label>
                      <input
                        type="text"
                        value={item.details || ''}
                        onChange={(e) => updateItem(index, 'details', e.target.value)}
                        placeholder="Ex: Corrediça telescópica 45cm, Porto personalizado..."
                        className="w-full h-10 px-3 text-sm bg-slate-600 border border-slate-500 rounded-industrial text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
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
                    <div className="relative">
                      <label className="block mb-1 text-xs text-slate-400">Valor Unit. (R$)</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                        onFocus={() => {
                          if (item.type === 'service' && !item.unit_price && hourlyRate > 0) {
                            updateItem(index, 'unit_price', hourlyRate.toFixed(2))
                          }
                        }}
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        className="w-full h-10 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      {item.type === 'service' && !item.unit_price && hourlyRate > 0 && (
                        <span className="absolute right-12 top-7 text-xs text-amber-500">std: {formatCurrency(hourlyRate)}</span>
                      )}
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

          <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-1">Itens Adicionados</h3>
            <div className="border-t border-slate-600 my-3" />
            {items.filter((i) => i.description?.trim() && i.unit_price).length === 0 ? (
              <div className="text-center py-6">
                <Package className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <p className="text-sm text-slate-400">Nenhum item adicionado ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.filter((i) => i.description?.trim() && i.unit_price).map((item, index) => {
                  const realIndex = items.indexOf(item)
                  return (
                    <div key={realIndex} className="flex items-center justify-between p-3 bg-slate-700/50 border border-slate-600 rounded-industrial">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-industrial text-xs font-bold ${item.type === 'service' ? 'bg-amber-500/20 text-amber-500' : 'bg-purple-500/20 text-purple-400'}`}>
                            {item.type === 'service' ? <Wrench className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-100">{item.description}</p>
                            {item.details && <p className="text-xs text-slate-500 italic">{item.details}</p>}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">x{item.quantity} · {formatCurrency(Number(item.unit_price))} · subtotal {formatCurrency((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}</p>
                      </div>
                      <button onClick={() => removeItem(realIndex)} className="w-8 h-8 flex items-center justify-center rounded-industrial bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
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
                    <div className="relative">
                      <label className="block mb-1 text-xs text-slate-400">Valor Unit. (R$)</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                        onFocus={() => {
                          if (item.type === 'service' && !item.unit_price && hourlyRate > 0) {
                            updateItem(index, 'unit_price', hourlyRate.toFixed(2))
                          }
                        }}
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        className="w-full h-10 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      {item.type === 'service' && !item.unit_price && hourlyRate > 0 && (
                        <span className="absolute right-12 top-7 text-xs text-amber-500">std: {formatCurrency(hourlyRate)}</span>
                      )}
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
            <button
              onClick={() => {
                if (!clientName.trim()) { alert('Adicione o nome do cliente primeiro'); return }
                const details = items.filter((i) => i.description?.trim()).map((i) => `${i.description} (R$ ${Number(i.unit_price || 0).toFixed(2).replace('.', ',')})`).join('\n')
                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Orcamento+${encodeURIComponent(clientName)}&details=${encodeURIComponent(details)}&dates=${new Date(Date.now() + 7 * 86400000).toISOString().replace(/[-:]/g, '').slice(0, 15)}/${new Date(Date.now() + 8 * 86400000).toISOString().replace(/[-:]/g, '').slice(0, 15)}`
                window.open(url, '_blank')
              }}
              className="h-14 px-6 flex items-center justify-center gap-2 text-base font-bold text-slate-100 bg-blue-600 border border-blue-500 rounded-industrial hover:bg-blue-500 transition-all"
              title="Agendar no Google Calendar"
            >
              <Calendar className="w-5 h-5" />
            </button>
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
