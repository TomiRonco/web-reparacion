import jsPDF from 'jspdf'
import type { Contenedor } from '@/types/database'

export function generarPDFStock(contenedores: Contenedor[]) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let y = 20

  // Título
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('INVENTARIO DE STOCK', pageWidth / 2, y, { align: 'center' })
  y += 10

  // Fecha
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const fecha = new Date().toLocaleDateString('es-AR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  doc.text(`Fecha: ${fecha}`, pageWidth / 2, y, { align: 'center' })
  y += 15

  // Línea divisoria
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // Recorrer cada contenedor
  contenedores.forEach((contenedor, containerIndex) => {
    // Verificar si necesitamos una nueva página
    if (y > pageHeight - 40) {
      doc.addPage()
      y = 20
    }

    // Nombre del Contenedor (resaltado)
    doc.setFillColor(147, 51, 234) // purple-600
    doc.roundedRect(margin, y - 6, pageWidth - (margin * 2), 10, 2, 2, 'F')
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255) // blanco
    doc.text(contenedor.nombre.toUpperCase(), margin + 3, y, { baseline: 'middle' })
    
    doc.setTextColor(0, 0, 0) // volver a negro
    y += 12

    // Items del contenedor
    if (contenedor.items && contenedor.items.length > 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      // Headers de la tabla
      const colDetalleX = margin + 5
      const colCantidadX = pageWidth - margin - 30

      doc.setFont('helvetica', 'bold')
      doc.text('Detalle', colDetalleX, y)
      doc.text('Cant.', colCantidadX, y)
      y += 6

      // Línea debajo de headers
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y - 2, pageWidth - margin, y - 2)
      y += 2

      // Items
      doc.setFont('helvetica', 'normal')
      contenedor.items.forEach((item, itemIndex) => {
        // Verificar si necesitamos nueva página
        if (y > pageHeight - 25) {
          doc.addPage()
          y = 20
          
          // Repetir header del contenedor en nueva página
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text(`${contenedor.nombre} (continuación)`, margin, y)
          y += 8
          
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text('Detalle', colDetalleX, y)
          doc.text('Cant.', colCantidadX, y)
          y += 6
          doc.setFont('helvetica', 'normal')
        }

        // Fondo alternado para mejor lectura
        if (itemIndex % 2 === 0) {
          doc.setFillColor(245, 245, 245)
          doc.rect(margin, y - 4, pageWidth - (margin * 2), 6, 'F')
        }

        // Detalle del item (con wrapping si es muy largo)
        const maxDetalleWidth = pageWidth - margin - 50
        const detalleLines = doc.splitTextToSize(item.detalle, maxDetalleWidth)
        doc.text(detalleLines, colDetalleX, y)
        
        // Cantidad
        doc.text(`x${item.cantidad}`, colCantidadX, y)
        
        y += detalleLines.length * 5 + 1
      })

      y += 5

      // Total de items
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 100, 100)
      doc.text(`Total: ${contenedor.items.length} items`, margin + 5, y)
      doc.setTextColor(0, 0, 0)
      y += 8
    } else {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('Sin items', margin + 5, y)
      doc.setTextColor(0, 0, 0)
      y += 10
    }

    // Línea divisoria entre contenedores (excepto el último)
    if (containerIndex < contenedores.length - 1) {
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.3)
      doc.line(margin, y, pageWidth - margin, y)
      y += 10
    }
  })

  // Footer en la última página
  const totalContenedores = contenedores.length
  const totalItems = contenedores.reduce((sum, cont) => sum + (cont.items?.length || 0), 0)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(100, 100, 100)
  const footerY = pageHeight - 10
  doc.text(
    `Total de contenedores: ${totalContenedores} | Total de items: ${totalItems}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  )

  // Guardar PDF
  const nombreArchivo = `Stock_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}
