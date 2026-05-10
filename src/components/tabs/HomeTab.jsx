import { useState } from 'react'
import { useProfile, useUpdateSettings } from '../../hooks/useProfile'
import {
  TrendingUp, TrendingDown, Target, DollarSign, ArrowUpRight,
  ArrowDownRight, X, ChevronLeft, ChevronRight, Link2, Bell, Repeat,
} from 'lucide-react'

const DEFAULT_EXPENSE_CATEGORIES = ['Gasolina', 'Alimentação', 'Material de Montagem', 'Manutenção Ferramentas', 'Internet', 'Telefone', 'Marketing', 'Outros']
const DEFAULT_INCOME_CATEGORIES = ['Serviço Montagem', 'Serviço Instalação', 'Serviço Avulso', 'Receita Extra']
const DEFAULT_ACCOUNTS = ['Carteira', 'Conta Banco', 'Pix']

const USEFUL_LINKS = [
  { label: 'Carnê Leão', url: 'https://www.gov.br/receitafederal/pt-br/assistente/arrecadacao' },
  { label: 'Simples Nacional', url: 'https://www.gov.br/receitafederal/pt-br/assistente/simplesnacional' },
  { label: 'PGFN Regulariza', url: 'https://www.receita.fazenda.gov.br/Pgfman/Gfe/Anexos/AnexoII/SituacaoCadastral.htm' },
  { label: 'DAS - Simples', url: 'https://www8.receita.fazenda.gov.br/simplesnacional/aplicacoes.aspx?id=3' },
  { label: 'FGTS Regulariza', url: 'https://www.regularizadireta.trabalho.gov.br/login' },
]

const QUICK_LINKS = [
  { label: 'Emitir NFS-e', url: 'https://www.nfse.gov.br/EmissorNacional' },
  { label: 'Pagar DAS', url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/pagamento-de-contribuicao-mensal' },
]

export function HomeTab() {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const settings = profile?.settings || {}
  const pricing = settings.pricing || {}
  const transactions = (settings.transactions || []).filter((t) => t.recurring !== true)
  const recurringTransactions = settings.transactions?.filter((t) => t.recurring === true) || []
  const links = settings.usefulLinks || []
  const reminder = settings.monthlyReminder || {}
  const expenseCategories = settings.expenseCategories || DEFAULT_EXPENSE_CATEGORIES
  const incomeCategories = settings.incomeCategories || DEFAULT_INCOME_CATEGORIES
  const accounts = settings.accounts || DEFAULT_ACCOUNTS

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showModal, setShowModal] = useState(null)
  const [showLinks, setShowLinks] = useState(false)

  const allTransactions = settings.transactions || []

  const monthTransactions = transactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
  })

  const activeRecurring = recurringTransactions.filter((t) => {
    const start = new Date(t.startDate || t.date)
    const end = t.endDate ? new Date(t.endDate) : null
    const now = new Date(selectedYear, selectedMonth, 1)
    return start <= now && (!end || end >= now)
  })

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  const recurringIncome = activeRecurring
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount) * (t.multiplier || 1), 0)

  const recurringExpense = activeRecurring
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount) * (t.multiplier || 1), 0)

  const totalMonthIncome = totalIncome + recurringIncome
  const totalMonthExpense = totalExpense + recurringExpense
  const monthBalance = totalMonthIncome - totalMonthExpense

  const generalBalance = (() => {
    const allIncome = allTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0)
    const allExpense = allTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0)
    return allIncome - allExpense
  })()

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

  const progressPercent = monthlyTarget > 0 ? Math.min((totalMonthIncome / monthlyTarget) * 100, 100) : 0

  const annualLimit = settings.annualLimit || {}
  const regime = annualLimit.regime || 'MEI'
  const limit = Number(annualLimit.value) || (regime === 'MEI' ? 81600 : regime === 'Simples' ? 3600000 : 0)
  const currentYearTransactions = (settings.transactions || [])
    .filter((t) => t.type === 'income' && new Date(t.date).getFullYear() === new Date().getFullYear())
    .reduce((s, t) => s + Number(t.amount), 0)
  const annualProgress = limit > 0 ? Math.min((currentYearTransactions / limit) * 100, 100) : 0

  const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`

  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1) }
    else setSelectedMonth(selectedMonth - 1)
  }

  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1) }
    else setSelectedMonth(selectedMonth + 1)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Visão Geral</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <span className="text-sm font-medium text-slate-300 min-w-[120px] text-center capitalize">
            {monthName}
          </span>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Saldo Geral (Acumulado)</p>
              <p className={`text-2xl font-bold ${generalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(generalBalance)}
              </p>
            </div>
            <div className={`w-12 h-12 flex items-center justify-center rounded-industrial ${generalBalance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {generalBalance >= 0 ? (
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
          <p className="text-xl font-bold text-slate-100">{formatCurrency(totalMonthIncome)}</p>
          {recurringIncome > 0 && (
            <p className="text-xs text-emerald-500 mt-1">+ {formatCurrency(recurringIncome)} recorrentes</p>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
          <p className="text-sm text-slate-400">Despesas</p>
          <p className="text-xl font-bold text-slate-100">{formatCurrency(totalMonthExpense)}</p>
          {recurringExpense > 0 && (
            <p className="text-xs text-red-500 mt-1">+ {formatCurrency(recurringExpense)} recorrentes</p>
          )}
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
          {progressPercent.toFixed(1)}% atingido ({formatCurrency(totalMonthIncome)})
        </p>
      </div>

      {limit > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-red-500/10">
                <DollarSign className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-slate-100">Limite Anual {regime}</p>
                <p className="text-sm text-slate-400">{formatCurrency(currentYearTransactions)} de {formatCurrency(limit)}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-red-500">{annualProgress.toFixed(1)}%</p>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${annualProgress >= 90 ? 'bg-red-500' : annualProgress >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${annualProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-14 flex items-center justify-center gap-2 text-sm font-bold text-slate-100 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700 transition-colors"
          >
            <Link2 className="w-5 h-5 text-amber-500" />
            {link.label}
          </a>
        ))}
      </div>

      <button
        onClick={() => setShowLinks(true)}
        className="w-full h-14 flex items-center justify-center gap-2 text-sm font-bold text-slate-100 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700 transition-colors"
      >
        <Link2 className="w-5 h-5" />
        Links Úteis
      </button>

      {reminder.enabled && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-panel shadow-stamped flex items-center gap-3">
          <Bell className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-sm font-bold text-amber-500">Lembrete Mensal</p>
            <p className="text-sm text-slate-300">{reminder.text || 'Verificar pendências mensais'}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <h3 className="font-bold text-slate-100 mb-3">Transações do Mês</h3>
        {monthTransactions.length === 0 && activeRecurring.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <p className="text-slate-400">Nenhuma transação este mês</p>
            <p className="text-xs text-slate-500 mt-1">Clique em Receita ou Despesa para adicionar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeRecurring.map((t, i) => (
              <div key={`r-${i}`} className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-industrial">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-industrial bg-amber-500/10`}>
                    <Repeat className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{t.description}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Repeat className="w-3 h-3" />
                      Recorrente · {t.account} · x{t.multiplier || 1}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount) * (t.multiplier || 1))}
                </span>
              </div>
            ))}
            {monthTransactions.map((t, i) => (
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
            const newTransactions = [...allTransactions, { ...tx, id: Date.now() }]
            updateSettings.mutate({ transactions: newTransactions })
          }}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          accounts={accounts}
          recurringTransactions={recurringTransactions}
          onSaveRecurring={(newRecurring) => {
            updateSettings.mutate({ transactions: newRecurring })
          }}
        />
      )}

      {showLinks && (
        <LinksModal
          links={links}
          onClose={() => setShowLinks(false)}
          onSave={(newLinks) => updateSettings.mutate({ usefulLinks: newLinks })}
        />
      )}
    </div>
  )
}

function TransactionModal({ type, onClose, onSave, expenseCategories, incomeCategories, accounts, recurringTransactions, onSaveRecurring }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [account, setAccount] = useState(accounts[0] || 'Carteira')
  const [category, setCategory] = useState('')
  const [repeatMonths, setRepeatMonths] = useState(1)

  const categories = type === 'expense' ? expenseCategories : incomeCategories

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount || !category) return

    if (repeatMonths > 1) {
      const baseDate = new Date(date)
      const newRecurring = []
      for (let i = 0; i < repeatMonths; i++) {
        const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate())
        newRecurring.push({
          id: Date.now() + i,
          type,
          description: description.trim(),
          amount: Number(amount),
          date: monthDate.toISOString(),
          account,
          category,
          recurring: true,
          multiplier: 1,
          startDate: monthDate.toISOString(),
        })
      }
      onSaveRecurring([...recurringTransactions, ...newRecurring])
    } else {
      onSave({
        type,
        description: description.trim(),
        amount: Number(amount),
        date: new Date(date).toISOString(),
        account,
        category,
        recurring: false,
        multiplier: 1,
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-100">
            {type === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa'}
          </h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600 transition-colors">
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
                {accounts.map((acc) => (
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
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600 rounded-industrial">
            <input
              type="checkbox"
              id="repeatLanc"
              checked={repeatMonths > 1}
              onChange={(e) => setRepeatMonths(e.target.checked ? 2 : 1)}
              className="w-5 h-5 accent-amber-500"
            />
            <label htmlFor="repeatLanc" className="flex items-center gap-2 text-sm font-medium text-slate-200 cursor-pointer">
              <Repeat className="w-4 h-4" />
              Repetir lançamento?
            </label>
          </div>
          {repeatMonths > 1 && (
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-300">Por quantos meses?</label>
              <input
                type="number"
                value={repeatMonths}
                onChange={(e) => setRepeatMonths(Math.max(2, Math.min(12, Number(e.target.value))))}
                min="2"
                max="12"
                className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-xs text-slate-500 mt-1">Lançamento será multiplicado por {repeatMonths} meses</p>
            </div>
          )}
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

function LinksModal({ links, onClose, onSave }) {
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const allLinks = [...USEFUL_LINKS, ...links]

  const handleAdd = () => {
    if (!newLabel.trim() || !newUrl.trim()) return
    onSave([...links, { label: newLabel.trim(), url: newUrl.trim() }])
    setNewLabel('')
    setNewUrl('')
  }

  const handleOpen = (url) => {
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h3 className="font-bold text-slate-100">Links Úteis</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600 transition-colors">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {allLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => handleOpen(link.url)}
              className="w-full h-12 px-3 flex items-center gap-3 text-sm font-medium text-slate-200 bg-slate-700 border border-slate-600 rounded-industrial hover:bg-slate-600 transition-colors"
            >
              <Link2 className="w-4 h-4 text-amber-500" />
              {link.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700 space-y-3 flex-shrink-0">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Nome do link"
            className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
            className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleAdd}
            className="w-full h-12 flex items-center justify-center gap-2 text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors"
          >
            + Adicionar Link Personalizado
          </button>
        </div>
      </div>
    </div>
  )
}
