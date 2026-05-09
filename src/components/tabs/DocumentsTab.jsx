import { useState } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { generateReceiptPDF, generateWarrantyPDF } from '../../lib/pdfGenerator'
import { FileText, Receipt, Shield, X } from 'lucide-react'

export function DocumentsTab() {
  const { data: profile } = useProfile()
  const [showModal, setShowModal] = useState(null)

  const cards = [
    {
      id: 'receipt',
      icon: Receipt,
      title: 'Recibo de Pagamento',
      description: 'Gere um recibo para pagamentos recebidos',
      color: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      id: 'warranty',
      icon: Shield,
      title: 'Termo de Garantia',
      description: 'Termo de garantia de 90 dias para serviços',
      color: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <h2 className="text-lg font-bold text-slate-100">Documentos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.id}
              onClick={() => setShowModal(card.id)}
              className="p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors text-left"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-industrial ${card.color} mb-3`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <h3 className="font-bold text-slate-100">{card.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{card.description}</p>
            </button>
          )
        })}
      </div>

      {showModal === 'receipt' && (
        <ReceiptModal
          profile={profile}
          onClose={() => setShowModal(null)}
        />
      )}

      {showModal === 'warranty' && (
        <WarrantyModal
          profile={profile}
          onClose={() => setShowModal(null)}
        />
      )}
    </div>
  )
}

function ReceiptModal({ profile, onClose }) {
  const [form, setForm] = useState({
    clientName: '',
    amount: '',
    description: '',
    paymentMethod: 'PIX',
    observations: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    generateReceiptPDF({
      ...form,
      amount: Number(form.amount),
      profileName: profile?.full_name || 'Montador Pro',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-100">Gerar Recibo</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Nome do Cliente</label>
            <input
              type="text"
              value={form.clientName}
              onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Valor (R$)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Referente a</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Ex: Instalação de torneira"
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Forma de Pagamento</label>
            <div className="flex gap-2">
              {['PIX', 'Dinheiro', 'Transferência', 'Boleto'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, paymentMethod: m }))}
                  className={`flex-1 h-10 rounded-industrial text-sm font-medium transition-colors ${
                    form.paymentMethod === m
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-700 text-slate-300 border border-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Observações</label>
            <textarea
              value={form.observations}
              onChange={(e) => setForm((p) => ({ ...p, observations: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500 resize-none h-20"
            />
          </div>
          <button type="submit" className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
            <Receipt className="w-5 h-5" />
            Gerar PDF
          </button>
        </form>
      </div>
    </div>
  )
}

function WarrantyModal({ profile, onClose }) {
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    clientDocument: '',
    serviceDescription: '',
    serviceDate: new Date().toLocaleDateString('pt-BR'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    generateWarrantyPDF({
      ...form,
      profileName: profile?.full_name || 'Montador Pro',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-100">Gerar Termo de Garantia</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Nome do Cliente</label>
            <input
              type="text"
              value={form.clientName}
              onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Telefone</label>
            <input
              type="tel"
              value={form.clientPhone}
              onChange={(e) => setForm((p) => ({ ...p, clientPhone: e.target.value }))}
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">CPF/CNPJ</label>
            <input
              type="text"
              value={form.clientDocument}
              onChange={(e) => setForm((p) => ({ ...p, clientDocument: e.target.value }))}
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Descrição do Serviço</label>
            <input
              type="text"
              value={form.serviceDescription}
              onChange={(e) => setForm((p) => ({ ...p, serviceDescription: e.target.value }))}
              placeholder="Ex: Instalação de esquadrias"
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Data de Execução</label>
            <input
              type="text"
              value={form.serviceDate}
              onChange={(e) => setForm((p) => ({ ...p, serviceDate: e.target.value }))}
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <button type="submit" className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
            <Shield className="w-5 h-5" />
            Gerar PDF
          </button>
        </form>
      </div>
    </div>
  )
}
