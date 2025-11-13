# 🔧 Sistema de Gestión de Reparaciones

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**Sistema profesional para gestión de reparaciones de locales técnicos**

[Demo](#demo) • [Características](#características) • [Instalación](#instalación) • [Documentación](#documentación)

</div>

---

## 📋 Descripción

Sistema web completo para gestionar reparaciones en locales técnicos. Permite registrar clientes, equipos, técnicos, seguimiento de estados, generación de comprobantes PDF y estadísticas en tiempo real.

## ✨ Características Principales

### 🔐 Autenticación
- Login seguro con Supabase Auth
- Remember me (persistencia de credenciales)
- Rutas protegidas con middleware

### 📊 Dashboard Profesional
- **Sidebar responsive** con menú hamburguesa en móvil
- **Headers con gradientes** únicos por sección
- **Diseño moderno** con Tailwind CSS

### 🛠️ Gestión de Reparaciones
- ✅ Estados: Pendiente, En Proceso, Finalizada, Entregada
- 🔍 **Filtros avanzados** por búsqueda y estado
- 📝 Formulario completo de registro
- 💊 Diagnósticos y presupuestos
- 📄 **Generación de PDF** automática
- 📥 **Re-descarga** de comprobantes

### 👥 Gestión de Técnicos
- Lista profesional en formato tabla
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Asignación a reparaciones

### 📈 Estadísticas
- Total de reparaciones
- Ingresos totales
- Reparaciones por estado
- Técnico más activo
- Gráficos visuales

### ⚙️ Configuración Personalizable
- Logo del local (subida a Supabase Storage)
- Datos del negocio
- Redes sociales
- Horarios de atención

## 🎨 Capturas de Pantalla

### Dashboard Principal
```
┌─────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════╗  │
│ ║ 🔧 Reparaciones               [⚪ Nueva Reparación] ║  │
│ ╚═══════════════════════════════════════════════════╝  │
├─────────────────────────────────────────────────────────┤
│ [Filtros: Buscar | Estado]                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Cliente | Equipo | Técnico | Estado | Acciones     │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ...                                                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Tecnologías

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **PDF**: jsPDF + jspdf-autotable
- **Iconos**: Lucide React

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- npm o pnpm
- Cuenta en Supabase

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/web-reparacion.git
cd web-reparacion
```

### Paso 2: Instalar dependencias
```bash
npm install
# o
pnpm install
```

### Paso 3: Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el schema SQL:
```bash
# Copiar contenido de supabase-schema.sql
# Ejecutar en SQL Editor de Supabase
```

3. Habilitar Storage:
   - Crear bucket `logos` (público)
   - Configurar políticas de acceso

### Paso 4: Variables de entorno

Crear archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Paso 5: Ejecutar en desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📚 Documentación

El proyecto incluye documentación completa:

- `INSTALACION.md` - Guía detallada de instalación
- `INICIO-RAPIDO.md` - Inicio rápido en 5 minutos
- `COMANDOS.md` - Todos los comandos disponibles
- `CHECKLIST.md` - Checklist de funcionalidades
- `FAQ.md` - Preguntas frecuentes
- `DATOS-PRUEBA.md` - Datos de ejemplo
- `components/README.md` - Documentación de componentes

### Documentación de Funcionalidades
- `FILTRO-PROFESIONAL.md` - Sistema de filtros
- `RECORDAR-CREDENCIALES.md` - Remember me
- `HEADERS-GRADIENTES.md` - Headers con gradientes
- `CHANGELOG.md` - Historial de cambios

## 🗂️ Estructura del Proyecto

```
web-reparacion/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Lista de reparaciones
│   │   ├── tecnicos/page.tsx     # Gestión de técnicos
│   │   ├── estadisticas/page.tsx # Estadísticas
│   │   └── configuracion/page.tsx # Configuración
│   ├── login/page.tsx            # Login
│   └── layout.tsx
├── components/
│   ├── DashboardLayout.tsx       # Layout con sidebar
│   ├── FiltroReparaciones.tsx    # Componente de filtros
│   └── PageHeader.tsx            # Headers con gradientes
├── lib/
│   ├── supabase/                 # Cliente Supabase
│   └── pdf-generator.ts          # Generador de PDFs
├── types/
│   └── database.ts               # Tipos TypeScript
└── supabase-schema.sql           # Schema de BD
```

## 🎯 Uso

### 1. Primer Login
```
Email: tu@email.com
Password: (crear en Supabase Auth)
```

### 2. Configurar Local
- Ir a Configuración
- Subir logo
- Completar datos del negocio

### 3. Agregar Técnicos
- Ir a Técnicos
- Agregar técnicos del local

### 4. Registrar Reparación
- Dashboard → Nueva Reparación
- Completar formulario
- Descargar comprobante PDF

### 5. Seguimiento
- Cambiar estados: Pendiente → En Proceso → Finalizada → Entregada
- Ver estadísticas en tiempo real

## 🌈 Paleta de Colores

| Sección | Gradiente |
|---------|-----------|
| 🔧 Reparaciones | Azul → Índigo |
| 👥 Técnicos | Púrpura → Rosa |
| 📊 Estadísticas | Verde → Turquesa |
| ⚙️ Configuración | Naranja → Rojo |

## 🔒 Seguridad

- ✅ Autenticación JWT con Supabase
- ✅ Row Level Security (RLS) en base de datos
- ✅ Rutas protegidas con middleware
- ✅ Variables de entorno para secrets
- ⚠️ Remember me en localStorage (solo dispositivos personales)

## 📱 Responsive

- ✅ Desktop (1920px+)
- ✅ Laptop (1280px - 1920px)
- ✅ Tablet (768px - 1280px)
- ✅ Móvil (320px - 768px)

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

## 🐛 Reportar Bugs

Crear un issue con:
- Descripción del bug
- Pasos para reproducir
- Comportamiento esperado
- Screenshots (si aplica)

## 📝 Roadmap

### v1.4 (Próximamente)
- [ ] Notificaciones push
- [ ] Exportar a Excel
- [ ] Gráficos avanzados
- [ ] Multi-idioma

### v1.5
- [ ] Modo oscuro
- [ ] Calendario de citas
- [ ] Historial de cambios
- [ ] Chat interno

### v2.0
- [ ] App móvil
- [ ] QR codes
- [ ] Pagos online
- [ ] API pública

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 👤 Autor

**Tomás Roncoroni**

## 🙏 Agradecimientos

- Next.js team
- Supabase team
- Tailwind CSS team
- Lucide Icons team

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella ⭐**

[Reportar Bug](../../issues) • [Solicitar Feature](../../issues)

</div>
