'use client'

import { Search, X } from 'lucide-react'

export interface FiltrosReparacion {
  busqueda: string
  estado: string
}

interface FiltroReparacionesProps {
  filtros: FiltrosReparacion
  onFiltrosChange: (filtros: FiltrosReparacion) => void
  totalResultados: number
  totalFiltrados: number
}

const ESTADOS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'entregada', label: 'Entregada' },
]

export default function FiltroReparaciones({ 
  filtros, 
  onFiltrosChange, 
  totalResultados,
  totalFiltrados 
}: FiltroReparacionesProps) {

  const handleBusquedaChange = (valor: string) => {
    onFiltrosChange({ ...filtros, busqueda: valor })
  }

  const handleEstadoChange = (estado: string) => {
    onFiltrosChange({ ...filtros, estado })
  }

  const limpiarFiltros = () => {
    onFiltrosChange({ busqueda: '', estado: 'todos' })
  }

  const hayFiltrosActivos = filtros.busqueda !== '' || filtros.estado !== 'todos'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-4">
      {/* Barra principal con búsqueda */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Campo de búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={filtros.busqueda}
            onChange={(e) => handleBusquedaChange(e.target.value)}
            placeholder="Buscar por nombre, apellido o celular del cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-500 shadow-sm transition"
          />
          {filtros.busqueda && (
            <button
              onClick={() => handleBusquedaChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Select de estados */}
        <select
          value={filtros.estado}
          onChange={(e) => handleEstadoChange(e.target.value)}
          className="px-4 py-2.5 bg-white border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium shadow-sm transition cursor-pointer min-w-[180px]"
        >
          {ESTADOS.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>

        {/* Botón limpiar filtros */}
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition font-medium border-2 border-slate-300"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-slate-600 pt-2 border-t border-slate-100">
        <div>
          {hayFiltrosActivos ? (
            <span>
              Mostrando <span className="font-semibold text-slate-900">{totalFiltrados}</span> de{' '}
              <span className="font-semibold text-slate-900">{totalResultados}</span> reparaciones
            </span>
          ) : (
            <span>
              Total: <span className="font-semibold text-slate-900">{totalResultados}</span> reparaciones
            </span>
          )}
        </div>

        {hayFiltrosActivos && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-600 font-medium">Filtros activos</span>
          </div>
        )}
      </div>
    </div>
  )
}
