import { useState } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { generateReceiptPDF, generateWarrantyPDF, generateAnnualReportPDF } from '../../lib/pdfGenerator'
import { FileText, Receipt, Shield, X, BarChart3 } from 'lucide-react'

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
      description: 'Termo de garantia de 90 dias para servicos',
      color: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
    {
      id: 'annualReport',
      icon: BarChart3,
      title: 'Relatorio Anual',
      description: 'Resumo financeiro do ano comtotais mensais',
      color: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
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

      {showModal === 'annualReport' && (
        <AnnualReportModal
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
      clientName: form.clientName,
      amount: Number(form.amount),
      description: form.description,
      paymentMethod: form.paymentMethod,
      observations: form.observations,
      profile,
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
    const warrantySettings = profile?.settings?.warranty || null
    generateWarrantyPDF({
      clientName: form.clientName,
      clientPhone: form.clientPhone,
      clientDocument: form.clientDocument,
      serviceDescription: form.serviceDescription,
      serviceDate: form.serviceDate,
      profile,
      warrantySettings,
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

function AnnualReportModal({ profile, onClose }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [customTransactions, setCustomTransactions] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const year = selectedYear
    const months = []
    for (let m = 0; m < 12; m++) {
      const label = new Date(year, m, 1).toLocaleDateString('pt-BR', { month: 'short' })
      const monthStart = new Date(year, m, 1)
      const monthEnd = new Date(year, m + 1, 0)
      const all = customTransactions || (profile?.settings?.transactions || [])
      const monthTransactions = all.filter((t) => {
        const d = new Date(t.date)
        return d >= monthStart && d <= monthEnd
      })
      const income = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const expense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      months.push({ label, income, expense, balance: income - expense })
    }
    const totals = {
      totalIncome: months.reduce((s, m) => s + m.income, 0),
      totalExpense: months.reduce((s, m) => s + m.expense, 0),
      balance: months.reduce((s, m) => s + m.balance, 0),
    }
    generateAnnualReportPDF({
      year,
      profile,
      monthlyData: months,
      totals,
    })
    onClose()
  }

  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-100">Gerar Relatorio Anual</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Ano</label>
            <div className="grid grid-cols-3 gap-2">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setSelectedYear(y)}
                  className={`h-12 rounded-industrial text-sm font-medium transition-colors ${
                    selectedYear === y
                      ? 'bg-amber-500 text-slate-950 shadow-stamped'
                      : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">O relatorio agrupa receitas e despesas por mes, com totais anuais.</p>
          <button type="submit" className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
            <BarChart3 className="w-5 h-5" />
            Gerar PDF
          </button>
        </form>
      </div>
    </div>
  )
}
