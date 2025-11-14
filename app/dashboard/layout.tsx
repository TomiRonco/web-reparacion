import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/DashboardLayout'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      title: 'Sistema de Reparaciones',
      description: 'Gestión de reparaciones',
    }
  }

  const { data: config } = await supabase
    .from('configuracion_local')
    .select('nombre_local, logo_url')
    .eq('user_id', user.id)
    .single()

  const nombreLocal = config?.nombre_local || 'Sistema de Reparaciones'

  const metadata: Metadata = {
    title: nombreLocal,
    description: `Sistema de gestión de reparaciones - ${nombreLocal}`,
    icons: {
      icon: '/api/favicon',
      apple: '/api/favicon',
    },
  }

  return metadata
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
