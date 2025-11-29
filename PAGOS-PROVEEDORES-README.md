# Sistema de Pagos a Proveedores

Sistema completo de gestión de deudas y control de pagos a proveedores, diseñado para mantener las cuentas claras y visualizar el estado de las obligaciones con cada proveedor.

## 📋 Características Principales

### 1. **Gestión de Proveedores**
- Crear múltiples proveedores (tabs dinámicos)
- Cada proveedor tiene su propio espacio de trabajo
- Editar y eliminar proveedores
- Organización por tabs para fácil navegación

### 2. **Registro de Comprobantes**
- **Tipos de comprobantes**: Facturas, Remitos, Presupuestos
- **Información registrada**:
  - Tipo de comprobante
  - Número de comprobante
  - Fecha
  - Monto
  - Moneda (ARS o USD)
  - Estado (Pagado/Pendiente)
- Edición y eliminación de comprobantes
- Marcas visuales por tipo de comprobante

### 3. **Registro de Pagos**
- Selección múltiple de comprobantes a pagar
- Vista del total seleccionado por moneda
- Registro de:
  - Fecha de pago
  - Monto pagado
  - Moneda del pago
  - Notas adicionales (método de pago, detalles)
- Actualización automática del estado de comprobantes

### 4. **Dashboard Financiero**
- **Total Gastado**: Suma de todos los comprobantes (por moneda)
- **Total Pagado**: Suma de todos los pagos realizados (por moneda)
- **Deuda Pendiente**: Diferencia entre gastado y pagado
- Indicador visual de estado:
  - 🟢 Verde: Al día con el proveedor (deuda = 0)
  - 🟠 Naranja: Hay deuda pendiente

### 5. **Control de Estado**
- Vista de comprobantes pendientes y pagados
- Historial completo de pagos realizados
- Trazabilidad de qué comprobantes se pagaron en cada transacción

## 🗄️ Estructura de Base de Datos

### Tabla: `proveedores_pago`
```sql
- id (UUID)
- user_id (UUID) - Referencia a auth.users
- nombre (TEXT) - Nombre del proveedor
- orden (INTEGER) - Orden de visualización
- created_at, updated_at
```

### Tabla: `comprobantes`
```sql
- id (UUID)
- user_id (UUID)
- proveedor_id (UUID) - Referencia a proveedores_pago
- tipo (TEXT) - 'factura', 'remito', 'presupuesto'
- numero (TEXT) - Número del comprobante
- fecha (DATE)
- monto (DECIMAL)
- moneda (TEXT) - 'ARS' o 'USD'
- pagado (BOOLEAN)
- created_at, updated_at
```

### Tabla: `pagos_realizados`
```sql
- id (UUID)
- user_id (UUID)
- proveedor_id (UUID)
- comprobante_ids (UUID[]) - Array de comprobantes pagados
- fecha_pago (DATE)
- monto_pagado (DECIMAL)
- moneda (TEXT)
- notas (TEXT, nullable)
- created_at, updated_at
```

## 🚀 Instalación

### 1. Aplicar la migración en Supabase

Ejecuta el archivo `migration-pagos-proveedores.sql` en el SQL Editor de Supabase:

```bash
# O desde la interfaz de Supabase:
# Dashboard → SQL Editor → New Query → Pegar contenido de migration-pagos-proveedores.sql → Run
```

### 2. Verificar las tablas

Verifica que se crearon las siguientes tablas:
- `proveedores_pago`
- `comprobantes`
- `pagos_realizados`

### 3. Verificar RLS

Todas las tablas tienen Row Level Security habilitado con políticas que permiten a cada usuario acceder solo a sus propios datos.

## 📖 Guía de Uso

### Paso 1: Crear un Proveedor
1. Accede a "Pagos a Proveedores" desde el menú
2. Haz clic en "Crear Proveedor"
3. Ingresa el nombre del proveedor
4. El proveedor aparecerá como un nuevo tab

### Paso 2: Registrar Comprobantes
1. Selecciona el tab del proveedor
2. Haz clic en "Agregar Comprobante"
3. Completa la información:
   - Tipo (Factura/Remito/Presupuesto)
   - Número de comprobante
   - Fecha
   - Monto y moneda
4. Los comprobantes aparecerán en la tabla como "Pendientes"

### Paso 3: Registrar un Pago
1. Haz clic en "Registrar Pago"
2. Selecciona los comprobantes que estás pagando
3. Verás el total seleccionado por moneda
4. Ingresa:
   - Fecha del pago
   - Monto pagado
   - Moneda del pago
   - Notas (opcional)
5. Al registrar, los comprobantes se marcarán como "Pagados"

### Paso 4: Monitorear el Estado
- El dashboard superior muestra en tiempo real:
  - Total gastado (todos los comprobantes)
  - Total pagado (suma de pagos)
  - Deuda pendiente (diferencia)
- El color del card de deuda indica:
  - 🟢 Verde: Estás al día
  - 🟠 Naranja: Tienes deuda pendiente

## 💡 Casos de Uso

### Caso 1: Proveedor con Múltiples Facturas
```
1. Registras 3 facturas de $10,000 ARS cada una
2. Dashboard muestra: Gastado $30,000, Pagado $0, Deuda $30,000
3. Pagas 2 facturas con un pago de $20,000
4. Dashboard actualiza: Gastado $30,000, Pagado $20,000, Deuda $10,000
```

### Caso 2: Control de Monedas Separadas
```
1. Registras: Factura $5,000 USD y Factura $50,000 ARS
2. Dashboard muestra deudas separadas por moneda
3. Puedes pagar en diferentes monedas
4. El control se mantiene independiente por moneda
```

### Caso 3: Pagos Parciales
```
1. Factura de $100,000 ARS
2. Primer pago de $50,000 ARS (marca la factura como pagada)
3. Si necesitas registrar pago parcial, crea 2 comprobantes separados
```

## 🎨 Interfaz

### Vista Principal
- **Tabs superiores**: Un tab por cada proveedor
- **Botón +**: Crear nuevo proveedor

### Cards de Resumen
- 🔵 **Total Gastado**: Azul
- 🟢 **Total Pagado**: Verde
- 🟠/🟢 **Deuda**: Naranja (hay deuda) o Verde (al día)

### Tabla de Comprobantes
- **Tipo**: Badge de color (Factura=Azul, Remito=Morado, Presupuesto=Ámbar)
- **Estado**: 
  - ⏰ Pendiente (Naranja)
  - ✅ Pagado (Verde)
- **Acciones**: Editar, Eliminar

### Tabla de Pagos
- Fecha de pago
- Monto pagado con moneda
- Cantidad de comprobantes incluidos
- Notas
- Acción: Eliminar (revierte el estado de los comprobantes)

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- Cada usuario solo puede ver y modificar sus propios datos
- Las políticas RLS verifican `auth.uid() = user_id`
- Relaciones con `ON DELETE CASCADE` para mantener integridad

## 🛠️ Tecnologías

- **Next.js 16** con TypeScript
- **Supabase** (PostgreSQL con RLS)
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **React Hooks** para gestión de estado

## 📊 Tipos TypeScript

Ver `types/database.ts` para las interfaces completas:
- `ProveedorPago`
- `Comprobante`
- `PagoRealizado`
- `ComprobanteFormData`
- `PagoFormData`
- `ResumenProveedor`
- `TipoComprobante`: 'factura' | 'remito' | 'presupuesto'
- `Moneda`: 'ARS' | 'USD'

## ⚠️ Notas Importantes

1. **Eliminación de Proveedores**: Al eliminar un proveedor, se eliminan todos sus comprobantes y pagos (CASCADE)
2. **Eliminación de Pagos**: Al eliminar un pago, los comprobantes vuelven a estado "Pendiente"
3. **Monedas Independientes**: Los cálculos de deuda son independientes por moneda
4. **No hay conversión**: No se hace conversión automática entre ARS y USD

## 🔄 Flujo de Datos

```
Usuario → Crea Proveedor → Tab nuevo
       ↓
    Registra Comprobantes → Estado: Pendiente
       ↓
    Selecciona Comprobantes → Registra Pago
       ↓
    Comprobantes → Estado: Pagado
       ↓
    Dashboard actualiza → Resumen financiero
```

## 🎯 Objetivo

Mantener un control claro de:
- ✅ Cuánto le debes a cada proveedor
- ✅ Qué comprobantes están pendientes de pago
- ✅ Historial completo de pagos realizados
- ✅ Estado actual de la relación comercial (al día o con deuda)

---

**Sistema diseñado para**: Talleres, comercios, servicios técnicos y cualquier negocio que necesite control de deudas con proveedores.
