import { useState } from 'react'
import { useProfile, useUpdateSettings } from '../../hooks/useProfile'
import { Users, UserPlus, X, Cake, Pencil, Trash2, MessageSquare } from 'lucide-react'

export function ClientsTab() {
  const { data: profile } = useProfile()
  const updateSettings = useUpdateSettings()
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const settings = profile?.settings || {}
  const clients = settings.clients || []

  const today = new Date()
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`
  const birthdayToday = clients.find((c) => c.birthdate?.slice(5, 10) === todayStr)

  const handleDelete = (clientId) => {
    if (!window.confirm('Excluir este cliente? Esta acao nao pode ser desfeita.')) return
    const newClients = clients.filter((c) => c.id !== clientId)
    updateSettings.mutate({ clients: newClients })
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setShowModal(true)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {birthdayToday && (
        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-panel shadow-stamped flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-industrial bg-amber-500/20">
            <Cake className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-amber-500">Aniversariante do Dia!</p>
            <p className="text-sm text-slate-200">{birthdayToday.name}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100">Clientes</h2>
        <button
          onClick={() => { setEditingClient(null); setShowModal(true) }}
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
          <p className="mt-1 text-sm text-slate-500">Clique em "Novo Cliente" para comecar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div key={client.id} className="p-4 bg-slate-800 border border-slate-700 rounded-panel shadow-stamped flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-industrial bg-slate-700 flex-shrink-0">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-100 truncate">{client.name}</p>
                <p className="text-sm text-slate-400">{client.phone ? `(${client.phone.slice(0,2)}) ${client.phone.slice(2,7)}-${client.phone.slice(7)}` : ''}</p>
              </div>
              {client.birthdate && (
                <span className="text-xs text-amber-500 flex-shrink-0">{new Date(client.birthdate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
              )}
              <div className="flex items-center gap-2 flex-shrink-0">
                {client.phone && (
                  <a
                    href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-industrial bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                  </a>
                )}
                <button
                  onClick={() => handleEdit(client)}
                  className="w-10 h-10 flex items-center justify-center rounded-industrial bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-amber-500" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-industrial bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => setShowModal(false)}
          onSave={(client) => {
            let newClients
            if (editingClient) {
              newClients = clients.map((c) => c.id === editingClient.id ? { ...c, ...client } : c)
            } else {
              newClients = [...clients, { ...client, id: Date.now() }]
            }
            updateSettings.mutate({ clients: newClients })
          }}
        />
      )}
    </div>
  )
}

function ClientModal({ client, onClose, onSave }) {
  const [name, setName] = useState(client?.name || '')
  const [phone, setPhone] = useState(client?.phone || '')
  const [address, setAddress] = useState(client?.address || '')
  const [document, setDocument] = useState(client?.document || '')
  const [birthdate, setBirthdate] = useState(client?.birthdate || '')

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  }

  const formatDoc = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const handlePhoneChange = (e) => setPhone(formatPhone(e.target.value))
  const handleDocChange = (e) => setDocument(formatDoc(e.target.value))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      address: address.trim(),
      document: document.replace(/\D/g, ''),
      birthdate: birthdate,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-100">{client ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Nome *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" required />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Telefone/WhatsApp</label>
            <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="(11) 99999-9999" className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">CPF/CNPJ <span className="text-slate-500">(Opcional)</span></label>
            <input type="text" value={document} onChange={handleDocChange} placeholder="CPF ou CNPJ" className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Endereco <span className="text-slate-500">(Opcional)</span></label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Endereco do cliente" className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Data de Nascimento <span className="text-slate-500">(Opcional)</span></label>
            <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full h-12 px-3 text-sm bg-slate-700 border border-slate-600 rounded-industrial text-slate-100 focus:outline-none focus:border-amber-500" />
          </div>
          <button type="submit" className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold text-slate-950 bg-amber-500 rounded-industrial shadow-stamped hover:bg-amber-400 transition-colors">
            <UserPlus className="w-5 h-5" />
            {client ? 'Salvar Alteracoes' : 'Adicionar Cliente'}
          </button>
        </form>
      </div>
    </div>
  )
}
