'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Upload } from 'lucide-react'
import type { ConfiguracionLocal } from '@/types/database'
import Image from 'next/image'
import PageHeader from '@/components/PageHeader'
import { CardSkeleton } from '@/components/LoadingSkeletons'
import { useToast } from '@/components/Toast'
import { Button } from '@/components/Button'

export default function ConfiguracionPage() {
  const supabase = createClient()
  const { showToast } = useToast()
  const [config, setConfig] = useState<ConfiguracionLocal | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    nombre_local: '',
    logo_url: '',
    ubicacion: '',
    telefono: '',
    celular: '',
    email: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    horarios: ''
  })

  const fetchConfig = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('configuracion_local')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setConfig(data)
      setFormData({
        nombre_local: data.nombre_local || '',
        logo_url: data.logo_url || '',
        ubicacion: data.ubicacion || '',
        telefono: data.telefono || '',
        celular: data.celular || '',
        email: data.email || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        whatsapp: data.whatsapp || '',
        horarios: data.horarios || ''
      })
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        showToast('error', 'Error al subir el logo')
        console.error(uploadError)
        setUploadingLogo(false)
        return
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      setFormData({ ...formData, logo_url: publicUrl })
      setUploadingLogo(false)
    } catch (error) {
      alert('Error al subir el logo')
      console.error(error)
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (config) {
        // Actualizar configuración existente
        const { error } = await supabase
          .from('configuracion_local')
          .update(formData)
          .eq('user_id', user.id)

        if (error) {
          showToast('error', 'Error al actualizar la configuración')
          console.error(error)
          setSaving(false)
          return
        }
      } else {
        // Crear nueva configuración
        const { error } = await supabase
          .from('configuracion_local')
          .insert({
            user_id: user.id,
            ...formData
          })

        if (error) {
          showToast('error', 'Error al guardar la configuración')
          console.error(error)
          setSaving(false)
          return
        }
      }

      await fetchConfig()
      showToast('success', 'Configuración guardada exitosamente')
      setSaving(false)
    } catch (error) {
      showToast('error', 'Error al guardar')
      console.error(error)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Configuración del Local" gradient="orange" />
        <div className="max-w-4xl mx-auto">
          <CardSkeleton count={2} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Configuración del Local"
        gradient="orange"
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Logo del Local
          </label>
          <div className="flex items-center space-x-4">
            {formData.logo_url && (
              <Image 
                src={formData.logo_url} 
                alt="Logo" 
                width={80} 
                height={80}
                className="rounded-lg object-cover border border-slate-200"
              />
            )}
            <div>
              <label className="cursor-pointer inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                <Upload className="w-4 h-4" />
                <span>{uploadingLogo ? 'Subiendo...' : 'Subir Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </label>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG o SVG (máx. 2MB)</p>
            </div>
          </div>
        </div>

        {/* Información Básica */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Información Básica</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Local
              </label>
              <input
                type="text"
                value={formData.nombre_local}
                onChange={(e) => setFormData({ ...formData, nombre_local: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
                placeholder="Ej: TechFix Reparaciones"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ubicación / Dirección
              </label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
                placeholder="Av. Corrientes 1234, CABA"
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Información de Contacto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
                placeholder="011 4567-8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Celular / WhatsApp
              </label>
              <input
                type="tel"
                value={formData.celular}
                onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
                placeholder="contacto@tulocal.com"
              />
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Redes Sociales</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Facebook
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
                placeholder="https://facebook.com/tulocal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
                placeholder="@tulocal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                WhatsApp (Número)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
                placeholder="+5491112345678"
              />
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Horarios de Atención</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Horarios
            </label>
            <textarea
              value={formData.horarios}
              onChange={(e) => setFormData({ ...formData, horarios: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              placeholder="Lunes a Viernes: 9:00 - 18:00&#10;Sábados: 10:00 - 14:00&#10;Domingos: Cerrado"
            />
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-6 border-t">
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSubmit}
            loading={saving}
            disabled={saving}
          >
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  )
}
