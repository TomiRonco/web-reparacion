# Módulo de Gestión de Stock

## 📦 Descripción

Nueva funcionalidad para gestionar el inventario del local mediante contenedores/cajas identificadas con nombres o números, cada una conteniendo items con detalle y cantidad.

---

## ✨ Características

### 🎯 Funcionalidades Principales

1. **Gestión de Contenedores**
   - Crear contenedores con nombre/número identificador
   - Editar contenedores existentes
   - Eliminar contenedores
   - Vista en cards con diseño purple

2. **Gestión de Items**
   - Agregar items a cada contenedor
   - Cada item tiene: Detalle + Cantidad
   - Editar items existentes
   - Eliminar items del contenedor

3. **Exportación a PDF**
   - Genera PDF en formato A4 listo para imprimir
   - Nombres de contenedores resaltados (fondo purple)
   - Tabla con dos columnas: Detalle y Cantidad
   - Footer con totales (contenedores e items)
   - Paginación automática

---

## 🗄️ Estructura de Base de Datos

### Tabla: `contenedores`

```sql
CREATE TABLE contenedores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  nombre TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Estructura de Items (JSONB)

```typescript
{
  detalle: string;  // Descripción del producto
  cantidad: number; // Cantidad disponible
}[]
```

---

## 🚀 Instalación

### 1. Ejecutar Migración SQL

Ve a Supabase Dashboard → SQL Editor y ejecuta:

```sql
-- Contenido del archivo migration-add-stock.sql
```

O directamente:

```sql
CREATE TABLE IF NOT EXISTS contenedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contenedores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS...
```

### 2. Verificar Instalación

```sql
SELECT * FROM contenedores LIMIT 1;
```

---

## 📱 Uso

### Acceder al Módulo

1. Ve a **Dashboard**
2. Haz clic en **"Stock"** en el menú lateral
3. O navega a: `/dashboard/stock`

### Crear un Contenedor

1. Haz clic en **"Nuevo Contenedor"**
2. Ingresa el nombre/número (ej: "Caja 1", "Estante A")
3. Agrega items haciendo clic en **"Agregar Item"**
4. Para cada item, completa:
   - **Detalle**: Descripción del producto
   - **Cantidad**: Número de unidades
5. Haz clic en **"Crear Contenedor"**

### Editar un Contenedor

1. Haz clic en el ícono de lápiz (✏️) en el contenedor
2. Modifica el nombre o los items
3. Guarda los cambios

### Eliminar un Contenedor

1. Haz clic en el ícono de basurero (🗑️)
2. Confirma la eliminación

### Exportar a PDF

1. Haz clic en **"Exportar PDF"** (botón superior derecha)
2. Se generará un PDF con todo el inventario
3. El archivo se descargará automáticamente

---

## 📄 Formato del PDF

### Estructura

```
┌─────────────────────────────────────┐
│     INVENTARIO DE STOCK             │
│     Fecha: 18 de noviembre de 2025  │
├─────────────────────────────────────┤
│                                     │
│ ┌───────────────────────────────┐   │
│ │ CAJA 1                        │   │ ← Fondo purple, texto blanco
│ └───────────────────────────────┘   │
│                                     │
│ Detalle               Cant.         │
│ ─────────────────────────────────   │
│ Cable HDMI            x5            │
│ Teclado USB           x3            │
│ Mouse inalámbrico     x7            │
│                                     │
│ Total: 3 items                      │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ ESTANTE A                     │   │
│ └───────────────────────────────┘   │
│ ...                                 │
└─────────────────────────────────────┘
Total de contenedores: 2 | Total: 5 items
```

---

## 🎨 Diseño Visual

### Colores

- **Primary**: Purple-600 (#9333ea)
- **Contenedores**: Cards blancos con header purple
- **Items**: Fondo alternado gris claro para mejor lectura

### Iconos

- 📦 **Package**: Contenedores y stock
- ➕ **Plus**: Agregar contenedor/item
- ✏️ **Edit2**: Editar contenedor
- 🗑️ **Trash2**: Eliminar
- 📄 **FileText**: Exportar PDF

---

## 📊 Tipos TypeScript

```typescript
export interface ItemStock {
  id?: string;
  detalle: string;
  cantidad: number;
}

export interface Contenedor {
  id: string;
  user_id: string;
  nombre: string;
  items: ItemStock[];
  created_at: string;
  updated_at: string;
}

export interface ContenedorFormData {
  nombre: string;
  items: ItemStock[];
}
```

---

## 🔧 Archivos Modificados/Creados

```
✅ types/database.ts                    - Tipos TypeScript
✅ app/dashboard/stock/page.tsx         - Página principal
✅ lib/pdf-stock.ts                     - Generador de PDF
✅ migration-add-stock.sql              - Script SQL
✅ components/DashboardLayout.tsx       - Menú actualizado
```

---

## 💡 Casos de Uso

### Ejemplo 1: Gestión de Repuestos

```
Contenedor: "Caja 1 - Cables"
├─ Cable HDMI - x5
├─ Cable USB-C - x10
└─ Cable micro-USB - x8

Contenedor: "Estante A - Cargadores"
├─ Cargador iPhone - x3
├─ Cargador Samsung - x6
└─ Cargador Universal - x12
```

### Ejemplo 2: Inventario de Herramientas

```
Contenedor: "Caja Roja"
├─ Destornillador Phillips - x2
├─ Pinzas - x3
└─ Soldador - x1
```

---

## ✅ Checklist de Implementación

- [x] Crear tipos TypeScript
- [x] Crear tabla en Supabase
- [x] Implementar CRUD de contenedores
- [x] Crear interfaz de usuario
- [x] Generador de PDF
- [x] Agregar al menú de navegación
- [x] Testing básico

---

## 🔄 Próximas Mejoras (Opcional)

- [ ] Búsqueda de items en todos los contenedores
- [ ] Filtros por contenedor
- [ ] Alertas de stock bajo
- [ ] Historial de cambios
- [ ] Exportación a Excel
- [ ] Códigos de barras/QR para contenedores

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que ejecutaste la migración SQL
2. Revisa la consola del navegador para errores
3. Asegúrate de tener los permisos correctos en Supabase

---

¡Listo para usar! 🎉
