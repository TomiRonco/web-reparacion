# 🚀 INICIO RÁPIDO

## Para empezar en 5 minutos:

### 1️⃣ Abre la terminal y ejecuta:
```bash
cd web-reparacion
npm install
```

### 2️⃣ Mientras se instala, ve a:
👉 **https://supabase.com** → Crea un proyecto

### 3️⃣ En Supabase:
- Ve a SQL Editor
- Copia el contenido de `supabase-schema.sql`
- Pégalo y ejecuta (Run)

### 4️⃣ Crea un bucket de Storage:
- Storage → Create bucket → `logos`
- Hacerlo público

### 5️⃣ Crea un usuario:
- Authentication → Users → Add user
- Email: `admin@tulocal.com`
- Password: `Admin123!`
- Auto Confirm: ✅

### 6️⃣ Copia tus credenciales:
- Settings → API
- Copia: Project URL y anon public key

### 7️⃣ Pégalas en `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=tu-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key-aqui
```

### 8️⃣ Ejecuta:
```bash
npm run dev
```

### 9️⃣ Abre:
👉 **http://localhost:3000**

### 🔟 Login con:
- Email: `admin@tulocal.com`
- Password: `Admin123!`

---

## ✅ ¡Listo! Ya está funcionando.

### Ahora puedes:
- ✅ Crear reparaciones
- ✅ Agregar técnicos
- ✅ Ver estadísticas
- ✅ Generar PDFs
- ✅ Configurar tu local

---

## 📚 Siguiente paso:

Lee **INSTALACION.md** para la guía completa paso a paso.

O **RESUMEN.md** para entender todo el proyecto.

---

## 🆘 ¿Problemas?

1. **"Cannot find module"** → `npm install`
2. **"Failed to fetch"** → Verifica `.env.local`
3. **"No se crean reparaciones"** → Crea un técnico primero
4. **Otro problema** → Revisa **FAQ.md**

---

## 💰 ¿Listo para vender?

Lee **VENTA.md** para:
- Modelo de negocio
- Precios sugeridos
- Script de ventas
- ROI para el cliente

---

**¡Éxito! 🎉**
