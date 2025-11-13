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
  AlertCircle
} from 'lucide-react'
import type { Tecnico } from '@/types/database'
import PageHeader from '@/components/PageHeader'

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
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Las estadísticas se actualizan en tiempo real con cada cambio en las reparaciones.
        </p>
      </div>
    </div>
  )
}
