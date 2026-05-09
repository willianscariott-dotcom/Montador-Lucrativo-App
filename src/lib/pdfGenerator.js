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
  doc.text('Montador Pro - Documento gerado via app', 14, pageHeight - 5)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 196, pageHeight - 5, { align: 'right' })
}

export function generateQuotePDF(quote, items, profile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  addHeader(doc, 'ORÇAMENTO', profile?.full_name || 'Montador Pro')

  const quoteDate = new Date().toLocaleDateString('pt-BR')
  const quoteNumber = quote.id?.slice(0, 8).toUpperCase() || '00000000'

  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`Nº ${quoteNumber}`, 196, 20, { align: 'right' })
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
  doc.text(`Nome: ${quote.client_name || 'Não informado'}`, 16, yPos + 14)
  if (quote.client_document) {
    doc.text(`CPF/CNPJ: ${quote.client_document}`, 110, yPos + 14)
  }

  yPos += 28

  const tableData = items.map((item, index) => [
    String(index + 1),
    item.description,
    item.type === 'service' ? 'Serviço' : 'Material',
    String(item.quantity),
    `R$ ${Number(item.unit_price).toFixed(2).replace('.', ',')}`,
    `R$ ${(item.quantity * item.unit_price).toFixed(2).replace('.', ',')}`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Descrição', 'Tipo', 'Qtd', 'Valor Unit.', 'Subtotal']],
    body: tableData,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: { top: 2, right: 3, bottom: 2, left: 3 }, overflow: 'linebreak' },
    headStyles: { fillColor: primaryColor, textColor: accentColor, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 70 }, 2: { cellWidth: 25 }, 3: { cellWidth: 15, halign: 'center' }, 4: { cellWidth: 35, halign: 'right' }, 5: { cellWidth: 35, halign: 'right' } },
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
  doc.text('TOTAL DO ORÇAMENTO', 114, yPos + 7)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...emeraldColor)
  doc.text(`R$ ${totalAmount.toFixed(2).replace('.', ',')}`, 194, yPos + 14, { align: 'right' })

  if (totalServices > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Serviços: R$ ${totalServices.toFixed(2).replace('.', ',')}`, 114, yPos + 21)
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
    '• Garantia de 90 dias para serviços realizados.',
    '• Peças/materiais seguem garantia do fabricante.',
    '• Orçamento válido por 15 dias.',
    '• Pagamento via PIX ou transferência bancária.',
  ]
  terms.forEach((term, i) => {
    doc.text(term, 18, yPos + 16 + i * 5)
  })
}

export function generateReceiptPDF(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })

  addHeader(doc, 'RECIBO', data.profileName || 'Montador Pro')

  const receiptNumber = `RCP${Date.now().toString().slice(-8)}`
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`Nº ${receiptNumber}`, 196, 20, { align: 'right' })
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
  doc.text(`Forma de Pagamento: ${data.paymentMethod || 'Não informada'}`, 14, yPos)
  if (data.observations) {
    yPos += 7
    doc.text(`Observações: ${data.observations}`, 14, yPos)
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
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  addHeader(doc, 'TERMO DE GARANTIA', data.profileName || 'Montador Pro')

  const warrantyNumber = `GAR${Date.now().toString().slice(-8)}`
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`Nº ${warrantyNumber}`, 196, 20, { align: 'right' })
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 196, 28, { align: 'right' })

  let yPos = 55

  doc.setFillColor(241, 245, 249)
  doc.rect(14, yPos, 182, 30, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text('DADOS DO CLIENTE E SERVIÇO', 16, yPos + 7)

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
  doc.text('DESCRIÇÃO DO SERVIÇO', 16, yPos + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text(data.serviceDescription || 'Serviço realizado', 16, yPos + 14)
  doc.text(`Data de Execução: ${data.serviceDate || new Date().toLocaleDateString('pt-BR')}`, 16, yPos + 21)

  yPos += 35

  doc.setFillColor(5, 150, 105)
  doc.rect(14, yPos, 182, 20, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text(`PRAZO DE GARANTIA: 90 DIAS`, 105, yPos + 13, { align: 'center' })

  yPos += 30

  doc.setFillColor(30, 41, 59)
  doc.rect(14, yPos, 182, 60, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(251, 191, 36)
  doc.text('CONDIÇÕES DA GARANTIA', 18, yPos + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(226, 232, 240)
  const terms = [
    '1. O presente Termo de Garantia cobre exclusivamente os serviços realizados pelo prestador.',
    '2. O prazo de garantia é de 90 (noventa) dias, contados a partir da data de execução do serviço.',
    '3. A garantia cobre apenas o trabalho executado, não incluindo peças ou materiais utilizados.',
    '4. Peças e materiais fornecidos seguem a garantia padrão do fabricante.',
    '5. A garantia não cobre danos causados por uso inadequado, força maior ou terceiros.',
    '6. Para acionar a garantia, o cliente deve apresentar este Termo e/ou orçamento original.',
  ]
  terms.forEach((term, i) => {
    doc.text(term, 18, yPos + 16 + i * 6.5)
  })

  yPos += 70

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
