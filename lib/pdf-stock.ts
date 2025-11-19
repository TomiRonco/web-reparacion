import jsPDF from 'jspdf'
import type { Contenedor } from '@/types/database'

export function generarPDFStock(contenedores: Contenedor[]) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 6
  const headerHeight = 25
  
  // Configuración del grid - 3 columnas para aprovechar más espacio
  const cols = 3
  const boxWidth = (pageWidth - margin * (cols + 1)) / cols // Ancho de cada caja
  const boxMargin = 2 // Margen interno de la caja
  const boxSpacing = 2 // Espacio entre cajas
  
  let currentPage = 1
  let boxIndex = 0

  // Función para dibujar header con fecha
  const drawHeader = () => {
    let y = 10
    
    // Título
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INVENTARIO DE STOCK', pageWidth / 2, y, { align: 'center' })
    y += 6

    // Fecha del día
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const fecha = new Date().toLocaleDateString('es-AR', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    doc.text(fecha.charAt(0).toUpperCase() + fecha.slice(1), pageWidth / 2, y, { align: 'center' })
    y += 5

    // Línea divisoria
    doc.setDrawColor(147, 51, 234) // purple-600
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
  }

  // Dibujar header inicial
  drawHeader()

  // Recorrer cada contenedor
  for (let i = 0; i < contenedores.length; i++) {
    const contenedor = contenedores[i]
    
    // Calcular posición en el grid
    const col = boxIndex % cols
    const row = Math.floor(boxIndex / cols)
    
    // Calcular coordenadas X e Y
    const x = margin + col * (boxWidth + boxSpacing)
    const y = headerHeight + row * 65 // 65 es la altura ultra-compacta de cada caja
    
    // Verificar si necesitamos una nueva página
    if (y + 63 > pageHeight - 6) {
      doc.addPage()
      currentPage++
      drawHeader()
      boxIndex = 0 // Reiniciar el índice en la nueva página
      i-- // Volver a procesar este contenedor en la nueva página
      continue
    }

    // Calcular altura necesaria para el contenedor
    const itemCount = contenedor.items?.length || 0
    const itemHeight = 4
    const baseHeight = 18
    const boxHeight = Math.min(baseHeight + itemCount * itemHeight, 62)

    // Dibujar borde de la caja
    doc.setDrawColor(147, 51, 234) // purple-600
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, boxWidth, boxHeight, 1, 1)

    // Header del contenedor (fondo morado)
    doc.setFillColor(147, 51, 234) // purple-600
    doc.roundedRect(x, y, boxWidth, 8, 1, 1, 'F')
    
    // Nombre del contenedor
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255) // blanco
    const nombreTruncado = doc.splitTextToSize(contenedor.nombre.toUpperCase(), boxWidth - boxMargin * 2)
    doc.text(nombreTruncado[0], x + boxMargin, y + 5.5)
    
    // Volver a color negro
    doc.setTextColor(0, 0, 0)
    
    let itemY = y + 12

    // Items del contenedor
    if (contenedor.items && contenedor.items.length > 0) {
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')

      // Mostrar items (máximo espacio disponible)
      const maxItems = Math.floor((boxHeight - 14) / itemHeight)
      const itemsToShow = contenedor.items.slice(0, maxItems)

      itemsToShow.forEach((item, idx) => {
        // Fondo alternado
        if (idx % 2 === 0) {
          doc.setFillColor(248, 248, 248)
          doc.rect(x + 0.5, itemY - 2, boxWidth - 1, itemHeight, 'F')
        }

        // Detalle truncado
        const maxWidth = boxWidth - boxMargin * 2 - 10
        const detalleText = doc.splitTextToSize(item.detalle, maxWidth)
        doc.setFont('helvetica', 'normal')
        doc.text(detalleText[0], x + boxMargin, itemY)
        
        // Cantidad en negrita
        doc.setFont('helvetica', 'bold')
        doc.text(`x${item.cantidad}`, x + boxWidth - boxMargin - 7, itemY, { align: 'right' })
        
        itemY += itemHeight
      })

      // Si hay más items, mostrar indicador
      if (contenedor.items.length > maxItems) {
        doc.setFontSize(5.5)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(100, 100, 100)
        doc.text(`+${contenedor.items.length - maxItems} más...`, x + boxMargin, itemY)
        doc.setTextColor(0, 0, 0)
        itemY += 3
      }

      // Total de items en el footer de la caja
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(147, 51, 234)
      doc.text(
        `Total: ${contenedor.items.length} items`,
        x + boxWidth / 2,
        y + boxHeight - 2.5,
        { align: 'center' }
      )
      doc.setTextColor(0, 0, 0)
    } else {
      // Sin items
      doc.setFontSize(7)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('Sin items', x + boxWidth / 2, itemY + 6, { align: 'center' })
      doc.setTextColor(0, 0, 0)
    }

    boxIndex++
  }

  // Footer en la última página
  const totalContenedores = contenedores.length
  const totalItems = contenedores.reduce((sum, cont) => sum + (cont.items?.length || 0), 0)
  
  doc.setFontSize(7)
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
