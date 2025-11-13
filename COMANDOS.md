# 🛠️ COMANDOS ÚTILES

## Desarrollo Local

### Iniciar servidor de desarrollo
```bash
npm run dev
```

### Construir para producción
```bash
npm run build
```

### Ejecutar versión de producción localmente
```bash
npm run start
```

### Limpiar caché de Next.js
```bash
rm -rf .next
npm run dev
```

## Supabase

### Ver logs en tiempo real
En el dashboard de Supabase → Database → Logs

### Hacer backup de datos
```sql
-- Exportar reparaciones
COPY (SELECT * FROM reparaciones) TO STDOUT WITH CSV HEADER;

-- Exportar tecnicos
COPY (SELECT * FROM tecnicos) TO STDOUT WITH CSV HEADER;

-- Exportar configuracion
COPY (SELECT * FROM configuracion_local) TO STDOUT WITH CSV HEADER;
```

### Resetear base de datos (⚠️ CUIDADO: Borra todo)
```sql
-- Ejecutar en SQL Editor de Supabase
DELETE FROM reparaciones;
DELETE FROM tecnicos;
DELETE FROM configuracion_local;

-- O si quieres dropear todo y empezar de cero:
DROP TABLE IF EXISTS reparaciones CASCADE;
DROP TABLE IF EXISTS tecnicos CASCADE;
DROP TABLE IF EXISTS configuracion_local CASCADE;
-- Luego volver a ejecutar supabase-schema.sql
```

### Ver últimas reparaciones
```sql
SELECT 
  numero_comprobante,
  cliente_nombre,
  cliente_apellido,
  estado,
  fecha_ingreso
FROM reparaciones
ORDER BY fecha_ingreso DESC
LIMIT 10;
```

### Estadísticas rápidas
```sql
SELECT 
  estado,
  COUNT(*) as cantidad,
  SUM(monto) as ingresos
FROM reparaciones
GROUP BY estado;
```

## Git (para versionar tu proyecto)

### Inicializar repositorio
```bash
git init
git add .
git commit -m "Initial commit: Sistema de gestión de reparaciones"
```

### Subir a GitHub
```bash
# Crear repositorio en github.com primero, luego:
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

### Actualizar después de cambios
```bash
git add .
git commit -m "Descripción de tus cambios"
git push
```

## Vercel (Despliegue)

### Desplegar por primera vez
```bash
npm install -g vercel
vercel login
vercel
```

### Redesplegar después de cambios
```bash
# Opción 1: Automático con GitHub
# Solo haz push a GitHub y Vercel redesplegará automáticamente

# Opción 2: Manual
vercel --prod
```

### Ver logs de producción
```bash
vercel logs [deployment-url]
```

### Ver dominios
```bash
vercel domains ls
```

## NPM (Gestión de paquetes)

### Actualizar dependencias
```bash
npm update
```

### Ver dependencias desactualizadas
```bash
npm outdated
```

### Instalar dependencia específica
```bash
npm install nombre-paquete
```

### Desinstalar dependencia
```bash
npm uninstall nombre-paquete
```

## TypeScript

### Verificar errores de TypeScript
```bash
npx tsc --noEmit
```

### Generar tipos desde Supabase (avanzado)
```bash
# Instalar CLI de Supabase
npm install -g supabase

# Login
supabase login

# Generar tipos
npx supabase gen types typescript --project-id "tu-project-id" > types/supabase.ts
```

## Debugging

### Ver variables de entorno
```bash
# En desarrollo
cat .env.local

# En producción (Vercel)
vercel env ls
```

### Probar conexión a Supabase
Crea un archivo `test-supabase.js`:
```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('reparaciones').select('count')
  console.log('Data:', data)
  console.log('Error:', error)
}

test()
```

Ejecutar:
```bash
node test-supabase.js
```

## Mantenimiento

### Limpiar node_modules
```bash
rm -rf node_modules
npm install
```

### Limpiar todo y reinstalar
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Ver tamaño del build
```bash
npm run build
# Al final verás un resumen del tamaño de cada página
```

## Monitoreo

### Ver analytics en Vercel
1. Ve a tu proyecto en vercel.com
2. Click en "Analytics"
3. Verás: visitantes, páginas más vistas, rendimiento

### Ver uso de Supabase
1. Ve a tu proyecto en supabase.com
2. Click en "Settings" → "Usage"
3. Verás: Storage usado, DB size, Bandwidth

## Seguridad

### Rotar claves de Supabase (cada 6-12 meses)
1. En Supabase → Settings → API
2. Click en "Generate new anon key"
3. Actualizar en .env.local y Vercel
4. Redesplegar

### Cambiar contraseña de database
1. En Supabase → Settings → Database
2. Scroll hasta "Database password"
3. Click "Reset database password"

## Backup Manual

### Exportar toda la base de datos
1. En Supabase → Database → Backups
2. Click "Create backup"
3. Download cuando esté listo

### Restaurar desde backup
1. En Supabase → Database → Backups
2. Selecciona el backup
3. Click "Restore"

## Resolución de Problemas Comunes

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### "Failed to fetch" en login
- Verifica las credenciales en .env.local
- Asegúrate de que el proyecto de Supabase esté activo

### PDFs no se generan
```bash
npm install jspdf html2canvas
```

### Imágenes no cargan
- Verifica que el bucket 'logos' sea público
- Revisa las políticas de storage

### Build falla en Vercel
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Vercel

## Comandos de Producción

### Ver estado del deployment
```bash
vercel ls
```

### Rollback a versión anterior
```bash
vercel rollback [deployment-url]
```

### Configurar dominio personalizado
```bash
vercel domains add tudominio.com
```

---

**💡 Tip:** Guarda estos comandos en un lugar accesible para referencia rápida.
