# 🔧 Sistema de Gestión de Reparaciones

Sistema completo de gestión para locales de reparación de equipos electrónicos. Incluye gestión de clientes, técnicos, reparaciones, notificaciones automáticas por WhatsApp y generación de comprobantes en PDF.

## 🚀 Características Principales

### 📱 Notificaciones por WhatsApp
- Apertura automática de WhatsApp Web con mensajes prellenados
- 4 tipos de mensajes personalizados:
  - **Nueva Reparación**: Confirmación de recepción + link al comprobante PDF
  - **En Proceso**: Diagnóstico completo + monto estimado + solicitud de confirmación
  - **Finalizada**: Notificación de equipo listo + horarios de atención
  - **Entregada**: Agradecimiento + garantía + link a Google Reviews

### 📄 Generación de Comprobantes PDF
- PDF con diseño profesional de dos columnas
- Logo del local integrado
- Datos del cliente y producto
- Subida automática a Supabase Storage
- Links públicos compartibles

### 👥 Gestión de Clientes y Técnicos
- CRUD completo de clientes
- Asignación de técnicos a reparaciones
- Historial de reparaciones por cliente

### 📊 Estados de Reparación
- Pendiente
- En proceso
- Finalizada
- Entregada
- Cancelada

### 🔍 Filtros y Búsqueda
- Filtro por estado de reparación
- Búsqueda por cliente, producto o comprobante
- Interfaz limpia y profesional

### ⚙️ Configuración Personalizable
- Logo del local
- Datos de contacto
- Horarios de atención
- Información para comprobantes

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **PDF**: jsPDF
- **Iconos**: Lucide React

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ instalado
- Cuenta de Supabase (gratis)
- Git

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/TomiRonco/web-reparacion.git
cd web-reparacion
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

Obtén estas credenciales desde tu proyecto de Supabase:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a Settings > API
4. Copia la URL y la `anon` key

### Paso 4: Configurar la Base de Datos

Ejecuta el siguiente script SQL en tu proyecto de Supabase (SQL Editor):

```sql
-- Habilitar Row Level Security
alter table if exists public.clientes enable row level security;
alter table if exists public.tecnicos enable row level security;
alter table if exists public.reparaciones enable row level security;
alter table if exists public.configuracion_local enable row level security;

-- Tabla de clientes
create table if not exists public.clientes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nombre_completo text not null,
  telefono text not null,
  email text,
  direccion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de técnicos
create table if not exists public.tecnicos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nombre text not null,
  especialidad text,
  telefono text,
  activo boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de reparaciones
create table if not exists public.reparaciones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  numero_comprobante integer not null,
  cliente_nombre text not null,
  cliente_apellido text not null,
  cliente_celular text not null,
  producto text not null,
  marca text not null,
  tiene_cargador boolean default false,
  observacion text,
  tecnico_id uuid references public.tecnicos,
  estado text default 'pendiente',
  diagnostico text,
  monto numeric(10,2),
  fecha_ingreso timestamp with time zone default timezone('utc'::text, now()) not null,
  fecha_actualizado timestamp with time zone,
  fecha_finalizado timestamp with time zone,
  fecha_entregado timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de configuración
create table if not exists public.configuracion_local (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  nombre_local text,
  ubicacion text,
  celular text,
  telefono text,
  email text,
  horarios text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas de seguridad (RLS)
-- Clientes
create policy "Los usuarios pueden ver sus propios clientes"
  on public.clientes for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden crear sus propios clientes"
  on public.clientes for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propios clientes"
  on public.clientes for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propios clientes"
  on public.clientes for delete
  using (auth.uid() = user_id);

-- Técnicos
create policy "Los usuarios pueden ver sus propios técnicos"
  on public.tecnicos for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden crear sus propios técnicos"
  on public.tecnicos for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propios técnicos"
  on public.tecnicos for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propios técnicos"
  on public.tecnicos for delete
  using (auth.uid() = user_id);

-- Reparaciones
create policy "Los usuarios pueden ver sus propias reparaciones"
  on public.reparaciones for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden crear sus propias reparaciones"
  on public.reparaciones for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propias reparaciones"
  on public.reparaciones for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propias reparaciones"
  on public.reparaciones for delete
  using (auth.uid() = user_id);

-- Configuración
create policy "Los usuarios pueden ver su propia configuración"
  on public.configuracion_local for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden crear su propia configuración"
  on public.configuracion_local for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar su propia configuración"
  on public.configuracion_local for update
  using (auth.uid() = user_id);
```

### Paso 5: Configurar Storage para Comprobantes

1. Ve a **Storage** en tu proyecto de Supabase
2. Crea un nuevo bucket llamado `comprobantes`
3. Marca como **Public bucket**
4. Crea las siguientes políticas:

```sql
-- Política 1: Subir archivos
CREATE POLICY "Los usuarios pueden subir sus comprobantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprobantes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 2: Ver archivos (público)
CREATE POLICY "Los comprobantes son públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'comprobantes');

-- Política 3: Actualizar archivos
CREATE POLICY "Los usuarios pueden actualizar sus comprobantes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'comprobantes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 4: Eliminar archivos
CREATE POLICY "Los usuarios pueden eliminar sus comprobantes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comprobantes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Paso 6: Configurar Storage para Logos

1. Crea otro bucket llamado `logos`
2. Marca como **Public bucket**
3. Aplica las mismas políticas que para comprobantes

### Paso 7: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📖 Uso

### Primera Configuración

1. **Crear una cuenta** - Regístrate en el sistema
2. **Configurar el local**:
   - Ve a Configuración
   - Completa todos los datos del local
   - Sube el logo
   - Configura los horarios de atención
3. **Agregar técnicos** - Crea los técnicos que trabajarán en las reparaciones

### Crear una Reparación

1. Click en **"Nueva Reparación"**
2. Completa los datos del cliente
3. Ingresa información del equipo
4. Selecciona el técnico asignado
5. Agrega observaciones si es necesario
6. Click en **Guardar**

**Resultado:**
- Se genera el comprobante PDF automáticamente
- El PDF se descarga localmente
- El PDF se sube a Supabase Storage
- Se abre WhatsApp Web con mensaje de confirmación
- El mensaje incluye el link de descarga del comprobante

### Actualizar Estado de Reparación

#### Agregar Diagnóstico (Pasar a "En Proceso")

1. Click en el icono de edición ✏️
2. Completa el diagnóstico
3. Ingresa el monto estimado
4. Click en **Guardar**

**Resultado:**
- Se abre WhatsApp con mensaje de diagnóstico
- Incluye el problema detectado
- Muestra el monto estimado
- Solicita confirmación del cliente

#### Marcar como Finalizada

1. Click en el ícono de check ✓
2. Confirma la acción

**Resultado:**
- Se abre WhatsApp notificando que está listo
- Incluye los horarios de atención del local
- Cliente sabe cuándo puede retirar

#### Marcar como Entregada

1. Click en el ícono de paquete 📦
2. Confirma la acción

**Resultado:**
- Se abre WhatsApp agradeciendo el retiro
- Incluye información de garantía
- Link directo para dejar reseña en Google

### Reenviar Comprobante

En cualquier momento puedes reenviar el comprobante:
1. Click en el ícono de descarga 📥 en la columna "Comprobante"
2. El PDF se descargará automáticamente

## 🎨 Personalización

### Logo del Local

1. Ve a **Configuración**
2. Click en **"Seleccionar Logo"**
3. Sube una imagen (JPG, PNG)
4. El logo aparecerá en:
   - Comprobantes PDF
   - Sidebar del sistema

### Plantillas de Mensajes WhatsApp

Edita el archivo `lib/whatsapp.ts` para personalizar los mensajes:

```typescript
export const plantillasWhatsApp = {
  nueva_reparacion: (numeroComprobante, tipoEquipo, nombreLocal, comprobanteURL) => {
    // Personaliza el mensaje aquí
  },
  // ... otros mensajes
}
```

### Estilos y Colores

El proyecto usa Tailwind CSS. Puedes personalizar los colores en `tailwind.config.ts`.

## 📱 Formato de Números de Teléfono

El sistema formatea automáticamente números argentinos:
- `3415071726` → `+543415071726`
- `03415071726` → `+543415071726`
- Ya incluye el código de país +54

Para otros países, edita la función `formatearTelefonoArgentino` en `lib/whatsapp.ts`.

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Autenticación requerida para todas las operaciones
- ✅ Usuarios solo ven sus propios datos
- ✅ Storage segmentado por usuario
- ✅ Comprobantes con URLs públicas pero carpetas privadas

## 📊 Estructura del Proyecto

```
web-reparacion/
├── app/                      # Páginas Next.js
│   ├── login/               # Página de login
│   ├── dashboard/           # Dashboard principal
│   │   ├── page.tsx        # Listado de reparaciones
│   │   ├── tecnicos/       # Gestión de técnicos
│   │   ├── estadisticas/   # Estadísticas
│   │   └── configuracion/  # Configuración del local
├── components/              # Componentes reutilizables
│   ├── DashboardLayout.tsx # Layout principal
│   ├── PageHeader.tsx      # Headers con gradientes
│   └── FiltroReparaciones.tsx # Filtros de búsqueda
├── lib/                     # Utilidades
│   ├── supabase/           # Cliente de Supabase
│   ├── pdf-generator.ts    # Generación de PDFs
│   └── whatsapp.ts         # Sistema de mensajes
├── types/                   # Tipos TypeScript
│   └── database.ts         # Tipos de la BD
├── public/                  # Archivos estáticos
├── .env.local              # Variables de entorno (no commitear)
├── .env.example            # Ejemplo de variables
└── README.md               # Este archivo
```

## 🐛 Troubleshooting

### No se generan los PDFs

- Verifica que el bucket `comprobantes` exista en Supabase
- Asegúrate de que las políticas estén configuradas
- Revisa que la configuración del local esté completa

### No se abre WhatsApp

- Verifica que el navegador permita pop-ups
- Asegúrate de tener WhatsApp Web activo
- El número debe tener formato válido (10 dígitos)

### No se sube el logo

- Verifica que el bucket `logos` exista
- Comprueba que la imagen sea JPG o PNG
- Máximo 2MB por imagen

### Error de autenticación

- Verifica las credenciales en `.env.local`
- Asegúrate de que Supabase Auth esté habilitado
- Revisa las políticas RLS en Supabase

## 🚀 Deployment

### Vercel (Recomendado)

1. Push tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura las variables de entorno
4. Deploy automático

### Variables de Entorno en Producción

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 📄 Licencia

Este proyecto es privado y de uso personal.

## 👨‍💻 Autor

**TomiRonco**
- GitHub: [@TomiRonco](https://github.com/TomiRonco)
- Repositorio: [web-reparacion](https://github.com/TomiRonco/web-reparacion)

## 🤝 Contribuciones

Este es un proyecto privado. No se aceptan contribuciones externas.

## 📞 Soporte

Para soporte o consultas sobre el proyecto, contacta al propietario del repositorio.

## 📝 Changelog

### v2.0.0 - Sistema de Notificaciones WhatsApp
- ✨ Notificaciones automáticas por WhatsApp
- 📄 Generación de PDFs con subida a Storage
- 💰 Mensajes con diagnóstico y presupuesto
- 🕐 Horarios de atención en notificaciones
- ⭐ Garantía y reseñas de Google

### v1.0.0 - Versión Inicial
- 👥 Gestión de clientes y técnicos
- 🔧 CRUD de reparaciones
- 📊 Estados y filtros
- ⚙️ Configuración personalizable
- 🔐 Autenticación con Supabase
