import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const primaryColor = [15, 23, 42]
const accentColor = [251, 191, 36]
const emeraldColor = [5, 150, 105]
const slate300 = [203, 213, 225]

function addHeader(doc, title, subtitle = '') {
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 45, 'F')

  doc.setFillColor(...accentColor)
  doc.rect(0, 42, 210, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...accentColor)
  doc.text(title, 14, 20)

  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text(subtitle, 14, 28)
  }
}

function addFooter(doc) {
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFillColor(...primaryColor)
  doc.rect(0, pageHeight - 15, 210, 15, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('Montador Lucrativo - Documento gerado via app', 14, pageHeight - 5)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 196, pageHeight - 5, { align: 'right' })
}

export function generateQuotePDF(quote, items, profile) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })

  addHeader(doc, 'ORCAMENTO', profile?.full_name || 'Montador Lucrativo')

  const quoteDate = new Date().toLocaleDateString('pt-BR')
  const quoteNumber = quote.id?.slice(0, 8).toUpperCase() || '00000000'

  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`N ${quoteNumber}`, 196, 20, { align: 'right' })
  doc.text(`Data: ${quoteDate}`, 196, 28, { align: 'right' })
  doc.text(`Status: ${quote.status?.toUpperCase() || 'RASCUNHO'}`, 196, 34, { align: 'right' })

  let yPos = 55

  doc.setFillColor(241, 245, 249)
  doc.rect(14, yPos, 182, 20, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...primaryColor)
  doc.text('DADOS DO CLIENTE', 16, yPos + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text(`Nome: ${quote.client_name || 'Nao informado'}`, 16, yPos + 14)
  if (quote.client_document) {
    doc.text(`CPF/CNPJ: ${quote.client_document}`, 110, yPos + 14)
  }

  yPos += 28

  const tableData = items.map((item, index) => [
    String(index + 1),
    item.description,
    item.type === 'service' ? 'Servico' : 'Material',
    String(item.quantity),
    `R$ ${Number(item.unit_price).toFixed(2).replace('.', ',')}`,
    `R$ ${(item.quantity * item.unit_price).toFixed(2).replace('.', ',')}`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Descricao', 'Tipo', 'Qtd', 'Valor Unit.', 'Subtotal']],
    body: tableData,
    margin: { left: 14, right: 14, top: 10, bottom: 10 },
    styles: { fontSize: 9, cellPadding: { top: 2, right: 3, bottom: 2, left: 3 }, overflow: 'linebreak' },
    headStyles: { fillColor: primaryColor, textColor: accentColor, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 25 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 35, halign: 'right' },
      5: { cellWidth: 35, halign: 'right' },
    },
    tableWidth: '100%',
    rowPageBreak: 'avoid',
  })

  yPos = doc.lastAutoTable.finalY + 10

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const totalServices = items.filter((i) => i.type === 'service').reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const totalMaterials = items.filter((i) => i.type === 'material').reduce((s, i) => s + i.quantity * i.unit_price, 0)

  doc.setFillColor(241, 245, 249)
  doc.rect(110, yPos, 86, 28, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text('TOTAL DO ORCAMENTO', 114, yPos + 7)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...emeraldColor)
  doc.text(`R$ ${totalAmount.toFixed(2).replace('.', ',')}`, 194, yPos + 14, { align: 'right' })

  if (totalServices > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Servicos: R$ ${totalServices.toFixed(2).replace('.', ',')}`, 114, yPos + 21)
  }
  if (totalMaterials > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Materiais: R$ ${totalMaterials.toFixed(2).replace('.', ',')}`, 114, yPos + 25)
  }

  yPos += 38
  if (yPos > 240) { doc.addPage(); yPos = 20 }

  addTermsBlock(doc, yPos)
  addFooter(doc)

  const fileName = `Orcamento_${quoteNumber}_${quote.client_name?.replace(/\s+/g, '_') || 'cliente'}.pdf`
  doc.save(fileName)
  return fileName
}

function addTermsBlock(doc, yPos) {
  doc.setFillColor(30, 41, 59)
  doc.rect(14, yPos, 182, 40, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(251, 191, 36)
  doc.text('TERMOS E GARANTIA', 18, yPos + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(226, 232, 240)
  const terms = [
    '• Garantia de 90 dias para servicos realizados.',
    '• Peas/materiais seguem garantia do fabricante.',
    '•Orcamento valido por 15 dias.',
    '• Pagamento via PIX ou transferencia bancaria.',
  ]
  terms.forEach((term, i) => {
    doc.text(term, 18, yPos + 16 + i * 5)
  })
}

export function generateReceiptPDF(data) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })

  addHeader(doc, 'RECIBO', data.profileName || 'Montador Lucrativo')

  const receiptNumber = `RCP${Date.now().toString().slice(-8)}`
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`N ${receiptNumber}`, 196, 20, { align: 'right' })
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 196, 28, { align: 'right' })

  let yPos = 55

  doc.setFillColor(241, 245, 249)
  doc.rect(14, yPos, 182, 35, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text('DADOS DO RECIBO', 16, yPos + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)

  doc.text(`Recebi de: ${data.clientName || '______________________'}`, 16, yPos + 14)
  doc.text(`Valor: R$ ${Number(data.amount || 0).toFixed(2).replace('.', ',')}`, 16, yPos + 21)
  doc.text(`Referente a: ${data.description || '______________________'}`, 16, yPos + 28)

  yPos += 45

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text(`Valor Recebido: R$ ${Number(data.amount || 0).toFixed(2).replace('.', ',')}`, 14, yPos)

  yPos += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Forma de Pagamento: ${data.paymentMethod || 'Nao informada'}`, 14, yPos)
  if (data.observations) {
    yPos += 7
    doc.text(`Observacoes: ${data.observations}`, 14, yPos)
  }

  yPos += 20

  doc.setDrawColor(...slate300)
  doc.line(14, yPos, 90, yPos)
  doc.setFontSize(9)
  doc.text('Assinatura do Recebedor', 52, yPos + 5, { align: 'center' })

  doc.line(106, yPos, 182, yPos)
  doc.text('Assinatura do Pagador', 144, yPos + 5, { align: 'center' })

  addFooter(doc)

  const fileName = `Recibo_${receiptNumber}_${data.clientName?.replace(/\s+/g, '_') || 'cliente'}.pdf`
  doc.save(fileName)
  return fileName
}

export function generateWarrantyPDF(data) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })

  addHeader(doc, 'TERMO DE GARANTIA', data.profileName || 'Montador Lucrativo')

  const warrantyNumber = `GAR${Date.now().toString().slice(-8)}`
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`N ${warrantyNumber}`, 196, 20, { align: 'right' })
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 196, 28, { align: 'right' })

  let yPos = 55

  doc.setFillColor(241, 245, 249)
  doc.rect(14, yPos, 182, 30, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text('DADOS DO CLIENTE E SERVICO', 16, yPos + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text(`Cliente: ${data.clientName || '______________________'}`, 16, yPos + 14)
  doc.text(`Telefone: ${data.clientPhone || '______________________'}`, 16, yPos + 21)
  if (data.clientDocument) {
    doc.text(`CPF/CNPJ: ${data.clientDocument}`, 110, yPos + 21)
  }

  yPos += 38

  doc.setFillColor(241, 245, 249)
  doc.rect(14, yPos, 182, 25, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text('DESCRICAO DO SERVICO', 16, yPos + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text(data.serviceDescription || 'Servico realizado', 16, yPos + 14)
  doc.text(`Data de Execucao: ${data.serviceDate || new Date().toLocaleDateString('pt-BR')}`, 16, yPos + 21)

  yPos += 35

  doc.setFillColor(5, 150, 105)
  doc.rect(14, yPos, 182, 20, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text(`PRAZO DE GARANTIA: 90 DIAS`, 105, yPos + 13, { align: 'center' })

  yPos += 28

  const introText = `Certificamos que o servico de montagem realizado para o cliente ${data.clientName || '[NOME DO CLIENTE]'} possui garantia tecnica de 90 (noventa) dias, a contar da data de realizacao do servico ${data.serviceDate || new Date().toLocaleDateString('pt-BR')}, conforme previsto no Codigo de Defesa do Consumidor.`

  const wrappedIntro = doc.splitTextToSize(introText, 182)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(50, 50, 50)
  const introBlockHeight = wrappedIntro.length * 5 + 8
  doc.setFillColor(241, 245, 249)
  doc.rect(14, yPos, 182, introBlockHeight, 'F')
  doc.text(wrappedIntro, 16, yPos + 6)
  yPos += introBlockHeight + 8

  const coverBlock = [
    { title: 'O QUE ESTA GARANTIA COBRE:', color: emeraldColor, items: [
      'Falhas na execucao da montagem (ex: portas desalinhadas por falta de regulagem, pecas soltas).',
      'Danos causados diretamente pelo montador durante a execucao do servico.',
    ]},
    { title: 'O QUE ESTA GARANTIA NAO COBRE:', color: [239, 68, 68], items: [
      'Defeitos de fabricacao do movel, pecas empenadas ou falta de ferragens na embalagem original.',
      'Danos causados por mau uso, umidade, infiltracoes ou uso de produtos de limpeza inadequados.',
      'Desalinhamentos futuros causados por piso irregular ou sobrecarga de peso.',
      'Danos causados se o movel for arrastado, mudado de lugar ou desmontado por terceiros.',
    ]},
  ]

  coverBlock.forEach((section) => {
    const sectionText = doc.splitTextToSize(section.title, 182)
    const itemTexts = section.items.map((item) => doc.splitTextToSize(item, 182))

    const blockHeight = 8 + sectionText.length * 5 + itemTexts.flat().length * 5 + 6

    doc.setFillColor(30, 41, 59)
    doc.rect(14, yPos, 182, blockHeight, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...section.color)
    doc.text(sectionText, 16, yPos + 6)

    let itemY = yPos + 6 + sectionText.length * 5 + 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(226, 232, 240)

    itemTexts.forEach((lines) => {
      doc.text(lines, 18, itemY)
      itemY += lines.length * 5
    })

    yPos += blockHeight + 6
  })

  yPos += 10

  doc.setDrawColor(...slate300)
  doc.line(14, yPos, 90, yPos)
  doc.setFontSize(9)
  doc.text('Assinatura do Prestador', 52, yPos + 5, { align: 'center' })

  doc.line(106, yPos, 182, yPos)
  doc.text('Assinatura do Cliente', 144, yPos + 5, { align: 'center' })

  addFooter(doc)

  const fileName = `Garantia_${warrantyNumber}_${data.clientName?.replace(/\s+/g, '_') || 'cliente'}.pdf`
  doc.save(fileName)
  return fileName
}
