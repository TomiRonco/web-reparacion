'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Clock, 
  CheckCircle2, 
  User,
  AlertCircle,
  Wrench,
  Box,
  AlertTriangle,
  Archive,
  BarChart3,
  Settings
} from 'lucide-react'
import type { Tecnico } from '@/types/database'
import PageHeader from '@/components/PageHeader'

type TabType = 'reparaciones' | 'stock'

interface ItemStock {
  detalle: string
  cantidad: number
  costo?: number
  moneda?: 'USD' | 'ARS'
}

interface Contenedor {
  id: string
  nombre: string
  ubicacion: 'adelante' | 'atras'
  items: ItemStock[]
}

interface AlertaStock {
  nombre_producto: string
  cantidad_total: number
  cantidad_adelante: number
  cantidad_atras: number
  umbral: number
}

interface ValorInventario {
  totalUSD: number
  totalARS: number
}

interface ConfiguracionStock {
  umbral_bajo: number
  mostrar_alertas: boolean
}

interface EstadisticasData {
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
  reparaciones_por_estado: {
    estado: string
    cantidad: number
  }[]
}

export default function EstadisticasPage() {
  const [tabActiva, setTabActiva] = useState<TabType>('reparaciones')
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados para stock
  const [contenedores, setContenedores] = useState<Contenedor[]>([])
  const [alertasStock, setAlertasStock] = useState<AlertaStock[]>([])
  const [valorInventario, setValorInventario] = useState<ValorInventario>({ totalUSD: 0, totalARS: 0 })
  const [configuracion, setConfiguracion] = useState<ConfiguracionStock>({
    umbral_bajo: 5,
    mostrar_alertas: true
  })
  const [modalConfigAbierto, setModalConfigAbierto] = useState(false)
  
  const supabase = createClient()

  const fetchEstadisticasStock = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch todos los contenedores con items
    const { data: contenedoresData } = await supabase
      .from('contenedores')
      .select('*')
      .eq('user_id', user.id)

    if (!contenedoresData) return
    
    setContenedores(contenedoresData)

    // Calcular productos consolidados y alertas
    const productosMap = new Map<string, { total: number; adelante: number; atras: number }>()
    
    // Variables para calcular valor total del inventario
    let totalUSD = 0
    let totalARS = 0
    
    contenedoresData.forEach((contenedor: Contenedor) => {
      if (contenedor.items && Array.isArray(contenedor.items)) {
        contenedor.items.forEach((item: ItemStock) => {
          const nombre = item.detalle.toLowerCase().trim()
          const cantidad = item.cantidad || 0
          
          // Calcular valor del inventario
          if (item.costo && item.costo > 0) {
            const valorItem = item.cantidad * item.costo
            if (item.moneda === 'USD') {
              totalUSD += valorItem
            } else {
              totalARS += valorItem
            }
          }
          
          const existing = productosMap.get(nombre)
          if (existing) {
            existing.total += cantidad
            if (contenedor.ubicacion === 'adelante') {
              existing.adelante += cantidad
            } else {
              existing.atras += cantidad
            }
          } else {
            productosMap.set(nombre, {
              total: cantidad,
              adelante: contenedor.ubicacion === 'adelante' ? cantidad : 0,
              atras: contenedor.ubicacion === 'atras' ? cantidad : 0
            })
          }
        })
      }
    })

    // Actualizar valor del inventario
    setValorInventario({ totalUSD, totalARS })

    // Generar alertas de stock bajo
    const alertas: AlertaStock[] = []
    productosMap.forEach((datos, nombre) => {
      if (datos.total <= configuracion.umbral_bajo) {
        alertas.push({
          nombre_producto: nombre,
          cantidad_total: datos.total,
          cantidad_adelante: datos.adelante,
          cantidad_atras: datos.atras,
          umbral: configuracion.umbral_bajo
        })
      }
    })

    setAlertasStock(alertas)
  }

  const fetchEstadisticas = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch todas las reparaciones
    const { data: reparaciones } = await supabase
      .from('reparaciones')
      .select(`
        *,
        tecnicos(*)
      `)
      .eq('user_id', user.id)

    if (!reparaciones) {
      setLoading(false)
      return
    }

    // Calcular estadísticas
    const total_pendientes = reparaciones.filter(r => r.estado === 'pendiente').length
    const total_en_proceso = reparaciones.filter(r => r.estado === 'en_proceso').length
    const total_finalizadas = reparaciones.filter(r => r.estado === 'finalizada').length
    const total_entregadas = reparaciones.filter(r => r.estado === 'entregada').length

    const ingresos_totales = reparaciones
      .filter(r => r.monto)
      .reduce((sum, r) => sum + (r.monto || 0), 0)

    // Técnico más activo
    const tecnicoMap = new Map<string, { tecnico: Tecnico; cantidad: number }>()
    
    reparaciones.forEach(r => {
      if (r.tecnico_id && r.tecnicos) {
        const existing = tecnicoMap.get(r.tecnico_id)
        if (existing) {
          existing.cantidad++
        } else {
          tecnicoMap.set(r.tecnico_id, {
            tecnico: r.tecnicos as Tecnico,
            cantidad: 1
          })
        }
      }
    })

    let tecnico_mas_activo: { tecnico: Tecnico | null; cantidad: number } = {
      tecnico: null,
      cantidad: 0
    }

    tecnicoMap.forEach(value => {
      if (value.cantidad > tecnico_mas_activo.cantidad) {
        tecnico_mas_activo = {
          tecnico: value.tecnico,
          cantidad: value.cantidad
        }
      }
    })

    // Reparaciones por estado
    const reparaciones_por_estado = [
      { estado: 'pendiente', cantidad: total_pendientes },
      { estado: 'en_proceso', cantidad: total_en_proceso },
      { estado: 'finalizada', cantidad: total_finalizadas },
      { estado: 'entregada', cantidad: total_entregadas },
    ]

    setEstadisticas({
      total_reparaciones: reparaciones.length,
      total_pendientes,
      total_en_proceso,
      total_finalizadas,
      total_entregadas,
      ingresos_totales,
      tecnico_mas_activo,
      reparaciones_por_estado
    })

    setLoading(false)
  }

  useEffect(() => {
    fetchEstadisticas()
    fetchEstadisticasStock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuracion.umbral_bajo])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!estadisticas) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Estadísticas"
        gradient="green"
      />

      {/* Sistema de Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setTabActiva('reparaciones')}
            className={`px-6 py-3 font-medium text-sm transition-all relative ${
              tabActiva === 'reparaciones'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4" />
              <span>Reparaciones</span>
            </div>
          </button>
          <button
            onClick={() => setTabActiva('stock')}
            className={`px-6 py-3 font-medium text-sm transition-all relative ${
              tabActiva === 'stock'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Box className="w-4 h-4" />
              <span>Stock</span>
              {alertasStock.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {alertasStock.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Contenido según tab activa */}
      {tabActiva === 'reparaciones' ? (
        <TabReparaciones estadisticas={estadisticas} />
      ) : (
        <TabStock 
          alertasStock={alertasStock}
          contenedores={contenedores}
          valorInventario={valorInventario}
          configuracion={configuracion}
          onConfigChange={setConfiguracion}
          modalConfigAbierto={modalConfigAbierto}
          setModalConfigAbierto={setModalConfigAbierto}
        />
      )}

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Las estadísticas se actualizan en tiempo real con cada cambio.
        </p>
      </div>
    </div>
  )
}

// Componente Tab de Reparaciones
function TabReparaciones({ estadisticas }: { estadisticas: EstadisticasData }) {
  return (
    <>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Reparaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Reparaciones</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {estadisticas.total_reparaciones}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Ingresos Totales */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ingresos Totales</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${estadisticas.ingresos_totales.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pendientes</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {estadisticas.total_pendientes}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* En Proceso */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">En Proceso</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {estadisticas.total_en_proceso}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Distribución por Estado
          </h2>
          <div className="space-y-4">
            {estadisticas.reparaciones_por_estado.map((item) => {
              const porcentaje = estadisticas.total_reparaciones > 0
                ? (item.cantidad / estadisticas.total_reparaciones) * 100
                : 0

              const colores: Record<string, { bg: string; bar: string }> = {
                pendiente: { bg: 'bg-yellow-100', bar: 'bg-yellow-500' },
                en_proceso: { bg: 'bg-blue-100', bar: 'bg-blue-500' },
                finalizada: { bg: 'bg-green-100', bar: 'bg-green-500' },
                entregada: { bg: 'bg-slate-100', bar: 'bg-slate-500' }
              }

              const color = colores[item.estado] || colores.pendiente

              return (
                <div key={item.estado}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {item.estado.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-slate-600">
                      {item.cantidad} ({porcentaje.toFixed(0)}%)
                    </span>
                  </div>
                  <div className={`w-full ${color.bg} rounded-full h-3 overflow-hidden`}>
                    <div
                      className={`${color.bar} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-6">
          {/* Técnico Más Activo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Técnico Más Activo
            </h2>
            {estadisticas.tecnico_mas_activo.tecnico ? (
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {estadisticas.tecnico_mas_activo.tecnico.nombre}{' '}
                  {estadisticas.tecnico_mas_activo.tecnico.apellido}
                </p>
                <p className="text-slate-600 mt-2">
                  {estadisticas.tecnico_mas_activo.cantidad} reparaciones asignadas
                </p>
              </div>
            ) : (
              <p className="text-slate-500">No hay técnicos con reparaciones asignadas</p>
            )}
          </div>

          {/* Resumen de Estados */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Resumen de Estados
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-slate-700">Finalizadas</span>
                </div>
                <span className="text-lg font-semibold text-slate-900">
                  {estadisticas.total_finalizadas}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-slate-700">Entregadas</span>
                </div>
                <span className="text-lg font-semibold text-slate-900">
                  {estadisticas.total_entregadas}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional del técnico más activo */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Técnico Destacado:</strong> Las estadísticas reflejan el desempeño de tu equipo.
        </p>
      </div>
    </>
  )
}

// Componente Tab de Stock
function TabStock({ 
  alertasStock, 
  contenedores,
  valorInventario,
  configuracion,
  onConfigChange,
  modalConfigAbierto,
  setModalConfigAbierto
}: { 
  alertasStock: AlertaStock[]
  contenedores: Contenedor[]
  valorInventario: ValorInventario
  configuracion: ConfiguracionStock
  onConfigChange: (config: ConfiguracionStock) => void
  modalConfigAbierto: boolean
  setModalConfigAbierto: (open: boolean) => void
}) {
  // Calcular productos consolidados
  const productosMap = new Map<string, { total: number; adelante: number; atras: number }>()
  
  contenedores.forEach((contenedor) => {
    if (contenedor.items && Array.isArray(contenedor.items)) {
      contenedor.items.forEach((item) => {
        const nombre = item.detalle.toLowerCase().trim()
        const cantidad = item.cantidad || 0
        
        const existing = productosMap.get(nombre)
        if (existing) {
          existing.total += cantidad
          if (contenedor.ubicacion === 'adelante') {
            existing.adelante += cantidad
          } else {
            existing.atras += cantidad
          }
        } else {
          productosMap.set(nombre, {
            total: cantidad,
            adelante: contenedor.ubicacion === 'adelante' ? cantidad : 0,
            atras: contenedor.ubicacion === 'atras' ? cantidad : 0
          })
        }
      })
    }
  })

  const productos = Array.from(productosMap.entries()).map(([nombre, datos]) => ({
    nombre,
    ...datos
  })).sort((a, b) => a.total - b.total) // Ordenar por cantidad (menor a mayor)

  const totalProductos = productos.length
  const productosConStockBajo = productos.filter(p => p.total <= configuracion.umbral_bajo).length
  const valorTotalStock = productos.reduce((sum, p) => sum + p.total, 0)

  return (
    <>
      {/* Header con botón de configuración */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
          Análisis de Inventario
        </h2>
        <button
          onClick={() => setModalConfigAbierto(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Settings className="w-4 h-4" />
          <span>Configurar Alertas</span>
        </button>
      </div>

      {/* Tarjetas de resumen de stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Productos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Productos Únicos</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {totalProductos}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Unidades */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Unidades</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {valorTotalStock}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Archive className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Productos con Stock Bajo */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Stock Bajo</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {productosConStockBajo}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Valor del Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Valor en USD */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                Valor Total en USD
              </p>
              <p className="text-4xl font-black text-green-900 mt-3">
                ${valorInventario.totalUSD.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-green-200 p-4 rounded-full">
              <DollarSign className="w-8 h-8 text-green-700" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Valor total del inventario en dólares estadounidenses
          </p>
        </div>

        {/* Valor en ARS */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Valor Total en ARS
              </p>
              <p className="text-4xl font-black text-blue-900 mt-3">
                ${valorInventario.totalARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-blue-200 p-4 rounded-full">
              <DollarSign className="w-8 h-8 text-blue-700" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Valor total del inventario en pesos argentinos
          </p>
        </div>

        {/* Umbral Configurado */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Umbral de Alerta</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ≤ {configuracion.umbral_bajo}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de Stock Bajo */}
      {alertasStock.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <h3 className="text-xl font-bold text-red-900">
              ⚠️ Alertas de Stock Bajo ({alertasStock.length})
            </h3>
          </div>
          <div className="space-y-3">
            {alertasStock.map((alerta, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 capitalize text-lg">
                      {alerta.nombre_producto}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Stock total: <span className="font-semibold text-red-600">{alerta.cantidad_total} unidades</span>
                    </p>
                    <div className="flex space-x-4 mt-2 text-sm">
                      <span className="text-slate-600">
                        📦 Adelante: <span className="font-medium">{alerta.cantidad_adelante}</span>
                      </span>
                      <span className="text-slate-600">
                        📦 Atrás: <span className="font-medium">{alerta.cantidad_atras}</span>
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-100 px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-red-700">BAJO</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Todos los Productos con Cantidades */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2 text-purple-600" />
          Inventario Completo por Producto
        </h3>
        
        {productos.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No hay productos en el inventario</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {productos.map((producto, idx) => {
              const esStockBajo = producto.total <= configuracion.umbral_bajo
              
              return (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center p-4 rounded-lg border transition ${
                    esStockBajo 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-slate-900 capitalize">
                        {producto.nombre}
                      </h4>
                      {esStockBajo && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex space-x-4 mt-1 text-sm text-slate-600">
                      <span>Adelante: <span className="font-medium">{producto.adelante}</span></span>
                      <span>Atrás: <span className="font-medium">{producto.atras}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${esStockBajo ? 'text-red-600' : 'text-purple-600'}`}>
                      {producto.total}
                    </p>
                    <p className="text-xs text-slate-500">unidades</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Configuración */}
      {modalConfigAbierto && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Settings className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-slate-900">
                  Configuración de Alertas
                </h2>
              </div>
              <button 
                onClick={() => setModalConfigAbierto(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Umbral de Stock Bajo
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Recibirás alertas cuando un producto tenga esta cantidad o menos
                </p>
                <input
                  type="number"
                  min="1"
                  value={configuracion.umbral_bajo}
                  onChange={(e) => onConfigChange({ 
                    ...configuracion, 
                    umbral_bajo: parseInt(e.target.value) || 5 
                  })}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-bold text-center text-2xl"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Mostrar Alertas</p>
                  <p className="text-xs text-slate-600">Destacar productos con stock bajo</p>
                </div>
                <button
                  onClick={() => onConfigChange({ 
                    ...configuracion, 
                    mostrar_alertas: !configuracion.mostrar_alertas 
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    configuracion.mostrar_alertas ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      configuracion.mostrar_alertas ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Ajusta el umbral según la rotación de tus productos más vendidos.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setModalConfigAbierto(false)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
