'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DynamicFavicon() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data: config } = await supabase
          .from('configuracion_local')
          .select('logo_url, nombre_local')
          .eq('user_id', user.id)
          .single()

        if (config?.logo_url) {
          // Actualizar favicon
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = config.logo_url

          // Actualizar apple touch icon
          let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement
          if (!appleLink) {
            appleLink = document.createElement('link')
            appleLink.rel = 'apple-touch-icon'
            document.head.appendChild(appleLink)
          }
          appleLink.href = config.logo_url
        }

        if (config?.nombre_local) {
          // Actualizar título de la página
          document.title = config.nombre_local
        }
      } catch (error) {
        console.error('Error al actualizar favicon:', error)
      }
    }

    updateFavicon()
  }, [])

  return null
}
