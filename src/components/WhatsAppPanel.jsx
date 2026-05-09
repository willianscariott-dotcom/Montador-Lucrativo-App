import { MessageSquare, Gift, FileText, X } from 'lucide-react'
import { openWhatsApp, messageTemplates } from '../../lib/whatsapp'

export function WhatsAppPanel({ client, onClose }) {
  const templates = [
    {
      id: 'budget',
      icon: FileText,
      label: 'Enviar Orçamento',
      description: 'Mensagem com link do orçamento',
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      id: 'birthday',
      icon: Gift,
      label: 'Feliz Aniversário',
      description: 'Mensagem de parabéns',
      color: 'bg-pink-500/10 text-pink-500',
    },
    {
      id: 'followUp',
      icon: MessageSquare,
      label: 'Acompanhamento',
      description: 'Ligar para o cliente',
      color: 'bg-blue-500/10 text-blue-400',
    },
  ]

  const handleSelect = (templateId) => {
    let message = ''
    switch (templateId) {
      case 'budget':
        message = messageTemplates.budget(client.name, client.amount, client.quoteNumber)
        break
      case 'birthday':
        message = messageTemplates.birthday()
        break
      case 'followUp':
        message = messageTemplates.followUp(client.name)
        break
    }
    openWhatsApp(client.phone, message)
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-panel shadow-stamped">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-100">Mensagens Prontas</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-industrial bg-slate-700 hover:bg-slate-600">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-400 mb-2">Enviar para: {client.name}</p>
          {templates.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className="w-full flex items-center gap-4 p-4 bg-slate-700 border border-slate-600 rounded-panel hover:bg-slate-600 transition-colors"
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-industrial ${t.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-100">{t.label}</p>
                  <p className="text-sm text-slate-400">{t.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
