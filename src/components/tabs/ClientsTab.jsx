import { useState } from 'react'
import { useProfile, useUpdateSettings } from '../../hooks/useProfile'
import { Users, UserPlus, X } from 'lucide-react'

export function ClientsTab() {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const [showModal, setShowModal] = useState(false)
  const settings = profile?.settings || {}
  const clients = settings.clients || []

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100">Clientes</h2>
        <button
          onClick={() => setShowModal(true)}
          className="h-14 px-6 flex items-center gap-2 text-sm font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 active:bg-amber-600 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="p-6 text-center bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
          <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-industrial bg-slate-700">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <p className="mt-4 text-slate-400">Nenhum cliente cadastrado</p>
          <p className="mt-1 text-sm text-slate-500">Clique em "Novo Cliente" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div key={client.id} className="p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-slate-700">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-100">{client.name}</p>
                  <p className="text-sm text-slate-400">{client.phone ? `(${client.phone.slice(0,2)}) ${client.phone.slice(2,7)}-${client.phone.slice(7)}` : client.email || ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ClientModal
          onClose={() => setShowModal(false)}
          onSave={(client) => {
            const newClients = [...clients, { ...client, id: Date.now() }]
            updateSettings.mutate({ clients: newClients })
          }}
        />
      )}
    </div>
  )
}

function ClientModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [document, setDocument] = useState('')

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  }

  const handlePhoneChange = (e) => {
    setPhone(formatPhone(e.target.value))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      address: address.trim(),
      document: document.trim(),
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-100">Novo Cliente</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Telefone/WhatsApp</label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Endereço</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Endereço do cliente"
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">CPF</label>
            <input
              type="text"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="CPF do cliente"
              className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Adicionar Cliente
          </button>
        </form>
      </div>
    </div>
  )
}
