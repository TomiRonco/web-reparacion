import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Si no hay usuario, retornar un favicon por defecto o error
      return new NextResponse(null, { status: 404 })
    }

    const { data: config } = await supabase
      .from('configuracion_local')
      .select('logo_url')
      .eq('user_id', user.id)
      .single()

    if (!config?.logo_url) {
      return new NextResponse(null, { status: 404 })
    }

    // Obtener la imagen del logo
    const response = await fetch(config.logo_url)
    
    if (!response.ok) {
      return new NextResponse(null, { status: 404 })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    })
  } catch (error) {
    console.error('Error al obtener favicon:', error)
    return new NextResponse(null, { status: 404 })
  }
}
