import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Tecnico } from '@/types/database'

interface ReparacionTecnico {
  numero_comprobante: number
  diagnostico: string
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
  
  // Título
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Reporte de Ganancias por Técnico', pageWidth / 2, 20, { align: 'center' })
  
  // Nombre del local
  if (nombreLocal) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(nombreLocal, pageWidth / 2, 28, { align: 'center' })
  }
  
  // Período
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const periodoTexto = `Período: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`
  doc.text(periodoTexto, pageWidth / 2, 36, { align: 'center' })
  
  let startY = 45
  
  // Total general
  const totalGeneral = ganancias.reduce((sum, g) => sum + g.total_ganancia, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total General: $${totalGeneral.toLocaleString()}`, 14, startY)
  
  startY += 10
  
  // Generar tabla para cada técnico
  ganancias.forEach((ganancia, index) => {
    if (index > 0) {
      startY += 8
    }
    
    // Información del técnico
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(
      `${ganancia.tecnico.nombre} ${ganancia.tecnico.apellido}`,
      14,
      startY
    )
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Total: $${ganancia.total_ganancia.toLocaleString()} | Reparaciones: ${ganancia.reparaciones.length}`,
      14,
      startY + 5
    )
    
    startY += 10
    
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
      head: [['N° Comprobante', 'Detalle', 'Mano de Obra', 'Estado', 'Fecha']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 80 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'center' }
      },
      margin: { left: 14, right: 14 }
    })
    
    startY = (doc as any).lastAutoTable.finalY + 5
    
    // Verificar si necesitamos una nueva página
    if (startY > doc.internal.pageSize.getHeight() - 30 && index < ganancias.length - 1) {
      doc.addPage()
      startY = 20
    }
  })
  
  // Footer con fecha de generación
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-AR')} | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
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

function formatearFecha(fecha: string): string {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
