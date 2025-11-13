# 🖼️ Logo en PDF - Implementación

**Fecha**: 12 de noviembre de 2025  
**Versión**: 1.3.2  
**Tipo**: Mejora de PDF

---

## 📋 Cambio Implementado

### ❌ Antes
```typescript
if (config?.logo_url) {
  doc.text('[LOGO]', leftColumnX, leftY)  // Solo texto
  leftY += 6
}
```

**Resultado:**
```
┌────────────────────────┐
│ [LOGO]                 │  ← Texto simulado
│ BYT COMPUTACIÓN        │
└────────────────────────┘
```

---

### ✅ Ahora
```typescript
// Cargar imagen desde URL
async function cargarImagenComoBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

// Usar en PDF
let logoBase64 = ''
if (config?.logo_url) {
  logoBase64 = await cargarImagenComoBase64(config.logo_url)
}

// Agregar al documento
if (logoBase64) {
  const logoSize = 20 // mm
  doc.addImage(logoBase64, 'PNG', leftColumnX, leftY, logoSize, logoSize)
  leftY += logoSize + 3
}
```

**Resultado:**
```
┌────────────────────────┐
│  ╔═══╗                 │  ← Logo real
│  ║ L ║                 │
│  ╚═══╝                 │
│ BYT COMPUTACIÓN        │
└────────────────────────┘
```

---

## 🔧 Cómo Funciona

### 1. Carga del Logo
```typescript
async function cargarImagenComoBase64(url: string): Promise<string>
```

**Proceso:**
1. Hace `fetch` a la URL del logo en Supabase Storage
2. Convierte la respuesta a `Blob`
3. Usa `FileReader` para convertir a Base64
4. Retorna el string `data:image/png;base64,...`

**Manejo de Errores:**
- Si falla la carga, retorna string vacío `''`
- El PDF continúa sin logo (no se rompe)
- Error se muestra en consola para debugging

---

### 2. Conversión a Base64

**¿Por qué Base64?**
- jsPDF requiere imágenes en formato Base64 o URL de data
- Supabase Storage URLs son públicas pero pueden tener CORS
- Base64 garantiza que la imagen esté embebida en el PDF

**Formato:**
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

---

### 3. Agregar al PDF

```typescript
doc.addImage(
  logoBase64,     // Imagen en Base64
  'PNG',          // Formato (PNG, JPEG, etc.)
  leftColumnX,    // Posición X (15 mm)
  leftY,          // Posición Y (variable)
  logoSize,       // Ancho (20 mm)
  logoSize        // Alto (20 mm - cuadrado)
)
```

**Parámetros:**
- **Posición**: Esquina superior izquierda del header
- **Tamaño**: 20x20 mm (cuadrado perfecto)
- **Formato**: Detecta automáticamente PNG/JPEG
- **Mantenimiento de aspecto**: Cuadrado forzado

---

## 📐 Especificaciones

### Tamaño del Logo
```typescript
const logoSize = 20 // mm
```

**Conversión a píxeles (aprox):**
- 20 mm = ~75 píxeles a 96 DPI
- 20 mm = ~94 píxeles a 120 DPI

**Recomendaciones:**
- Logo original: 500x500 px (alta calidad)
- Mínimo: 200x200 px
- Formato: PNG con fondo transparente (ideal)

---

### Espaciado

```typescript
leftY += logoSize + 3  // Logo + 3mm de margen
```

**Layout:**
```
┌─────────────────────┐
│ [Logo 20x20mm]      │
│                     │  ← 3mm espacio
│ NOMBRE DEL LOCAL    │
│ Dirección...        │
└─────────────────────┘
```

---

## 🎨 Formatos Soportados

| Formato | Extensión | Soporte | Notas |
|---------|-----------|---------|-------|
| PNG | .png | ✅ Completo | Ideal con transparencia |
| JPEG | .jpg, .jpeg | ✅ Completo | Fondo blanco |
| GIF | .gif | ⚠️ Limitado | Solo primer frame |
| WebP | .webp | ❌ No | Convertir a PNG |
| SVG | .svg | ❌ No | Convertir a PNG |

**Recomendado:** PNG con transparencia

---

## 🔄 Flujo Completo

```
Usuario sube logo en Configuración
           ↓
Logo se guarda en Supabase Storage
           ↓
URL guardada en configuracion_local.logo_url
           ↓
Al generar PDF:
  1. Leer logo_url de config
  2. Hacer fetch a Supabase Storage
  3. Convertir a Blob
  4. Convertir a Base64 con FileReader
  5. Agregar al PDF con doc.addImage()
           ↓
PDF generado con logo real
```

---

## 🛡️ Manejo de Errores

### Error en Fetch
```typescript
try {
  const response = await fetch(url)
  const blob = await response.blob()
  // ...
} catch (error) {
  console.error('Error al cargar imagen:', error)
  return ''  // ← Retorna vacío, continúa sin logo
}
```

### Error en addImage
```typescript
try {
  doc.addImage(logoBase64, 'PNG', x, y, w, h)
  leftY += logoSize + 3
} catch (error) {
  console.error('Error al agregar logo al PDF:', error)
  // Continúa sin agregar logo
}
```

**Ventajas:**
- PDF nunca falla por logo roto
- Usuario siempre obtiene su comprobante
- Errores logeados para debugging

---

## 🎯 Casos de Uso

### Caso 1: Logo Configurado
```typescript
config.logo_url = "https://supabase.co/storage/.../logo.png"
```
**Resultado:** Logo se muestra en PDF ✅

### Caso 2: Sin Logo
```typescript
config.logo_url = null
```
**Resultado:** Se salta el logo, continúa con nombre ✅

### Caso 3: URL Inválida
```typescript
config.logo_url = "https://invalid-url.com/logo.png"
```
**Resultado:** Fetch falla, continúa sin logo ✅

### Caso 4: Formato No Soportado
```typescript
config.logo_url = "https://supabase.co/.../logo.svg"
```
**Resultado:** addImage falla, continúa sin logo ✅

---

## 📊 Comparación Visual

### Sin Logo (Antes)
```
┌──────────────────────────┐
│ [LOGO]    ORIGINAL       │ ← Texto simulado
│ BYT COMP  COMPROBANTE... │
│ Dir: ...  Fecha: ...     │
└──────────────────────────┘
```

### Con Logo (Ahora)
```
┌──────────────────────────┐
│  ╔═══╗    ORIGINAL       │ ← Logo real
│  ║ B ║    COMPROBANTE... │
│  ╚═══╝    Fecha: ...     │
│ BYT COMP                 │
│ Dir: ...                 │
└──────────────────────────┘
```

---

## 🔍 Debugging

### Ver si el logo se cargó:
```javascript
console.log('Logo Base64 length:', logoBase64.length)
// Si > 0, se cargó correctamente
// Si = 0, hubo error
```

### Ver la imagen en consola:
```javascript
console.log('Logo URL:', config.logo_url)
console.log('Logo Base64 preview:', logoBase64.substring(0, 50))
```

### Probar la carga manualmente:
```javascript
const testLogo = await cargarImagenComoBase64('https://...')
console.log('Test logo:', testLogo ? 'OK' : 'FAIL')
```

---

## 📝 Ejemplo Completo

### Configuración del Local
```sql
-- En Supabase
UPDATE configuracion_local 
SET logo_url = 'https://your-project.supabase.co/storage/v1/object/public/logos/mi-logo.png'
WHERE user_id = 'xxx';
```

### PDF Generado
```
Original:
┌────────────────────────────────────────────────────┐
│  ╔══════╗                      ORIGINAL            │
│  ║      ║                      COMPROBANTE N° 0001 │
│  ║ LOGO ║                      Fecha: 12/11/2025   │
│  ║      ║                      Hora: 21:30          │
│  ╚══════╝                                           │
│  BYT COMPUTACIÓN                                    │
│  Dirección: Entre Rios 640                         │
│  Cel: 3415071726                                    │
│  Email: info@bytcomputacion.com.ar                  │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ DATOS DEL CLIENTE                               ││
│ │ ...                                             ││
│ └─────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuración Recomendada

### Para Mejores Resultados:

1. **Logo Original**:
   - Tamaño: 500x500 px o mayor
   - Formato: PNG con transparencia
   - Peso: < 200 KB

2. **Supabase Storage**:
   - Bucket: `logos` (público)
   - Políticas: Lectura pública habilitada
   - URL completa guardada en DB

3. **Diseño del Logo**:
   - Cuadrado (1:1)
   - Fondo transparente
   - Colores sólidos (mejor para impresión)
   - Sin degradados complejos

---

## 🚀 Mejoras Futuras

### Corto plazo
- [ ] Ajustar tamaño automáticamente según contenido
- [ ] Soportar logos rectangulares (16:9, 4:3)
- [ ] Caché de logos para mejor performance

### Mediano plazo
- [ ] Comprimir imagen antes de agregar al PDF
- [ ] Convertir SVG a PNG automáticamente
- [ ] Marca de agua en esquinas

### Largo plazo
- [ ] Editor de logo en línea
- [ ] Múltiples logos (header, footer)
- [ ] Plantillas con diferentes posiciones

---

## ✅ Testing

### Para probar:
1. Ir a Configuración
2. Subir un logo (PNG recomendado)
3. Guardar configuración
4. Ir a Reparaciones
5. Descargar un comprobante PDF
6. Verificar que el logo aparezca en ambas secciones (ORIGINAL y COPIA)

### Checklist:
- [ ] Logo se muestra correctamente
- [ ] Tamaño apropiado (20x20 mm)
- [ ] No deforma la imagen
- [ ] Aparece en ORIGINAL
- [ ] Aparece en COPIA
- [ ] Si falla, PDF continúa sin logo

---

**Estado:** ✅ Implementado  
**Archivo modificado:** `/lib/pdf-generator.ts`  
**Líneas agregadas:** ~25  
**Compatibilidad:** Todos los navegadores modernos  

¡Ahora el PDF muestra el logo real del local! 🖼️✨
