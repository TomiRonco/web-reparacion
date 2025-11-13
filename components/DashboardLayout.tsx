'use client'

import { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Wrench, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { ConfiguracionLocal } from '@/types/database'

interface DashboardLayoutProps {
  children: ReactNode
}

const menuItems = [
  { name: 'Reparaciones', href: '/dashboard', icon: Wrench },
  { name: 'Técnicos', href: '/dashboard/tecnicos', icon: Users },
  { name: 'Estadísticas', href: '/dashboard/estadisticas', icon: BarChart3 },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [config, setConfig] = useState<ConfiguracionLocal | null>(null)

  const fetchConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('configuracion_local')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setConfig(data)
    }
  }

  useEffect(() => {
    fetchConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200">
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-slate-200">
          {config?.logo_url ? (
            <div className="flex items-center space-x-3">
              <Image 
                src={config.logo_url} 
                alt="Logo" 
                width={48} 
                height={48}
                className="rounded-lg object-cover flex-shrink-0"
              />
              {config.nombre_local && (
                <h2 className="text-base font-bold text-slate-900 leading-tight break-words">
                  {config.nombre_local}
                </h2>
              )}
            </div>
          ) : config?.nombre_local ? (
            <h2 className="text-lg font-bold text-slate-900 leading-tight break-words">
              {config.nombre_local}
            </h2>
          ) : (
            <div className="flex items-center space-x-2">
              <Wrench className="w-8 h-8 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Reparaciones
              </h2>
            </div>
          )}
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/dashboard/configuracion')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/dashboard/configuracion'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Configuración</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-slate-200"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-slate-900" />
          ) : (
            <Menu className="w-6 h-6 text-slate-900" />
          )}
        </button>
      </div>

      {/* Sidebar Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm bg-black/20" onClick={() => setMobileMenuOpen(false)}>
          <aside className="w-64 h-full bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header del Sidebar */}
            <div className="p-6 border-b border-slate-200">
              {config?.logo_url ? (
                <div className="flex items-center space-x-3">
                  <Image 
                    src={config.logo_url} 
                    alt="Logo" 
                    width={48} 
                    height={48}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                  {config.nombre_local && (
                    <h2 className="text-base font-bold text-slate-900 leading-tight break-words">
                      {config.nombre_local}
                    </h2>
                  )}
                </div>
              ) : config?.nombre_local ? (
                <h2 className="text-lg font-bold text-slate-900 leading-tight break-words">
                  {config.nombre_local}
                </h2>
              ) : (
                <div className="flex items-center space-x-2">
                  <Wrench className="w-8 h-8 text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Reparaciones
                  </h2>
                </div>
              )}
            </div>

            {/* Menú de Navegación */}
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>

            {/* Footer del Sidebar */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    router.push('/dashboard/configuracion')
                    setMobileMenuOpen(false)
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    pathname === '/dashboard/configuracion'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Configuración</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 lg:px-8 mt-16 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
