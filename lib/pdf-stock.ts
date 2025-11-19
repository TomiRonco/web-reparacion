import jsPDF from 'jspdf'
import type { Contenedor } from '@/types/database'

export function generarPDFStock(contenedores: Contenedor[]) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  const headerHeight = 35
  
  // Configuración del grid
  const cols = 2 // 2 columnas
  const boxWidth = (pageWidth - margin * 3) / cols // Ancho de cada caja
  const boxMargin = 5 // Margen interno de la caja
  
  let currentPage = 1
  let boxIndex = 0

  // Función para dibujar header con fecha
  const drawHeader = () => {
    let y = 15
    
    // Título
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('INVENTARIO DE STOCK', pageWidth / 2, y, { align: 'center' })
    y += 8

    // Fecha del día
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const fecha = new Date().toLocaleDateString('es-AR', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    doc.text(fecha.charAt(0).toUpperCase() + fecha.slice(1), pageWidth / 2, y, { align: 'center' })
    y += 8

    // Línea divisoria
    doc.setDrawColor(147, 51, 234) // purple-600
    doc.setLineWidth(0.8)
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
    const x = margin + col * (boxWidth + margin)
    const y = headerHeight + row * 125 // 125 es la altura aproximada de cada caja
    
    // Verificar si necesitamos una nueva página
    if (y + 120 > pageHeight - 10) {
      doc.addPage()
      currentPage++
      drawHeader()
      boxIndex = 0 // Reiniciar el índice en la nueva página
      i-- // Volver a procesar este contenedor en la nueva página
      continue
    }

    // Calcular altura necesaria para el contenedor
    const itemCount = contenedor.items?.length || 0
    const itemHeight = 5
    const baseHeight = 25
    const boxHeight = Math.min(baseHeight + itemCount * itemHeight, 115)

    // Dibujar borde de la caja
    doc.setDrawColor(147, 51, 234) // purple-600
    doc.setLineWidth(0.5)
    doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2)

    // Header del contenedor (fondo morado)
    doc.setFillColor(147, 51, 234) // purple-600
    doc.roundedRect(x, y, boxWidth, 12, 2, 2, 'F')
    
    // Nombre del contenedor
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255) // blanco
    const nombreTruncado = doc.splitTextToSize(contenedor.nombre.toUpperCase(), boxWidth - boxMargin * 2)
    doc.text(nombreTruncado[0], x + boxMargin, y + 8)
    
    // Volver a color negro
    doc.setTextColor(0, 0, 0)
    
    let itemY = y + 18

    // Items del contenedor
    if (contenedor.items && contenedor.items.length > 0) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')

      // Mostrar items (máximo espacio disponible)
      const maxItems = Math.floor((boxHeight - 25) / itemHeight)
      const itemsToShow = contenedor.items.slice(0, maxItems)

      itemsToShow.forEach((item, idx) => {
        // Fondo alternado
        if (idx % 2 === 0) {
          doc.setFillColor(248, 248, 248)
          doc.rect(x + 1, itemY - 3, boxWidth - 2, itemHeight, 'F')
        }

        // Detalle truncado
        const maxWidth = boxWidth - boxMargin * 2 - 15
        const detalleText = doc.splitTextToSize(item.detalle, maxWidth)
        doc.setFont('helvetica', 'normal')
        doc.text(detalleText[0], x + boxMargin, itemY)
        
        // Cantidad en negrita
        doc.setFont('helvetica', 'bold')
        doc.text(`x${item.cantidad}`, x + boxWidth - boxMargin - 10, itemY, { align: 'right' })
        
        itemY += itemHeight
      })

      // Si hay más items, mostrar indicador
      if (contenedor.items.length > maxItems) {
        doc.setFontSize(7)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(100, 100, 100)
        doc.text(`+${contenedor.items.length - maxItems} más...`, x + boxMargin, itemY)
        doc.setTextColor(0, 0, 0)
        itemY += 5
      }

      // Total de items en el footer de la caja
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(147, 51, 234)
      doc.text(
        `Total: ${contenedor.items.length} items`,
        x + boxWidth / 2,
        y + boxHeight - 4,
        { align: 'center' }
      )
      doc.setTextColor(0, 0, 0)
    } else {
      // Sin items
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('Sin items', x + boxWidth / 2, itemY + 10, { align: 'center' })
      doc.setTextColor(0, 0, 0)
    }

    boxIndex++
  }

  // Footer en la última página
  const totalContenedores = contenedores.length
  const totalItems = contenedores.reduce((sum, cont) => sum + (cont.items?.length || 0), 0)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(100, 100, 100)
  const footerY = pageHeight - 8
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
