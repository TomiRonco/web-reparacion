'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TransaccionCaja, TransaccionCajaFormData } from '@/types/database'
import { ArrowDownCircle, ArrowUpCircle, Download, X } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function CajaDiariaPage() {
  const [transacciones, setTransacciones] = useState<TransaccionCaja[]>([])
  const [loading, setLoading] = useState(true)
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0])
  const [monto, setMonto] = useState<string>('')
  const [detalle, setDetalle] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchTransacciones()
  }, [fechaFiltro])

  const fetchTransacciones = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Filtrar por día seleccionado
    const fechaInicio = new Date(fechaFiltro)
    fechaInicio.setHours(0, 0, 0, 0)
    const fechaFin = new Date(fechaFiltro)
    fechaFin.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('transacciones_caja')
      .select('*')
      .eq('user_id', user.id)
      .gte('fecha_hora', fechaInicio.toISOString())
      .lte('fecha_hora', fechaFin.toISOString())
      .order('fecha_hora', { ascending: false })

    if (!error && data) {
      setTransacciones(data)
    }
    setLoading(false)
  }

  const calcularTotal = () => {
    return transacciones.reduce((total, t) => {
      return t.tipo === 'ingreso' ? total + Number(t.monto) : total - Number(t.monto)
    }, 0)
  }

  const calcularTotalIngresos = () => {
    return transacciones
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + Number(t.monto), 0)
  }

  const calcularTotalEgresos = () => {
    return transacciones
      .filter(t => t.tipo === 'egreso')
      .reduce((sum, t) => sum + Number(t.monto), 0)
  }

  const handleAgregarTransaccion = async (tipo: 'ingreso' | 'egreso') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const montoNum = Number(monto)
    if (!detalle.trim() || montoNum <= 0) {
      alert('Por favor completa todos los campos correctamente')
      return
    }

    const { error } = await supabase
      .from('transacciones_caja')
      .insert([{
        user_id: user.id,
        tipo: tipo,
        monto: montoNum,
        detalle: detalle
      }])

    if (error) {
      console.error('Error al guardar transacción:', error)
      alert('Error al guardar la transacción')
      return
    }

    setMonto('')
    setDetalle('')
    fetchTransacciones()
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción?')) return

    const { error } = await supabase
      .from('transacciones_caja')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchTransacciones()
    }
  }

  const exportarExcel = () => {
    const datos = transacciones.map(t => ({
      'Fecha y Hora': new Date(t.fecha_hora).toLocaleString('es-AR'),
      'Tipo': t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso',
      'Monto': t.monto,
      'Detalle': t.detalle
    }))

    // Agregar fila de totales
    datos.push({
      'Fecha y Hora': 'TOTALES',
      'Tipo': '',
      'Monto': calcularTotal(),
      'Detalle': `Ingresos: $${calcularTotalIngresos().toFixed(2)} | Egresos: $${calcularTotalEgresos().toFixed(2)}`
    })

    const ws = XLSX.utils.json_to_sheet(datos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Caja Diaria')
    
    const fileName = `caja_diaria_${fechaFiltro}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const formatearHora = (fechaHora: string) => {
    return new Date(fechaHora).toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatearFecha = (fechaHora: string) => {
    return new Date(fechaHora).toLocaleDateString('es-AR')
  }

  const total = calcularTotal()
  const totalIngresos = calcularTotalIngresos()
  const totalEgresos = calcularTotalEgresos()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Caja Diaria</h1>
                <p className="text-slate-600 mt-1">Gestión de ingresos y egresos</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={fechaFiltro}
                  onChange={(e) => setFechaFiltro(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={exportarExcel}
                  disabled={transacciones.length === 0}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  Exportar Excel
                </button>
              </div>
            </div>

            {/* Formulario de transacción */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Detalle
                  </label>
                  <input
                    type="text"
                    value={detalle}
                    onChange={(e) => setDetalle(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción de la transacción"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-4 flex gap-2">
                  <button
                    onClick={() => handleAgregarTransaccion('ingreso')}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                    Ingreso
                  </button>
                  <button
                    onClick={() => handleAgregarTransaccion('egreso')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <ArrowDownCircle className="w-5 h-5" />
                    Egreso
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-700">Ingresos</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${totalIngresos.toFixed(2)}
            </p>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownCircle className="w-8 h-8 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-700">Egresos</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">
              ${totalEgresos.toFixed(2)}
            </p>
          </div>

          <div className={`${total >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border-2 rounded-lg p-6`}>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-700">Total en Caja</h3>
            </div>
            <p className={`text-3xl font-bold ${total >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ${total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Lista de transacciones */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4">
            <h2 className="text-xl font-bold text-white">
              Transacciones del {formatearFecha(fechaFiltro + 'T00:00:00')}
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Cargando transacciones...
            </div>
          ) : transacciones.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No hay transacciones para este día
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Detalle
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {transacciones.map((transaccion) => (
                    <tr key={transaccion.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatearHora(transaccion.fecha_hora)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaccion.tipo === 'ingreso' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <ArrowUpCircle className="w-3 h-3" />
                            Ingreso
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            <ArrowDownCircle className="w-3 h-3" />
                            Egreso
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {transaccion.detalle}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${
                        transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaccion.tipo === 'ingreso' ? '+' : '-'}${Number(transaccion.monto).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleEliminar(transaccion.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Eliminar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
