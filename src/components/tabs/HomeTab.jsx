import { useState } from 'react'
import { useProfile, useUpdateSettings } from '../../hooks/useProfile'
import { Plus, TrendingUp, TrendingDown, Target, DollarSign, ArrowUpRight, ArrowDownRight, X } from 'lucide-react'

const EXPENSE_CATEGORIES = ['Gasolina', 'Alimentação', 'Material de Montagem', 'Manutenção Ferramentas', 'Internet', 'Telefone', 'Marketing', 'Outros']
const INCOME_CATEGORIES = ['Serviço Montagem', 'Serviço Instalação', 'Serviço Avulso', 'Receita Extra']
const ACCOUNTS = ['Carteira', 'Conta Banco', 'Pix']

export function HomeTab() {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const settings = profile?.settings || {}
  const pricing = settings.pricing || {}
  const transactions = settings.transactions || []

  const [showModal, setShowModal] = useState(null)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthTransactions = transactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  const monthlyTarget = (() => {
    const das = Number(pricing.dasValue) || 0
    const proLabore = Number(pricing.proLabore) || 0
    const fixedCosts = Number(pricing.fixedCosts) || 0
    const profitMargin = Number(pricing.profitMargin) || 0
    const days = Number(pricing.workDays) || 22
    const hours = Number(pricing.workHours) || 8
    const hourlyRate = days * hours > 0 ? (das + proLabore + fixedCosts) * (1 + profitMargin / 100) / (days * hours) : 0
    return days * hours * hourlyRate
  })()

  const progressPercent = monthlyTarget > 0 ? Math.min((totalIncome / monthlyTarget) * 100, 100) : 0

  const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Visão Geral</h2>
        <span className="text-sm text-slate-400">
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Saldo do Mês</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className={`w-12 h-12 flex items-center justify-center rounded-industrial ${balance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {balance >= 0 ? (
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowModal('income')}
              className="flex-1 h-10 flex items-center justify-center gap-2 text-xs font-medium text-slate-950 bg-emerald-500 rounded-industrial shadow-stamped hover:bg-emerald-400 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              Receita
            </button>
            <button
              onClick={() => setShowModal('expense')}
              className="flex-1 h-10 flex items-center justify-center gap-2 text-xs font-medium text-slate-100 bg-red-500 rounded-industrial shadow-stamped hover:bg-red-400 transition-colors"
            >
              <ArrowDownRight className="w-4 h-4" />
              Despesa
            </button>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
          <p className="text-sm text-slate-400">Receitas</p>
          <p className="text-xl font-bold text-slate-100">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-slate-500 mt-1">{monthTransactions.filter((t) => t.type === 'income').length} transações</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
          <p className="text-sm text-slate-400">Despesas</p>
          <p className="text-xl font-bold text-slate-100">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-slate-500 mt-1">{monthTransactions.filter((t) => t.type === 'expense').length} transações</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-amber-500/10">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-slate-100">Meta de Faturamento</p>
              <p className="text-sm text-slate-400">Baseado na sua precificação</p>
            </div>
          </div>
          <p className="text-sm font-bold text-amber-500">{formatCurrency(monthlyTarget)}</p>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-2 text-right">
          {progressPercent.toFixed(1)}% atingido ({formatCurrency(totalIncome)})
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <h3 className="font-bold text-slate-100 mb-3">Transações Recentes</h3>
        {monthTransactions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <p className="text-slate-400">Nenhuma transação este mês</p>
            <p className="text-xs text-slate-500 mt-1">Clique em Receita ou Despesa para adicionar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {monthTransactions.slice(-5).reverse().map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 border border-slate-600 rounded-industrial">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-industrial ${t.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {t.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{t.description}</p>
                    <p className="text-xs text-slate-500">{t.category} · {t.account} · {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <span className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal
          type={showModal}
          onClose={() => setShowModal(null)}
          onSave={(tx) => {
            const newTransactions = [...transactions, { ...tx, id: Date.now() }]
            updateSettings.mutate({ transactions: newTransactions })
          }}
        />
      )}
    </div>
  )
}

function TransactionModal({ type, onClose, onSave }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [account, setAccount] = useState('Carteira')
  const [category, setCategory] = useState('')

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount || !category) return
    onSave({
      type,
      description: description.trim(),
      amount: Number(amount),
      date: new Date(date).toISOString(),
      account,
      category,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-100">
            {type === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa'}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Descrição *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'income' ? 'Ex: Instalação de esquadria' : 'Ex: Material de construção'}
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Valor (R$) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              min="0.01"
              step="0.01"
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-300">Data *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-300">Conta *</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                required
              >
                {ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Categoria *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              required
            >
              <option value="">Selecione...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className={`w-full h-14 flex items-center justify-center gap-2 text-base font-bold rounded-industrial shadow-stamped transition-all ${
              type === 'income'
                ? 'text-slate-950 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600'
                : 'text-slate-100 bg-red-500 hover:bg-red-400 active:bg-red-600'
            }`}
          >
            {type === 'income' ? '+ Adicionar Receita' : '+ Adicionar Despesa'}
          </button>
        </form>
      </div>
    </div>
  )
}
