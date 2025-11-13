# ⚠️ NOTAS IMPORTANTES

## Build Error Normal

Si ves este error al hacer `npm run build`:

```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

**¡Es NORMAL!** Significa que las variables de entorno no están configuradas aún.

### Solución:
1. Configura `.env.local` con tus credenciales de Supabase
2. El build funcionará correctamente

## Variables de Entorno Requeridas

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...tu-clave-aqui
```

Sin estas variables:
- ❌ El build falla (normal)
- ❌ El login no funciona
- ❌ No se conecta a la base de datos

Con estas variables configuradas:
- ✅ El build funciona
- ✅ Todo el sistema funciona correctamente

## Verificación Rápida

### ¿Está configurado?
```bash
cat .env.local
```

Deberías ver tus credenciales. Si sale "No such file", necesitas crearlo.

### ¿Las credenciales son correctas?
Deben empezar con:
- URL: `https://xxxxx.supabase.co`
- KEY: `eyJhbGc...` (muy largo, 200+ caracteres)

## En Vercel

Cuando despliegues en Vercel, asegúrate de:
1. Ir a Settings → Environment Variables
2. Agregar ambas variables
3. Aplicar a "Production, Preview y Development"
4. Redesplegar

---

**💡 Tip:** Usa `.env.example` como plantilla. Copia y pega tus credenciales reales.
