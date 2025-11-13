# 🚀 GUÍA RÁPIDA DE INSTALACIÓN

## Paso 1: Crear proyecto en Supabase (5 minutos)

1. Ve a https://supabase.com
2. Click en "Start your project"
3. Crea una cuenta (GitHub, Google, etc.)
4. Click en "New Project"
5. Completa:
   - Name: "reparaciones-local" (o el nombre que prefieras)
   - Database Password: guarda esta contraseña (la necesitarás)
   - Region: South America (elige el más cercano)
6. Click en "Create new project"
7. Espera 2-3 minutos mientras se crea

## Paso 2: Configurar la base de datos (3 minutos)

1. En tu proyecto de Supabase, busca el menú lateral
2. Click en "SQL Editor"
3. Click en "New query"
4. Abre el archivo `supabase-schema.sql` de este proyecto
5. Copia TODO el contenido del archivo
6. Pégalo en el SQL Editor de Supabase
7. Click en el botón "Run" (abajo a la derecha)
8. Deberías ver "Success. No rows returned"

## Paso 3: Configurar Storage para logos (2 minutos)

1. En el menú lateral de Supabase, click en "Storage"
2. Click en "Create a new bucket"
3. Nombre: `logos`
4. Public bucket: **ACTIVAR** (toggle en ON)
5. Click en "Create bucket"
6. Click en el bucket "logos" que acabas de crear
7. Click en "Policies" (arriba)
8. Click en "New Policy"
9. Selecciona "For full customization" en ambas opciones
10. Copia y pega estas dos políticas:

**Primera política (INSERT):**
```sql
CREATE POLICY "Los usuarios pueden subir sus propios logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');
```

**Segunda política (SELECT):**
```sql
CREATE POLICY "Logos son públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');
```

## Paso 4: Crear usuario de prueba (1 minuto)

1. En el menú lateral, click en "Authentication"
2. Click en la pestaña "Users"
3. Click en "Add user" (botón verde)
4. Completa:
   - Email: `admin@tulocal.com` (o el que prefieras)
   - Password: `Admin123!` (o la que prefieras - recuérdala)
   - Auto Confirm User: **ACTIVAR**
5. Click en "Create user"

## Paso 5: Obtener las credenciales (1 minuto)

1. En el menú lateral, click en el ícono de configuración (⚙️)
2. Click en "API"
3. Busca y copia estos dos valores:

   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public** (clave larga que empieza con `eyJ...`)

## Paso 6: Configurar el proyecto local (2 minutos)

1. Abre el proyecto en VS Code
2. Busca el archivo `.env.local`
3. Reemplaza los valores con tus credenciales:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

4. Guarda el archivo

## Paso 7: Instalar y ejecutar (2 minutos)

Abre una terminal en VS Code y ejecuta:

```bash
npm install
npm run dev
```

Espera a que termine de instalar. Luego verás:

```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

## Paso 8: Probar la aplicación (2 minutos)

1. Abre http://localhost:3000 en tu navegador
2. Deberías ver la pantalla de login
3. Ingresa el email y password que creaste en el Paso 4
4. Click en "Iniciar Sesión"
5. Deberías ver el dashboard vacío

## Paso 9: Configurar tu local (3 minutos)

1. En el dashboard, click en "Configuración" en el sidebar
2. Completa los datos de tu local:
   - Nombre del Local: "TechFix Reparaciones"
   - Ubicación: "Av. Corrientes 1234, CABA"
   - Celular: "+54 9 11 1234-5678"
   - Email: "contacto@techfix.com"
3. (Opcional) Sube un logo
4. Click en "Guardar Configuración"

## Paso 10: Agregar tu primer técnico (1 minuto)

1. Click en "Técnicos" en el sidebar
2. Click en "Agregar Técnico"
3. Completa:
   - Nombre: Juan
   - Apellido: Pérez
   - Celular: +54 9 11 9999-8888
4. Click en "Agregar"

## Paso 11: Crear tu primera reparación (2 minutos)

1. Click en "Reparaciones" en el sidebar
2. Click en "Nueva Reparación"
3. Completa:
   - Cliente: María González
   - Celular: 11 3333-4444
   - Producto: Notebook
   - Marca: HP
   - Técnico: Juan Pérez
   - Cargador: Sí
4. Click en "Crear Reparación"
5. Se descargará automáticamente un PDF con el comprobante

## ✅ ¡Listo!

Tu sistema está funcionando. Ahora puedes:

- Ver la reparación en el listado
- Agregar diagnóstico y monto (estado → En Proceso)
- Marcar como finalizada
- Marcar como entregada
- Ver estadísticas en tiempo real

## 🚀 Desplegar en Vercel (OPCIONAL - 5 minutos)

Si quieres que tu aplicación esté disponible en internet:

1. Crea una cuenta en https://vercel.com (es gratis)
2. Click en "Add New" → "Project"
3. Importa tu repositorio de GitHub (primero súbelo a GitHub)
4. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`: tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: tu clave anon
5. Click en "Deploy"
6. Espera 2-3 minutos
7. ¡Tu app está en línea! (ej: `tu-proyecto.vercel.app`)

## 📞 Ayuda

Si algo no funciona:

1. Verifica que copiaste bien las credenciales en `.env.local`
2. Asegúrate de haber ejecutado TODO el schema SQL
3. Verifica que el bucket "logos" sea público
4. Confirma que el usuario existe en Authentication

## 🎉 ¡Éxito!

Ahora tienes un sistema profesional de gestión de reparaciones funcionando.
