# Sección de Pedidos

## Descripción
Nueva funcionalidad para gestionar pedidos y listas de compras organizadas por proveedor.

## Características

### 📋 Funcionalidades principales
- **Crear pedidos** por proveedor con múltiples items
- **Editar pedidos** pendientes
- **Marcar pedidos como completados** para llevar control
- **Eliminar pedidos** que ya no sean necesarios
- **Filtrar pedidos** por estado (Todos/Pendientes/Completados)
- **Agregar notas** opcionales a cada item

### 📊 Interfaz
- Vista en tarjetas (grid responsive)
- Filtros rápidos con estadísticas
- Modal intuitivo para agregar/editar
- Diseño optimizado para 100vh (sin scroll externo)
- Colores diferenciados por estado (azul=pendiente, verde=completado)

### 🗂️ Estructura de datos
Cada pedido contiene:
- **Proveedor**: Nombre del proveedor (ej: MercadoLibre, Proveedor Local)
- **Items**: Lista de productos a comprar
  - Detalle: Descripción del item
  - Cantidad: Número de unidades
  - Notas: Información adicional opcional
- **Estado**: Pendiente o Completado
- **Fecha de creación**: Timestamp automático

## Archivos creados/modificados

### Nuevos archivos
- `app/dashboard/pedidos/page.tsx` - Página principal de Pedidos
- `migration-pedidos.sql` - Script de migración para Supabase

### Archivos modificados
- `types/database.ts` - Agregados tipos Pedido, ItemPedido, PedidoFormData
- `components/DashboardLayout.tsx` - Agregado enlace "Pedidos" en navegación
- `supabase-schema.sql` - Agregada tabla pedidos con RLS

## Instalación

### 1. Aplicar migración en Supabase
Ejecuta el script `migration-pedidos.sql` en el editor SQL de Supabase:

```sql
-- Copiar y pegar el contenido de migration-pedidos.sql
```

### 2. Verificar la tabla
En Supabase Dashboard → Table Editor, deberías ver la nueva tabla `pedidos` con:
- Columnas: id, user_id, proveedor, items (JSONB), completado, created_at, updated_at
- Políticas RLS activas
- Índices en user_id y completado

### 3. Acceder a la funcionalidad
- Navega a **Dashboard → Pedidos** en el menú lateral
- El ícono del carrito de compras (🛒) identifica la sección

## Uso

### Crear un nuevo pedido
1. Click en **"Nuevo Pedido"**
2. Ingresa el nombre del proveedor
3. Agrega items con el botón **"+ Agregar Item"**
4. Para cada item:
   - Descripción (obligatorio)
   - Cantidad (obligatorio)
   - Notas adicionales (opcional)
5. Click en **"Crear Pedido"**

### Gestionar pedidos
- ✅ **Completar**: Click en el ícono de círculo para marcar como completado
- ✏️ **Editar**: Solo disponible para pedidos pendientes
- 🗑️ **Eliminar**: Elimina el pedido permanentemente

### Filtrar pedidos
- **Todos**: Muestra todos los pedidos
- **Pendientes**: Solo pedidos sin completar
- **Completados**: Solo pedidos marcados como completados

## Casos de uso

### Ejemplo 1: Pedido a MercadoLibre
```
Proveedor: MercadoLibre
Items:
  - Cable USB-C (x5)
  - Memoria RAM 8GB (x2)
  - Teclado mecánico (x1) - Nota: Switches azules
```

### Ejemplo 2: Compra local
```
Proveedor: Proveedor Local
Items:
  - Pantallas LCD iPhone 12 (x10)
  - Baterías iPhone 11 (x15)
  - Adhesivos (x50) - Nota: Doble faz
```

## Ventajas
✅ Organización por proveedor
✅ No olvidas qué comprar
✅ Historial de pedidos completados
✅ Notas para especificaciones
✅ Interfaz simple e intuitiva

## Integración con Stock
Los pedidos son independientes del stock actual. Puedes:
1. Crear un pedido con items que necesitas
2. Cuando lleguen, agregarlos manualmente al Stock
3. Marcar el pedido como completado

## Soporte
Para problemas o sugerencias, revisar:
- Consola del navegador para errores
- Supabase Dashboard → Logs para errores de base de datos
- Verificar que las políticas RLS estén activas
