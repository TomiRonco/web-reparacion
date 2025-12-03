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

export interface RepuestoItem {
  detalle: string
  precio: number
  marca?: string
  capacidad?: string
  proveedor?: string
}

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
  contrasena: string | null
  observacion: string | null
  notas: string | null
  
  // Asignación y estado
  tecnico_id: string | null
  estado: EstadoReparacion
  
  // Diagnóstico y costo
  diagnostico: string | null
  mano_obra: number | null
  repuestos: RepuestoItem[]
  monto: number | null  // Total calculado: mano_obra + suma(repuestos)
  
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
  contrasena: string
  observacion: string
  tecnico_id?: string  // Ahora es opcional al crear, se selecciona al editar
}

export interface TecnicoFormData {
  nombre: string
  apellido: string
  celular: string
}

export interface DiagnosticoFormData {
  diagnostico: string
  mano_obra: number
  repuestos: RepuestoItem[]
  tecnico_id: string
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
  
  // Flag para mostrar precios
  mostrar_precios: boolean
  
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

// Tipos para Stock
export type MonedaStock = 'USD' | 'ARS'

export interface ItemStock {
  id?: string
  detalle: string
  cantidad: number
  costo?: number
  moneda?: MonedaStock
}

export type UbicacionStock = 'adelante' | 'atras'

export interface Contenedor {
  id: string
  user_id: string
  nombre: string
  items: ItemStock[]
  ubicacion: UbicacionStock
  created_at: string
  updated_at: string
}

export interface ContenedorFormData {
  nombre: string
  items: ItemStock[]
  ubicacion?: UbicacionStock
}

// Tipos para Pedidos
export interface ItemPedido {
  detalle: string
  cantidad: number
}

export interface Pedido {
  id: string
  user_id: string
  proveedor: string
  items: ItemPedido[]
  completado: boolean
  created_at: string
  updated_at: string
}

export interface PedidoFormData {
  proveedor: string
  items: ItemPedido[]
}

// Tipos para Pagos a Proveedores
export type TipoComprobante = 'factura' | 'remito' | 'presupuesto' | 'nota_credito'
export type Moneda = 'ARS' | 'USD'

export interface ProveedorPago {
  id: string
  user_id: string
  nombre: string
  orden: number
  created_at: string
  updated_at: string
}

export interface Comprobante {
  id: string
  user_id: string
  proveedor_id: string
  tipo: TipoComprobante
  numero: string
  fecha: string
  monto: number
  moneda: Moneda
  pagado: boolean
  created_at: string
  updated_at: string
}

export interface PagoRealizado {
  id: string
  user_id: string
  proveedor_id: string
  comprobante_ids: string[]
  fecha_pago: string
  monto_pagado: number
  moneda: Moneda
  notas: string | null
  created_at: string
  updated_at: string
}

export interface ComprobanteFormData {
  proveedor_id: string
  tipo: TipoComprobante
  numero: string
  fecha: string
  monto: number
  moneda: Moneda
}

export interface PagoFormData {
  proveedor_id: string
  comprobante_ids: string[]
  fecha_pago: string
  monto_pagado: number
  moneda: Moneda
  notas?: string
}

export interface ResumenProveedor {
  total_gastado_ars: number
  total_gastado_usd: number
  total_pagado_ars: number
  total_pagado_usd: number
  deuda_ars: number
  deuda_usd: number
}
