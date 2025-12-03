# Modificaciones en Reparaciones - Desglose de Costos

## Resumen de Cambios

Se modificó el sistema de reparaciones para desglosar el monto total en **mano de obra** y **repuestos**, además de mover la selección del técnico al momento de editar la reparación (no al crearla).

## Cambios Principales

### 1. Base de Datos
- **Nuevos campos en `reparaciones`:**
  - `mano_obra`: DECIMAL(10,2) - Costo de la mano de obra
  - `repuestos`: JSONB - Array de repuestos con estructura `[{detalle: string, precio: number}]`
  
- **Campo existente modificado:**
  - `monto`: Ahora almacena el total calculado (mano_obra + suma de repuestos)

### 2. Flujo de Trabajo Actualizado

#### Al Crear una Reparación:
- ✅ Datos del cliente (nombre, apellido, celular)
- ✅ Datos del producto (producto, marca, cargador)
- ✅ Observaciones iniciales
- ❌ **NO** se selecciona el técnico (se asigna después)

#### Al Editar/Diagnosticar una Reparación:
- ✅ Diagnóstico (qué necesita reparar)
- ✅ **Selección del técnico asignado**
- ✅ **Mano de obra** (campo separado)
- ✅ **Lista de repuestos** (agregar múltiples items con detalle y precio)
- ✅ **Cálculo automático del monto total**

### 3. Visualización para el Cliente

El cliente **solo ve el monto total** de la reparación:
- No ve el desglose de mano de obra
- No ve el detalle de repuestos
- Solo recibe el monto final vía WhatsApp y en el PDF del comprobante

### 4. Archivos Modificados

```
app/dashboard/page.tsx          - Componente principal de reparaciones
types/database.ts               - Tipos TypeScript actualizados
migration-reparaciones-detalladas.sql - Script de migración SQL
```

## Migración de Base de Datos

Para aplicar los cambios en tu base de datos Supabase:

1. Abre el **SQL Editor** en tu proyecto de Supabase
2. Ejecuta el contenido del archivo `migration-reparaciones-detalladas.sql`
3. Verifica que las columnas se crearon correctamente

```sql
-- El script hace lo siguiente:
-- 1. Agrega columnas mano_obra y repuestos
-- 2. Migra datos existentes (monto → mano_obra)
-- 3. Agrega comentarios descriptivos
```

## Ejemplo de Uso

### Estructura de Repuestos en JSON

```json
[
  {
    "detalle": "Pantalla LCD",
    "precio": 15000
  },
  {
    "detalle": "Batería",
    "precio": 8000
  }
]
```

### Cálculo del Monto Total

```
Mano de obra: $10,000
Repuestos:
  - Pantalla LCD: $15,000
  - Batería: $8,000
  
TOTAL: $33,000 (calculado automáticamente)
```

## Interfaz de Usuario

### Modal de Edición/Diagnóstico

El nuevo modal incluye:
1. **Diagnóstico**: Textarea para describir qué necesita el producto
2. **Técnico**: Selector desplegable de técnicos disponibles
3. **Mano de Obra**: Input numérico para el costo de trabajo
4. **Repuestos**: 
   - Lista de repuestos agregados
   - Formulario para agregar nuevos (detalle + precio)
   - Botón para eliminar repuestos
5. **Resumen**: Vista del cálculo total (mano de obra + repuestos)

### Características
- ✨ Cálculo en tiempo real del monto total
- ✨ Agregar/eliminar repuestos dinámicamente
- ✨ Validación de campos requeridos
- ✨ Diseño responsive (mobile y desktop)

## Notas Importantes

- **Compatibilidad**: Las reparaciones existentes migrarán su monto actual a `mano_obra`
- **Técnico**: Ahora se asigna en la edición, no en la creación inicial
- **Privacidad**: El desglose es solo para uso interno del negocio
- **WhatsApp**: Los mensajes al cliente siguen mostrando solo el monto total

## Próximos Pasos

Si necesitas revertir estos cambios:
1. Hacer checkout a la rama `main`
2. O eliminar la rama `feature/modificar-reparaciones`

Si todo funciona bien:
1. Mergear la rama a `main`
2. Aplicar la migración en producción
