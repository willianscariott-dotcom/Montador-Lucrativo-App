import { useState } from 'react'
import { useProfile, useUpdateSettings } from '../../hooks/useProfile'
import {
  TrendingUp, TrendingDown, Target, DollarSign, ArrowUpRight,
  ArrowDownRight, X, ChevronLeft, ChevronRight, Link2, Bell, Repeat, Eye, EyeOff,
  Pencil, Trash2, Settings2, SlidersHorizontal,
} from 'lucide-react'

const DEFAULT_EXPENSE_CATEGORIES = ['Gasolina', 'Alimentacao', 'Material de Montagem', 'Manutencao Ferramentas', 'Internet', 'Telefone', 'Marketing', 'Outros']
const DEFAULT_INCOME_CATEGORIES = ['Servico Montagem', 'Servico Instalacao', 'Servico Avulso', 'Receita Extra']
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
  const nonRecurringTransactions = (settings.transactions || []).filter((t) => t.recurring !== true)
  const recurringTransactions = (settings.transactions || []).filter((t) => t.recurring === true)
  const links = settings.usefulLinks || []
  const reminder = settings.monthlyReminder || {}
  const expenseCategories = settings.expenseCategories || DEFAULT_EXPENSE_CATEGORIES
  const incomeCategories = settings.incomeCategories || DEFAULT_INCOME_CATEGORIES
  const accounts = settings.accounts || DEFAULT_ACCOUNTS

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showModal, setShowModal] = useState(null)
  const [showLinks, setShowLinks] = useState(false)
  const [showFinanceSettings, setShowFinanceSettings] = useState(false)
  const [privacyMode, setPrivacyMode] = useState(false)

  const allTransactions = settings.transactions || []

  const monthTransactions = nonRecurringTransactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  const activeRecurring = recurringTransactions.filter((t) => {
    const d = new Date(t.startDate || t.date)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  const recurringIncome = activeRecurring
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0)

  const recurringExpense = activeRecurring
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

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

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const isFutureMonth = selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)
  const isPastMonth = selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth

  const progressPercent = monthlyTarget > 0 ? Math.min((totalMonthIncome / monthlyTarget) * 100, 100) : 0

  const metaBatida = totalMonthIncome >= monthlyTarget && monthlyTarget > 0
  const remainingToTarget = Math.max(0, monthlyTarget - totalMonthIncome)
  const daysPerMonth = Number(pricing.workDays) || 22
  const hoursPerDay = Number(pricing.workHours) || 8
  const hourlyRate = (() => {
    const das = Number(pricing.dasValue) || 0
    const proLabore = Number(pricing.proLabore) || 0
    const fixedCosts = Number(pricing.fixedCosts) || 0
    const profitMargin = Number(pricing.profitMargin) || 0
    return daysPerMonth * hoursPerDay > 0 ? (das + proLabore + fixedCosts) * (1 + profitMargin / 100) / (daysPerMonth * hoursPerDay) : 0
  })()
  const dailyGoal = hourlyRate * hoursPerDay
  const daysLeft = isCurrentMonth && dailyGoal > 0 ? Math.ceil(remainingToTarget / dailyGoal) : 0

  const annualLimit = settings.annualLimit || {}
  const regime = annualLimit.regime || 'MEI'
  const limit = Number(annualLimit.value) || (regime === 'MEI' ? 81600 : regime === 'Simples' ? 3600000 : 0)
  const currentYearTransactions = (settings.transactions || [])
    .filter((t) => t.type === 'income' && new Date(t.date).getFullYear() === new Date().getFullYear())
    .reduce((s, t) => s + Number(t.amount), 0)
  const annualProgress = limit > 0 ? Math.min((currentYearTransactions / limit) * 100, 100) : 0

  const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`

  const privacyClass = privacyMode ? 'blur-sm select-none' : ''

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
    <div className="max-w-7xl mx-auto space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-100">Visao Geral</h2>
          <button
            onClick={() => setShowFinanceSettings(true)}
            className="w-9 h-9 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Configuracoes Financeiras"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          </button>
        </div>
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
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
            title={privacyMode ? 'Mostrar valores' : 'Ocultar valores'}
          >
            {privacyMode ? <EyeOff className="w-5 h-5 text-amber-500" /> : <Eye className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Saldo do Mes</p>
              <p className={`text-2xl font-bold ${monthBalance >= 0 ? 'text-emerald-500' : 'text-red-500'} ${privacyClass}`}>
                {privacyMode ? 'R$ ***' : formatCurrency(monthBalance)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Balanco mensal - sem recorrentes</p>
            </div>
            <div className={`w-12 h-12 flex items-center justify-center rounded-industrial ${monthBalance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {monthBalance >= 0 ? (
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
          <p className="text-sm text-slate-400">Receitas do Mes</p>
          <p className={`text-xl font-bold text-slate-100 ${privacyClass}`}>
            {privacyMode ? 'R$ ***' : formatCurrency(totalMonthIncome)}
          </p>
          {recurringIncome > 0 && (
            <p className="text-xs text-emerald-500 mt-1">+ {privacyMode ? '***' : formatCurrency(recurringIncome)} recorrentes</p>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
          <p className="text-sm text-slate-400">Despesas do Mes</p>
          <p className={`text-xl font-bold text-slate-100 ${privacyClass}`}>
            {privacyMode ? 'R$ ***' : formatCurrency(totalMonthExpense)}
          </p>
          {recurringExpense > 0 && (
            <p className="text-xs text-red-500 mt-1">+ {privacyMode ? '***' : formatCurrency(recurringExpense)} recorrentes</p>
          )}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-emerald-500/10">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-slate-100">Saldo Geral (Acumulado)</p>
              <p className="text-sm text-slate-400">Todas receitas - despesas de todos os meses</p>
            </div>
          </div>
          <p className={`text-xl font-bold ${generalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'} ${privacyClass}`}>
            {privacyMode ? 'R$ ***' : formatCurrency(generalBalance)}
          </p>
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
              <p className="text-sm text-slate-400">Baseado na sua precificacao</p>
            </div>
          </div>
          <p className={`text-sm font-bold text-amber-500 ${privacyClass}`}>
            {privacyMode ? '***' : formatCurrency(monthlyTarget)}
          </p>
        </div>

        {isFutureMonth ? (
          <div className="flex items-center justify-center py-4">
            <p className="text-sm text-slate-500 italic">Mes Futuro - Meta nao aplicavel</p>
          </div>
        ) : (
          <>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${metaBatida ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className={`text-sm text-slate-400 mt-2 text-right ${privacyClass}`}>
              {privacyMode ? '***' : `${progressPercent.toFixed(1)}% atingido (${formatCurrency(totalMonthIncome)})`}
            </p>
            {metaBatida ? (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-industrial">
                <p className="text-center font-bold text-emerald-400 text-sm">Parabens! Voce bateu a meta do mes!</p>
              </div>
            ) : isCurrentMonth && daysLeft > 0 ? (
              <p className="text-sm text-slate-500 mt-2 text-center">
                Faltam aprox. <span className="font-bold text-amber-500">{daysLeft}</span> dias de trabalho
              </p>
            ) : isPastMonth ? (
              <p className="text-sm text-slate-500 mt-2 text-center">
                Fechamento do Mes - {progressPercent.toFixed(1)}% atingido
              </p>
            ) : null}
          </>
        )}
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
                <p className={`text-sm text-slate-400 ${privacyClass}`}>
                  {privacyMode ? '*** de ***' : `${formatCurrency(currentYearTransactions)} de ${formatCurrency(limit)}`}
                </p>
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
            <p className="text-sm text-slate-300">{reminder.text || 'Verificar pendencias mensais'}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <h3 className="font-bold text-slate-100 mb-3">Transacoes do Mes</h3>
        {monthTransactions.length === 0 && activeRecurring.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <p className="text-slate-400">Nenhuma transação este mês</p>
            <p className="text-xs text-slate-500 mt-1">Clique em Receita ou Despesa para adicionar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeRecurring.map((t, i) => {
              const globalIndex = allTransactions.findIndex((tx) => tx.id === t.id)
              return (
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
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount) * (t.multiplier || 1))}
                  </span>
                  <button onClick={() => setShowModal({ type: t.type, editingTx: t, _globalIndex: globalIndex })} className="w-8 h-8 flex items-center justify-center rounded-industrial bg-slate-600 hover:bg-slate-500 transition-colors">
                    <Pencil className="w-3 h-3 text-slate-300" />
                  </button>
                  <button onClick={() => {
                    const updated = allTransactions.filter((tx) => tx.id !== t.id)
                    updateSettings.mutate({ transactions: updated })
                  }} className="w-8 h-8 flex items-center justify-center rounded-industrial bg-red-500/10 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
              )
            })}
            {monthTransactions.map((t, i) => {
              const globalIndex = allTransactions.findIndex((tx) => tx.id === t.id)
              return (
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
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                  <button onClick={() => setShowModal({ type: t.type, editingTx: t, _globalIndex: globalIndex })} className="w-8 h-8 flex items-center justify-center rounded-industrial bg-slate-600 hover:bg-slate-500 transition-colors">
                    <Pencil className="w-3 h-3 text-slate-300" />
                  </button>
                  <button onClick={() => {
                    const updated = allTransactions.filter((tx) => tx.id !== t.id)
                    updateSettings.mutate({ transactions: updated })
                  }} className="w-8 h-8 flex items-center justify-center rounded-industrial bg-red-500/10 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal
          type={showModal}
          editingTx={showModal.editingTx}
          onClose={() => setShowModal(null)}
          onSave={(tx) => {
            if (tx._editIndex !== undefined) {
              const updated = [...allTransactions]
              updated[tx._editIndex] = { ...tx }
              delete updated[tx._editIndex]._editIndex
              updateSettings.mutate({ transactions: updated })
            } else {
              updateSettings.mutate({ transactions: [...allTransactions, { ...tx, id: Date.now() }] })
            }
          }}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          accounts={accounts}
          onDelete={(index) => {
            const updated = allTransactions.filter((_, i) => i !== index)
            updateSettings.mutate({ transactions: updated })
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

      {showFinanceSettings && (
        <FinanceSettingsModal
          settings={settings}
          onClose={() => setShowFinanceSettings(false)}
          onSave={(updates) => updateSettings.mutate(updates)}
        />
      )}
    </div>
  )
}

function FinanceSettingsModal({ settings, onClose, onSave }) {
  const expenseCategories = settings.expenseCategories || DEFAULT_EXPENSE_CATEGORIES
  const incomeCategories = settings.incomeCategories || DEFAULT_INCOME_CATEGORIES
  const accounts = settings.accounts || DEFAULT_ACCOUNTS

  const [expenseCats, setExpenseCats] = useState(expenseCategories)
  const [incomeCats, setIncomeCats] = useState(incomeCategories)
  const [accs, setAccs] = useState(accounts)
  const [newExpense, setNewExpense] = useState('')
  const [newIncome, setNewIncome] = useState('')
  const [newAcc, setNewAcc] = useState('')
  const [tab, setTab] = useState('accounts')

  const save = () => {
    onSave({ expenseCategories: expenseCats, incomeCategories: incomeCats, accounts: accs })
    onClose()
  }

  const addExpense = () => {
    if (newExpense.trim() && !expenseCats.includes(newExpense.trim())) {
      setExpenseCats([...expenseCats, newExpense.trim()])
      setNewExpense('')
    }
  }
  const removeExpense = (cat) => setExpenseCats(expenseCats.filter((c) => c !== cat))
  const addIncome = () => {
    if (newIncome.trim() && !incomeCats.includes(newIncome.trim())) {
      setIncomeCats([...incomeCats, newIncome.trim()])
      setNewIncome('')
    }
  }
  const removeIncome = (cat) => setIncomeCats(incomeCats.filter((c) => c !== cat))
  const addAcc = () => {
    if (newAcc.trim() && !accs.includes(newAcc.trim())) {
      setAccs([...accs, newAcc.trim()])
      setNewAcc('')
    }
  }
  const removeAcc = (acc) => setAccs(accs.filter((a) => a !== acc))

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h3 className="font-bold text-slate-100">Config Financeiras</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <div className="flex border-b border-slate-700 flex-shrink-0">
          <button onClick={() => setTab('accounts')} className={`flex-1 h-10 text-xs font-medium transition-colors ${tab === 'accounts' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>Contas</button>
          <button onClick={() => setTab('categories')} className={`flex-1 h-10 text-xs font-medium transition-colors ${tab === 'categories' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>Categorias</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {tab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {accs.map((acc) => (
                  <button key={acc} onClick={() => removeAcc(acc)} className="h-9 px-3 flex items-center gap-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-industrial hover:bg-cyan-500/20">
                    <DollarSign className="w-3 h-3" />{acc}<X className="w-3 h-3" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newAcc} onChange={(e) => setNewAcc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addAcc()} placeholder="Nova conta" className="flex-1 h-10 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
                <button onClick={addAcc} className="h-10 px-4 flex items-center justify-center text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400">+</button>
              </div>
            </div>
          )}
          {tab === 'categories' && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-slate-200 mb-2">Despesas</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {expenseCats.map((cat) => (
                    <button key={cat} onClick={() => removeExpense(cat)} className="h-8 px-2 flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-industrial hover:bg-red-500/20">
                      {cat}<X className="w-2 h-2" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newExpense} onChange={(e) => setNewExpense(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addExpense()} placeholder="Nova categoria despesa" className="flex-1 h-10 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
                  <button onClick={addExpense} className="h-10 px-4 flex items-center justify-center text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400">+</button>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200 mb-2">Receitas</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {incomeCats.map((cat) => (
                    <button key={cat} onClick={() => removeIncome(cat)} className="h-8 px-2 flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-industrial hover:bg-emerald-500/20">
                      {cat}<X className="w-2 h-2" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newIncome} onChange={(e) => setNewIncome(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addIncome()} placeholder="Nova categoria receita" className="flex-1 h-10 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
                  <button onClick={addIncome} className="h-10 px-4 flex items-center justify-center text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400">+</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <button onClick={save} className="w-full h-12 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors m-4 mt-0 flex-shrink-0">
          Salvar Alteracoes
        </button>
      </div>
    </div>
  )
}

function TransactionModal({ type, onClose, onSave, expenseCategories, incomeCategories, accounts, editingTx }) {
  const [description, setDescription] = useState(editingTx?.description || '')
  const [amount, setAmount] = useState(editingTx ? String(editingTx.amount) : '')
  const [date, setDate] = useState(editingTx ? editingTx.date?.split('T')[0] : new Date().toISOString().split('T')[0])
  const [account, setAccount] = useState(editingTx?.account || accounts[0] || 'Carteira')
  const [category, setCategory] = useState(editingTx?.category || '')
  const [repeatMonths, setRepeatMonths] = useState(editingTx?.recurring ? 2 : 1)

  const isEditing = !!editingTx
  const modalType = typeof type === 'object' ? type.type : type
  const globalIndex = typeof type === 'object' ? type._globalIndex : undefined
  const categories = modalType === 'expense' ? expenseCategories : incomeCategories

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount || !category) return

    if (isEditing && repeatMonths <= 1) {
      onSave({
        ...editingTx,
        type: modalType,
        description: description.trim(),
        amount: Number(amount),
        date: new Date(date).toISOString(),
        account,
        category,
        recurring: false,
        multiplier: 1,
      })
      onClose()
      return
    }

    const baseDate = new Date(date)
    if (repeatMonths > 1) {
      for (let i = 0; i < repeatMonths; i++) {
        const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate())
        onSave({
          id: isEditing ? editingTx.id : Date.now() + i,
          type: modalType,
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
    } else {
      onSave({
        type: modalType,
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
            {isEditing ? 'Editar Transacao' : modalType === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa'}
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
              placeholder={modalType === 'income' ? 'Ex: Instalação de esquadria' : 'Ex: Material de construção'}
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
{isEditing ? null : (
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
                Repetir lancamento?
              </label>
            </div>
          )}
          {isEditing ? null : repeatMonths > 1 && (
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
              <p className="text-xs text-slate-500 mt-1">Lancamento sera multiplicado por {repeatMonths} meses</p>
            </div>
          )}
          <button
            type="submit"
            className={`w-full h-14 flex items-center justify-center gap-2 text-base font-bold rounded-industrial shadow-stamped transition-all ${
              modalType === 'income'
                ? 'text-slate-950 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600'
                : 'text-slate-100 bg-red-500 hover:bg-red-400 active:bg-red-600'
            }`}
          >
            {isEditing ? 'Salvar Alteracoes' : modalType === 'income' ? '+ Adicionar Receita' : '+ Adicionar Despesa'}
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
