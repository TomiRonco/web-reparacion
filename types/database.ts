export interface ConfiguracionLocal {
  id: string
  user_id: string
  nombre_local: string | null
  logo_url: string | null
  ubicacion: string | null
  telefono: string | null
  celular: string | null
  email: string | null
  facebook: string | null
  instagram: string | null
  whatsapp: string | null
  horarios: string | null
  created_at: string
  updated_at: string
}

export interface Tecnico {
  id: string
  user_id: string
  nombre: string
  apellido: string
  celular: string
  created_at: string
  updated_at: string
}

export type EstadoReparacion = 'pendiente' | 'en_proceso' | 'finalizada' | 'entregada'

export interface Reparacion {
  id: string
  user_id: string
  numero_comprobante: number
  
  // Datos del cliente
  cliente_nombre: string
  cliente_apellido: string
  cliente_celular: string
  
  // Datos del producto
  producto: string
  marca: string
  tiene_cargador: boolean
  observacion: string | null
  notas: string | null
  
  // Asignación y estado
  tecnico_id: string | null
  estado: EstadoReparacion
  
  // Diagnóstico y costo
  diagnostico: string | null
  monto: number | null
  
  // Fechas
  fecha_ingreso: string
  fecha_actualizado: string
  fecha_finalizado: string | null
  fecha_entregado: string | null
  
  created_at: string
  updated_at: string
  
  // Relaciones
  tecnicos?: Tecnico
}

export interface ReparacionFormData {
  cliente_nombre: string
  cliente_apellido: string
  cliente_celular: string
  producto: string
  marca: string
  tiene_cargador: boolean
  observacion: string
  notas: string
  tecnico_id: string
}

export interface TecnicoFormData {
  nombre: string
  apellido: string
  celular: string
}

export interface DiagnosticoFormData {
  diagnostico: string
  monto: number
}

export interface Estadisticas {
  total_reparaciones: number
  total_pendientes: number
  total_en_proceso: number
  total_finalizadas: number
  total_entregadas: number
  ingresos_totales: number
  tecnico_mas_activo: {
    tecnico: Tecnico | null
    cantidad: number
  }
  reparaciones_por_mes: {
    mes: string
    cantidad: number
  }[]
}

// Tipos para Presupuestos
export interface PresupuestoItem {
  cantidad: number
  detalle: string
  precio: number
  subtotal: number
}

export interface Presupuesto {
  id: string
  user_id: string
  numero_presupuesto: number
  
  // Datos del cliente (opcionales)
  cliente_nombre: string | null
  cliente_cuit: string | null
  cliente_direccion: string | null
  
  // Items del presupuesto
  items: PresupuestoItem[]
  
  // Observaciones opcionales
  observaciones: string | null
  
  // Total
  total: number
  
  // Fechas
  fecha_creacion: string
  created_at: string
  updated_at: string
}

export interface PresupuestoFormData {
  cliente_nombre: string
  cliente_cuit: string
  cliente_direccion: string
  observaciones: string
  items: PresupuestoItem[]
}
