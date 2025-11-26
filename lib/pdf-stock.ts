import jsPDF from 'jspdf'
import type { Contenedor, UbicacionStock } from '@/types/database'

export function generarPDFStock(contenedores: Contenedor[], ubicacion?: UbicacionStock) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 6
  const headerHeight = 28
  
  // Configuración del grid - 3 columnas
  const cols = 3
  const boxWidth = (pageWidth - margin * (cols + 1)) / cols
  const boxMargin = 2
  const boxSpacing = 3 // Espacio entre cajas verticalmente
  
  let currentPage = 1
  
  // Array para trackear la posición Y actual de cada columna
  const columnY = [headerHeight, headerHeight, headerHeight]

  // Función para dibujar header con fecha
  const drawHeader = () => {
    let y = 10
    
    // Título
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    const titulo = ubicacion === 'adelante' ? 'INVENTARIO DE STOCK - ADELANTE' : 'INVENTARIO DE STOCK - ATRÁS'
    doc.text(titulo, pageWidth / 2, y, { align: 'center' })
    y += 7

    // Fecha del día
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const fecha = new Date().toLocaleDateString('es-AR', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    doc.text(fecha.charAt(0).toUpperCase() + fecha.slice(1), pageWidth / 2, y, { align: 'center' })
    y += 6

    // Línea divisoria
    doc.setDrawColor(147, 51, 234) // purple-600
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
  }

  // Dibujar header inicial
  drawHeader()

  // Recorrer cada contenedor
  contenedores.forEach((contenedor) => {
    // Encontrar la columna con menor altura (colocar donde hay más espacio)
    const colIndex = columnY.indexOf(Math.min(...columnY))
    
    // Calcular altura necesaria para el contenedor
    const itemCount = contenedor.items?.length || 0
    const itemHeight = 4
    const headerBoxHeight = 8
    const footerBoxHeight = 6
    const minEmptyHeight = 14
    
    // Altura real basada en contenido
    let boxHeight = headerBoxHeight + footerBoxHeight
    if (itemCount > 0) {
      boxHeight += itemCount * itemHeight
    } else {
      boxHeight += minEmptyHeight
    }

    // Calcular coordenadas X e Y
    const x = margin + colIndex * (boxWidth + boxSpacing)
    let y = columnY[colIndex]
    
    // Verificar si necesitamos una nueva página
    if (y + boxHeight > pageHeight - 10) {
      doc.addPage()
      currentPage++
      drawHeader()
      // Resetear todas las columnas
      columnY.fill(headerHeight)
      y = headerHeight
    }

    // Dibujar borde de la caja
    doc.setDrawColor(147, 51, 234) // purple-600
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, boxWidth, boxHeight, 1, 1)

    // Header del contenedor (fondo morado)
    doc.setFillColor(147, 51, 234) // purple-600
    doc.roundedRect(x, y, boxWidth, headerBoxHeight, 1, 1, 'F')
    
    // Nombre del contenedor
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255) // blanco
    const nombreTruncado = doc.splitTextToSize(contenedor.nombre.toUpperCase(), boxWidth - boxMargin * 2)
    doc.text(nombreTruncado[0], x + boxMargin, y + 5.5)
    
    // Volver a color negro
    doc.setTextColor(0, 0, 0)
    
    let itemY = y + headerBoxHeight + 4

    // Items del contenedor
    if (contenedor.items && contenedor.items.length > 0) {
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'normal')

      contenedor.items.forEach((item, idx) => {
        // Fondo alternado - ajustado para alinearse con el texto
        if (idx % 2 === 0) {
          doc.setFillColor(248, 248, 248)
          doc.rect(x + 0.5, itemY - 2.5, boxWidth - 1, itemHeight, 'F')
        }

        // Detalle truncado
        const maxWidth = boxWidth - boxMargin * 2 - 10
        const detalleText = doc.splitTextToSize(item.detalle, maxWidth)
        doc.setFont('helvetica', 'normal')
        doc.text(detalleText[0], x + boxMargin, itemY)
        
        // Cantidad en negrita - alineada a la derecha del contenedor
        doc.setFont('helvetica', 'bold')
        doc.text(`x${item.cantidad}`, x + boxWidth - boxMargin, itemY, { align: 'right' })
        
        itemY += itemHeight
      })

      // Total de items en el footer de la caja
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(147, 51, 234)
      doc.text(
        `Total: ${contenedor.items.length} items`,
        x + boxWidth / 2,
        y + boxHeight - 2,
        { align: 'center' }
      )
      doc.setTextColor(0, 0, 0)
    } else {
      // Sin items
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('Sin items', x + boxWidth / 2, itemY + 2, { align: 'center' })
      doc.setTextColor(0, 0, 0)
    }

    // Actualizar la posición Y de esta columna
    columnY[colIndex] = y + boxHeight + boxSpacing
  })

  // Footer en la última página
  const totalContenedores = contenedores.length
  const totalItems = contenedores.reduce((sum, cont) => sum + (cont.items?.length || 0), 0)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(100, 100, 100)
  const footerY = pageHeight - 6
  doc.text(
    `${totalContenedores} contenedores | ${totalItems} items totales | Página ${currentPage}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  )

  // Guardar PDF
  const nombreArchivo = `Stock_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}
