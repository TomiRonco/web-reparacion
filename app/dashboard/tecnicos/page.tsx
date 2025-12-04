'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import type { Tecnico, TecnicoFormData } from '@/types/database'
import PageHeader from '@/components/PageHeader'
import { CardSkeleton } from '@/components/LoadingSkeletons'
import { useToast } from '@/components/Toast'

export default function TecnicosPage() {
  const supabase = createClient()
  const { showToast } = useToast()
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null)

  const fetchTecnicos = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tecnicos')
      .select('*')
      .eq('user_id', user.id)
      .order('nombre')

    if (data) {
      setTecnicos(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchTecnicos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAgregarTecnico = async (formData: TecnicoFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('tecnicos')
      .insert({
        user_id: user.id,
        ...formData
      })

    if (error) {
      showToast('error', 'Error al crear el técnico')
      return
    }

    await fetchTecnicos()
    setShowModal(false)
  }

  const handleEditarTecnico = async (formData: TecnicoFormData) => {
    if (!editingTecnico) return

    const { error } = await supabase
      .from('tecnicos')
      .update(formData)
      .eq('id', editingTecnico.id)

    if (error) {
      showToast('error', 'Error al actualizar el técnico')
      return
    }

    await fetchTecnicos()
    setShowModal(false)
    setEditingTecnico(null)
  }

  const handleEliminarTecnico = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este técnico? Esta acción no se puede deshacer.')) {
      return
    }

    const { error } = await supabase
      .from('tecnicos')
      .delete()
      .eq('id', id)

    if (error) {
      showToast('error', 'Error al eliminar el técnico. Puede que tenga reparaciones asignadas.')
      return
    }

    await fetchTecnicos()
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Técnicos" gradient="purple" />
        <CardSkeleton count={4} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Técnicos"
        gradient="purple"
        actions={
          <button
            onClick={() => {
              setEditingTecnico(null)
              setShowModal(true)
            }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition shadow-md font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Técnico</span>
          </button>
        }
      />

      {/* Lista de técnicos - Vista Desktop (Tabla) */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Celular
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tecnicos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="space-y-2">
                      <p className="text-lg font-medium">No hay técnicos registrados</p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Agregar el primer técnico
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                tecnicos.map((tecnico) => (
                  <tr key={tecnico.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {tecnico.nombre} {tecnico.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {tecnico.celular}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(tecnico.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingTecnico(tecnico)
                            setShowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 transition"
                          title="Editar técnico"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminarTecnico(tecnico.id)}
                          className="text-red-600 hover:text-red-900 transition"
                          title="Eliminar técnico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de técnicos - Vista Mobile (Cards) */}
      <div className="lg:hidden space-y-4">
        {tecnicos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
            <div className="space-y-2">
              <p className="text-lg font-medium">No hay técnicos registrados</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Agregar el primer técnico
              </button>
            </div>
          </div>
        ) : (
          tecnicos.map((tecnico) => (
            <div key={tecnico.id} className="bg-white rounded-lg shadow p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {tecnico.nombre} {tecnico.apellido}
                  </p>
                  <p className="text-sm text-slate-600">{tecnico.celular}</p>
                </div>
              </div>

              {/* Fecha */}
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-slate-500">Fecha de registro</p>
                <p className="text-sm text-slate-900">
                  {new Date(tecnico.created_at).toLocaleDateString('es-AR')}
                </p>
              </div>

              {/* Acciones */}
              <div className="border-t pt-3 flex space-x-2">
                <button
                  onClick={() => {
                    setEditingTecnico(tecnico)
                    setShowModal(true)
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleEliminarTecnico(tecnico.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Agregar/Editar Técnico */}
      {showModal && (
        <ModalTecnico
          tecnico={editingTecnico}
          onClose={() => {
            setShowModal(false)
            setEditingTecnico(null)
          }}
          onSubmit={editingTecnico ? handleEditarTecnico : handleAgregarTecnico}
        />
      )}
    </div>
  )
}

// Modal para agregar/editar técnico
function ModalTecnico({
  tecnico,
  onClose,
  onSubmit
}: {
  tecnico: Tecnico | null
  onClose: () => void
  onSubmit: (data: TecnicoFormData) => void
}) {
  const [formData, setFormData] = useState<TecnicoFormData>({
    nombre: tecnico?.nombre || '',
    apellido: tecnico?.apellido || '',
    celular: tecnico?.celular || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {tecnico ? 'Editar Técnico' : 'Agregar Técnico'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre*
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Apellido*
            </label>
            <input
              type="text"
              required
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Celular*
            </label>
            <input
              type="tel"
              required
              value={formData.celular}
              onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              placeholder="+54 9 11 1234-5678"
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
              {tecnico ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
