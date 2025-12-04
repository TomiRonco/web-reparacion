import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Tecnico } from '@/types/database'

interface ReparacionTecnico {
  numero_comprobante: number
  diagnostico: string | null
  mano_obra: number
  estado: string
  fecha_ingreso: string
}

interface GananciaTecnico {
  tecnico: Tecnico
  reparaciones: ReparacionTecnico[]
  total_ganancia: number
}

export async function generarPDFEstadisticasTecnicos(
  ganancias: GananciaTecnico[],
  fechaInicio: string,
  fechaFin: string,
  nombreLocal?: string
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  // Título
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Reporte de Ganancias por Técnico', pageWidth / 2, 22, { align: 'center' })
  
  // Nombre del local
  if (nombreLocal) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.text(nombreLocal, pageWidth / 2, 32, { align: 'center' })
  }
  
  // Período
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const periodoTexto = `Período: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`
  doc.text(periodoTexto, pageWidth / 2, nombreLocal ? 40 : 38, { align: 'center' })
  
  let startY = nombreLocal ? 52 : 48
  
  // Total general con caja destacada
  const totalGeneral = ganancias.reduce((sum, g) => sum + g.total_ganancia, 0)
  doc.setFillColor(34, 197, 94) // Verde
  doc.roundedRect(14, startY - 8, pageWidth - 28, 12, 2, 2, 'F')
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(`TOTAL GENERAL: $${totalGeneral.toLocaleString()}`, pageWidth / 2, startY - 1, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  
  startY += 12
  
  // Generar tabla para cada técnico
  ganancias.forEach((ganancia, index) => {
    // Verificar si necesitamos una nueva página antes de empezar un nuevo técnico
    if (startY > pageHeight - 60) {
      doc.addPage()
      startY = 20
    }
    
    if (index > 0) {
      startY += 10
    }
    
    // Información del técnico con fondo
    doc.setFillColor(240, 240, 240)
    doc.roundedRect(14, startY - 6, pageWidth - 28, 14, 1, 1, 'F')
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(
      `${ganancia.tecnico.nombre} ${ganancia.tecnico.apellido}`,
      18,
      startY
    )
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const reparacionesPagadas = ganancia.reparaciones.filter(r => r.estado === 'entregada').length
    doc.text(
      `Total: $${ganancia.total_ganancia.toLocaleString()} | ${ganancia.reparaciones.length} reparaciones (${reparacionesPagadas} pagadas)`,
      18,
      startY + 6
    )
    
    doc.setTextColor(0, 0, 0)
    startY += 14
    
    // Tabla de reparaciones
    const tableData = ganancia.reparaciones.map(rep => [
      `#${rep.numero_comprobante.toString().padStart(6, '0')}`,
      rep.diagnostico || 'Sin diagnóstico',
      rep.mano_obra && rep.mano_obra > 0 ? `$${rep.mano_obra.toLocaleString()}` : 'Sin asignar',
      rep.estado === 'entregada' ? 'Pagada' : 'No Pagada',
      formatearFecha(rep.fecha_ingreso)
    ])
    
    autoTable(doc, {
      startY: startY,
      head: [['N° Comp.', 'Detalle', 'Mano de Obra', 'Estado', 'Fecha']],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 28, halign: 'left' },
        1: { cellWidth: 70 },
        2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        3: { cellWidth: 28, halign: 'center', fontSize: 8 },
        4: { cellWidth: 28, halign: 'center' }
      },
      margin: { left: 14, right: 14 },
      didParseCell: function(data) {
        // Colorear la columna de estado
        if (data.column.index === 3 && data.section === 'body') {
          if (data.cell.raw === 'Pagada') {
            data.cell.styles.textColor = [22, 163, 74] // Verde
            data.cell.styles.fontStyle = 'bold'
          } else {
            data.cell.styles.textColor = [202, 138, 4] // Amarillo oscuro
          }
        }
        // Colorear mano de obra
        if (data.column.index === 2 && data.section === 'body') {
          if (data.cell.raw === 'Sin asignar') {
            data.cell.styles.textColor = [156, 163, 175] // Gris
            data.cell.styles.fontStyle = 'italic'
          } else {
            data.cell.styles.textColor = [22, 163, 74] // Verde
          }
        }
      }
    })
    
    startY = (doc as any).lastAutoTable.finalY + 8
  })
  
  // Footer con fecha de generación
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    const footerY = pageHeight - 10
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      14,
      footerY
    )
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 14,
      footerY,
      { align: 'right' }
    )
  }
  
  return doc
}

export async function descargarPDFEstadisticasTecnicos(
  ganancias: GananciaTecnico[],
  fechaInicio: string,
  fechaFin: string,
  nombreLocal?: string
) {
  const doc = await generarPDFEstadisticasTecnicos(ganancias, fechaInicio, fechaFin, nombreLocal)
  const nombreArchivo = `estadisticas-tecnicos-${fechaInicio}-${fechaFin}.pdf`
  doc.save(nombreArchivo)
}

export async function generarPDFTecnicoIndividual(
  ganancia: GananciaTecnico,
  fechaInicio: string,
  fechaFin: string,
  nombreLocal?: string
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  // Título
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Reporte de Ganancias', pageWidth / 2, 22, { align: 'center' })
  
  // Nombre del local
  if (nombreLocal) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.text(nombreLocal, pageWidth / 2, 32, { align: 'center' })
  }
  
  // Período
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const periodoTexto = `Período: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`
  doc.text(periodoTexto, pageWidth / 2, nombreLocal ? 40 : 38, { align: 'center' })
  
  let startY = nombreLocal ? 52 : 48
  
  // Información del técnico con fondo destacado
  doc.setFillColor(34, 197, 94) // Verde
  doc.roundedRect(14, startY - 8, pageWidth - 28, 18, 2, 2, 'F')
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(
    `${ganancia.tecnico.nombre} ${ganancia.tecnico.apellido}`,
    pageWidth / 2,
    startY - 1,
    { align: 'center' }
  )
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const reparacionesPagadas = ganancia.reparaciones.filter(r => r.estado === 'entregada').length
  doc.text(
    `${ganancia.reparaciones.length} reparaciones • ${reparacionesPagadas} pagadas`,
    pageWidth / 2,
    startY + 5,
    { align: 'center' }
  )
  
  doc.setTextColor(0, 0, 0)
  startY += 20
  
  // Total de mano de obra con caja destacada
  doc.setFillColor(240, 240, 240)
  doc.roundedRect(14, startY, pageWidth - 28, 12, 2, 2, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(34, 197, 94)
  doc.text(
    `TOTAL MANO DE OBRA: $${ganancia.total_ganancia.toLocaleString()}`,
    pageWidth / 2,
    startY + 7,
    { align: 'center' }
  )
  doc.setTextColor(0, 0, 0)
  
  startY += 18
  
  // Tabla de reparaciones
  const tableData = ganancia.reparaciones.map(rep => [
    `#${rep.numero_comprobante.toString().padStart(6, '0')}`,
    rep.diagnostico || 'Sin diagnóstico',
    rep.mano_obra && rep.mano_obra > 0 ? `$${rep.mano_obra.toLocaleString()}` : 'Sin asignar',
    rep.estado === 'entregada' ? 'Pagada' : 'No Pagada',
    formatearFecha(rep.fecha_ingreso)
  ])
  
  autoTable(doc, {
    startY: startY,
    head: [['N° Comp.', 'Detalle', 'Mano de Obra', 'Estado', 'Fecha']],
    body: tableData,
    theme: 'striped',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 28, halign: 'left' },
      1: { cellWidth: 70 },
      2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 28, halign: 'center', fontSize: 8 },
      4: { cellWidth: 28, halign: 'center' }
    },
    margin: { left: 14, right: 14 },
    didParseCell: function(data) {
      // Colorear la columna de estado
      if (data.column.index === 3 && data.section === 'body') {
        if (data.cell.raw === 'Pagada') {
          data.cell.styles.textColor = [22, 163, 74] // Verde
          data.cell.styles.fontStyle = 'bold'
        } else {
          data.cell.styles.textColor = [202, 138, 4] // Amarillo oscuro
        }
      }
      // Colorear mano de obra
      if (data.column.index === 2 && data.section === 'body') {
        if (data.cell.raw === 'Sin asignar') {
          data.cell.styles.textColor = [156, 163, 175] // Gris
          data.cell.styles.fontStyle = 'italic'
        } else {
          data.cell.styles.textColor = [22, 163, 74] // Verde
        }
      }
    }
  })
  
  // Footer con fecha de generación
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    const footerY = pageHeight - 10
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      14,
      footerY
    )
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 14,
      footerY,
      { align: 'right' }
    )
  }
  
  return doc
}

export async function descargarPDFTecnicoIndividual(
  ganancia: GananciaTecnico,
  fechaInicio: string,
  fechaFin: string,
  nombreLocal?: string
) {
  const doc = await generarPDFTecnicoIndividual(ganancia, fechaInicio, fechaFin, nombreLocal)
  const nombreTecnico = `${ganancia.tecnico.nombre}-${ganancia.tecnico.apellido}`.toLowerCase().replace(/\s+/g, '-')
  const nombreArchivo = `ganancia-${nombreTecnico}-${fechaInicio}-${fechaFin}.pdf`
  doc.save(nombreArchivo)
}

function formatearFecha(fecha: string): string {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
