# Instrucciones para Migración: Columna de Notas

## 📝 Resumen de Cambios

Se ha agregado una nueva funcionalidad de **notas opcionales** a las reparaciones.

### Cambios Realizados:

#### 1. **Base de Datos (Supabase)**
- ✅ Se creó el archivo `migration-add-notas.sql` con el script de migración

#### 2. **Tipos TypeScript** (`types/database.ts`)
- ✅ Agregado campo `notas: string | null` a la interfaz `Reparacion`
- ✅ Agregado campo `notas: string` a la interfaz `ReparacionFormData`

#### 3. **Interfaz de Usuario** (`app/dashboard/page.tsx`)
- ✅ Nueva columna "Notas" en la tabla de reparaciones (vista desktop)
- ✅ Sección de notas en cards de reparaciones (vista mobile)
- ✅ Campo opcional de notas en el formulario de nueva reparación

---

## 🚀 Instrucciones para Aplicar la Migración en Supabase

### Opción 1: SQL Editor en Dashboard de Supabase (Recomendado)

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú lateral, ve a **SQL Editor**
4. Haz clic en **New query**
5. Copia y pega el contenido del archivo `migration-add-notas.sql`
6. Haz clic en **Run** para ejecutar la migración

### Opción 2: CLI de Supabase

Si tienes instalado Supabase CLI:

\`\`\`bash
# Asegúrate de estar en el directorio del proyecto
cd /Users/tomasroncoroni/Documents/web-reparacion

# Ejecuta la migración
supabase db push
\`\`\`

### Opción 3: Conexión Directa a PostgreSQL

Si tienes acceso directo a la base de datos:

\`\`\`bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" -f migration-add-notas.sql
\`\`\`

---

## ✅ Verificación

Después de ejecutar la migración, verifica que la columna se haya agregado correctamente:

\`\`\`sql
-- Ejecuta esta consulta en SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reparaciones' AND column_name = 'notas';
\`\`\`

Deberías ver:
- **column_name**: notas
- **data_type**: text
- **is_nullable**: YES

---

## 🔄 Cómo Usar la Nueva Funcionalidad

### Agregar o Editar Notas

1. Ve a **Dashboard → Reparaciones**
2. En la lista de reparaciones, busca la columna **"Notas"**
3. Haz clic en el botón con el ícono de nota (📝):
   - Si no hay notas, verás "Agregar nota" en gris
   - Si ya hay notas, el ícono será azul y verás un preview de la nota
4. Se abrirá un modal donde puedes:
   - Ver el comprobante y datos de la reparación
   - Escribir o editar las notas
   - Guardar o cancelar los cambios

### Ver Notas en la Lista

- **Vista Desktop (tabla)**: La columna "Notas" muestra un botón clicable con preview
- **Vista Mobile (cards)**: Un botón expandible con el ícono y preview de la nota

### Características

- ✅ Las notas son **opcionales** - no es necesario agregar notas a todas las reparaciones
- ✅ Las notas son **privadas** - solo visibles para ti y tu equipo
- ✅ Se pueden **editar en cualquier momento** desde la lista
- ✅ El ícono cambia de color (gris → azul) cuando hay notas guardadas
- ✅ **No se agregan notas al crear una reparación nueva** - solo después desde la lista

---

## 📋 Contenido del Script SQL

\`\`\`sql
-- Agregar la columna 'notas' a la tabla reparaciones
ALTER TABLE reparaciones 
ADD COLUMN IF NOT EXISTS notas TEXT;

-- Comentario de la columna para documentación
COMMENT ON COLUMN reparaciones.notas IS 'Notas adicionales opcionales sobre la reparación';
\`\`\`

---

## 🔧 Rollback (Revertir Cambios)

Si necesitas revertir la migración:

\`\`\`sql
-- Eliminar la columna 'notas'
ALTER TABLE reparaciones DROP COLUMN IF EXISTS notas;
\`\`\`

---

## 📦 Rama Git

Todos los cambios están en la rama: **\`feature/notas-reparacion\`**

Para mergear a main:
\`\`\`bash
git checkout main
git merge feature/notas-reparacion
git push origin main
\`\`\`

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar el script SQL en Supabase
2. ✅ Reiniciar el servidor de desarrollo si está corriendo
3. ✅ Probar la funcionalidad creando una nueva reparación
4. ✅ Verificar que las notas se muestran correctamente en la lista

---

## 💡 Notas Técnicas

- El campo **notas** es completamente opcional (nullable en la BD)
- Las notas se muestran truncadas en la vista de tabla desktop
- En la vista mobile, las notas solo se muestran si existen (condicional)
- La migración usa \`IF NOT EXISTS\` para evitar errores si se ejecuta múltiples veces

---

¿Tienes alguna pregunta? ¡No dudes en consultar! 🚀
