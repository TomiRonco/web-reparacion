import jsPDF from 'jspdf'
import type { Reparacion, ConfiguracionLocal } from '@/types/database'

export async function generarPDFComprobante(
  reparacion: Reparacion,
  config: ConfiguracionLocal | null
) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const halfHeight = pageHeight / 2
  
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
    
    // Título
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(esOriginal ? 'ORIGINAL' : 'COPIA', pageWidth / 2, y, { align: 'center' })
    y += 8
    
    // ===== HEADER =====
    doc.setDrawColor(200, 200, 200)
    doc.rect(10, y, pageWidth - 20, 30)
    
    // Columna izquierda - Datos del local
    const leftX = 12
    const rightX = pageWidth / 2 + 5
    let headerY = y + 5
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    
    if (config?.nombre_local) {
      doc.text(config.nombre_local.toUpperCase(), leftX, headerY)
      headerY += 4
    }
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    
    if (config?.ubicacion) {
      doc.text(`Dirección: ${config.ubicacion}`, leftX, headerY)
      headerY += 3.5
    }
    if (config?.celular) {
      doc.text(`Cel: ${config.celular}`, leftX, headerY)
      headerY += 3.5
    }
    if (config?.telefono) {
      doc.text(`Tel: ${config.telefono}`, leftX, headerY)
      headerY += 3.5
    }
    if (config?.email) {
      doc.text(`Email: ${config.email}`, leftX, headerY)
    }
    
    // Columna derecha - Fecha y número
    headerY = y + 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(`COMPROBANTE N° ${reparacion.numero_comprobante.toString().padStart(6, '0')}`, rightX, headerY)
    headerY += 5
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const fechaIngreso = new Date(reparacion.fecha_ingreso)
    doc.text(`Fecha: ${fechaIngreso.toLocaleDateString('es-AR')}`, rightX, headerY)
    headerY += 4
    doc.text(`Hora: ${fechaIngreso.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`, rightX, headerY)
    
    y += 35
    
    // ===== BODY =====
    doc.rect(10, y, pageWidth - 20, 40)
    
    let bodyY = y + 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('DATOS DEL CLIENTE', 12, bodyY)
    bodyY += 5
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`Nombre: ${reparacion.cliente_nombre} ${reparacion.cliente_apellido}`, 12, bodyY)
    bodyY += 4
    doc.text(`Celular: ${reparacion.cliente_celular}`, 12, bodyY)
    bodyY += 6
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('DATOS DEL PRODUCTO', 12, bodyY)
    bodyY += 5
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`Producto: ${reparacion.producto}`, 12, bodyY)
    bodyY += 4
    doc.text(`Marca: ${reparacion.marca}`, 12, bodyY)
    bodyY += 4
    doc.text(`Cargador: ${reparacion.tiene_cargador ? 'SÍ' : 'NO'}`, 12, bodyY)
    
    if (reparacion.observacion) {
      bodyY += 4
      const observacionLines = doc.splitTextToSize(`Observación: ${reparacion.observacion}`, pageWidth - 24)
      doc.text(observacionLines, 12, bodyY)
    }
    
    y += 45
    
    // ===== FOOTER =====
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    
    const footerText1 = 'En caso de no ser aceptada la reparación, la revisión tiene un costo de $10,000.'
    const footerText2 = 'La revisión puede llevar entre 2 a 3 días.'
    const footerText3 = 'Si la reparación permanece más de 30 días en el local, los precios se actualizarán.'
    
    doc.text(footerText1, pageWidth / 2, y + 2, { align: 'center' })
    doc.text(footerText2, pageWidth / 2, y + 6, { align: 'center' })
    doc.text(footerText3, pageWidth / 2, y + 10, { align: 'center' })
  }
  
  // Dibujar sección Original (mitad superior)
  dibujarSeccion(0, true)
  
  // Dibujar sección Copia (mitad inferior)
  dibujarSeccion(halfHeight, false)
  
  // Descargar el PDF
  const nombreArchivo = `Comprobante_${reparacion.numero_comprobante.toString().padStart(6, '0')}_${reparacion.cliente_apellido}.pdf`
  doc.save(nombreArchivo)
}
