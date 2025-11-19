'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Check, Package, X, Download, StickyNote } from 'lucide-react'
import type { Reparacion, Tecnico, ConfiguracionLocal, ReparacionFormData, DiagnosticoFormData } from '@/types/database'
import { generarPDFComprobante, generarPDFBlob } from '@/lib/pdf-generator'
import { abrirWhatsApp, plantillasWhatsApp, formatearTelefonoArgentino } from '@/lib/whatsapp'
import FiltroReparaciones, { FiltrosReparacion } from '@/components/FiltroReparaciones'
import PageHeader from '@/components/PageHeader'

export default function ReparacionesPage() {
  const [reparaciones, setReparaciones] = useState<Reparacion[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [config, setConfig] = useState<ConfiguracionLocal | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDiagnosticoModal, setShowDiagnosticoModal] = useState(false)
  const [showNotasModal, setShowNotasModal] = useState(false)
  const [selectedReparacion, setSelectedReparacion] = useState<Reparacion | null>(null)
  const [filtros, setFiltros] = useState<FiltrosReparacion>({
    busqueda: '',
    estado: 'todos'
  })
  
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch reparaciones con técnicos
    const { data: reparacionesData } = await supabase
      .from('reparaciones')
      .select(`
        *,
        tecnicos(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (reparacionesData) {
      setReparaciones(reparacionesData)
    }

    // Fetch técnicos
    const { data: tecnicosData } = await supabase
      .from('tecnicos')
      .select('*')
      .eq('user_id', user.id)
      .order('nombre')

    if (tecnicosData) {
      setTecnicos(tecnicosData)
    }

    // Fetch configuración
    const { data: configData } = await supabase
      .from('configuracion_local')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (configData) {
      setConfig(configData)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAgregarReparacion = async (formData: ReparacionFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Obtener el último número de comprobante
    const { data: ultimaReparacion } = await supabase
      .from('reparaciones')
      .select('numero_comprobante')
      .eq('user_id', user.id)
      .order('numero_comprobante', { ascending: false })
      .limit(1)
      .single()

    const nuevoNumero = ultimaReparacion ? ultimaReparacion.numero_comprobante + 1 : 1

    const { data: nuevaReparacion, error } = await supabase
      .from('reparaciones')
      .insert({
        user_id: user.id,
        numero_comprobante: nuevoNumero,
        ...formData,
        estado: 'pendiente'
      })
      .select(`
        *,
        tecnicos(*)
      `)
      .single()

    if (error) {
      alert('Error al crear la reparación')
      return
    }

    if (nuevaReparacion) {
      setReparaciones([nuevaReparacion, ...reparaciones])
      setShowModal(false)
      
      // Generar PDF como blob
      const { blob, nombreArchivo } = await generarPDFBlob(nuevaReparacion, config)
      
      // Subir PDF a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(`${user.id}/${nombreArchivo}`, blob, {
          contentType: 'application/pdf',
          upsert: true
        })
      
      let comprobanteURL = ''
      if (!uploadError && uploadData) {
        // Obtener URL pública del PDF
        const { data: urlData } = supabase.storage
          .from('comprobantes')
          .getPublicUrl(`${user.id}/${nombreArchivo}`)
        
        comprobanteURL = urlData.publicUrl
      }
      
      // También descargar el PDF localmente
      await generarPDFComprobante(nuevaReparacion, config)
      
      // Enviar notificación de WhatsApp con link al comprobante
      if (nuevaReparacion.cliente_celular && config?.nombre_local) {
        const telefono = formatearTelefonoArgentino(nuevaReparacion.cliente_celular)
        const mensaje = plantillasWhatsApp.nueva_reparacion(
          nuevaReparacion.numero_comprobante.toString().padStart(6, '0'),
          nuevaReparacion.producto,
          config.nombre_local,
          comprobanteURL
        )
        
        abrirWhatsApp({ to: telefono, message: mensaje })
      }
    }
  }

  const handleAgregarDiagnostico = async (formData: DiagnosticoFormData) => {
    if (!selectedReparacion) return

    const { error } = await supabase
      .from('reparaciones')
      .update({
        diagnostico: formData.diagnostico,
        monto: formData.monto,
        estado: 'en_proceso',
        fecha_actualizado: new Date().toISOString()
      })
      .eq('id', selectedReparacion.id)

    if (error) {
      alert('Error al actualizar la reparación')
      return
    }

    // Enviar notificación de WhatsApp
    if (selectedReparacion.cliente_celular && config?.nombre_local) {
      const telefono = formatearTelefonoArgentino(selectedReparacion.cliente_celular)
      const mensaje = plantillasWhatsApp.modificacion(
        selectedReparacion.numero_comprobante.toString().padStart(6, '0'),
        formData.diagnostico,
        formData.monto,
        config.nombre_local
      )
      
      abrirWhatsApp({ to: telefono, message: mensaje })
    }

    await fetchData()
    setShowDiagnosticoModal(false)
    setSelectedReparacion(null)
  }

  const handleGuardarNotas = async (notas: string) => {
    if (!selectedReparacion) return

    const { error } = await supabase
      .from('reparaciones')
      .update({
        notas: notas || null,
        fecha_actualizado: new Date().toISOString()
      })
      .eq('id', selectedReparacion.id)

    if (error) {
      alert('Error al guardar las notas')
      return
    }

    await fetchData()
    setShowNotasModal(false)
    setSelectedReparacion(null)
  }

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const updates: Record<string, unknown> = {
      estado: nuevoEstado,
      fecha_actualizado: new Date().toISOString()
    }

    if (nuevoEstado === 'finalizada') {
      updates.fecha_finalizado = new Date().toISOString()
    } else if (nuevoEstado === 'entregada') {
      updates.fecha_entregado = new Date().toISOString()
    }

    const { error } = await supabase
      .from('reparaciones')
      .update(updates)
      .eq('id', id)

    if (error) {
      alert('Error al cambiar el estado')
      return
    }

    // Enviar notificación de WhatsApp según el nuevo estado
    const reparacion = reparaciones.find(r => r.id === id)
    if (reparacion && reparacion.cliente_celular && config?.nombre_local) {
      const telefono = formatearTelefonoArgentino(reparacion.cliente_celular)
      let mensaje = ''
      
      if (nuevoEstado === 'finalizada') {
        mensaje = plantillasWhatsApp.finalizada(
          reparacion.numero_comprobante.toString().padStart(6, '0'),
          reparacion.producto,
          config.nombre_local,
          config.horarios || undefined
        )
      } else if (nuevoEstado === 'entregada') {
        mensaje = plantillasWhatsApp.entregada(
          reparacion.numero_comprobante.toString().padStart(6, '0'),
          reparacion.producto,
          config.nombre_local
        )
      }
      
      if (mensaje) {
        abrirWhatsApp({ to: telefono, message: mensaje })
      }
    }

    await fetchData()
  }

  // Filtrado de reparaciones con búsqueda y estado
  const reparacionesFiltradas = useMemo(() => {
    return reparaciones.filter(r => {
      // Filtro por estado
      const cumpleEstado = filtros.estado === 'todos' ? true : r.estado === filtros.estado

      // Filtro por búsqueda (nombre, apellido o celular)
      const cumpleBusqueda = filtros.busqueda === '' ? true : 
        r.cliente_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        r.cliente_apellido.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        r.cliente_celular.toLowerCase().includes(filtros.busqueda.toLowerCase())

      return cumpleEstado && cumpleBusqueda
    })
  }, [reparaciones, filtros])

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      en_proceso: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Proceso' },
      finalizada: { bg: 'bg-green-100', text: 'text-green-800', label: 'Finalizada' },
      entregada: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Entregada' }
    }
    const badge = badges[estado] || badges.pendiente
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Reparaciones"
        gradient="blue"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition shadow-md font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Reparación</span>
          </button>
        }
      />

      {/* Componente de filtros */}
      <div className="mb-6">
        <FiltroReparaciones
          filtros={filtros}
          onFiltrosChange={setFiltros}
          totalResultados={reparaciones.length}
          totalFiltrados={reparacionesFiltradas.length}
        />
      </div>

      {/* Lista de reparaciones - Vista Desktop (Tabla) */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  N° Comprobante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Técnico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Notas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  PDF
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {reparacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    {filtros.busqueda || filtros.estado !== 'todos' ? (
                      <div className="space-y-2">
                        <p className="text-lg font-medium">No se encontraron reparaciones</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    ) : (
                      <p>No hay reparaciones registradas</p>
                    )}
                  </td>
                </tr>
              ) : (
                reparacionesFiltradas.map((reparacion) => (
                  <tr key={reparacion.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      #{reparacion.numero_comprobante.toString().padStart(6, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {reparacion.cliente_nombre} {reparacion.cliente_apellido}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {reparacion.producto} - {reparacion.marca}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {reparacion.tecnicos ? 
                        `${reparacion.tecnicos.nombre} ${reparacion.tecnicos.apellido}` : 
                        '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(reparacion.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {reparacion.monto ? `$${reparacion.monto.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <button
                        onClick={() => {
                          setSelectedReparacion(reparacion)
                          setShowNotasModal(true)
                        }}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-slate-100 transition group"
                        title={reparacion.notas ? "Ver/Editar nota" : "Agregar nota"}
                      >
                        <StickyNote className={`w-4 h-4 ${reparacion.notas ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="max-w-[200px] truncate text-left">
                          {reparacion.notas || 'Agregar nota'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-center">
                        <button
                          onClick={() => generarPDFComprobante(reparacion, config)}
                          className="text-red-600 hover:text-red-900 transition"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        {reparacion.estado === 'pendiente' && (
                          <button
                            onClick={() => {
                              setSelectedReparacion(reparacion)
                              setShowDiagnosticoModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Agregar diagnóstico"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {reparacion.estado === 'en_proceso' && (
                          <button
                            onClick={() => cambiarEstado(reparacion.id, 'finalizada')}
                            className="text-green-600 hover:text-green-900"
                            title="Marcar como finalizada"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {reparacion.estado === 'finalizada' && (
                          <button
                            onClick={() => cambiarEstado(reparacion.id, 'entregada')}
                            className="text-purple-600 hover:text-purple-900"
                            title="Marcar como entregada"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de reparaciones - Vista Mobile (Cards) */}
      <div className="lg:hidden space-y-4">
        {reparacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
            {filtros.busqueda || filtros.estado !== 'todos' ? (
              <div className="space-y-2">
                <p className="text-lg font-medium">No se encontraron reparaciones</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <p>No hay reparaciones registradas</p>
            )}
          </div>
        ) : (
          reparacionesFiltradas.map((reparacion) => (
            <div key={reparacion.id} className="bg-white rounded-lg shadow p-4 space-y-3">
              {/* Header del Card */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Comprobante</p>
                  <p className="text-lg font-bold text-slate-900">
                    #{reparacion.numero_comprobante.toString().padStart(6, '0')}
                  </p>
                </div>
                <div>
                  {getEstadoBadge(reparacion.estado)}
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Cliente</p>
                <p className="text-sm font-medium text-slate-900">
                  {reparacion.cliente_nombre} {reparacion.cliente_apellido}
                </p>
                <p className="text-xs text-slate-600">{reparacion.cliente_celular}</p>
              </div>

              {/* Información del Producto */}
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Producto</p>
                <p className="text-sm font-medium text-slate-900">
                  {reparacion.producto} - {reparacion.marca}
                </p>
              </div>

              {/* Técnico y Monto */}
              <div className="border-t pt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Técnico</p>
                  <p className="text-sm text-slate-900">
                    {reparacion.tecnicos ? 
                      `${reparacion.tecnicos.nombre} ${reparacion.tecnicos.apellido}` : 
                      '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Monto</p>
                  <p className="text-sm font-bold text-slate-900">
                    {reparacion.monto ? `$${reparacion.monto.toLocaleString()}` : '-'}
                  </p>
                </div>
              </div>

              {/* Notas */}
              <div className="border-t pt-3">
                <button
                  onClick={() => {
                    setSelectedReparacion(reparacion)
                    setShowNotasModal(true)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition w-full text-left"
                >
                  <StickyNote className={`w-4 h-4 ${reparacion.notas ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500">Notas</p>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {reparacion.notas || 'Agregar nota...'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Acciones */}
              <div className="border-t pt-3 flex items-center justify-between">
                <button
                  onClick={() => generarPDFComprobante(reparacion, config)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                
                <div className="flex space-x-2">
                  {reparacion.estado === 'pendiente' && (
                    <button
                      onClick={() => {
                        setSelectedReparacion(reparacion)
                        setShowDiagnosticoModal(true)
                      }}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Diagnóstico</span>
                    </button>
                  )}
                  {reparacion.estado === 'en_proceso' && (
                    <button
                      onClick={() => cambiarEstado(reparacion.id, 'finalizada')}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Finalizar</span>
                    </button>
                  )}
                  {reparacion.estado === 'finalizada' && (
                    <button
                      onClick={() => cambiarEstado(reparacion.id, 'entregada')}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    >
                      <Package className="w-4 h-4" />
                      <span>Entregar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Agregar Reparación */}
      {showModal && (
        <ModalAgregarReparacion
          tecnicos={tecnicos}
          onClose={() => setShowModal(false)}
          onSubmit={handleAgregarReparacion}
        />
      )}

      {/* Modal Diagnóstico */}
      {showDiagnosticoModal && selectedReparacion && (
        <ModalDiagnostico
          reparacion={selectedReparacion}
          onClose={() => {
            setShowDiagnosticoModal(false)
            setSelectedReparacion(null)
          }}
          onSubmit={handleAgregarDiagnostico}
        />
      )}

      {/* Modal Notas */}
      {showNotasModal && selectedReparacion && (
        <ModalNotas
          reparacion={selectedReparacion}
          onClose={() => {
            setShowNotasModal(false)
            setSelectedReparacion(null)
          }}
          onSubmit={handleGuardarNotas}
        />
      )}
    </div>
  )
}

// Modal para agregar reparación
function ModalAgregarReparacion({
  tecnicos,
  onClose,
  onSubmit
}: {
  tecnicos: Tecnico[]
  onClose: () => void
  onSubmit: (data: ReparacionFormData) => void
}) {
  const [formData, setFormData] = useState<ReparacionFormData>({
    cliente_nombre: '',
    cliente_apellido: '',
    cliente_celular: '',
    producto: '',
    marca: '',
    tiene_cargador: false,
    observacion: '',
    tecnico_id: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Nueva Reparación</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Cliente*
              </label>
              <input
                type="text"
                required
                value={formData.cliente_nombre}
                onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellido del Cliente*
              </label>
              <input
                type="text"
                required
                value={formData.cliente_apellido}
                onChange={(e) => setFormData({ ...formData, cliente_apellido: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Celular del Cliente*
            </label>
            <input
              type="tel"
              required
              value={formData.cliente_celular}
              onChange={(e) => setFormData({ ...formData, cliente_celular: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Producto a Reparar*
              </label>
              <input
                type="text"
                required
                value={formData.producto}
                onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
                placeholder="Ej: Notebook, Celular, PC"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Marca*
              </label>
              <input
                type="text"
                required
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Técnico Asignado*
            </label>
            <select
              required
              value={formData.tecnico_id}
              onChange={(e) => setFormData({ ...formData, tecnico_id: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
            >
              <option value="">Seleccionar técnico...</option>
              {tecnicos.map((tecnico) => (
                <option key={tecnico.id} value={tecnico.id}>
                  {tecnico.nombre} {tecnico.apellido}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ¿Tiene cargador?*
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="cargador"
                  checked={formData.tiene_cargador === true}
                  onChange={() => setFormData({ ...formData, tiene_cargador: true })}
                  className="mr-2"
                />
                <span className="text-sm text-slate-700">Sí</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="cargador"
                  checked={formData.tiene_cargador === false}
                  onChange={() => setFormData({ ...formData, tiene_cargador: false })}
                  className="mr-2"
                />
                <span className="text-sm text-slate-700">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observacion}
              onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              placeholder="Detalles adicionales sobre el estado del producto..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Crear Reparación
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal para agregar diagnóstico
function ModalDiagnostico({
  reparacion,
  onClose,
  onSubmit
}: {
  reparacion: Reparacion
  onClose: () => void
  onSubmit: (data: DiagnosticoFormData) => void
}) {
  const [formData, setFormData] = useState<DiagnosticoFormData>({
    diagnostico: '',
    monto: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Agregar Diagnóstico</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-slate-600">Cliente: <span className="font-medium text-slate-900">{reparacion.cliente_nombre} {reparacion.cliente_apellido}</span></p>
            <p className="text-sm text-slate-600">Producto: <span className="font-medium text-slate-900">{reparacion.producto} - {reparacion.marca}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Diagnóstico / Qué necesita reparar*
            </label>
            <textarea
              required
              value={formData.diagnostico}
              onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              placeholder="Detalla qué necesita el producto para repararse..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto de la Reparación*
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Guardar y Pasar a En Proceso
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal para agregar/editar notas
function ModalNotas({
  reparacion,
  onClose,
  onSubmit
}: {
  reparacion: Reparacion
  onClose: () => void
  onSubmit: (notas: string) => void
}) {
  const [notas, setNotas] = useState<string>(reparacion.notas || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(notas)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <StickyNote className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Notas de Reparación</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">Comprobante #{reparacion.numero_comprobante.toString().padStart(6, '0')}</span>
            </p>
            <p className="text-sm text-slate-600">Cliente: <span className="font-medium text-slate-900">{reparacion.cliente_nombre} {reparacion.cliente_apellido}</span></p>
            <p className="text-sm text-slate-600">Producto: <span className="font-medium text-slate-900">{reparacion.producto} - {reparacion.marca}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              placeholder="Escribe aquí cualquier información adicional sobre esta reparación..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Estas notas son privadas y solo visibles para ti y tu equipo.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <StickyNote className="w-4 h-4" />
              <span>Guardar Notas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
