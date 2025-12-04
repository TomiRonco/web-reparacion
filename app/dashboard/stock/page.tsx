'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, X, Package, FileText, Barcode, ScanBarcode } from 'lucide-react'
import type { Contenedor, ItemStock, ContenedorFormData, UbicacionStock, MonedaStock } from '@/types/database'
import { generarPDFStock } from '@/lib/pdf-stock'
import PageHeader from '@/components/PageHeader'
import BarcodeGenerator from '@/components/BarcodeGenerator'

export default function StockPage() {
  const [tabActivo, setTabActivo] = useState<UbicacionStock>('adelante')
  const [contenedores, setContenedores] = useState<Contenedor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContenedor, setEditingContenedor] = useState<Contenedor | null>(null)
  
  // Estados para códigos de barra
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false)
  const [selectedItemForBarcode, setSelectedItemForBarcode] = useState<{contenedor: Contenedor, item: ItemStock} | null>(null)
  const [showDescontar, setShowDescontar] = useState(false)
  const [itemToDiscount, setItemToDiscount] = useState<{contenedor: Contenedor, item: ItemStock} | null>(null)
  const [barcodeBuffer, setBarcodeBuffer] = useState('')
  const [barcodeTimeout, setBarcodeTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showGenerarCodigo, setShowGenerarCodigo] = useState(false)
  const [codigoGenerado, setCodigoGenerado] = useState('')
  const [showEditarItem, setShowEditarItem] = useState(false)
  const [editingItem, setEditingItem] = useState<{contenedor: Contenedor, item: ItemStock, index: number} | null>(null)
  
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

  // Detectar escaneo de lector físico de código de barras
  useEffect(() => {
    if (!showBarcodeScanner) return

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo en un input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // Si presiona Enter, procesar el código acumulado
      if (e.key === 'Enter' && barcodeBuffer.length > 0) {
        handleBarcodeScan(barcodeBuffer)
        setBarcodeBuffer('')
        if (barcodeTimeout) clearTimeout(barcodeTimeout)
        return
      }

      // Acumular caracteres alfanuméricos y guiones
      if (/^[a-zA-Z0-9-]$/.test(e.key)) {
        setBarcodeBuffer(prev => prev + e.key)
        
        // Limpiar buffer después de 100ms de inactividad
        if (barcodeTimeout) clearTimeout(barcodeTimeout)
        const timeout = setTimeout(() => {
          setBarcodeBuffer('')
        }, 100)
        setBarcodeTimeout(timeout)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      if (barcodeTimeout) clearTimeout(barcodeTimeout)
    }
  }, [showBarcodeScanner, barcodeBuffer, barcodeTimeout])

  const handleGuardarContenedor = async (formData: ContenedorFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const itemsConPrecioModificado: Array<{detalle: string, costo: number, moneda: MonedaStock}> = []
    const itemsSinPrecio: string[] = []
    
    if (editingContenedor) {
      // Si estamos editando, verificar TODOS los items con precio para sincronizar
      formData.items.forEach(itemNuevo => {
        const itemOriginal = editingContenedor.items.find(
          item => item.detalle.toLowerCase() === itemNuevo.detalle.toLowerCase()
        )
        
        // Si el item tiene precio, sincronizarlo (sin importar si cambió o no)
        if (itemNuevo.costo && itemNuevo.costo > 0) {
          itemsConPrecioModificado.push({
            detalle: itemNuevo.detalle.toLowerCase(),
            costo: itemNuevo.costo,
            moneda: itemNuevo.moneda || 'ARS'
          })
        }
        // Si el precio se eliminó
        else if (itemOriginal && itemOriginal.costo && itemOriginal.costo > 0) {
          itemsSinPrecio.push(itemNuevo.detalle.toLowerCase())
        }
      })

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
      // Crear nuevo contenedor - también detectar items con precio para sincronizar
      formData.items.forEach(item => {
        if (item.costo && item.costo > 0) {
          itemsConPrecioModificado.push({
            detalle: item.detalle.toLowerCase(),
            costo: item.costo,
            moneda: item.moneda || 'ARS'
          })
        }
      })

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

    // Sincronizar precios modificados en todos los contenedores
    if (itemsConPrecioModificado.length > 0) {
      console.log('Sincronizando precios:', itemsConPrecioModificado)
      await sincronizarPreciosEnTodasUbicaciones(user.id, itemsConPrecioModificado)
    }

    // Si hay items con precios eliminados, eliminar precios en todos los contenedores
    if (itemsSinPrecio.length > 0) {
      console.log('Eliminando precios:', itemsSinPrecio)
      await eliminarPreciosDeTodasUbicaciones(user.id, itemsSinPrecio)
    }

    // Recargar todos los contenedores para reflejar cambios en ambas ubicaciones
    await fetchContenedores()
    setShowModal(false)
    setEditingContenedor(null)
  }

  const eliminarPreciosDeTodasUbicaciones = async (userId: string, detallesSinPrecio: string[]) => {
    // Obtener todos los contenedores del usuario
    const { data: todosContenedores, error: errorFetch } = await supabase
      .from('contenedores')
      .select('*')
      .eq('user_id', userId)

    if (errorFetch || !todosContenedores) return

    // Actualizar cada contenedor eliminando los precios de los items especificados
    for (const contenedor of todosContenedores) {
      let huboChangios = false
      const itemsActualizados = contenedor.items.map((item: ItemStock) => {
        if (detallesSinPrecio.includes(item.detalle.toLowerCase())) {
          huboChangios = true
          return { ...item, costo: 0, moneda: 'ARS' as MonedaStock }
        }
        return item
      })

      // Solo actualizar si hubo cambios
      if (huboChangios) {
        await supabase
          .from('contenedores')
          .update({ items: itemsActualizados })
          .eq('id', contenedor.id)
      }
    }
  }

  const sincronizarPreciosEnTodasUbicaciones = async (
    userId: string, 
    itemsConPrecio: Array<{detalle: string, costo: number, moneda: MonedaStock}>
  ) => {
    // Obtener todos los contenedores del usuario
    const { data: todosContenedores, error: errorFetch } = await supabase
      .from('contenedores')
      .select('*')
      .eq('user_id', userId)

    if (errorFetch || !todosContenedores) {
      console.error('Error al obtener contenedores:', errorFetch)
      return
    }

    console.log('Contenedores encontrados:', todosContenedores.length)

    // Actualizar cada contenedor con los nuevos precios
    for (const contenedor of todosContenedores) {
      let huboChangios = false
      const itemsActualizados = contenedor.items.map((item: ItemStock) => {
        const itemConPrecio = itemsConPrecio.find(
          ip => ip.detalle === item.detalle.toLowerCase()
        )
        
        if (itemConPrecio) {
          huboChangios = true
          console.log(`Actualizando ${item.detalle} en contenedor ${contenedor.nombre}:`, itemConPrecio)
          return { ...item, costo: itemConPrecio.costo, moneda: itemConPrecio.moneda }
        }
        return item
      })

      // Solo actualizar si hubo cambios
      if (huboChangios) {
        console.log(`Guardando cambios en contenedor ${contenedor.nombre}`)
        const { error } = await supabase
          .from('contenedores')
          .update({ items: itemsActualizados })
          .eq('id', contenedor.id)
        
        if (error) {
          console.error('Error al actualizar contenedor:', error)
        }
      }
    }
    console.log('Sincronización completada')
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

  // Generar código de barras único
  const generateBarcodeId = (): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `STK-${timestamp}-${random}`
  }

  // Manejar escaneo de código de barras
  const handleBarcodeScan = (code: string) => {
    setShowBarcodeScanner(false)
    
    // Buscar el item en todos los contenedores
    let foundItem: {contenedor: Contenedor, item: ItemStock} | null = null
    
    for (const contenedor of contenedores) {
      const item = contenedor.items.find((it: ItemStock) => it.codigo_barras === code)
      if (item) {
        foundItem = { contenedor, item }
        break
      }
    }

    if (foundItem) {
      setItemToDiscount(foundItem)
      setShowDescontar(true)
    } else {
      alert(`No se encontró ningún artículo con el código: ${code}`)
    }
  }

  // Descontar cantidad del item escaneado
  const handleDescontarCantidad = async (cantidadADescontar: number) => {
    if (!itemToDiscount) return

    const { contenedor, item } = itemToDiscount
    const nuevaCantidad = item.cantidad - cantidadADescontar

    if (nuevaCantidad < 0) {
      alert('La cantidad a descontar es mayor que la disponible')
      return
    }

    // Actualizar el item en el contenedor
    const itemsActualizados = contenedor.items.map((it: ItemStock) =>
      it.id === item.id ? { ...it, cantidad: nuevaCantidad } : it
    )

    const { error } = await supabase
      .from('contenedores')
      .update({ items: itemsActualizados })
      .eq('id', contenedor.id)

    if (error) {
      alert('Error al actualizar la cantidad')
      return
    }

    setShowDescontar(false)
    setItemToDiscount(null)
    await fetchContenedores()
  }

  // Generar código aleatorio para imprimir (sin asignar)
  const handleGenerarCodigoNuevo = () => {
    const nuevoCodigo = generateBarcodeId()
    setCodigoGenerado(nuevoCodigo)
    setShowGenerarCodigo(true)
  }

  // Actualizar código de barras de un item
  const handleActualizarCodigoBarras = async (nuevoCodigo: string) => {
    if (!editingItem) return

    const { contenedor, item, index } = editingItem

    // Actualizar el item en el contenedor
    const itemsActualizados = [...contenedor.items]
    itemsActualizados[index] = { ...item, codigo_barras: nuevoCodigo }

    const { error } = await supabase
      .from('contenedores')
      .update({ items: itemsActualizados })
      .eq('id', contenedor.id)

    if (error) {
      alert('Error al actualizar código de barras')
      return
    }

    await fetchContenedores()
    setShowEditarItem(false)
    setEditingItem(null)
    alert('Código de barras actualizado')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="shrink-0">
        <PageHeader
          title="Gestión de Stock"
          gradient="purple"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition shadow-md font-semibold text-sm ${
                  showBarcodeScanner 
                    ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse' 
                    : 'bg-white text-purple-600 hover:bg-purple-50'
                }`}
              >
                <ScanBarcode className="w-4 h-4" />
                <span>{showBarcodeScanner ? 'Escuchando...' : 'Activar Scanner'}</span>
              </button>
              <button
                onClick={handleGenerarCodigoNuevo}
                className="flex items-center space-x-2 bg-white text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-50 transition shadow-md font-semibold text-sm"
              >
                <Barcode className="w-4 h-4" />
                <span>Generar Código</span>
              </button>
              <button
                onClick={handleExportarPDF}
                disabled={contenedores.length === 0}
                className="flex items-center space-x-2 bg-white text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-50 transition shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => {
                  setEditingContenedor(null)
                  setShowModal(true)
                }}
                className="flex items-center space-x-2 bg-white text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-50 transition shadow-md font-semibold text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo</span>
              </button>
            </div>
          }
        />

        {/* Tabs para Stock Adelante / Stock Atrás */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="border-b border-slate-200">
            <div className="flex space-x-1">
              <button
                onClick={() => setTabActivo('adelante')}
                className={`px-6 py-2 font-medium text-sm transition-all relative ${
                  tabActivo === 'adelante'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Adelante</span>
                </div>
              </button>
              <button
                onClick={() => setTabActivo('atras')}
                className={`px-6 py-2 font-medium text-sm transition-all relative ${
                  tabActivo === 'atras'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Atrás</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Contenedores con scroll */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                        <div key={index} className="py-2 border-b border-slate-100 last:border-0">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-slate-700 flex-1">{item.detalle}</span>
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="text-sm font-semibold text-purple-600">x{item.cantidad}</span>
                              {item.codigo_barras ? (
                                <button
                                  onClick={() => {
                                    setSelectedItemForBarcode({ contenedor, item })
                                    setShowBarcodeGenerator(true)
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded transition"
                                  title="Ver código de barras"
                                >
                                  <Barcode className="w-4 h-4 text-green-600" />
                                </button>
                              ) : null}
                              <button
                                onClick={() => {
                                  setEditingItem({ contenedor, item, index })
                                  setShowEditarItem(true)
                                }}
                                className="p-1 hover:bg-slate-100 rounded transition"
                                title="Editar código de barras"
                              >
                                <Edit2 className="w-3 h-3 text-slate-400" />
                              </button>
                            </div>
                          </div>
                          {item.costo && item.costo > 0 && (
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-slate-500">
                                {item.moneda} ${item.costo.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u
                              </span>
                              <span className="text-xs font-bold text-green-600">
                                {item.moneda} ${(item.cantidad * item.costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
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

      {/* Indicador de Scanner Activo */}
      {showBarcodeScanner && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse z-50">
          <ScanBarcode className="w-5 h-5" />
          <span className="text-sm font-medium">Scanner activado - Escanee un código</span>
        </div>
      )}

      {/* Modal para Generar Código Nuevo */}
      {showGenerarCodigo && codigoGenerado && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Código Generado</h3>
              <button
                onClick={() => {
                  setShowGenerarCodigo(false)
                  setCodigoGenerado('')
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Código generado para imprimir. Luego podrás asignarlo a un item.
            </p>
            <BarcodeGenerator
              codigo={codigoGenerado}
              nombre="Código Nuevo"
              onClose={() => {
                setShowGenerarCodigo(false)
                setCodigoGenerado('')
              }}
            />
          </div>
        </div>
      )}

      {/* Modal para Generar Código de Barras */}
      {showBarcodeGenerator && selectedItemForBarcode && (
        <BarcodeGenerator
          codigo={selectedItemForBarcode.item.codigo_barras!}
          nombre={selectedItemForBarcode.item.detalle}
          onClose={() => {
            setShowBarcodeGenerator(false)
            setSelectedItemForBarcode(null)
          }}
        />
      )}

      {/* Modal para Editar Código de Barras */}
      {showEditarItem && editingItem && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Asignar Código de Barras
              </h3>
              <button
                onClick={() => {
                  setShowEditarItem(false)
                  setEditingItem(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              <strong>{editingItem.item.detalle}</strong>
            </p>
            {editingItem.item.codigo_barras && (
              <p className="text-xs text-slate-500 mb-4">
                Código actual: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{editingItem.item.codigo_barras}</span>
              </p>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Código de Barras:
            </label>
            <input
              type="text"
              defaultValue={editingItem.item.codigo_barras || ''}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Escanee o ingrese el código..."
              id="input-codigo-barras"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEditarItem(false)
                  setEditingItem(null)
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('input-codigo-barras') as HTMLInputElement
                  const codigo = input.value.trim()
                  if (codigo) {
                    handleActualizarCodigoBarras(codigo)
                  } else {
                    alert('Por favor ingrese un código')
                  }
                }}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Descontar Cantidad */}
      {showDescontar && itemToDiscount && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Descontar Stock
            </h3>
            <p className="text-sm text-slate-600 mb-2">
              <strong>{itemToDiscount.item.detalle}</strong>
            </p>
            <p className="text-sm text-slate-600 mb-4">
              Stock actual: <strong>{itemToDiscount.item.cantidad}</strong> unidades
            </p>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cantidad a descontar:
            </label>
            <input
              type="number"
              min="1"
              max={itemToDiscount.item.cantidad}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ingrese cantidad..."
              id="cantidad-descontar"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDescontar(false)
                  setItemToDiscount(null)
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('cantidad-descontar') as HTMLInputElement
                  const cantidad = parseInt(input.value)
                  if (cantidad > 0 && cantidad <= itemToDiscount.item.cantidad) {
                    handleDescontarCantidad(cantidad)
                  }
                }}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
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
  const [itemsPreciosMap, setItemsPreciosMap] = useState<Map<string, { costo?: number, moneda?: MonedaStock }>>(new Map())
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
        // Extraer todos los items con sus precios
        const todosLosItems = data.flatMap(cont => 
          Array.isArray(cont.items) ? cont.items : []
        )
        
        // Crear mapa de precios (usar el primer item con precio encontrado para cada detalle)
        const preciosMap = new Map<string, { costo?: number, moneda?: MonedaStock }>()
        todosLosItems.forEach((item: ItemStock) => {
          const key = item.detalle.toLowerCase()
          if (!preciosMap.has(key) && item.costo !== undefined && item.costo > 0) {
            preciosMap.set(key, { costo: item.costo, moneda: item.moneda })
          }
        })
        setItemsPreciosMap(preciosMap)
        
        // Extraer detalles únicos y ordenar
        const detallesUnicos = Array.from(new Set(todosLosItems.map((item: ItemStock) => item.detalle))).sort()
        setItemsUnicos(detallesUnicos)
      }
    }

    fetchItemsUnicos()
  }, [supabase])

  const agregarItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { detalle: '', cantidad: 1, costo: 0, moneda: 'ARS' }]
    })
  }

  const actualizarItem = (index: number, field: keyof ItemStock, value: string | number | MonedaStock) => {
    const nuevosItems = [...formData.items]
    if (field === 'cantidad' || field === 'costo') {
      nuevosItems[index][field] = Number(value)
    } else if (field === 'moneda') {
      nuevosItems[index][field] = value as MonedaStock
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
    
    // Autocompletar precio y moneda si existe en el map
    const precioInfo = itemsPreciosMap.get(sugerencia.toLowerCase())
    if (precioInfo?.costo && precioInfo.costo > 0) {
      nuevosItems[index].costo = precioInfo.costo
      nuevosItems[index].moneda = precioInfo.moneda || 'ARS'
    }
    
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
                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {/* Una sola fila horizontal */}
                      <div className="flex gap-2 items-start">
                        {/* Detalle del producto */}
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

                        {/* Cantidad */}
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
                        
                        {/* Costo */}
                        <div className="w-32">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.costo || ''}
                            onChange={(e) => actualizarItem(index, 'costo', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border-2 border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-medium shadow-sm"
                            placeholder="Costo"
                          />
                        </div>

                        {/* Moneda */}
                        <div className="w-24">
                          <select
                            value={item.moneda || 'ARS'}
                            onChange={(e) => actualizarItem(index, 'moneda', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border-2 border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-bold shadow-sm"
                          >
                            <option value="ARS">ARS</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          type="button"
                          onClick={() => eliminarItem(index)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Eliminar item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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
