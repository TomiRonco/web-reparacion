# Configuración de Storage para Comprobantes

Para que los comprobantes en PDF se puedan compartir por WhatsApp, necesitas configurar un bucket de almacenamiento en Supabase.

## 📦 Crear Bucket de Comprobantes

### Paso 1: Acceder a Storage en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. En el menú lateral, click en **Storage**
3. Click en **Create a new bucket**

### Paso 2: Configurar el Bucket

**Nombre del bucket:** `comprobantes`

**Configuración:**
- ✅ **Public bucket** (marcado)
- Esto permite que los PDFs tengan URLs públicas para compartir

### Paso 3: Configurar Políticas (Policies)

Una vez creado el bucket, necesitas configurar las políticas de acceso:

#### Política 1: Permitir INSERT (subir archivos)

```sql
CREATE POLICY "Los usuarios pueden subir sus comprobantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprobantes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Política 2: Permitir SELECT (ver/descargar archivos)

```sql
CREATE POLICY "Los comprobantes son públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'comprobantes');
```

#### Política 3: Permitir UPDATE (actualizar archivos)

```sql
CREATE POLICY "Los usuarios pueden actualizar sus comprobantes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'comprobantes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Política 4: Permitir DELETE (eliminar archivos)

```sql
CREATE POLICY "Los usuarios pueden eliminar sus comprobantes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comprobantes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 🔒 Seguridad

- Cada usuario solo puede subir/modificar/eliminar PDFs en su propia carpeta
- La carpeta se identifica por el `user_id` (UUID)
- Los PDFs son públicamente accesibles para compartir (necesario para WhatsApp)
- La estructura de carpetas es: `comprobantes/{user_id}/Comprobante_000123_Apellido.pdf`

## ✅ Verificar Configuración

Para verificar que todo está configurado correctamente:

1. Crea una reparación de prueba
2. El PDF se debería subir automáticamente
3. El link del comprobante aparecerá en el mensaje de WhatsApp
4. Al hacer click en el link, el PDF se debería descargar

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"

- Verifica que las políticas estén creadas correctamente
- Asegúrate de que el bucket se llame exactamente `comprobantes`
- Verifica que el usuario esté autenticado

### Los PDFs no se descargan

- Verifica que el bucket sea **público**
- Revisa que la política SELECT esté activa
- Prueba el link directamente en el navegador

### No se puede subir el PDF

- Verifica la política INSERT
- Asegúrate de que el usuario tenga permisos
- Revisa los logs en Supabase (Settings > Logs)

## 📝 Ejemplo de URL

Una URL de comprobante generada se verá así:

```
https://klgqvowopvtlurhbhqog.supabase.co/storage/v1/object/public/comprobantes/123e4567-e89b-12d3-a456-426614174000/Comprobante_000123_Gonzalez.pdf
```

Esta URL:
- Es pública y permanente
- Se puede compartir por WhatsApp
- Se puede abrir directamente en el navegador
- Descarga el PDF automáticamente
