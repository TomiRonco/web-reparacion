'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, X, Receipt, DollarSign, TrendingUp, TrendingDown, CheckCircle, Clock, FileText } from 'lucide-react'
import type { ProveedorPago, Comprobante, PagoRealizado, ComprobanteFormData, PagoFormData, ResumenProveedor, TipoComprobante, Moneda, ConfiguracionLocal } from '@/types/database'
import PageHeader from '@/components/PageHeader'
import { generarPDFPagosProveedor } from '@/lib/pdf-pagos-proveedores'

export default function PagosProveedoresPage() {
  const [proveedores, setProveedores] = useState<ProveedorPago[]>([])
  const [proveedorActivo, setProveedorActivo] = useState<string | null>(null)
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [pagos, setPagos] = useState<PagoRealizado[]>([])
  const [loading, setLoading] = useState(true)
  const [showModalProveedor, setShowModalProveedor] = useState(false)
  const [showModalComprobante, setShowModalComprobante] = useState(false)
  const [showModalPago, setShowModalPago] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<ProveedorPago | null>(null)
  const [editingComprobante, setEditingComprobante] = useState<Comprobante | null>(null)
  const [nombreProveedor, setNombreProveedor] = useState('')
  const [config, setConfig] = useState<ConfiguracionLocal | null>(null)
  
  const supabase = createClient()

  const fetchProveedores = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('proveedores_pago')
      .select('*')
      .eq('user_id', user.id)
      .order('orden', { ascending: true })

    if (!error && data) {
      setProveedores(data)
      if (data.length > 0 && !proveedorActivo) {
        setProveedorActivo(data[0].id)
      }
    }
  }

  const fetchComprobantes = async (proveedorId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('comprobantes')
      .select('*')
      .eq('user_id', user.id)
      .eq('proveedor_id', proveedorId)
      .order('fecha', { ascending: false })

    if (!error && data) {
      setComprobantes(data)
    }
  }

  const fetchPagos = async (proveedorId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('pagos_realizados')
      .select('*')
      .eq('user_id', user.id)
      .eq('proveedor_id', proveedorId)
      .order('fecha_pago', { ascending: false })

    if (!error && data) {
      setPagos(data)
    }
  }

  const fetchConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('configuracion_local')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setConfig(data)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchProveedores()
      await fetchConfig()
      setLoading(false)
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (proveedorActivo) {
      fetchComprobantes(proveedorActivo)
      fetchPagos(proveedorActivo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedorActivo])

  const handleGuardarProveedor = async () => {
    if (!nombreProveedor.trim()) {
      alert('El nombre del proveedor es obligatorio')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingProveedor) {
      const { error } = await supabase
        .from('proveedores_pago')
        .update({ nombre: nombreProveedor })
        .eq('id', editingProveedor.id)

      if (error) {
        alert('Error al actualizar el proveedor')
        return
      }
    } else {
      const { error } = await supabase
        .from('proveedores_pago')
        .insert({
          user_id: user.id,
          nombre: nombreProveedor,
          orden: proveedores.length
        })

      if (error) {
        alert('Error al crear el proveedor')
        return
      }
    }

    await fetchProveedores()
    setShowModalProveedor(false)
    setEditingProveedor(null)
    setNombreProveedor('')
  }

  const handleEliminarProveedor = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor? Se eliminarán todos sus comprobantes y pagos.')) return

    const { error } = await supabase
      .from('proveedores_pago')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error al eliminar el proveedor')
      return
    }

    await fetchProveedores()
    if (proveedorActivo === id) {
      setProveedorActivo(proveedores[0]?.id || null)
    }
  }

  const calcularResumen = (): ResumenProveedor => {
    const resumen: ResumenProveedor = {
      total_gastado_ars: 0,
      total_gastado_usd: 0,
      total_pagado_ars: 0,
      total_pagado_usd: 0,
      deuda_ars: 0,
      deuda_usd: 0
    }

    comprobantes.forEach(comp => {
      // Las notas de crédito se suman como "pagado" (a favor del cliente)
      if (comp.tipo === 'nota_credito') {
        if (comp.moneda === 'ARS') {
          resumen.total_pagado_ars += comp.monto
        } else {
          resumen.total_pagado_usd += comp.monto
        }
      } else {
        // Facturas, remitos y presupuestos suman al gasto
        if (comp.moneda === 'ARS') {
          resumen.total_gastado_ars += comp.monto
        } else {
          resumen.total_gastado_usd += comp.monto
        }
      }
    })

    pagos.forEach(pago => {
      if (pago.moneda === 'ARS') {
        resumen.total_pagado_ars += pago.monto_pagado
      } else {
        resumen.total_pagado_usd += pago.monto_pagado
      }
    })

    resumen.deuda_ars = resumen.total_gastado_ars - resumen.total_pagado_ars
    resumen.deuda_usd = resumen.total_gastado_usd - resumen.total_pagado_usd

    return resumen
  }

  const resumen = proveedorActivo ? calcularResumen() : null
  const proveedorActualNombre = proveedores.find(p => p.id === proveedorActivo)?.nombre || ''

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <PageHeader
          title="Pagos a Proveedores"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Pagos a Proveedores"
      />

      {proveedores.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-12 text-center max-w-md">
            <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No hay proveedores</h3>
            <p className="text-slate-500 mb-6">Crea tu primer proveedor para comenzar a gestionar pagos y deudas</p>
            <button
              onClick={() => setShowModalProveedor(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Proveedor</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Tabs de Proveedores */}
          <div className="bg-white border-b border-slate-200 px-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <div className="flex space-x-1 py-2">
                {proveedores.map(proveedor => (
                  <button
                    key={proveedor.id}
                    onClick={() => setProveedorActivo(proveedor.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                      proveedorActivo === proveedor.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {proveedor.nombre}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowModalProveedor(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0"
                title="Agregar proveedor"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenido del Proveedor Activo */}
          {proveedorActivo && (
            <div className="flex-1 overflow-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Resumen Financiero */}
                {resumen && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Total Gastado</h3>
                        <TrendingUp className="w-5 h-5 opacity-75" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">${resumen.total_gastado_ars.toFixed(2)} ARS</p>
                        <p className="text-lg font-semibold opacity-90">${resumen.total_gastado_usd.toFixed(2)} USD</p>
                      </div>
                    </div>

                    <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Total Pagado</h3>
                        <CheckCircle className="w-5 h-5 opacity-75" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">${resumen.total_pagado_ars.toFixed(2)} ARS</p>
                        <p className="text-lg font-semibold opacity-90">${resumen.total_pagado_usd.toFixed(2)} USD</p>
                      </div>
                    </div>

                    <div className={`bg-linear-to-br rounded-lg shadow-md p-6 text-white ${
                      resumen.deuda_ars <= 0 && resumen.deuda_usd <= 0
                        ? 'from-emerald-500 to-emerald-600'
                        : 'from-orange-500 to-orange-600'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Deuda Pendiente</h3>
                        {resumen.deuda_ars <= 0 && resumen.deuda_usd <= 0 ? (
                          <CheckCircle className="w-5 h-5 opacity-75" />
                        ) : (
                          <TrendingDown className="w-5 h-5 opacity-75" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">${resumen.deuda_ars.toFixed(2)} ARS</p>
                        <p className="text-lg font-semibold opacity-90">${resumen.deuda_usd.toFixed(2)} USD</p>
                      </div>
                      {resumen.deuda_ars <= 0 && resumen.deuda_usd <= 0 && (
                        <p className="text-xs mt-2 opacity-75">✓ Al día con el proveedor</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => setShowModalComprobante(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Comprobante</span>
                  </button>
                  <button
                    onClick={() => setShowModalPago(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Registrar Pago</span>
                  </button>
                  <button
                    onClick={async () => {
                      const prov = proveedores.find(p => p.id === proveedorActivo)
                      if (prov && resumen) {
                        await generarPDFPagosProveedor(prov, comprobantes, pagos, resumen, config)
                      }
                    }}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Exportar PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      const prov = proveedores.find(p => p.id === proveedorActivo)
                      if (prov) {
                        setEditingProveedor(prov)
                        setNombreProveedor(prov.nombre)
                        setShowModalProveedor(true)
                      }
                    }}
                    className="flex items-center space-x-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar Proveedor</span>
                  </button>
                  <button
                    onClick={() => handleEliminarProveedor(proveedorActivo)}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Proveedor</span>
                  </button>
                </div>

                {/* Tabla de Comprobantes */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Comprobantes</span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    {comprobantes.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        No hay comprobantes registrados
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-slate-50 text-slate-700 text-sm">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                            <th className="px-4 py-3 text-left font-semibold">Número</th>
                            <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                            <th className="px-4 py-3 text-right font-semibold">Monto</th>
                            <th className="px-4 py-3 text-center font-semibold">Estado</th>
                            <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {comprobantes.map(comp => (
                            <tr key={comp.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  comp.tipo === 'factura' ? 'bg-blue-100 text-blue-700' :
                                  comp.tipo === 'remito' ? 'bg-purple-100 text-purple-700' :
                                  comp.tipo === 'nota_credito' ? 'bg-green-100 text-green-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {comp.tipo === 'nota_credito' ? 'NOTA CRÉDITO' : comp.tipo.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-700">{comp.numero}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {new Date(comp.fecha).toLocaleDateString('es-AR')}
                              </td>
                              <td className={`px-4 py-3 text-right font-semibold ${
                                comp.tipo === 'nota_credito' ? 'text-green-600' : 'text-slate-900'
                              }`}>
                                {comp.tipo === 'nota_credito' ? '-' : ''}${comp.monto.toFixed(2)} {comp.moneda}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {comp.pagado ? (
                                  <span className="inline-flex items-center space-x-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">
                                      {comp.tipo === 'nota_credito' ? 'Aplicada' : 'Pagado'}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 text-orange-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-medium">Pendiente</span>
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingComprobante(comp)
                                      setShowModalComprobante(true)
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm('¿Eliminar este comprobante?')) return
                                      await supabase.from('comprobantes').delete().eq('id', comp.id)
                                      fetchComprobantes(proveedorActivo)
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Tabla de Pagos Realizados */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Pagos Realizados</span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    {pagos.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        No hay pagos registrados
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-slate-50 text-slate-700 text-sm">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                            <th className="px-4 py-3 text-right font-semibold">Monto Pagado</th>
                            <th className="px-4 py-3 text-center font-semibold">Comprobantes</th>
                            <th className="px-4 py-3 text-left font-semibold">Notas</th>
                            <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagos.map(pago => (
                            <tr key={pago.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-700">
                                {new Date(pago.fecha_pago).toLocaleDateString('es-AR')}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-green-600">
                                ${pago.monto_pagado.toFixed(2)} {pago.moneda}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                  {pago.comprobante_ids.length} comp.
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 text-sm">
                                {pago.notas || '-'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={async () => {
                                    if (!confirm('¿Eliminar este pago?')) return
                                    // Marcar comprobantes como no pagados
                                    await Promise.all(
                                      pago.comprobante_ids.map(id =>
                                        supabase.from('comprobantes').update({ pagado: false }).eq('id', id)
                                      )
                                    )
                                    await supabase.from('pagos_realizados').delete().eq('id', pago.id)
                                    fetchPagos(proveedorActivo)
                                    fetchComprobantes(proveedorActivo)
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Proveedor */}
      {showModalProveedor && (
        <ModalProveedor
          proveedor={editingProveedor}
          nombre={nombreProveedor}
          setNombre={setNombreProveedor}
          onClose={() => {
            setShowModalProveedor(false)
            setEditingProveedor(null)
            setNombreProveedor('')
          }}
          onSubmit={handleGuardarProveedor}
        />
      )}

      {/* Modal Comprobante */}
      {showModalComprobante && proveedorActivo && (
        <ModalComprobante
          proveedorId={proveedorActivo}
          comprobante={editingComprobante}
          onClose={() => {
            setShowModalComprobante(false)
            setEditingComprobante(null)
          }}
          onSubmit={async () => {
            await fetchComprobantes(proveedorActivo)
            setShowModalComprobante(false)
            setEditingComprobante(null)
          }}
        />
      )}

      {/* Modal Pago */}
      {showModalPago && proveedorActivo && (
        <ModalPago
          proveedorId={proveedorActivo}
          proveedorNombre={proveedorActualNombre}
          comprobantesPendientes={comprobantes.filter(c => !c.pagado)}
          onClose={() => setShowModalPago(false)}
          onSubmit={async () => {
            await fetchComprobantes(proveedorActivo)
            await fetchPagos(proveedorActivo)
            setShowModalPago(false)
          }}
        />
      )}
    </div>
  )
}

// Modal para Agregar/Editar Proveedor
function ModalProveedor({
  proveedor,
  nombre,
  setNombre,
  onClose,
  onSubmit
}: {
  proveedor: ProveedorPago | null
  nombre: string
  setNombre: (value: string) => void
  onClose: () => void
  onSubmit: () => void
}) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">
            {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre del Proveedor
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Proveedor X, Distribuidora Y..."
            className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
            autoFocus
          />
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {proveedor ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal para Agregar/Editar Comprobante
function ModalComprobante({
  proveedorId,
  comprobante,
  onClose,
  onSubmit
}: {
  proveedorId: string
  comprobante: Comprobante | null
  onClose: () => void
  onSubmit: () => void
}) {
  const [formData, setFormData] = useState<ComprobanteFormData>({
    proveedor_id: proveedorId,
    tipo: comprobante?.tipo || 'factura',
    numero: comprobante?.numero || '',
    fecha: comprobante?.fecha || new Date().toISOString().split('T')[0],
    monto: comprobante?.monto || 0,
    moneda: comprobante?.moneda || 'ARS'
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.numero.trim() || formData.monto <= 0) {
      alert('Completa todos los campos obligatorios')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (comprobante) {
      const { error } = await supabase
        .from('comprobantes')
        .update(formData)
        .eq('id', comprobante.id)

      if (error) {
        alert('Error al actualizar el comprobante')
        return
      }
    } else {
      const { error } = await supabase
        .from('comprobantes')
        .insert({
          ...formData,
          user_id: user.id,
          pagado: false
        })

      if (error) {
        alert('Error al crear el comprobante')
        return
      }
    }

    onSubmit()
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">
            {comprobante ? 'Editar Comprobante' : 'Nuevo Comprobante'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de Comprobante
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoComprobante })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="factura">Factura</option>
              <option value="remito">Remito</option>
              <option value="presupuesto">Presupuesto</option>
              <option value="nota_credito">Nota de Crédito</option>
            </select>
            {formData.tipo === 'nota_credito' && (
              <p className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                ℹ️ Las notas de crédito se descuentan automáticamente de la deuda total
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Número
            </label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              placeholder="Ej: 0001-00001234"
              className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Monto
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Moneda
              </label>
              <select
                value={formData.moneda}
                onChange={(e) => setFormData({ ...formData, moneda: e.target.value as Moneda })}
                className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {comprobante ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal para Registrar Pago
function ModalPago({
  proveedorId,
  proveedorNombre,
  comprobantesPendientes,
  onClose,
  onSubmit
}: {
  proveedorId: string
  proveedorNombre: string
  comprobantesPendientes: Comprobante[]
  onClose: () => void
  onSubmit: () => void
}) {
  const [formData, setFormData] = useState<PagoFormData>({
    proveedor_id: proveedorId,
    comprobante_ids: [],
    fecha_pago: new Date().toISOString().split('T')[0],
    monto_pagado: 0,
    moneda: 'ARS',
    notas: ''
  })

  const supabase = createClient()

  const handleToggleComprobante = (id: string) => {
    if (formData.comprobante_ids.includes(id)) {
      setFormData({
        ...formData,
        comprobante_ids: formData.comprobante_ids.filter(cid => cid !== id)
      })
    } else {
      setFormData({
        ...formData,
        comprobante_ids: [...formData.comprobante_ids, id]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.comprobante_ids.length === 0) {
      alert('Selecciona al menos un comprobante')
      return
    }

    if (formData.monto_pagado <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Crear el pago
    const { error: pagoError } = await supabase
      .from('pagos_realizados')
      .insert({
        user_id: user.id,
        proveedor_id: formData.proveedor_id,
        comprobante_ids: formData.comprobante_ids,
        fecha_pago: formData.fecha_pago,
        monto_pagado: formData.monto_pagado,
        moneda: formData.moneda,
        notas: formData.notas || null
      })

    if (pagoError) {
      alert('Error al registrar el pago')
      return
    }

    // Marcar comprobantes como pagados
    const updatePromises = formData.comprobante_ids.map(id =>
      supabase
        .from('comprobantes')
        .update({ pagado: true })
        .eq('id', id)
    )

    await Promise.all(updatePromises)

    onSubmit()
  }

  const comprobantesSeleccionados = comprobantesPendientes.filter(c =>
    formData.comprobante_ids.includes(c.id)
  )

  const totalSeleccionado = {
    ARS: comprobantesSeleccionados.reduce((sum, c) => {
      if (c.moneda === 'ARS') {
        // Las notas de crédito restan (son a favor)
        return c.tipo === 'nota_credito' ? sum - c.monto : sum + c.monto
      }
      return sum
    }, 0),
    USD: comprobantesSeleccionados.reduce((sum, c) => {
      if (c.moneda === 'USD') {
        // Las notas de crédito restan (son a favor)
        return c.tipo === 'nota_credito' ? sum - c.monto : sum + c.monto
      }
      return sum
    }, 0)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Registrar Pago</h2>
            <p className="text-sm text-slate-600">{proveedorNombre}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {comprobantesPendientes.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No hay comprobantes pendientes</h3>
            <p className="text-slate-600 mb-6">Todos los comprobantes están pagados</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Selección de Comprobantes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Seleccionar Comprobantes a Pagar
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-slate-200 rounded-lg p-3">
                {comprobantesPendientes.map(comp => (
                  <label
                    key={comp.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                      formData.comprobante_ids.includes(comp.id)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-slate-50 border-2 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.comprobante_ids.includes(comp.id)}
                        onChange={() => handleToggleComprobante(comp.id)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            comp.tipo === 'factura' ? 'bg-blue-100 text-blue-700' :
                            comp.tipo === 'remito' ? 'bg-purple-100 text-purple-700' :
                            comp.tipo === 'nota_credito' ? 'bg-green-100 text-green-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {comp.tipo === 'nota_credito' ? 'NC' : comp.tipo.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-slate-900">{comp.numero}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(comp.fecha).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        comp.tipo === 'nota_credito' ? 'text-green-600' : 'text-slate-900'
                      }`}>
                        {comp.tipo === 'nota_credito' ? '-' : ''}${comp.monto.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">{comp.moneda}</p>
                    </div>
                  </label>
                ))}
              </div>

              {formData.comprobante_ids.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Total seleccionado:</p>
                  <div className="flex space-x-4 text-sm">
                    {totalSeleccionado.ARS > 0 && (
                      <span className="text-blue-700">${totalSeleccionado.ARS.toFixed(2)} ARS</span>
                    )}
                    {totalSeleccionado.USD > 0 && (
                      <span className="text-blue-700">${totalSeleccionado.USD.toFixed(2)} USD</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Datos del Pago */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  value={formData.fecha_pago}
                  onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Moneda del Pago
                </label>
                <select
                  value={formData.moneda}
                  onChange={(e) => setFormData({ ...formData, moneda: e.target.value as Moneda })}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Monto Pagado
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.monto_pagado}
                onChange={(e) => setFormData({ ...formData, monto_pagado: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Método de pago, detalles adicionales..."
                rows={3}
                className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Registrar Pago
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
