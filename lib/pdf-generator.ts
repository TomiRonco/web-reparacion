import jsPDF from 'jspdf'
import type { Reparacion, ConfiguracionLocal } from '@/types/database'

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

export async function generarPDFComprobante(
  reparacion: Reparacion,
  config: ConfiguracionLocal | null
) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const halfHeight = pageHeight / 2
  
  // Cargar logo si existe
  let logoBase64 = ''
  if (config?.logo_url) {
    logoBase64 = await cargarImagenComoBase64(config.logo_url)
  }
  
  // Función para dibujar una sección (original o copia)
  const dibujarSeccion = (startY: number, esOriginal: boolean) => {
    const currentY = startY
    let y = currentY + 10
    
    // Línea divisoria superior
    if (!esOriginal) {
      doc.setLineWidth(0.5)
      doc.setDrawColor(150, 150, 150)
      const dashLength = 3
      const gapLength = 3
      for (let i = 10; i < pageWidth - 10; i += dashLength + gapLength) {
        doc.line(i, currentY, Math.min(i + dashLength, pageWidth - 10), currentY)
      }
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.2)
    }
    
    // ===== HEADER CON TRES COLUMNAS =====
    const leftMargin = 10 // Margen izquierdo
    const logoSize = 20 // Tamaño del logo en mm
    const infoLocalX = leftMargin + logoSize + 5  // Después del logo con separación
    const rightMargin = 10 // Margen derecho
    const headerStartY = y
    
    // Dibujar LOGO primero (alineado a la izquierda)
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', leftMargin, headerStartY, logoSize, logoSize)
      } catch (error) {
        console.error('Error al agregar logo al PDF:', error)
      }
    }
    
    // Calcular el centro vertical del logo para alinear el texto
    const logoCenterY = headerStartY + (logoSize / 2)
    
    // COLUMNA CENTRAL - Info del Local (centrada verticalmente con el logo)
    // Comenzar el texto en el centro del logo
    let centerY = logoCenterY - 8 // Ajuste para centrar el bloque de texto
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    if (config?.nombre_local) {
      const nombreLines = doc.splitTextToSize(config.nombre_local.toUpperCase(), (pageWidth / 2) - 50)
      doc.text(nombreLines, infoLocalX, centerY)
      centerY += nombreLines.length * 4.5
    } else {
      centerY += 4.5
    }
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    
    if (config?.ubicacion) {
      doc.text(`Dirección: ${config.ubicacion}`, infoLocalX, centerY)
      centerY += 4
    }
    if (config?.celular) {
      doc.text(`Cel: ${config.celular}`, infoLocalX, centerY)
      centerY += 4
    }
    if (config?.telefono) {
      doc.text(`Tel: ${config.telefono}`, infoLocalX, centerY)
      centerY += 4
    }
    if (config?.email) {
      doc.text(`Email: ${config.email}`, infoLocalX, centerY)
      centerY += 4
    }
    
    // COLUMNA DERECHA - Original/Copia, Número, Fecha, Hora (alineada a la derecha)
    let rightY = logoCenterY - 8 // Mismo punto de inicio que columna central
    
    // ORIGINAL / COPIA
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(esOriginal ? 'ORIGINAL' : 'COPIA', pageWidth - rightMargin, rightY, { align: 'right' })
    rightY += 6
    
    // Número de comprobante
    doc.setFontSize(10)
    doc.text(`COMPROBANTE N° ${reparacion.numero_comprobante.toString().padStart(6, '0')}`, pageWidth - rightMargin, rightY, { align: 'right' })
    rightY += 6
    
    // Fecha y Hora
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const fechaIngreso = new Date(reparacion.fecha_ingreso)
    doc.text(`Fecha: ${fechaIngreso.toLocaleDateString('es-AR')}`, pageWidth - rightMargin, rightY, { align: 'right' })
    rightY += 4
    doc.text(`Hora: ${fechaIngreso.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - rightMargin, rightY, { align: 'right' })
    rightY += 4
    
    // Ajustar Y para continuar después del header
    y = Math.max(centerY, rightY, headerStartY + logoSize) + 5
    
    // ===== LÍNEA DIVISORIA =====
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(leftMargin, y, pageWidth - rightMargin, y)
    y += 8
    
    // ===== DOS COLUMNAS: DATOS DEL CLIENTE Y PRODUCTO =====
    const leftColumnX = leftMargin
    
    let leftY = y
    let clienteRightY = y
    
    // COLUMNA IZQUIERDA - DATOS DEL CLIENTE (alineado a la izquierda)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL CLIENTE', leftColumnX, leftY)
    leftY += 6
    
    doc.setFontSize(9)
    
    // Nombre
    doc.setFont('helvetica', 'bold')
    doc.text('Nombre: ', leftColumnX, leftY)
    doc.setFont('helvetica', 'normal')
    const nombreCompleto = `${reparacion.cliente_nombre} ${reparacion.cliente_apellido}`
    doc.text(nombreCompleto, leftColumnX + 17, leftY)
    leftY += 5
    
    // Celular
    doc.setFont('helvetica', 'bold')
    doc.text('Celular: ', leftColumnX, leftY)
    doc.setFont('helvetica', 'normal')
    doc.text(reparacion.cliente_celular, leftColumnX + 17, leftY)
    leftY += 5
    
    // COLUMNA DERECHA - DATOS DEL PRODUCTO (alineado a la derecha)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL PRODUCTO', pageWidth - rightMargin, clienteRightY, { align: 'right' })
    clienteRightY += 6
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    // Producto
    doc.text(`Producto: ${reparacion.producto}`, pageWidth - rightMargin, clienteRightY, { align: 'right' })
    clienteRightY += 5
    
    // Marca
    doc.text(`Marca: ${reparacion.marca}`, pageWidth - rightMargin, clienteRightY, { align: 'right' })
    clienteRightY += 5
    
    // Cargador
    const cargadorTexto = reparacion.tiene_cargador ? 'SÍ' : 'NO'
    doc.text(`Cargador: ${cargadorTexto}`, pageWidth - rightMargin, clienteRightY, { align: 'right' })
    clienteRightY += 5
    
    // Continuar después de ambas columnas
    y = Math.max(leftY, clienteRightY) + 5
    
    // ===== OBSERVACIONES (NUEVO TÍTULO) =====
    if (reparacion.observacion) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('OBSERVACIONES', leftMargin, y)
      y += 6
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const obsLines = doc.splitTextToSize(reparacion.observacion, pageWidth - leftMargin - rightMargin)
      doc.text(obsLines, leftMargin, y)
      y += obsLines.length * 4 + 5
    } else {
      y += 3
    }
    
    // ===== FOOTER - Posicionarlo cerca de la línea de corte =====
    // Calcular posición del footer antes de la línea de corte
    const footerY = esOriginal ? halfHeight - 15 : pageHeight - 15
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    
    const footerText1 = 'En caso de no ser aceptada la reparación, la revisión tiene un costo de $10,000.'
    const footerText2 = 'La revisión puede llevar entre 2 a 3 días.'
    const footerText3 = 'Si la reparación permanece más de 30 días en el local, los precios se actualizarán.'
    
    doc.text(footerText1, pageWidth / 2, footerY, { align: 'center' })
    doc.text(footerText2, pageWidth / 2, footerY + 4, { align: 'center' })
    doc.text(footerText3, pageWidth / 2, footerY + 8, { align: 'center' })
  }
  
  // Dibujar sección Original (mitad superior)
  dibujarSeccion(0, true)
  
  // Dibujar sección Copia (mitad inferior)
  dibujarSeccion(halfHeight, false)
  
  // Descargar el PDF
  const nombreArchivo = `Comprobante_${reparacion.numero_comprobante.toString().padStart(6, '0')}_${reparacion.cliente_apellido}.pdf`
  doc.save(nombreArchivo)
}
