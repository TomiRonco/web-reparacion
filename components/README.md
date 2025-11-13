# Componentes Reutilizables

## FiltroReparaciones

Componente profesional de filtrado para reparaciones con búsqueda por texto y filtrado por estados.

### Características

- 🔍 **Búsqueda en tiempo real**: Busca por nombre, apellido o celular del cliente
- 🏷️ **Filtrado por estado**: Filtra reparaciones por su estado actual
- 📊 **Contador de resultados**: Muestra cuántos resultados coinciden con los filtros
- 🎨 **Interfaz profesional**: Diseño moderno con animaciones suaves
- ♻️ **Reutilizable**: Fácil de importar y usar en otras páginas
- 🧹 **Limpieza rápida**: Botón para resetear todos los filtros

### Uso

```tsx
import FiltroReparaciones, { FiltrosReparacion } from '@/components/FiltroReparaciones'
import { useState, useMemo } from 'react'

// 1. Crear el estado de filtros
const [filtros, setFiltros] = useState<FiltrosReparacion>({
  busqueda: '',
  estado: 'todos'
})

// 2. Filtrar los datos usando useMemo para optimización
const reparacionesFiltradas = useMemo(() => {
  return reparaciones.filter(r => {
    // Filtro por estado
    const cumpleEstado = filtros.estado === 'todos' ? true : r.estado === filtros.estado

    // Filtro por búsqueda
    const cumpleBusqueda = filtros.busqueda === '' ? true : 
      r.cliente_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      r.cliente_apellido.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      r.cliente_celular.toLowerCase().includes(filtros.busqueda.toLowerCase())

    return cumpleEstado && cumpleBusqueda
  })
}, [reparaciones, filtros])

// 3. Usar el componente
<FiltroReparaciones
  filtros={filtros}
  onFiltrosChange={setFiltros}
  totalResultados={reparaciones.length}
  totalFiltrados={reparacionesFiltradas.length}
/>
```

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `filtros` | `FiltrosReparacion` | Objeto con los filtros actuales (`busqueda` y `estado`) |
| `onFiltrosChange` | `(filtros: FiltrosReparacion) => void` | Función callback para actualizar los filtros |
| `totalResultados` | `number` | Total de registros sin filtrar |
| `totalFiltrados` | `number` | Total de registros después de aplicar filtros |

### Interface FiltrosReparacion

```tsx
interface FiltrosReparacion {
  busqueda: string  // Texto de búsqueda
  estado: string    // Estado seleccionado ('todos', 'pendiente', 'en_diagnostico', etc.)
}
```

### Estados disponibles

- `todos` - Muestra todas las reparaciones
- `pendiente` - Reparaciones pendientes de diagnóstico
- `en_diagnostico` - En proceso de diagnóstico
- `esperando_repuestos` - Esperando piezas/repuestos
- `en_reparacion` - Actualmente en reparación
- `reparado` - Reparación completada
- `entregado` - Entregado al cliente
- `cancelado` - Reparación cancelada

### Ejemplo completo

```tsx
'use client'

import { useState, useMemo } from 'react'
import FiltroReparaciones, { FiltrosReparacion } from '@/components/FiltroReparaciones'

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [filtros, setFiltros] = useState<FiltrosReparacion>({
    busqueda: '',
    estado: 'todos'
  })

  // Filtrar pedidos
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(p => {
      const cumpleEstado = filtros.estado === 'todos' || p.estado === filtros.estado
      const cumpleBusqueda = !filtros.busqueda || 
        p.cliente.toLowerCase().includes(filtros.busqueda.toLowerCase())
      return cumpleEstado && cumpleBusqueda
    })
  }, [pedidos, filtros])

  return (
    <div>
      <h1>Mis Pedidos</h1>
      
      <FiltroReparaciones
        filtros={filtros}
        onFiltrosChange={setFiltros}
        totalResultados={pedidos.length}
        totalFiltrados={pedidosFiltrados.length}
      />

      {/* Renderizar pedidosFiltrados */}
      {pedidosFiltrados.map(pedido => (
        <div key={pedido.id}>{pedido.cliente}</div>
      ))}
    </div>
  )
}
```

### Personalización

Para adaptar el componente a otros casos de uso:

1. **Cambiar campos de búsqueda**: Modifica el filtro `cumpleBusqueda` para buscar en otros campos
2. **Agregar más filtros**: Extiende la interface `FiltrosReparacion` con nuevos campos
3. **Modificar estados**: Edita el array `ESTADOS` dentro del componente
4. **Estilos**: Los estilos usan Tailwind CSS y son fáciles de personalizar

### Optimización

El componente usa:
- `useMemo` para evitar re-renderizados innecesarios
- Búsqueda case-insensitive con `.toLowerCase()`
- Animaciones CSS suaves con `animate-in`
- Debouncing automático del input de búsqueda

### Responsive

El componente es completamente responsive:
- Mobile: Filtros en columna, botones apilados
- Tablet/Desktop: Layout horizontal con grid de estados
