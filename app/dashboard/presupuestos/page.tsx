'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/PageHeader'
import { generarPDFPresupuesto } from '@/lib/pdf-presupuesto'
import type { Presupuesto, PresupuestoItem, ConfiguracionLocal } from '@/types/database'
import { Plus, X, Download, Trash2, Edit, FileText } from 'lucide-react'
import { GridSkeleton } from '@/components/LoadingSkeletons'
import { useToast } from '@/components/Toast'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function PresupuestosPage() {
  const supabase = createClient()
  const { showToast } = useToast()
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [config, setConfig] = useState<ConfiguracionLocal | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [presupuestoToDelete, setPresupuestoToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [presupuestoEditando, setPresupuestoEditando] = useState<Presupuesto | null>(null)

  // Form state
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteCuit, setClienteCuit] = useState('')
  const [clienteDireccion, setClienteDireccion] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [mostrarPrecios, setMostrarPrecios] = useState(true)
  const [items, setItems] = useState<PresupuestoItem[]>([
    { cantidad: 1, detalle: '', precio: 0, subtotal: 0 }
  ])

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      // Cargar configuración
      const { data: configData } = await supabase
        .from('configuracion_local')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setConfig(configData)

      // Cargar presupuestos
      const { data: presupuestosData, error } = await supabase
        .from('presupuestos')
        .select('*')
        .eq('user_id', user.id)
        .order('numero_presupuesto', { ascending: false })

      if (error) {
        console.error('Error al cargar presupuestos:', error)
        return
      }

      setPresupuestos(presupuestosData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Agregar nuevo item
  const agregarItem = () => {
    setItems([...items, { cantidad: 1, detalle: '', precio: 0, subtotal: 0 }])
  }

  // Eliminar item
  const eliminarItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  // Actualizar item
  const actualizarItem = (index: number, field: keyof PresupuestoItem, value: string | number) => {
    const nuevosItems = [...items]
    
    if (field === 'cantidad' || field === 'precio') {
      nuevosItems[index][field] = Number(value)
    } else if (field === 'detalle') {
      nuevosItems[index][field] = value.toString()
    }

    // Recalcular subtotal
    nuevosItems[index].subtotal = nuevosItems[index].cantidad * nuevosItems[index].precio

    setItems(nuevosItems)
  }

  // Calcular total
  const calcularTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0)
  }

  // Guardar presupuesto (crear o actualizar)
  const guardarPresupuesto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Validar que haya al menos un item con detalle
      const itemsValidos = items.filter(item => item.detalle.trim() !== '')
      if (itemsValidos.length === 0) {
        showToast('warning', 'Debe agregar al menos un item con detalle')
        return
      }

      // Si estamos editando, actualizar el presupuesto existente
      if (presupuestoEditando) {
        const presupuestoActualizado = {
          cliente_nombre: clienteNombre.trim() || null,
          cliente_cuit: clienteCuit.trim() || null,
          cliente_direccion: clienteDireccion.trim() || null,
          observaciones: observaciones.trim() || null,
          items: itemsValidos,
          mostrar_precios: mostrarPrecios,
          total: mostrarPrecios ? calcularTotal() : 0,
        }

        const { error } = await supabase
          .from('presupuestos')
          .update(presupuestoActualizado)
          .eq('id', presupuestoEditando.id)

        if (error) {
          console.error('Error al actualizar presupuesto:', error)
          showToast('error', 'Error al actualizar el presupuesto')
          return
        }

        showToast('success', 'Presupuesto actualizado exitosamente')
      } else {
        // Crear nuevo presupuesto
        // Obtener el siguiente número de presupuesto
        const { data: ultimoPresupuesto } = await supabase
          .from('presupuestos')
          .select('numero_presupuesto')
          .eq('user_id', user.id)
          .order('numero_presupuesto', { ascending: false })
          .limit(1)
          .single()

        const nuevoNumero = (ultimoPresupuesto?.numero_presupuesto || 0) + 1

        // Crear presupuesto
        const nuevoPresupuesto = {
          user_id: user.id,
          numero_presupuesto: nuevoNumero,
          cliente_nombre: clienteNombre.trim() || null,
          cliente_cuit: clienteCuit.trim() || null,
          cliente_direccion: clienteDireccion.trim() || null,
          observaciones: observaciones.trim() || null,
          items: itemsValidos,
          mostrar_precios: mostrarPrecios,
          total: mostrarPrecios ? calcularTotal() : 0,
          fecha_creacion: new Date().toISOString()
        }

        const { error } = await supabase
          .from('presupuestos')
          .insert(nuevoPresupuesto)

        if (error) {
          console.error('Error al guardar presupuesto:', error)
          showToast('error', 'Error al guardar el presupuesto')
          return
        }

        showToast('success', 'Presupuesto guardado exitosamente')
      }

      // Limpiar formulario
      limpiarFormulario()
      
      // Recargar lista
      await cargarDatos()

      // Cerrar modal
      setModalAbierto(false)
    } catch (error) {
      console.error('Error:', error)
      showToast('error', 'Error al procesar el presupuesto')
    } finally {
      setSaving(false)
    }
  }

  // Limpiar formulario
  const limpiarFormulario = () => {
    setClienteNombre('')
    setClienteCuit('')
    setClienteDireccion('')
    setObservaciones('')
    setItems([{ cantidad: 1, detalle: '', precio: 0, subtotal: 0 }])
    setMostrarPrecios(true)
    setPresupuestoEditando(null)
  }

  // Abrir modal para editar presupuesto
  const abrirEditar = (presupuesto: Presupuesto) => {
    setPresupuestoEditando(presupuesto)
    setClienteNombre(presupuesto.cliente_nombre || '')
    setClienteCuit(presupuesto.cliente_cuit || '')
    setClienteDireccion(presupuesto.cliente_direccion || '')
    setObservaciones(presupuesto.observaciones || '')
    setItems(presupuesto.items)
    setMostrarPrecios(presupuesto.mostrar_precios)
    setModalAbierto(true)
  }

  // Generar PDF de un presupuesto guardado
  const descargarPDF = async (presupuesto: Presupuesto) => {
    await generarPDFPresupuesto(presupuesto, config, presupuesto.mostrar_precios)
  }

  // Eliminar presupuesto
  const eliminarPresupuesto = async (id: string) => {
    setPresupuestoToDelete(id)
    setShowConfirm(true)
  }

  const confirmDelete = async () => {
    if (!presupuestoToDelete) return

    setDeleting(true)
    const { error } = await supabase
      .from('presupuestos')
      .delete()
      .eq('id', presupuestoToDelete)

    if (error) {
      console.error('Error al eliminar presupuesto:', error)
      showToast('error', 'Error al eliminar el presupuesto')
      setDeleting(false)
      return
    }

    await cargarDatos()
    showToast('success', 'Presupuesto eliminado exitosamente')
    setDeleting(false)
    setShowConfirm(false)
    setPresupuestoToDelete(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Presupuestos" gradient="green" />
        <GridSkeleton count={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Presupuestos" 
        gradient="green"
        actions={
          <Button
            variant="success"
            icon={Plus}
            onClick={() => setModalAbierto(true)}
          >
            Nuevo Presupuesto
          </Button>
        }
      />

      {/* Lista de presupuestos guardados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Presupuestos Guardados</h2>

        {presupuestos.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No hay presupuestos guardados"
            description="Crea tu primer presupuesto para enviar a tus clientes"
            actionLabel="Crear Presupuesto"
            actionIcon={Plus}
            onAction={() => setModalAbierto(true)}
          />
        ) : (
          <>
            {/* Vista Desktop (Tabla) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N°
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {presupuestos.map((presupuesto) => (
                    <tr key={presupuesto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{presupuesto.numero_presupuesto.toString().padStart(6, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {presupuesto.cliente_nombre || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {presupuesto.items.length} {presupuesto.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ${presupuesto.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(presupuesto.fecha_creacion).toLocaleDateString('es-AR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => abrirEditar(presupuesto)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => descargarPDF(presupuesto)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Descargar PDF"
                        >
                          <Download className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => eliminarPresupuesto(presupuesto.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista Mobile (Cards) */}
            <div className="lg:hidden space-y-4">
              {presupuestos.map((presupuesto) => (
                <div
                  key={presupuesto.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Presupuesto</p>
                      <p className="text-lg font-bold text-gray-900">
                        #{presupuesto.numero_presupuesto.toString().padStart(6, '0')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="text-lg font-bold text-green-600">
                        ${presupuesto.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cliente:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {presupuesto.cliente_nombre || 'Sin especificar'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Items:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {presupuesto.items.length} {presupuesto.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(presupuesto.fecha_creacion).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => abrirEditar(presupuesto)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </button>
                    <button
                      onClick={() => descargarPDF(presupuesto)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">PDF</span>
                    </button>
                    <button
                      onClick={() => eliminarPresupuesto(presupuesto.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Nuevo/Editar Presupuesto */}
      {modalAbierto && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-slate-900">
                {presupuestoEditando ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h2>
              <button 
                onClick={() => {
                  setModalAbierto(false)
                  limpiarFormulario()
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Datos del cliente (opcionales) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Cliente (opcional)
                  </label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CUIT (opcional)
                  </label>
                  <input
                    type="text"
                    value={clienteCuit}
                    onChange={(e) => setClienteCuit(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="20-12345678-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección (opcional)
                  </label>
                  <input
                    type="text"
                    value={clienteDireccion}
                    onChange={(e) => setClienteDireccion(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Calle 123, Ciudad"
                  />
                </div>
              </div>

              {/* Checkbox para incluir precio total */}
              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="mostrarPrecios"
                  checked={mostrarPrecios}
                  onChange={(e) => setMostrarPrecios(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="mostrarPrecios" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Incluir precio total en el presupuesto
                </label>
              </div>

              {/* Tabla de items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Items del Presupuesto
                  </label>
                  <button
                    onClick={agregarItem}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Headers Desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-2 text-sm font-medium text-gray-700 px-2">
                    <div className="col-span-1">Cant.</div>
                    <div className="col-span-6">Detalle</div>
                    <div className="col-span-2">Precio Unit.</div>
                    <div className="col-span-2">Subtotal</div>
                    <div className="col-span-1"></div>
                  </div>

                  {items.map((item, index) => (
                    <div key={index}>
                      {/* Vista Desktop */}
                      <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1">
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                            className="w-full px-2 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center bg-white text-gray-900"
                          />
                        </div>

                        <div className="col-span-6">
                          <input
                            type="text"
                            value={item.detalle}
                            onChange={(e) => actualizarItem(index, 'detalle', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="Descripción del servicio o producto"
                          />
                        </div>

                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.precio}
                            onChange={(e) => actualizarItem(index, 'precio', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="0.00"
                          />
                        </div>

                        <div className="col-span-2">
                          <div className="px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded-md text-right font-semibold text-gray-900">
                            ${item.subtotal.toLocaleString()}
                          </div>
                        </div>

                        <div className="col-span-1">
                          <button
                            onClick={() => eliminarItem(index)}
                            disabled={items.length === 1}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Eliminar item"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Vista Mobile */}
                      <div className="md:hidden border-2 border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
                          <button
                            onClick={() => eliminarItem(index)}
                            disabled={items.length === 1}
                            className="p-1 text-red-600 hover:bg-red-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Eliminar item"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Detalle</label>
                          <input
                            type="text"
                            value={item.detalle}
                            onChange={(e) => actualizarItem(index, 'detalle', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="Descripción del servicio o producto"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center bg-white text-gray-900"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unit.</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.precio}
                              onChange={(e) => actualizarItem(index, 'precio', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-200 rounded-md p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Subtotal:</span>
                            <span className="text-lg font-bold text-blue-600">${item.subtotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Ej: Presupuesto válido por 30 días, precios sujetos a cambios..."
                  rows={3}
                />
              </div>

              {/* Total */}
              {mostrarPrecios && (
                <div className="flex justify-end items-center pt-4 border-t border-gray-200">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${calcularTotal().toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50">
              <Button
                variant="secondary"
                onClick={limpiarFormulario}
                disabled={saving}
              >
                Limpiar
              </Button>
              <Button
                variant="success"
                onClick={guardarPresupuesto}
                loading={saving}
              >
                {presupuestoEditando ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Presupuesto"
        message="¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer y se eliminarán todos los items asociados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
