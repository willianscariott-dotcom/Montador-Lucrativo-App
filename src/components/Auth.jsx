import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'

function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 13
}

export function LoginPage({ onSwitch }) {
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
      setSession(data.session)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-slate-950">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-industrial bg-amber-500 shadow-stamped">
            <svg className="w-8 h-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 18a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v2H2V4h2ZM4 10v2H2v-2h2ZM4 16v2H2v-2h2ZM10 4v2H8V4h2ZM10 10v2H8v-2h2ZM10 16v2H8v-2h2ZM16 4v2h-2V4h2ZM16 10v2h-2v-2h2ZM16 16v2h-2v-2h2ZM20 4v2h-2V4h2ZM20 10v2h-2v-2h2ZM20 16v2h-2v-2h2Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Montador Pro</h1>
          <p className="mt-2 text-sm text-slate-400">Faça login para continuar</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-14 px-4 text-base bg-slate-800 border border-slate-700 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-14 px-4 text-base bg-slate-800 border border-slate-700 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-industrial">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Aguarde...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Não tem conta?{' '}
          <span role="button" tabIndex={0} onClick={onSwitch} onKeyDown={(e) => e.key === 'Enter' && onSwitch()} className="text-amber-500 font-medium cursor-pointer hover:text-amber-400">Cadastre-se</span>
        </p>
      </div>
    </div>
  )
}

export function SignupPage({ onSwitch }) {
  const setSession = useAuthStore((s) => s.setSession)
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setForm((prev) => ({ ...prev, phone: formatted }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (!validatePhone(form.phone)) {
      setError('WhatsApp inválido. Digite um número com DDD')
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            phone: form.phone.replace(/\D/g, ''),
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone: form.phone.replace(/\D/g, '') })
          .eq('id', data.user.id)

        if (profileError) console.error('Erro ao salvar phone no profile:', profileError)
      }

      if (data.session) {
        setSession(data.session)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-slate-950">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-industrial bg-emerald-500 shadow-stamped">
            <svg className="w-8 h-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Confirme seu email</h2>
          <p className="mt-3 text-sm text-slate-400">
            Enviamos um link de confirmação para <span className="text-slate-200">{form.email}</span>.
            Clique no link para ativar sua conta.
          </p>
          <p className="mt-4 text-xs text-slate-500">Verifique também a caixa de spam.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-slate-950">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-industrial bg-amber-500 shadow-stamped">
            <svg className="w-8 h-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM10.5 18a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v2H2V4h2ZM4 10v2H2v-2h2ZM4 16v2H2v-2h2ZM10 4v2H8V4h2ZM10 10v2H8v-2h2ZM10 16v2H8v-2h2ZM16 4v2h-2V4h2ZM16 10v2h-2v-2h2ZM16 16v2h-2v-2h2ZM20 4v2h-2V4h2ZM20 10v2h-2v-2h2ZM20 16v2h-2v-2h2Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Criar Conta</h1>
          <p className="mt-2 text-sm text-slate-400">Cadastre-se gratuitamente</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">WhatsApp *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <input
                type="tel"
                value={form.phone}
                onChange={handlePhoneChange}
                required
                placeholder="(11) 99999-9999"
                className="w-full h-14 pl-12 pr-4 text-base bg-slate-800 border border-slate-700 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={updateField('email')}
              required
              className="w-full h-14 px-4 text-base bg-slate-800 border border-slate-700 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={updateField('password')}
              required
              minLength={6}
              className="w-full h-14 px-4 text-base bg-slate-800 border border-slate-700 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Confirmar Senha</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              required
              minLength={6}
              className="w-full h-14 px-4 text-base bg-slate-800 border border-slate-700 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="Repita a senha"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-industrial">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Aguarde...' : 'Criar Conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Já tem conta?{' '}
          <span role="button" tabIndex={0} onClick={onSwitch} onKeyDown={(e) => e.key === 'Enter' && onSwitch()} className="text-amber-500 font-medium cursor-pointer hover:text-amber-400">Faça login</span>
        </p>
      </div>
    </div>
  )
}
