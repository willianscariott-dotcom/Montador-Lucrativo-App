export function openWhatsApp(phone, message) {
  const encoded = encodeURIComponent(message || '')
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/55${cleanPhone}?text=${encoded}`, '_blank')
  } else {
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }
}

export const messageTemplates = {
  budget: (clientName, amount, quoteNumber) =>
    `Olá ${clientName}! 👋\n\nSegue o orçamento Nº ${quoteNumber} no valor de *R$ ${amount}*.\n\nO documento está em anexo. Qualquer dúvida, estou à disposição!\n\nAtenciosamente,\nMontador Pro`,

  birthday: () =>
    `🎂 Parabéns pelo seu dia! 🎉\n\nDesejamos muita saúde, paz e sucesso!\nQue este novo ano de vida seja repleto de conquistas.\n\nAtenciosamente,\nMontador Pro`,

  followUp: (clientName) =>
    `Olá ${clientName}! Tudo bem?\n\nEstou passando para saber se você teve alguma dúvida sobre o orçamento enviado. Fico à disposição para esclarecer qualquer questão!\n\nAtenciosamente,\nMontador Pro`,

  referral: (friendName, code) =>
    `Olá ${friendName}! 👋\n\nVocê conhece o Montador Pro? É o app que está revolucionando a vida de montadores!\n\nCom ele você consegue criar orçamentos profissionais, calcular o valor justo da sua hora de trabalho e muito mais.\n\nUse meu código de convite: *${code}*\n\nSe inscreva pelo link e ganhe benefícios exclusivos!\n\nBaixe agora no montador.pro\n\nAbraços!`,
}
