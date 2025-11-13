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
  const logoSize = 20
  
  // Logo (izquierda)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', leftMargin, y, logoSize, logoSize)
    } catch (error) {
      console.error('Error al agregar logo al PDF:', error)
    }
  }

  // Información del local (centro)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const nombreLocal = config?.nombre_local || 'Nombre del Local'
  doc.text(nombreLocal, pageWidth / 2, y + 5, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const ubicacion = config?.ubicacion || 'Ubicación'
  const celular = config?.celular || 'Celular'
  const telefono = config?.telefono || 'Teléfono'
  const email = config?.email || 'Email'

  doc.text(`${ubicacion} | ${celular}`, pageWidth / 2, y + 10, { align: 'center' })
  doc.text(`${telefono} | ${email}`, pageWidth / 2, y + 14, { align: 'center' })

  // Número de presupuesto (derecha)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PRESUPUESTO', pageWidth - rightMargin, y + 5, { align: 'right' })

  doc.setFontSize(14)
  const numeroPresupuesto = presupuesto.numero_presupuesto.toString().padStart(6, '0')
  doc.text(`N° ${numeroPresupuesto}`, pageWidth - rightMargin, y + 11, { align: 'right' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const fechaCreacion = new Date(presupuesto.fecha_creacion).toLocaleDateString('es-AR')
  doc.text(fechaCreacion, pageWidth - rightMargin, y + 16, { align: 'right' })

  y += 30

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
  
  // Headers de la tabla
  const colCantidad = leftMargin
  const colDetalle = leftMargin + 20
  const colPrecio = pageWidth - rightMargin - 40
  const colSubtotal = pageWidth - rightMargin
  
  // Fondo gris para headers
  doc.setFillColor(248, 250, 252)
  doc.rect(leftMargin, y - 4, pageWidth - leftMargin - rightMargin, 8, 'F')
  
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text('CANT.', colCantidad + 2, y)
  doc.text('DETALLE', colDetalle, y)
  doc.text('PRECIO UNIT.', colPrecio, y)
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

    // Detalle
    doc.setFont('helvetica', 'normal')
    const detalleLines = doc.splitTextToSize(item.detalle, colPrecio - colDetalle - 5)
    doc.text(detalleLines, colDetalle, y)

    // Precio unitario
    doc.text(`$${item.precio.toLocaleString()}`, colPrecio + 30, y, { align: 'right' })

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

  y += 5

  // Línea antes del total
  doc.setLineWidth(0.5)
  doc.setDrawColor(100, 116, 139)
  doc.line(leftMargin, y, pageWidth - rightMargin, y)

  y += 8

  // ===== TOTAL =====
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', pageWidth - rightMargin - 60, y)
  doc.setFontSize(16)
  doc.text(`$${presupuesto.total.toLocaleString()}`, pageWidth - rightMargin, y, { align: 'right' })

  y += 15

  // ===== FOOTER =====
  if (y < 270) {
    y = 270
  }
  
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(100, 116, 139)
  
  const footerText1 = 'Este presupuesto tiene una validez de 30 días desde la fecha de emisión.'
  const footerText2 = 'Los precios pueden variar según disponibilidad de stock.'
  
  doc.text(footerText1, pageWidth / 2, y, { align: 'center' })
  doc.text(footerText2, pageWidth / 2, y + 4, { align: 'center' })

  // Descargar el PDF
  const nombreArchivo = `Presupuesto_${numeroPresupuesto}.pdf`
  doc.save(nombreArchivo)
}
