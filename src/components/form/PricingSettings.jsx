import { useState } from 'react'
import { useProfile, useUpdateSettings } from '../../hooks/useProfile'
import { Calculator, Percent, DollarSign, Calendar, Clock, Building2, X } from 'lucide-react'

export function PricingSettings({ onClose }) {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const settings = profile?.settings || {}
  const pricing = settings.pricing || {}

  const [form, setForm] = useState({
    regime: pricing.regime || 'mei',
    dasValue: pricing.dasValue || '',
    proLabore: pricing.proLabore || '',
    fixedCosts: pricing.fixedCosts || '',
    profitMargin: pricing.profitMargin || '',
    workDays: pricing.workDays || '22',
    workHours: pricing.workHours || '8',
  })
  const [saving, setSaving] = useState(false)

  const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const calculateHourlyRate = () => {
    const das = Number(form.dasValue) || 0
    const proLabore = Number(form.proLabore) || 0
    const fixedCosts = Number(form.fixedCosts) || 0
    const profitMargin = Number(form.profitMargin) || 0
    const days = Number(form.workDays) || 22
    const hours = Number(form.workHours) || 8
    const hourlyRate = days * hours > 0 ? (das + proLabore + fixedCosts) * (1 + profitMargin / 100) / (days * hours) : 0
    return hourlyRate
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings.mutateAsync({
        pricing: {
          ...form,
          dasValue: Number(form.dasValue),
          proLabore: Number(form.proLabore),
          fixedCosts: Number(form.fixedCosts),
          profitMargin: Number(form.profitMargin),
          workDays: Number(form.workDays),
          workHours: Number(form.workHours),
        },
      })
      if (onClose) onClose()
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const hourlyRate = calculateHourlyRate()
  const formatCurrency = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`

  const monthlyGross = (Number(form.dasValue) || 0) + (Number(form.proLabore) || 0) + (Number(form.fixedCosts) || 0)
  const monthlyNet = monthlyGross * (1 + (Number(form.profitMargin) || 0) / 100)
  const profitValue = monthlyNet - monthlyGross
  const totalHours = (Number(form.workDays) || 22) * (Number(form.workHours) || 8)

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
          <h2 className="text-xl font-bold text-slate-100">Precificacao</h2>
          <p className="text-sm text-slate-400">Configure seus custos para calcular o valor/hora</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-amber-500/10">
                <Building2 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Regime Tributario</h3>
                <p className="text-sm text-slate-400">Selecione seu regime fiscal</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[{ id: 'mei', label: 'MEI' }, { id: 'simples', label: 'Simples Nacional' }, { id: 'outro', label: 'Outro' }].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setForm((p) => ({ ...p, regime: r.id }))}
                  className={`flex-1 h-12 rounded-industrial font-medium text-sm transition-colors ${
                    form.regime === r.id
                      ? 'bg-amber-500 text-slate-950 shadow-stamped'
                      : 'bg-slate-700 text-slate-300 border border-slate-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
            <h3 className="font-bold text-slate-100 mb-4">Custos Mensais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-300">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  DAS / Imposto (R$)
                </label>
                <input
                  type="number"
                  value={form.dasValue}
                  onChange={updateField('dasValue')}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-300">
                  Pro-labore (R$)
                </label>
                <input
                  type="number"
                  value={form.proLabore}
                  onChange={updateField('proLabore')}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-300">
                  Custos Fixos (R$)
                </label>
                <input
                  type="number"
                  value={form.fixedCosts}
                  onChange={updateField('fixedCosts')}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-300">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Meta de Lucro (%)
                </label>
                <input
                  type="number"
                  value={form.profitMargin}
                  onChange={updateField('profitMargin')}
                  placeholder="30"
                  min="0"
                  max="200"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-panel shadow-stamped p-4">
            <h3 className="font-bold text-slate-100 mb-4">Jornada de Trabalho</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-300">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Dias Trabalhados/Mes
                </label>
                <input
                  type="number"
                  value={form.workDays}
                  onChange={updateField('workDays')}
                  placeholder="22"
                  min="1"
                  max="31"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-300">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horas/Dia
                </label>
                <input
                  type="number"
                  value={form.workHours}
                  onChange={updateField('workHours')}
                  placeholder="8"
                  min="1"
                  max="24"
                  className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-800 border-2 border-amber-500 rounded-panel shadow-stamped p-4 sticky top-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-emerald-500/10">
                <Calculator className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Valor/Hora</h3>
                <p className="text-sm text-slate-400">Com lucro incluso</p>
              </div>
            </div>

            <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-panel mb-4">
              <p className="text-3xl font-bold text-emerald-500">
                {formatCurrency(hourlyRate)}
              </p>
              <p className="text-sm text-slate-400 mt-1">por hora</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Custo mensal:</span>
                <span className="text-slate-200">{formatCurrency(monthlyGross)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Margem de lucro:</span>
                <span className="text-amber-500 font-bold">{form.profitMargin || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor de lucro/mês:</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(profitValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total c/ lucro:</span>
                <span className="text-amber-500">{formatCurrency(monthlyNet)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Horas/mes:</span>
                <span className="text-slate-200">{totalHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Custo/hora (sem lucro):</span>
                <span className="text-slate-200">{totalHours > 0 ? formatCurrency(monthlyGross / totalHours) : '-'}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4 h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Precificacao'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
