export function openWhatsApp(phone, message) {
  if (!phone) {
    alert('Número de WhatsApp não cadastrado')
    return
  }
  const cleanPhone = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/55${cleanPhone}?text=${encoded}`, '_blank')
}

export const messageTemplates = {
  budget: (clientName, amount, quoteNumber) =>
    `Olá ${clientName}! 👋\n\nSegue o orçamento Nº ${quoteNumber} no valor de *R$ ${amount}*.\n\nO documento está em anexo. Qualquer dúvida, estou à disposição!\n\nAtenciosamente,\nMontador Pro`,

  birthday: () =>
    `🎂 Parabéns pelo seu dia! 🎉\n\nDesejamos muita saúde, paz e sucesso!\nQue este novo ano de vida seja repleto de conquistas.\n\nAtenciosamente,\nMontador Pro`,

  followUp: (clientName) =>
    `Olá ${clientName}! Tudo bem?\n\nEstou passando para saber se você teve alguma dúvida sobre o orçamento enviado. Fico à disposição para esclarecer qualquer questão!\n\nAtenciosamente,\nMontador Pro`,
}
