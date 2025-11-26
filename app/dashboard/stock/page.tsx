'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, X, Package, FileText } from 'lucide-react'
import type { Contenedor, ItemStock, ContenedorFormData, UbicacionStock } from '@/types/database'
import { generarPDFStock } from '@/lib/pdf-stock'
import PageHeader from '@/components/PageHeader'

export default function StockPage() {
  const [tabActivo, setTabActivo] = useState<UbicacionStock>('adelante')
  const [contenedores, setContenedores] = useState<Contenedor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContenedor, setEditingContenedor] = useState<Contenedor | null>(null)
  
  const supabase = createClient()

  const fetchContenedores = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('contenedores')
      .select('*')
      .eq('user_id', user.id)
      .eq('ubicacion', tabActivo)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setContenedores(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchContenedores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabActivo])

  const handleGuardarContenedor = async (formData: ContenedorFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingContenedor) {
      // Actualizar contenedor existente
      const { error } = await supabase
        .from('contenedores')
        .update({
          nombre: formData.nombre,
          items: formData.items,
          ubicacion: tabActivo
        })
        .eq('id', editingContenedor.id)

      if (error) {
        alert('Error al actualizar el contenedor')
        return
      }
    } else {
      // Crear nuevo contenedor
      const { error } = await supabase
        .from('contenedores')
        .insert({
          user_id: user.id,
          nombre: formData.nombre,
          items: formData.items,
          ubicacion: tabActivo
        })

      if (error) {
        alert('Error al crear el contenedor')
        return
      }
    }

    await fetchContenedores()
    setShowModal(false)
    setEditingContenedor(null)
  }

  const handleEliminarContenedor = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este contenedor?')) return

    const { error } = await supabase
      .from('contenedores')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error al eliminar el contenedor')
      return
    }

    await fetchContenedores()
  }

  const handleExportarPDF = async () => {
    // Obtener todos los contenedores del tab actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('contenedores')
      .select('*')
      .eq('user_id', user.id)
      .eq('ubicacion', tabActivo)
      .order('nombre')

    if (data) {
      generarPDFStock(data, tabActivo)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-12">
      <PageHeader
        title="Gestión de Stock"
        gradient="purple"
        actions={
          <div className="flex space-x-3">
            <button
              onClick={handleExportarPDF}
              disabled={contenedores.length === 0}
              className="flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={() => {
                setEditingContenedor(null)
                setShowModal(true)
              }}
              className="flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition shadow-md font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Contenedor</span>
            </button>
          </div>
        }
      />

      {/* Tabs para Stock Adelante / Stock Atrás */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-6 border-b border-slate-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setTabActivo('adelante')}
              className={`px-6 py-3 font-medium text-sm transition-all relative ${
                tabActivo === 'adelante'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Stock Adelante</span>
              </div>
            </button>
            <button
              onClick={() => setTabActivo('atras')}
              className={`px-6 py-3 font-medium text-sm transition-all relative ${
                tabActivo === 'atras'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Stock Atrás</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Contenedores */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {contenedores.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No hay contenedores</h3>
            <p className="text-slate-500 mb-6">Crea tu primer contenedor para comenzar a gestionar tu stock</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Contenedor</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contenedores.map((contenedor) => (
              <div key={contenedor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                {/* Header del Contenedor */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <h3 className="text-lg font-bold">{contenedor.nombre}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingContenedor(contenedor)
                          setShowModal(true)
                        }}
                        className="p-1.5 hover:bg-purple-400 rounded transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminarContenedor(contenedor.id)}
                        className="p-1.5 hover:bg-purple-400 rounded transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de Items */}
                <div className="p-4">
                  {contenedor.items && contenedor.items.length > 0 ? (
                    <div className="space-y-2">
                      {contenedor.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700 flex-1">{item.detalle}</span>
                          <span className="text-sm font-semibold text-purple-600 ml-2">x{item.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">Sin items</p>
                  )}
                </div>

                {/* Footer con total de items */}
                <div className="bg-slate-50 px-4 py-2 text-xs text-slate-500 border-t">
                  Total: {contenedor.items?.length || 0} items
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Agregar/Editar Contenedor */}
      {showModal && (
        <ModalContenedor
          contenedor={editingContenedor}
          onClose={() => {
            setShowModal(false)
            setEditingContenedor(null)
          }}
          onSubmit={handleGuardarContenedor}
        />
      )}
    </div>
  )
}

// Modal para agregar/editar contenedor
function ModalContenedor({
  contenedor,
  onClose,
  onSubmit
}: {
  contenedor: Contenedor | null
  onClose: () => void
  onSubmit: (data: ContenedorFormData) => void
}) {
  const [formData, setFormData] = useState<ContenedorFormData>({
    nombre: contenedor?.nombre || '',
    items: contenedor?.items || []
  })
  const [itemsUnicos, setItemsUnicos] = useState<string[]>([])
  const [sugerenciasActivas, setSugerenciasActivas] = useState<{ [key: number]: boolean }>({})
  
  const supabase = createClient()

  // Obtener todos los items únicos del stock (ambas ubicaciones)
  useEffect(() => {
    const fetchItemsUnicos = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('contenedores')
        .select('items')
        .eq('user_id', user.id)

      if (!error && data) {
        // Extraer todos los detalles únicos de items
        const todosLosItems = data.flatMap(cont => 
          Array.isArray(cont.items) ? cont.items.map((item: ItemStock) => item.detalle) : []
        )
        // Eliminar duplicados y ordenar
        const unicos = Array.from(new Set(todosLosItems)).sort()
        setItemsUnicos(unicos)
      }
    }

    fetchItemsUnicos()
  }, [supabase])

  const agregarItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { detalle: '', cantidad: 1 }]
    })
  }

  const actualizarItem = (index: number, field: keyof ItemStock, value: string | number) => {
    const nuevosItems = [...formData.items]
    if (field === 'cantidad') {
      nuevosItems[index][field] = Number(value)
    } else {
      nuevosItems[index][field] = value as string
    }
    setFormData({ ...formData, items: nuevosItems })
    
    // Activar sugerencias cuando se está escribiendo en detalle
    if (field === 'detalle' && typeof value === 'string' && value.length > 0) {
      setSugerenciasActivas({ ...sugerenciasActivas, [index]: true })
    }
  }

  const seleccionarSugerencia = (index: number, sugerencia: string) => {
    const nuevosItems = [...formData.items]
    nuevosItems[index].detalle = sugerencia
    setFormData({ ...formData, items: nuevosItems })
    setSugerenciasActivas({ ...sugerenciasActivas, [index]: false })
  }

  const cerrarSugerencias = (index: number) => {
    setSugerenciasActivas({ ...sugerenciasActivas, [index]: false })
  }

  const filtrarSugerencias = (texto: string): string[] => {
    if (!texto || texto.length < 2) return []
    const textoLower = texto.toLowerCase()
    return itemsUnicos.filter(item => 
      item.toLowerCase().includes(textoLower)
    ).slice(0, 8) // Máximo 8 sugerencias
  }

  const eliminarItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      alert('El nombre del contenedor es obligatorio')
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              {contenedor ? 'Editar Contenedor' : 'Nuevo Contenedor'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre del Contenedor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre/Número del Contenedor*
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 shadow-sm font-medium"
              placeholder="Ej: Caja 1, Estante A, etc."
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-700">
                Items del Contenedor
              </label>
              <button
                type="button"
                onClick={agregarItem}
                className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Item</span>
              </button>
            </div>

            <div className="space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto pr-2">
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay items. Agrega el primer item.</p>
                </div>
              ) : (
                formData.items.map((item, index) => {
                  const sugerencias = filtrarSugerencias(item.detalle)
                  const mostrarSugerencias = sugerenciasActivas[index] && sugerencias.length > 0

                  return (
                    <div key={index} className="flex space-x-2 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          required
                          value={item.detalle}
                          onChange={(e) => actualizarItem(index, 'detalle', e.target.value)}
                          onBlur={() => setTimeout(() => cerrarSugerencias(index), 200)}
                          className="w-full px-3 py-2.5 bg-white border-2 border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-medium shadow-sm"
                          placeholder="Detalle del producto"
                          autoComplete="off"
                        />
                        
                        {/* Lista de sugerencias autocompletado */}
                        {mostrarSugerencias && (
                          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-purple-400 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                            {sugerencias.map((sugerencia, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => seleccionarSugerencia(index, sugerencia)}
                                className="w-full text-left px-4 py-3 hover:bg-purple-50 text-base text-slate-700 border-b border-slate-100 last:border-0 transition-colors font-medium"
                              >
                                <span className="font-bold text-purple-600 text-lg">📦</span> {sugerencia}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border-2 border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-bold text-center shadow-sm"
                          placeholder="Cant."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Eliminar item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>{contenedor ? 'Actualizar' : 'Crear'} Contenedor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
