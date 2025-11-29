import jsPDF from 'jspdf'
import type { ProveedorPago, Comprobante, PagoRealizado, ConfiguracionLocal, ResumenProveedor } from '@/types/database'

// Función auxiliar para cargar imagen como base64
async function cargarImagenComoBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error al cargar imagen:', error)
    return ''
  }
}

export async function generarPDFPagosProveedor(
  proveedor: ProveedorPago,
  comprobantes: Comprobante[],
  pagos: PagoRealizado[],
  resumen: ResumenProveedor,
  config: ConfiguracionLocal | null
) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const leftMargin = 10
  const rightMargin = 10
  const contentWidth = pageWidth - leftMargin - rightMargin
  let y = 20

  // Cargar logo si existe
  let logoBase64 = ''
  if (config?.logo_url) {
    logoBase64 = await cargarImagenComoBase64(config.logo_url)
  }

  // ===== HEADER =====
  const logoSize = 20
  
  // Logo (izquierda)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', leftMargin, y, logoSize, logoSize)
    } catch (error) {
      console.error('Error al agregar logo al PDF:', error)
    }
  }

  // Información del local (centro-derecha)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  const localNombre = config?.nombre_local || 'Mi Local'
  doc.text(localNombre, pageWidth / 2, y + 5, { align: 'center' })
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  if (config?.telefono) {
    doc.text(`Tel: ${config.telefono}`, pageWidth / 2, y + 10, { align: 'center' })
  }
  if (config?.email) {
    doc.text(config.email, pageWidth / 2, y + 14, { align: 'center' })
  }
  if (config?.ubicacion) {
    doc.text(config.ubicacion, pageWidth / 2, y + 18, { align: 'center' })
  }

  y += 30

  // ===== TÍTULO =====
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CONTROL DE PAGOS A PROVEEDOR', pageWidth / 2, y, { align: 'center' })
  y += 8

  // Nombre del proveedor
  doc.setFontSize(14)
  doc.setTextColor(0, 102, 204) // Azul
  doc.text(proveedor.nombre, pageWidth / 2, y, { align: 'center' })
  doc.setTextColor(0, 0, 0) // Negro
  y += 10

  // Fecha del reporte
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const fechaReporte = new Date().toLocaleDateString('es-AR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  doc.text(`Reporte generado: ${fechaReporte}`, pageWidth / 2, y, { align: 'center' })
  y += 12

  // ===== RESUMEN FINANCIERO =====
  doc.setFillColor(240, 240, 240)
  doc.rect(leftMargin, y, contentWidth, 35, 'F')
  
  y += 5
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN FINANCIERO', leftMargin + 5, y)
  y += 7

  // Columnas del resumen
  const colWidth = contentWidth / 3
  doc.setFontSize(9)
  
  // Total Gastado
  doc.setFont('helvetica', 'bold')
  doc.text('Total Gastado:', leftMargin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`$${resumen.total_gastado_ars.toFixed(2)} ARS`, leftMargin + 5, y + 4)
  doc.text(`$${resumen.total_gastado_usd.toFixed(2)} USD`, leftMargin + 5, y + 8)

  // Total Pagado
  doc.setFont('helvetica', 'bold')
  doc.text('Total Pagado:', leftMargin + colWidth + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`$${resumen.total_pagado_ars.toFixed(2)} ARS`, leftMargin + colWidth + 5, y + 4)
  doc.text(`$${resumen.total_pagado_usd.toFixed(2)} USD`, leftMargin + colWidth + 5, y + 8)

  // Deuda Pendiente
  doc.setFont('helvetica', 'bold')
  const deudaColor = (resumen.deuda_ars <= 0 && resumen.deuda_usd <= 0) ? [0, 150, 0] : [255, 100, 0]
  doc.setTextColor(deudaColor[0], deudaColor[1], deudaColor[2])
  doc.text('Deuda Pendiente:', leftMargin + colWidth * 2 + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`$${resumen.deuda_ars.toFixed(2)} ARS`, leftMargin + colWidth * 2 + 5, y + 4)
  doc.text(`$${resumen.deuda_usd.toFixed(2)} USD`, leftMargin + colWidth * 2 + 5, y + 8)
  
  // Estado
  doc.setFontSize(8)
  const estado = (resumen.deuda_ars <= 0 && resumen.deuda_usd <= 0) ? '✓ AL DÍA' : '⚠ CON DEUDA'
  doc.text(estado, leftMargin + colWidth * 2 + 5, y + 12)
  doc.setTextColor(0, 0, 0)

  y += 25

  // ===== COMPROBANTES =====
  function verificarEspacio(alturaRequerida: number) {
    if (y + alturaRequerida > pageHeight - 20) {
      doc.addPage()
      y = 20
      return true
    }
    return false
  }

  verificarEspacio(15)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('COMPROBANTES', leftMargin, y)
  y += 7

  // Tabla de comprobantes
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  
  // Header de tabla
  const colWidths = {
    tipo: 25,
    numero: 35,
    fecha: 25,
    monto: 30,
    estado: 25
  }
  
  doc.setFillColor(200, 200, 200)
  doc.rect(leftMargin, y - 4, contentWidth, 6, 'F')
  
  let xPos = leftMargin + 2
  doc.text('Tipo', xPos, y)
  xPos += colWidths.tipo
  doc.text('Número', xPos, y)
  xPos += colWidths.numero
  doc.text('Fecha', xPos, y)
  xPos += colWidths.fecha
  doc.text('Monto', xPos, y)
  xPos += colWidths.monto
  doc.text('Estado', xPos, y)
  
  y += 6
  doc.setFont('helvetica', 'normal')

  // Ordenar comprobantes por fecha
  const comprobantesOrdenados = [...comprobantes].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )

  comprobantesOrdenados.forEach((comp, index) => {
    verificarEspacio(8)
    
    // Alternar color de fila
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(leftMargin, y - 4, contentWidth, 6, 'F')
    }
    
    xPos = leftMargin + 2
    
    // Tipo
    const tipoTexto = comp.tipo === 'nota_credito' ? 'NC' : 
                      comp.tipo === 'factura' ? 'FACT' :
                      comp.tipo === 'remito' ? 'REM' : 'PRES'
    doc.text(tipoTexto, xPos, y)
    xPos += colWidths.tipo
    
    // Número
    doc.text(comp.numero, xPos, y)
    xPos += colWidths.numero
    
    // Fecha
    doc.text(new Date(comp.fecha).toLocaleDateString('es-AR'), xPos, y)
    xPos += colWidths.fecha
    
    // Monto (en rojo si es NC)
    if (comp.tipo === 'nota_credito') {
      doc.setTextColor(0, 150, 0)
      doc.text(`-$${comp.monto.toFixed(2)} ${comp.moneda}`, xPos, y)
      doc.setTextColor(0, 0, 0)
    } else {
      doc.text(`$${comp.monto.toFixed(2)} ${comp.moneda}`, xPos, y)
    }
    xPos += colWidths.monto
    
    // Estado
    const estadoTexto = comp.pagado ? 
      (comp.tipo === 'nota_credito' ? 'Aplicada' : 'Pagado') : 
      'Pendiente'
    doc.text(estadoTexto, xPos, y)
    
    y += 6
  })

  y += 8

  // ===== PAGOS REALIZADOS =====
  verificarEspacio(15)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PAGOS REALIZADOS', leftMargin, y)
  y += 7

  if (pagos.length === 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text('No hay pagos registrados', leftMargin + 2, y)
    doc.setTextColor(0, 0, 0)
    y += 6
  } else {
    // Ordenar pagos por fecha
    const pagosOrdenados = [...pagos].sort((a, b) => 
      new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime()
    )

    pagosOrdenados.forEach((pago, index) => {
      verificarEspacio(20)
      
      // Box para cada pago
      doc.setFillColor(245, 250, 255)
      const boxHeight = 12 + (pago.notas ? 4 : 0)
      doc.rect(leftMargin, y, contentWidth, boxHeight, 'F')
      doc.setDrawColor(180, 180, 180)
      doc.rect(leftMargin, y, contentWidth, boxHeight, 'S')
      
      y += 5
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`Pago #${index + 1}`, leftMargin + 2, y)
      
      // Fecha
      doc.setFont('helvetica', 'normal')
      doc.text(`Fecha: ${new Date(pago.fecha_pago).toLocaleDateString('es-AR')}`, leftMargin + 40, y)
      
      // Monto
      doc.setTextColor(0, 150, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(`$${pago.monto_pagado.toFixed(2)} ${pago.moneda}`, pageWidth - rightMargin - 40, y, { align: 'right' })
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      
      y += 4
      
      // Comprobantes incluidos
      doc.setFontSize(8)
      const comprobantesTexto = `Comprobantes: ${pago.comprobante_ids.length} incluidos`
      doc.text(comprobantesTexto, leftMargin + 2, y)
      
      // Notas
      if (pago.notas) {
        y += 4
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(80, 80, 80)
        doc.text(`Notas: ${pago.notas}`, leftMargin + 2, y)
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')
      }
      
      y += boxHeight - 7
    })
  }

  // ===== FOOTER =====
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Documento generado por ${config?.nombre_local || 'Sistema'} - ${new Date().toLocaleString('es-AR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  // Generar nombre del archivo
  const nombreArchivo = `Pagos_${proveedor.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  
  // Descargar PDF
  doc.save(nombreArchivo)
}
