'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Check, Package, X, Download, StickyNote, Trash2 } from 'lucide-react'
import type { Reparacion, Tecnico, ConfiguracionLocal, ReparacionFormData, DiagnosticoFormData, RepuestoItem } from '@/types/database'
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
  const [editandoCelular, setEditandoCelular] = useState<string | null>(null)
  const [celularTemp, setCelularTemp] = useState('')
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

    // Calcular el monto total
    const sumaRepuestos = formData.repuestos.reduce((sum, r) => sum + r.precio, 0)
    const montoTotal = formData.mano_obra + sumaRepuestos

    const { error } = await supabase
      .from('reparaciones')
      .update({
        diagnostico: formData.diagnostico,
        mano_obra: formData.mano_obra,
        repuestos: formData.repuestos,
        monto: montoTotal,
        tecnico_id: formData.tecnico_id,
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
        montoTotal,
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

  const handleActualizarCelular = async (reparacionId: string, nuevoCelular: string) => {
    const celularFormateado = nuevoCelular.trim()
    
    if (!celularFormateado) {
      alert('El celular no puede estar vacío')
      return
    }

    const { error } = await supabase
      .from('reparaciones')
      .update({
        cliente_celular: celularFormateado,
        fecha_actualizado: new Date().toISOString()
      })
      .eq('id', reparacionId)

    if (error) {
      alert('Error al actualizar el celular')
      return
    }

    await fetchData()
    setEditandoCelular(null)
    setCelularTemp('')
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
        <div className="w-full">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">
                  N° Comp.
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Técnico
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-28">
                  Estado
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">
                  Monto
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-16">
                  Notas
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-16">
                  WPP
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-16">
                  PDF
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-20">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {reparacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
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
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                      #{reparacion.numero_comprobante.toString().padStart(6, '0')}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-900">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {reparacion.cliente_nombre} {reparacion.cliente_apellido}
                        </div>
                        {editandoCelular === reparacion.id ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={celularTemp}
                              onChange={(e) => setCelularTemp(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleActualizarCelular(reparacion.id, celularTemp)
                                } else if (e.key === 'Escape') {
                                  setEditandoCelular(null)
                                  setCelularTemp('')
                                }
                              }}
                              className="px-2 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Celular"
                              autoFocus
                            />
                            <button
                              onClick={() => handleActualizarCelular(reparacion.id, celularTemp)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Guardar"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                setEditandoCelular(null)
                                setCelularTemp('')
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Cancelar"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditandoCelular(reparacion.id)
                              setCelularTemp(reparacion.cliente_celular)
                            }}
                            className="text-xs text-slate-600 cursor-pointer hover:text-blue-600 hover:underline"
                            title="Click para editar"
                          >
                            {reparacion.cliente_celular}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-900">
                      {reparacion.producto} - {reparacion.marca}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-900">
                      {reparacion.tecnicos ? 
                        `${reparacion.tecnicos.nombre} ${reparacion.tecnicos.apellido}` : 
                        '-'
                      }
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {getEstadoBadge(reparacion.estado)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-900">
                      {reparacion.monto ? `$${reparacion.monto.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedReparacion(reparacion)
                          setShowNotasModal(true)
                        }}
                        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-100 transition"
                        title={reparacion.notas ? `Ver/Editar nota: ${reparacion.notas.substring(0, 50)}${reparacion.notas.length > 50 ? '...' : ''}` : "Agregar nota"}
                      >
                        <StickyNote className={`w-5 h-5 ${reparacion.notas ? 'text-blue-600' : 'text-slate-400'}`} />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => {
                          const mensaje = `*${config?.nombre_local || 'Nuestro Local'}*\n\n` +
                            `Hola ${reparacion.cliente_nombre}!\n\n` +
                            `Te compartimos nuevamente la información de tu reparación:\n\n` +
                            `Comprobante N°: *${reparacion.numero_comprobante.toString().padStart(6, '0')}*\n` +
                            `Equipo: *${reparacion.producto} - ${reparacion.marca}*\n` +
                            `Estado: *${reparacion.estado === 'pendiente' ? 'Pendiente' : 
                                       reparacion.estado === 'en_proceso' ? 'En Proceso' : 
                                       reparacion.estado === 'finalizada' ? 'Finalizada' : 'Entregada'}*\n\n` +
                            (reparacion.monto ? `Monto: *$${reparacion.monto.toLocaleString()}*\n\n` : '') +
                            `Cualquier consulta, no dudes en contactarnos.\n\n` +
                            `Gracias por confiar en nosotros!`
                          
                          abrirWhatsApp({
                            to: formatearTelefonoArgentino(reparacion.cliente_celular),
                            message: mensaje
                          })
                        }}
                        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-green-50 transition text-green-600 hover:text-green-700"
                        title="Enviar información por WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </button>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
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
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
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
          tecnicos={tecnicos}
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
    contrasena: '',
    observacion: ''
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
              Contraseña (opcional)
            </label>
            <input
              type="text"
              value={formData.contrasena}
              onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              placeholder="Si la notebook/PC tiene contraseña"
            />
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
  tecnicos,
  onClose,
  onSubmit
}: {
  reparacion: Reparacion
  tecnicos: Tecnico[]
  onClose: () => void
  onSubmit: (data: DiagnosticoFormData) => void
}) {
  const [formData, setFormData] = useState<DiagnosticoFormData>({
    diagnostico: reparacion.diagnostico || '',
    mano_obra: reparacion.mano_obra || 0,
    repuestos: reparacion.repuestos || [],
    tecnico_id: reparacion.tecnico_id || ''
  })

  const [nuevoRepuesto, setNuevoRepuesto] = useState<RepuestoItem>({
    detalle: '',
    precio: 0
  })

  const agregarRepuesto = () => {
    if (!nuevoRepuesto.detalle.trim()) {
      alert('Ingresa un detalle para el repuesto')
      return
    }
    if (nuevoRepuesto.precio <= 0) {
      alert('El precio debe ser mayor a 0')
      return
    }
    
    setFormData({
      ...formData,
      repuestos: [...formData.repuestos, nuevoRepuesto]
    })
    
    setNuevoRepuesto({ detalle: '', precio: 0 })
  }

  const eliminarRepuesto = (index: number) => {
    setFormData({
      ...formData,
      repuestos: formData.repuestos.filter((_, i) => i !== index)
    })
  }

  const calcularMontoTotal = () => {
    const sumaRepuestos = formData.repuestos.reduce((sum, r) => sum + r.precio, 0)
    return formData.mano_obra + sumaRepuestos
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.tecnico_id) {
      alert('Debes seleccionar un técnico')
      return
    }
    
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Editar Reparación</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg">
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
              rows={3}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              placeholder="Detalla qué necesita el producto para repararse..."
            />
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mano de Obra*
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.mano_obra}
              onChange={(e) => setFormData({ ...formData, mano_obra: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              placeholder="0.00"
            />
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Repuestos
            </label>
            
            {/* Lista de repuestos agregados */}
            {formData.repuestos.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.repuestos.map((repuesto, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{repuesto.detalle}</p>
                      <p className="text-sm text-slate-600">${repuesto.precio.toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarRepuesto(index)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                      title="Eliminar repuesto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar nuevo repuesto */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <p className="text-sm font-medium text-slate-700">Agregar Repuesto</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={nuevoRepuesto.detalle}
                    onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, detalle: e.target.value })}
                    placeholder="Detalle del repuesto"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={nuevoRepuesto.precio}
                    onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, precio: parseFloat(e.target.value) || 0 })}
                    placeholder="Precio"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={agregarRepuesto}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Monto Total */}
          <div className="border-t pt-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-600">Mano de Obra:</p>
                  <p className="text-sm text-slate-600">Repuestos ({formData.repuestos.length}):</p>
                  <p className="text-base font-bold text-slate-900 mt-2">TOTAL:</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900">${formData.mano_obra.toLocaleString()}</p>
                  <p className="text-sm text-slate-900">${formData.repuestos.reduce((sum, r) => sum + r.precio, 0).toLocaleString()}</p>
                  <p className="text-xl font-bold text-green-700 mt-2">${calcularMontoTotal().toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">* El cliente solo verá el monto total</p>
            </div>
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
