# 🔧 Sistema de Gestión de Reparaciones

Sistema profesional para gestión de reparaciones de un local técnico. Desarrollado con Next.js, Supabase y Tailwind CSS.

## ✨ Características

- 🔐 **Autenticación segura** con Supabase Auth
- 📋 **Gestión completa de reparaciones** con estados (Pendiente → En Proceso → Finalizada → Entregada)
- 👥 **Administración de técnicos**
- 📊 **Estadísticas en tiempo real**
- 📄 **Generación automática de PDFs** (comprobante con original y copia)
- ⚙️ **Configuración personalizada** del local con logo
- 📱 **Diseño responsive** y minimalista
- 🚀 **Listo para desplegar** en Vercel

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Estilos:** Tailwind CSS
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Storage:** Supabase Storage (para logos)
- **PDF Generation:** jsPDF + html2canvas
- **Iconos:** Lucide React
- **Hosting:** Vercel (recomendado)

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [Vercel](https://vercel.com) para despliegue (opcional, gratuita)

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

#### 2.1 Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Guarda la URL y la clave anon (las necesitarás después)

#### 2.2 Ejecutar el schema de base de datos

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido del archivo `supabase-schema.sql`
4. Ejecuta la query (Run)

Esto creará:
- Tabla `configuracion_local` (datos del local)
- Tabla `tecnicos` (técnicos del local)
- Tabla `reparaciones` (reparaciones con todos sus estados)
- Políticas de seguridad (RLS) para proteger los datos
- Índices para optimizar consultas

#### 2.3 Configurar Storage para logos

1. En Supabase, ve a **Storage**
2. Crea un nuevo bucket llamado `logos`
3. Haz que sea **público** (Settings del bucket → Public bucket: ON)
4. Configura las políticas:

```sql
-- Política para permitir subir logos
CREATE POLICY "Los usuarios pueden subir sus propios logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para leer logos públicos
CREATE POLICY "Logos son públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');
```

#### 2.4 Crear usuario de prueba

En Supabase, ve a **Authentication** → **Users** → **Add user**

- Email: `local@ejemplo.com`
- Password: `tupassword123` (o la que prefieras)
- Email confirm: **marcado** (para no tener que confirmar email)

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local` y completa con tus credenciales:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

**Importante:** Reemplaza con tus propias credenciales de Supabase.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Uso de la Aplicación

### Login
- Inicia sesión con el email y contraseña creados en Supabase
- Las credenciales se guardan automáticamente

### Dashboard - Reparaciones
1. **Agregar reparación:** Click en "Nueva Reparación"
   - Completa datos del cliente (nombre, apellido, celular)
   - Datos del producto (producto, marca, si tiene cargador)
   - Asigna un técnico
   - Se genera automáticamente un PDF con el comprobante
   
2. **Flujo de estados:**
   - **Pendiente** → El técnico puede agregar diagnóstico y monto (pasa a "En Proceso")
   - **En Proceso** → El técnico puede marcar como "Finalizada"
   - **Finalizada** → Se puede marcar como "Entregada" cuando el cliente la retira
   - **Entregada** → Estado final

### Dashboard - Técnicos
- Agregar técnicos con nombre, apellido y celular
- Editar datos de técnicos existentes
- Eliminar técnicos (no se puede si tienen reparaciones asignadas)

### Dashboard - Estadísticas
- Visualiza métricas en tiempo real:
  - Total de reparaciones
  - Ingresos totales
  - Reparaciones por estado
  - Técnico más activo
  - Distribución por estado (con gráficos)

### Dashboard - Configuración
- Subir logo del local (PNG, JPG, SVG)
- Configurar nombre, ubicación, contactos
- Redes sociales (Facebook, Instagram, WhatsApp)
- Horarios de atención
- Esta información aparece en los PDFs generados

## 🚀 Despliegue en Vercel

### Opción 1: Desde GitHub

1. Sube el proyecto a GitHub
2. Conecta tu repositorio en [vercel.com](https://vercel.com)
3. Configura las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Despliega

### Opción 2: CLI de Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Sigue las instrucciones y configura las variables de entorno cuando te las pida.

### Configuración de dominio

Una vez desplegado, puedes:
- Usar el dominio gratuito de Vercel (ej: `tu-proyecto.vercel.app`)
- Conectar un dominio personalizado en la configuración de Vercel

## 📄 Estructura del Proyecto

```
web-reparacion/
├── app/
│   ├── login/              # Página de login
│   ├── dashboard/          # Dashboard protegido
│   │   ├── page.tsx        # Reparaciones (página principal)
│   │   ├── tecnicos/       # Gestión de técnicos
│   │   ├── estadisticas/   # Estadísticas y métricas
│   │   ├── configuracion/  # Configuración del local
│   │   └── layout.tsx      # Layout con sidebar
│   └── page.tsx            # Redirección inicial
├── components/
│   └── DashboardLayout.tsx # Componente del sidebar
├── lib/
│   ├── supabase/          # Clientes de Supabase
│   │   ├── client.ts      # Cliente del navegador
│   │   ├── server.ts      # Cliente del servidor
│   │   └── middleware.ts  # Middleware para auth
│   └── pdf-generator.ts   # Generación de PDFs
├── types/
│   └── database.ts        # Tipos TypeScript
├── middleware.ts          # Middleware de Next.js
├── supabase-schema.sql   # Schema de base de datos
└── .env.local            # Variables de entorno (NO SUBIR A GIT)
```

## 🔒 Seguridad

- **Row Level Security (RLS)** activado en todas las tablas
- Los usuarios solo pueden ver y modificar sus propios datos
- Autenticación manejada por Supabase
- Variables de entorno para credenciales sensibles

## 🎨 Personalización

### Colores
Los colores principales se pueden cambiar en los componentes:
- Azul principal: `blue-600`
- Estados: amarillo (pendiente), azul (en proceso), verde (finalizada), gris (entregada)

### Logo y branding
- Configurable desde la sección "Configuración" del dashboard
- El logo aparece en el sidebar y en los PDFs generados

## 🐛 Solución de Problemas

### Error de autenticación
- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de que el usuario existe en Supabase Authentication

### No se pueden crear reparaciones
- Verifica que hayas ejecutado el schema SQL completo
- Asegúrate de tener al menos un técnico creado
- Revisa que RLS esté configurado correctamente

### PDFs no se generan
- Verifica que jsPDF esté instalado
- Asegúrate de que la configuración del local esté completa

### Error al subir logo
- Verifica que el bucket `logos` exista y sea público
- Revisa las políticas de storage en Supabase

## 📊 Plan Gratuito Supabase

Límites del plan gratuito (suficiente para locales pequeños):
- 500 MB de base de datos
- 1 GB de almacenamiento para archivos
- 50,000 usuarios activos mensuales
- 2 GB de transferencia

## 📝 Licencia

Este proyecto fue desarrollado como solución para locales de reparación.

---

**Desarrollado con ❤️ para profesionales de reparaciones**

