import jsPDF from 'jspdf'
import type { Presupuesto, PresupuestoItem, ConfiguracionLocal } from '@/types/database'

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

export async function generarPDFPresupuesto(
  presupuesto: Presupuesto,
  config: ConfiguracionLocal | null
) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const leftMargin = 10
  const rightMargin = 10
  let y = 20

  // Cargar logo si existe
  let logoBase64 = ''
  if (config?.logo_url) {
    logoBase64 = await cargarImagenComoBase64(config.logo_url)
  }

  // ===== HEADER =====
  const logoSize = 25
  const headerHeight = 30
  
  // Logo (izquierda) - centrado verticalmente
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', leftMargin, y, logoSize, logoSize)
    } catch (error) {
      console.error('Error al agregar logo al PDF:', error)
    }
  }

  // Información del local (centro) - centrado verticalmente
  const centerY = y + (headerHeight / 2)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const nombreLocal = config?.nombre_local || 'Nombre del Local'
  doc.text(nombreLocal, pageWidth / 2, centerY - 6, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const ubicacion = config?.ubicacion || 'Ubicación'
  const celular = config?.celular || 'Celular'
  const telefono = config?.telefono || 'Teléfono'
  const email = config?.email || 'Email'

  doc.text(`${ubicacion} | ${celular}`, pageWidth / 2, centerY, { align: 'center' })
  doc.text(`${telefono} | ${email}`, pageWidth / 2, centerY + 4, { align: 'center' })

  // Número de presupuesto (derecha) - centrado verticalmente
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PRESUPUESTO', pageWidth - rightMargin, centerY - 6, { align: 'right' })

  doc.setFontSize(14)
  const numeroPresupuesto = presupuesto.numero_presupuesto.toString().padStart(6, '0')
  doc.text(`N° ${numeroPresupuesto}`, pageWidth - rightMargin, centerY, { align: 'right' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const fechaCreacion = new Date(presupuesto.fecha_creacion).toLocaleDateString('es-AR')
  doc.text(fechaCreacion, pageWidth - rightMargin, centerY + 4, { align: 'right' })

  y += headerHeight + 5

  // Línea separadora
  doc.setLineWidth(0.3)
  doc.setDrawColor(200, 200, 200)
  doc.line(leftMargin, y, pageWidth - rightMargin, y)

  y += 8

  // ===== DATOS DEL CLIENTE (si existen) =====
  if (presupuesto.cliente_nombre || presupuesto.cliente_cuit || presupuesto.cliente_direccion) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL CLIENTE', leftMargin, y)
    y += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    if (presupuesto.cliente_nombre) {
      doc.text(`Nombre: ${presupuesto.cliente_nombre}`, leftMargin, y)
      y += 5
    }

    if (presupuesto.cliente_cuit) {
      doc.text(`CUIT: ${presupuesto.cliente_cuit}`, leftMargin, y)
      y += 5
    }

    if (presupuesto.cliente_direccion) {
      doc.text(`Dirección: ${presupuesto.cliente_direccion}`, leftMargin, y)
      y += 5
    }

    y += 3
    doc.setLineWidth(0.2)
    doc.setDrawColor(220, 220, 220)
    doc.line(leftMargin, y, pageWidth - rightMargin, y)
    y += 8
  }

  // ===== TABLA DE ITEMS =====
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  
  // Headers de la tabla - Ajustar anchos para evitar superposición
  const colCantidad = leftMargin
  const colDetalle = leftMargin + 18
  const colPrecio = pageWidth - 65  // Ajustado para dar más espacio
  const colSubtotal = pageWidth - rightMargin
  
  // Fondo gris para headers
  doc.setFillColor(248, 250, 252)
  doc.rect(leftMargin, y - 4, pageWidth - leftMargin - rightMargin, 8, 'F')
  
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text('CANT.', colCantidad + 2, y)
  doc.text('DETALLE', colDetalle, y)
  doc.text('P. UNIT.', colPrecio, y, { align: 'right' })
  doc.text('SUBTOTAL', colSubtotal, y, { align: 'right' })
  
  y += 8
  doc.setTextColor(0, 0, 0)

  // Items del presupuesto
  doc.setFont('helvetica', 'normal')
  presupuesto.items.forEach((item: PresupuestoItem, index) => {
    // Línea divisoria
    if (index > 0) {
      doc.setLineWidth(0.1)
      doc.setDrawColor(226, 232, 240)
      doc.line(leftMargin, y - 2, pageWidth - rightMargin, y - 2)
    }

    // Alternar color de fondo
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255)
    } else {
      doc.setFillColor(252, 252, 252)
    }
    doc.rect(leftMargin, y - 4, pageWidth - leftMargin - rightMargin, 8, 'F')

    // Cantidad
    doc.setFont('helvetica', 'bold')
    doc.text(item.cantidad.toString(), colCantidad + 5, y, { align: 'center' })

    // Detalle - Ajustar ancho máximo para el texto
    doc.setFont('helvetica', 'normal')
    const maxDetalleWidth = colPrecio - colDetalle - 10
    const detalleLines = doc.splitTextToSize(item.detalle, maxDetalleWidth)
    doc.text(detalleLines, colDetalle, y)

    // Precio unitario
    doc.text(`$${item.precio.toLocaleString()}`, colPrecio, y, { align: 'right' })

    // Subtotal
    doc.setFont('helvetica', 'bold')
    doc.text(`$${item.subtotal.toLocaleString()}`, colSubtotal, y, { align: 'right' })

    y += Math.max(8, detalleLines.length * 4 + 4)

    // Verificar si necesitamos nueva página
    if (y > 250) {
      doc.addPage()
      y = 20
    }
  })

  // Mover el total casi al final de la página
  const pageHeight = doc.internal.pageSize.getHeight()
  const totalY = pageHeight - 30  // 30mm desde el borde inferior

  // Si hay observaciones, dejar espacio para ellas
  const espacioObservaciones = presupuesto.observaciones && presupuesto.observaciones.trim() !== '' ? 15 : 0
  const finalTotalY = totalY - espacioObservaciones

  // Asegurar que el total esté en la posición correcta
  if (y > finalTotalY - 10) {
    // Si los items están muy abajo, usar la posición actual
    y += 10
  } else {
    // Si hay espacio, mover al final
    y = finalTotalY
  }

  // Línea antes del total
  doc.setLineWidth(0.5)
  doc.setDrawColor(100, 116, 139)
  doc.line(leftMargin, y - 5, pageWidth - rightMargin, y - 5)

  // ===== TOTAL =====
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', pageWidth - rightMargin - 60, y)
  doc.setFontSize(16)
  doc.text(`$${presupuesto.total.toLocaleString()}`, pageWidth - rightMargin, y, { align: 'right' })

  y += 12

  // ===== OBSERVACIONES (si existen) - Centradas sin título =====
  if (presupuesto.observaciones && presupuesto.observaciones.trim() !== '') {
    y += 8
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 116, 139)
    
    const observacionesLines = doc.splitTextToSize(presupuesto.observaciones, pageWidth - leftMargin - rightMargin - 20)
    observacionesLines.forEach((line: string, index: number) => {
      doc.text(line, pageWidth / 2, y + (index * 4), { align: 'center' })
    })
  }

  // Descargar el PDF
  const nombreArchivo = `Presupuesto_${numeroPresupuesto}.pdf`
  doc.save(nombreArchivo)
}
