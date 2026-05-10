import { useState } from 'react'
import { useProfile, useUpdateSettings, useUpdateProfile } from '../../hooks/useProfile'
import { CatalogManager } from '../form/CatalogManager'
import { PricingSettings } from '../form/PricingSettings'
import { ReferralDashboard } from '../form/ReferralDashboard'
import { UpgradePlan } from '../form/UpgradePlan'
import { Phone, Mail, AlertCircle, Bookmark, Crown, Zap, ChevronRight, Clock, TrendingUp, Calculator, Gift, Tag, Wallet, Bell, Link2, X, Plus, FileText, User } from 'lucide-react'

const DEFAULT_EXPENSE_CATEGORIES = ['Gasolina', 'Alimentação', 'Material de Montagem', 'Manutenção Ferramentas', 'Internet', 'Telefone', 'Marketing', 'Outros']
const DEFAULT_INCOME_CATEGORIES = ['Serviço Montagem', 'Serviço Instalação', 'Serviço Avulso', 'Receita Extra']
const DEFAULT_ACCOUNTS = ['Carteira', 'Conta Banco', 'Pix']

const REGIMES = [
  { value: 'MEI', label: 'MEI', limit: 81600 },
  { value: 'Simples', label: 'Simples Nacional', limit: 3600000 },
  { value: 'Presumido', label: 'Lucro Presumido', limit: 0 },
  { value: 'Real', label: 'Lucro Real', limit: 0 },
]

export function SettingsTab() {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const [showView, setShowView] = useState(null)
  const [showCategories, setShowCategories] = useState(false)
  const [showAccounts, setShowAccounts] = useState(false)
  const [showLimits, setShowLimits] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [showWarranty, setShowWarranty] = useState(false)

  if (showView === 'catalog') {
    return <CatalogManager onClose={() => setShowView(null)} />
  }

  if (showView === 'pricing') {
    return <PricingSettings onClose={() => setShowView(null)} />
  }

  if (showView === 'referral') {
    return <ReferralDashboard onBack={() => setShowView(null)} />
  }

  if (showView === 'upgrade') {
    return <UpgradePlan onBack={() => setShowView(null)} />
  }

  if (showView === 'profile') {
    return <ProfileManager onClose={() => setShowView(null)} />
  }

  if (showCategories) {
    return <CategoriesManager onClose={() => setShowCategories(false)} />
  }

  if (showAccounts) {
    return <AccountsManager onClose={() => setShowAccounts(false)} />
  }

  if (showLimits) {
    return <LimitsManager onClose={() => setShowLimits(false)} />
  }

  if (showReminder) {
    return <ReminderManager onClose={() => setShowReminder(false)} />
  }

  if (showWarranty) {
    return <WarrantyManager onClose={() => setShowWarranty(false)} />
  }

  const settings = profile?.settings || {}
  const pricing = settings.pricing || {}
  const catalogServices = profile?.settings?.catalogServices?.length || 0
  const catalogParts = profile?.settings?.catalogParts?.length || 0
  const expenseCats = (settings.expenseCategories || DEFAULT_EXPENSE_CATEGORIES).length
  const incomeCats = (settings.incomeCategories || DEFAULT_INCOME_CATEGORIES).length
  const accounts = (settings.accounts || DEFAULT_ACCOUNTS).length
  const annualLimit = settings.annualLimit || {}
  const reminder = settings.monthlyReminder || {}
  const warranty = settings.warranty || {}

  const calculateHourlyRate = () => {
    const das = Number(pricing.dasValue) || 0
    const proLabore = Number(pricing.proLabore) || 0
    const fixedCosts = Number(pricing.fixedCosts) || 0
    const profitMargin = Number(pricing.profitMargin) || 0
    const days = Number(pricing.workDays) || 22
    const hours = Number(pricing.workHours) || 8
    return days * hours > 0 ? (das + proLabore + fixedCosts) * (1 + profitMargin / 100) / (days * hours) : 0
  }

  const hourlyRate = calculateHourlyRate()

  const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <h2 className="text-lg font-bold text-slate-100">Ajustes</h2>

      <div className="bg-slate-800 border-2 border-amber-500 rounded-panel shadow-stamped p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-amber-500 uppercase tracking-wide">Ferramenta Principal</span>
        </div>

        <p className="text-sm text-slate-300 mb-4">
          Descubra o valor real da sua hora de trabalho e nunca mais tenha prejuízo.
        </p>

        <div className="bg-slate-950/50 border border-slate-700 rounded-industrial p-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Valor da sua hora</p>
            <p className="text-4xl font-bold text-amber-500">
              {hourlyRate > 0 ? formatCurrency(hourlyRate) : 'R$ 0,00'}
            </p>
            <p className="text-xs text-slate-500 mt-1">com lucro incluso</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-slate-700/50 rounded-industrial">
            <p className="text-lg font-bold text-slate-100">{Number(pricing.workDays) || 22}</p>
            <p className="text-xs text-slate-400">dias/mês</p>
          </div>
          <div className="text-center p-2 bg-slate-700/50 rounded-industrial">
            <p className="text-lg font-bold text-slate-100">{Number(pricing.workHours) || 8}h</p>
            <p className="text-xs text-slate-400">horas/dia</p>
          </div>
          <div className="text-center p-2 bg-slate-700/50 rounded-industrial">
            <p className="text-lg font-bold text-slate-100">{Number(pricing.profitMargin) || 0}%</p>
            <p className="text-xs text-slate-400">lucro</p>
          </div>
        </div>

        <button
          onClick={() => setShowView('pricing')}
          className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all"
        >
          <Calculator className="w-5 h-5" />
          {hourlyRate > 0 ? 'Editar Precificação' : 'Configurar Precificação'}
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 flex items-center justify-center rounded-industrial ${
            profile?.status === 'active' ? 'bg-amber-500/10' : 'bg-blue-500/10'
          }`}>
            <Crown className={`w-6 h-6 ${profile?.status === 'active' ? 'text-amber-500' : 'text-blue-400'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-100 capitalize">{profile?.status || 'Trial'}</p>
              {profile?.status !== 'active' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">Em Teste</span>
              )}
            </div>
            {profile?.status !== 'active' ? (
              <p className="text-sm text-slate-400">
                Aproveite o período de teste e configure sua precificação
              </p>
            ) : (
              <p className="text-sm text-emerald-500">Assinatura ativa - Acesso ilimitado</p>
            )}
          </div>
        </div>
        {profile?.status !== 'active' && (
          <button
            onClick={() => setShowView('upgrade')}
            className="w-full mt-4 h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            Fazer Upgrade
          </button>
        )}
      </div>

      <button
        onClick={() => setShowView('referral')}
        className="w-full flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-emerald-500/10">
          <Gift className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-slate-100">Indique e Ganhe</p>
          <p className="text-sm text-slate-400">Compartilhe e receba recompensas</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setShowView('catalog')}
          className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-amber-500/10">
            <Bookmark className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-slate-100">Catálogo</p>
            <p className="text-sm text-slate-400">
              {catalogServices + catalogParts > 0
                ? `${catalogServices} serviços, ${catalogParts} peças`
                : 'Cadastre seus padrões'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>

        <button
          onClick={() => setShowLimits(true)}
          className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-red-500/10">
            <Wallet className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-slate-100">Limite Anual</p>
            <p className="text-sm text-slate-400">
              {annualLimit.regime ? `${annualLimit.regime} · ${annualLimit.value ? `R$ ${Number(annualLimit.value).toFixed(2).replace('.', ',')}` : 'não definido'}` : 'Configure seu regime'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setShowCategories(true)}
          className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-purple-500/10">
            <Tag className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-slate-100">Categorias</p>
            <p className="text-sm text-slate-400">{expenseCats} despesas · {incomeCats} receitas</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>

        <button
          onClick={() => setShowAccounts(true)}
          className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-cyan-500/10">
            <Wallet className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-slate-100">Contas</p>
            <p className="text-sm text-slate-400">{accounts} contas configuradas</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <button
        onClick={() => setShowReminder(true)}
        className="w-full flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-amber-500/10">
          <Bell className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-slate-100">Lembrete Mensal</p>
          <p className="text-sm text-slate-400">
            {reminder.enabled ? reminder.text || 'Lembrete ativo' : 'Configure um lembrete mensal'}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </button>

      <button
        onClick={() => setShowWarranty(true)}
        className="w-full flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-emerald-500/10">
          <FileText className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-slate-100">Texto de Garantia PDF</p>
          <p className="text-sm text-slate-400">Personalize o Termo de Garantia</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </button>

      <button
        onClick={() => setShowView('profile')}
        className="w-full flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped hover:bg-slate-700/50 transition-colors"
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-amber-500/10">
          <User className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-slate-100">Dados Pessoais</p>
          <p className="text-sm text-slate-400">Nome, telefone e foto de perfil</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </button>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-slate-700">
          <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700">
            <Phone className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">WhatsApp</p>
            <p className="font-medium text-slate-100">{profile?.phone ? `(${profile.phone.slice(0,2)}) ${profile.phone.slice(2,7)}-${profile.phone.slice(7)}` : 'Não cadastrado'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700">
            <Mail className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">Email</p>
            <p className="font-medium text-slate-100">{profile?.email || 'Carregando...'}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-blue-500/10">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-100">Sobre o App</p>
            <p className="text-sm text-slate-400">Montador Pro v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoriesManager({ onClose }) {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const settings = profile?.settings || {}
  const [expenseCats, setExpenseCats] = useState(settings.expenseCategories || DEFAULT_EXPENSE_CATEGORIES)
  const [incomeCats, setIncomeCats] = useState(settings.incomeCategories || DEFAULT_INCOME_CATEGORIES)
  const [newExpense, setNewExpense] = useState('')
  const [newIncome, setNewIncome] = useState('')

  const save = () => {
    updateSettings.mutate({ expenseCategories: expenseCats, incomeCategories: incomeCats })
    onClose()
  }

  const addExpense = () => {
    if (newExpense.trim() && !expenseCats.includes(newExpense.trim())) {
      setExpenseCats([...expenseCats, newExpense.trim()])
      setNewExpense('')
    }
  }

  const addIncome = () => {
    if (newIncome.trim() && !incomeCats.includes(newIncome.trim())) {
      setIncomeCats([...incomeCats, newIncome.trim()])
      setNewIncome('')
    }
  }

  const removeExpense = (cat) => setExpenseCats(expenseCats.filter((c) => c !== cat))
  const removeIncome = (cat) => setIncomeCats(incomeCats.filter((c) => c !== cat))

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Categorias</h2>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700">
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <h3 className="font-bold text-slate-100 mb-3">Despesas</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {expenseCats.map((cat) => (
            <button key={cat} onClick={() => removeExpense(cat)} className="h-9 px-3 flex items-center gap-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-industrial hover:bg-red-500/20 transition-colors">
              {cat}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newExpense} onChange={(e) => setNewExpense(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addExpense()} placeholder="Nova categoria de despesa" className="flex-1 h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
          <button onClick={addExpense} className="h-12 px-4 flex items-center justify-center text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <h3 className="font-bold text-slate-100 mb-3">Receitas</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {incomeCats.map((cat) => (
            <button key={cat} onClick={() => removeIncome(cat)} className="h-9 px-3 flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-industrial hover:bg-emerald-500/20 transition-colors">
              {cat}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newIncome} onChange={(e) => setNewIncome(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addIncome()} placeholder="Nova categoria de receita" className="flex-1 h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
          <button onClick={addIncome} className="h-12 px-4 flex items-center justify-center text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <button onClick={save} className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
        Salvar Alterações
      </button>
    </div>
  )
}

function AccountsManager({ onClose }) {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const settings = profile?.settings || {}
  const [accounts, setAccounts] = useState(settings.accounts || DEFAULT_ACCOUNTS)
  const [newAccount, setNewAccount] = useState('')

  const save = () => {
    updateSettings.mutate({ accounts })
    onClose()
  }

  const addAccount = () => {
    if (newAccount.trim() && !accounts.includes(newAccount.trim())) {
      setAccounts([...accounts, newAccount.trim()])
      setNewAccount('')
    }
  }

  const removeAccount = (acc) => setAccounts(accounts.filter((a) => a !== acc))

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Contas e Carteiras</h2>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700">
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <h3 className="font-bold text-slate-100 mb-3">Suas Contas</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {accounts.map((acc) => (
            <button key={acc} onClick={() => removeAccount(acc)} className="h-9 px-3 flex items-center gap-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-industrial hover:bg-cyan-500/20 transition-colors">
              <Wallet className="w-3 h-3" />
              {acc}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newAccount} onChange={(e) => setNewAccount(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addAccount()} placeholder="Ex: Nubank, CEF, BTG+" className="flex-1 h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
          <button onClick={addAccount} className="h-12 px-4 flex items-center justify-center text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <button onClick={save} className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
        Salvar Alterações
      </button>
    </div>
  )
}

function LimitsManager({ onClose }) {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const settings = profile?.settings || {}
  const annualLimit = settings.annualLimit || {}
  const [regime, setRegime] = useState(annualLimit.regime || 'MEI')
  const [customLimit, setCustomLimit] = useState(annualLimit.value || '')

  const selectedRegime = REGIMES.find((r) => r.value === regime) || REGIMES[0]

  const save = () => {
    updateSettings.mutate({ annualLimit: { regime, value: customLimit ? Number(customLimit) : selectedRegime.limit } })
    onClose()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Limite Anual de Faturamento</h2>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700">
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <p className="text-sm text-slate-400 mb-3">Escolha seu regime tributário para acompanhamento do limite anual.</p>
        <div className="grid grid-cols-2 gap-2">
          {REGIMES.map((r) => (
            <button
              key={r.value}
              onClick={() => { setRegime(r.value); if (!customLimit) setCustomLimit(r.limit) }}
              className={`h-12 px-3 text-sm font-medium rounded-industrial border transition-all ${
                regime === r.value
                  ? 'text-slate-950 bg-amber-500 border-amber-500 shadow-stamped'
                  : 'text-slate-300 bg-slate-700 border-slate-600 hover:bg-slate-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-slate-100">Valor do Limite</p>
          {selectedRegime.limit > 0 && (
            <span className="text-xs text-slate-400">{regime === 'MEI' ? 'Atualizado 2026' : regime === 'Simples' ? 'Limite mensal R$ 300.000' : 'Sem limite padrão'}</span>
          )}
        </div>
        <input
          type="number"
          value={customLimit}
          onChange={(e) => setCustomLimit(e.target.value)}
          placeholder={String(selectedRegime.limit || '0')}
          min="0"
          className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        {customLimit && (
          <p className="text-sm text-slate-400 mt-2">
            Limite anual: <span className="font-bold text-slate-200">R$ {Number(customLimit).toFixed(2).replace('.', ',')}</span>
          </p>
        )}
      </div>

      <button onClick={save} className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
        Salvar Alterações
      </button>
    </div>
  )
}

function ReminderManager({ onClose }) {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const settings = profile?.settings || {}
  const reminder = settings.monthlyReminder || {}
  const [enabled, setEnabled] = useState(reminder.enabled ?? true)
  const [text, setText] = useState(reminder.text || '')

  const save = () => {
    updateSettings.mutate({ monthlyReminder: { enabled, text: text.trim() || 'Verificar pendências mensais' } })
    onClose()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Lembrete Mensal</h2>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700">
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="reminderEnabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-6 h-6 accent-amber-500"
          />
          <label htmlFor="reminderEnabled" className="flex items-center gap-2 font-bold text-slate-100 cursor-pointer">
            <Bell className="w-5 h-5 text-amber-500" />
            Ativar lembrete mensal
          </label>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
        <p className="text-sm text-slate-400 mb-3">Texto do lembrete exibido no topo do Dashboard.</p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Verificar DAS ate dia 20, coletar notas fiscais..."
          className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      <button onClick={save} className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
        Salvar Alteracoes
      </button>
    </div>
  )
}

function WarrantyManager({ onClose }) {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const settings = profile?.settings || {}
  const warranty = settings.warranty || {}

  const DEFAULT_INTRO = 'Certificamos que o servico de montagem realizado para o cliente [NOME DO CLIENTE] possui garantia tecnica de 90 (noventa) dias, a contar da data de realizacao do servico [DATA], conforme previsto no Codigo de Defesa do Consumidor.'
  const DEFAULT_COVERS = 'Falhas na execucao da montagem (ex: portas desalinhadas por falta de regulagem, pecas soltas).\nDanos causados diretamente pelo montador durante a execucao do servico.'
  const DEFAULT_NOT_COVERS = 'Defeitos de fabricacao do movel, pecas empenadas ou falta de ferragens na embalagem original.\nDanos causados por mau uso, umidade, infiltracoes ou uso de produtos de limpeza inadequados.\nDesalinhamentos futuros causados por piso irregular ou sobrecarga de peso.\nDanos causados se o movel for arrastado, mudado de lugar ou desmontado por terceiros.'

  const [intro, setIntro] = useState(warranty.intro || DEFAULT_INTRO)
  const [covers, setCovers] = useState((warranty.covers || []).join('\n') || DEFAULT_COVERS)
  const [notCovers, setNotCovers] = useState((warranty.notCovers || []).join('\n') || DEFAULT_NOT_COVERS)

  const save = () => {
    updateSettings.mutate({
      warranty: {
        intro: intro.trim(),
        covers: covers.split('\n').filter((l) => l.trim()),
        notCovers: notCovers.split('\n').filter((l) => l.trim()),
      },
    })
    onClose()
  }

  const reset = () => {
    setIntro(DEFAULT_INTRO)
    setCovers(DEFAULT_COVERS)
    setNotCovers(DEFAULT_NOT_COVERS)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Texto de Garantia PDF</h2>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700">
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      <p className="text-sm text-slate-400">Personalize o conteudo do Termo de Garantia gerado no PDF. Cada linha em "O que cobre" e "O que nao cobre" vira um bullet point.</p>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4 space-y-4">
        <div>
          <label className="block mb-2 text-sm font-bold text-slate-200">Texto de Introducao</label>
          <p className="text-xs text-slate-500 mb-2">Use [NOME DO CLIENTE] e [DATA] como variaveis.</p>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            placeholder="Texto de introducao..."
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-bold text-emerald-400">O que a Garantia Cobre</label>
          <p className="text-xs text-slate-500 mb-2">Um item por linha.</p>
          <textarea
            value={covers}
            onChange={(e) => setCovers(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            placeholder="Item 1..."
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-bold text-red-400">O que a Garantia NAO Cobre</label>
          <p className="text-xs text-slate-500 mb-2">Um item por linha.</p>
          <textarea
            value={notCovers}
            onChange={(e) => setNotCovers(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            placeholder="Item 1..."
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="h-12 px-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-industrial hover:bg-slate-600 transition-colors"
        >
          Restaurar Padrao
        </button>
        <button
          onClick={save}
          className="flex-1 h-12 flex items-center justify-center gap-2 text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors"
        >
          Salvar Alteracoes
        </button>
      </div>
    </div>
  )
}

function ProfileManager({ onClose }) {
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [address, setAddress] = useState(profile?.address || '')
  const [cnpj, setCnpj] = useState(profile?.cnpj || '')
  const [instagram, setInstagram] = useState(profile?.instagram || '')
  const [pixKey, setPixKey] = useState(profile?.pix_key || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile.mutateAsync({
        full_name: fullName.trim(),
        phone: phone.replace(/\D/g, ''),
        avatar_url: avatarUrl,
        address: address.trim(),
        cnpj: cnpj.replace(/\D/g, ''),
        instagram: instagram.replace('@', '').trim(),
        pix_key: pixKey.trim(),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarUrl(ev.target?.result || '')
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-24 mb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Dados Pessoais</h2>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-800 border border-slate-700 hover:bg-slate-700">
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      <div className="flex flex-col items-center mb-2">
        <label className="relative cursor-pointer group">
          <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-amber-500 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <span className="text-xs text-white font-medium">Alterar</span>
          </div>
          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </label>
        <p className="text-xs text-slate-500 mt-2">Foto de perfil</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4 space-y-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-300">Nome Completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-300">Telefone (WhatsApp)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3'))}
            className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-300">Endereco</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
            placeholder="Rua, numero, bairro, cidade"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-300">CNPJ</label>
          <input
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'))}
            className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
            placeholder="00.000.000/0000-00"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-300">Instagram</label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
            className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
            placeholder="seu_usuario"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-300">Chave Pix</label>
          <input
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500"
            placeholder="Email, CPF, telefone ou chave aleatoria"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors disabled:opacity-50"
      >
        {saving ? 'Salvando...' : 'Salvar Dados'}
      </button>
    </div>
  )
}
