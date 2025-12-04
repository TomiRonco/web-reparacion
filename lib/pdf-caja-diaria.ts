import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { TransaccionCaja } from '@/types/database'

export const generarPDFCajaDiaria = (
  transacciones: TransaccionCaja[],
  fecha: string,
  totalIngresos: number,
  totalEgresos: number,
  totalCaja: number,
  nombreLocal?: string
) => {
  const doc = new jsPDF()
  
  // Configuración
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPosition = 20

  // Encabezado
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(nombreLocal || 'Sistema de Reparaciones', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 10
  doc.setFontSize(16)
  doc.text('Reporte de Caja Diaria', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  const fechaFormateada = new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  doc.text(`Fecha: ${fechaFormateada}`, pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 15

  // Resumen
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen', 14, yPosition)
  
  yPosition += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  // Cuadro de resumen
  const resumenData = [
    ['Ingresos', `$${totalIngresos.toFixed(2)}`],
    ['Egresos', `$${totalEgresos.toFixed(2)}`],
    ['Total en Caja', `$${totalCaja.toFixed(2)}`]
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: resumenData,
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // Detalle de transacciones
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalle de Transacciones', 14, yPosition)
  
  yPosition += 5

  const transaccionesData = transacciones.map(t => [
    new Date(t.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso',
    t.detalle,
    `${t.tipo === 'ingreso' ? '+' : '-'}$${Number(t.monto).toFixed(2)}`
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Hora', 'Tipo', 'Detalle', 'Monto']],
    body: transaccionesData,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [71, 85, 105], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 90 },
      3: { halign: 'right', cellWidth: 30 }
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      // Colorear los montos según tipo
      if (data.column.index === 3 && data.section === 'body') {
        const valor = data.cell.text[0]
        if (valor.startsWith('+')) {
          data.cell.styles.textColor = [22, 163, 74] // verde
        } else if (valor.startsWith('-')) {
          data.cell.styles.textColor = [220, 38, 38] // rojo
        }
      }
    }
  })

  // Pie de página
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Descargar
  doc.save(`caja_diaria_${fecha}.pdf`)
}
