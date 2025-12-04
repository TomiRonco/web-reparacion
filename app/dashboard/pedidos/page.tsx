'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, X, ShoppingCart, CheckCircle, Circle } from 'lucide-react'
import type { Pedido, ItemPedido, PedidoFormData } from '@/types/database'
import PageHeader from '@/components/PageHeader'
import { GridSkeleton } from '@/components/LoadingSkeletons'
import { useToast } from '@/components/Toast'

export default function PedidosPage() {
  const supabase = createClient()
  const { showToast } = useToast()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'pendientes' | 'completados'>('todos')

  const fetchPedidos = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPedidos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPedidos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGuardarPedido = async (formData: PedidoFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingPedido) {
      // Actualizar pedido existente
      const { error } = await supabase
        .from('pedidos')
        .update({
          proveedor: formData.proveedor,
          items: formData.items
        })
        .eq('id', editingPedido.id)

      if (error) {
        showToast('error', 'Error al actualizar el pedido')
        return
      }
    } else {
      // Crear nuevo pedido
      const { error } = await supabase
        .from('pedidos')
        .insert({
          user_id: user.id,
          proveedor: formData.proveedor,
          items: formData.items,
          completado: false
        })

      if (error) {
        showToast('error', 'Error al crear el pedido')
        return
      }
    }

    await fetchPedidos()
    setShowModal(false)
    setEditingPedido(null)
  }

  const handleEliminarPedido = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return

    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id)

    if (error) {
      showToast('error', 'Error al eliminar el pedido')
      return
    }

    await fetchPedidos()
  }

  const handleToggleCompletado = async (pedido: Pedido) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ completado: !pedido.completado })
      .eq('id', pedido.id)

    if (error) {
      alert('Error al actualizar el pedido')
      return
    }

    await fetchPedidos()
  }

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtro === 'pendientes') return !pedido.completado
    if (filtro === 'completados') return pedido.completado
    return true
  })

  const totalPendientes = pedidos.filter(p => !p.completado).length
  const totalCompletados = pedidos.filter(p => p.completado).length

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <PageHeader title="Gestión de Pedidos" gradient="blue" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg border-2 bg-slate-100 animate-pulse h-24"></div>
              ))}
            </div>
          </div>
          <GridSkeleton count={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="shrink-0">
        <PageHeader
          title="Gestión de Pedidos"
          gradient="blue"
          actions={
            <button
              onClick={() => {
                setEditingPedido(null)
                setShowModal(true)
              }}
              className="flex items-center space-x-2 bg-white text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition shadow-md font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Pedido</span>
            </button>
          }
        />

        {/* Filtros y estadísticas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => setFiltro('todos')}
              className={`p-3 rounded-lg border-2 transition ${
                filtro === 'todos'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-sm font-medium text-slate-600">Todos</div>
              <div className="text-2xl font-bold text-slate-900">{pedidos.length}</div>
            </button>
            <button
              onClick={() => setFiltro('pendientes')}
              className={`p-3 rounded-lg border-2 transition ${
                filtro === 'pendientes'
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-sm font-medium text-slate-600">Pendientes</div>
              <div className="text-2xl font-bold text-orange-600">{totalPendientes}</div>
            </button>
            <button
              onClick={() => setFiltro('completados')}
              className={`p-3 rounded-lg border-2 transition ${
                filtro === 'completados'
                  ? 'border-green-600 bg-green-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-sm font-medium text-slate-600">Completados</div>
              <div className="text-2xl font-bold text-green-600">{totalCompletados}</div>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos con scroll */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {pedidosFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No hay pedidos</h3>
              <p className="text-slate-500 mb-6">Crea tu primer pedido para comenzar a gestionar tus compras</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Pedido</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pedidosFiltrados.map((pedido) => (
                <div 
                  key={pedido.id} 
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden ${
                    pedido.completado ? 'opacity-75' : ''
                  }`}
                >
                  {/* Header del Pedido */}
                  <div className={`p-4 text-white ${
                    pedido.completado ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-5 h-5" />
                        <h3 className="text-lg font-bold">{pedido.proveedor}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleCompletado(pedido)}
                          className="p-1.5 hover:bg-blue-400 rounded transition"
                          title={pedido.completado ? 'Marcar como pendiente' : 'Marcar como completado'}
                        >
                          {pedido.completado ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </button>
                        {!pedido.completado && (
                          <button
                            onClick={() => {
                              setEditingPedido(pedido)
                              setShowModal(true)
                            }}
                            className="p-1.5 hover:bg-blue-400 rounded transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminarPedido(pedido.id)}
                          className="p-1.5 hover:bg-red-400 rounded transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Items */}
                  <div className="p-4">
                    {pedido.items && pedido.items.length > 0 ? (
                      <div className="space-y-2">
                        {pedido.items.map((item, index) => (
                          <div key={index} className="py-2 border-b border-slate-100 last:border-0">
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-slate-700 flex-1">{item.detalle}</span>
                              <span className="text-sm font-semibold text-blue-600 ml-2">x{item.cantidad}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4">Sin items</p>
                    )}
                  </div>

                  {/* Footer con fecha */}
                  <div className="bg-slate-50 px-4 py-2 text-xs text-slate-500 border-t flex justify-between">
                    <span>Total: {pedido.items?.length || 0} items</span>
                    <span>{new Date(pedido.created_at).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Agregar/Editar Pedido */}
      {showModal && (
        <ModalPedido
          pedido={editingPedido}
          onClose={() => {
            setShowModal(false)
            setEditingPedido(null)
          }}
          onSubmit={handleGuardarPedido}
        />
      )}
    </div>
  )
}

// Componente Modal para Pedido
function ModalPedido({
  pedido,
  onClose,
  onSubmit
}: {
  pedido: Pedido | null
  onClose: () => void
  onSubmit: (data: PedidoFormData) => void
}) {
  const [formData, setFormData] = useState<PedidoFormData>({
    proveedor: pedido?.proveedor || '',
    items: pedido?.items || []
  })

  const agregarItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { detalle: '', cantidad: 1 }]
    })
  }

  const actualizarItem = (index: number, field: keyof ItemPedido, value: string | number) => {
    const nuevosItems = [...formData.items]
    if (field === 'cantidad') {
      nuevosItems[index][field] = Number(value)
    } else {
      nuevosItems[index][field] = value as string
    }
    setFormData({ ...formData, items: nuevosItems })
  }

  const eliminarItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.proveedor.trim()) {
      showToast('warning', 'El nombre del proveedor es obligatorio')
      return
    }
    if (formData.items.length === 0) {
      showToast('warning', 'Debes agregar al menos un item')
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              {pedido ? 'Editar Pedido' : 'Nuevo Pedido'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Nombre del Proveedor */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Proveedor
            </label>
            <input
              type="text"
              value={formData.proveedor}
              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
              placeholder="Ej: MercadoLibre, Proveedor Local..."
              className="w-full px-4 py-3 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Lista de Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-slate-700">
                Items del Pedido
              </label>
              <button
                type="button"
                onClick={agregarItem}
                className="flex items-center space-x-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Item</span>
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500 mb-3">No hay items agregados</p>
                <button
                  type="button"
                  onClick={agregarItem}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Agregar el primer item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input
                      type="text"
                      value={item.detalle}
                      onChange={(e) => actualizarItem(index, 'detalle', e.target.value)}
                      placeholder="Descripción del item"
                      className="flex-1 px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                      className="w-20 px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-semibold text-center"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {pedido ? 'Guardar Cambios' : 'Crear Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
