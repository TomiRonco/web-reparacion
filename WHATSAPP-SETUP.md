# Notificaciones de WhatsApp (Manual)

Este proyecto incluye un sistema de notificaciones de WhatsApp que **abre automáticamente WhatsApp Web** con el mensaje predefinido para que lo envíes manualmente.

## 📋 Estados que Generan Notificaciones

1. **Nueva Reparación** - Al crear una nueva orden de reparación
2. **Modificación** - Al agregar diagnóstico (pasa a "En proceso")
3. **Finalizada** - Cuando la reparación está lista para retirar
4. **Entregada** - Cuando el cliente retira su equipo

## � Cómo Funciona

Cuando realizas cualquiera de las acciones anteriores:

1. Se abre automáticamente una nueva pestaña de WhatsApp Web
2. El mensaje ya está escrito y personalizado con los datos del cliente
3. **Solo tienes que hacer click en "Enviar"** ✅
4. El número del cliente ya está seleccionado automáticamente

## 📱 Ventajas de Este Sistema

✅ **Gratis** - No requiere API de pago ni suscripciones
✅ **Simple** - No necesitas configurar nada en Twilio
✅ **Control** - Tú decides si envías o no el mensaje
✅ **Personalizable** - Puedes editar el mensaje antes de enviar
✅ **Sin límites** - Envía tantos mensajes como quieras

## 📨 Plantillas de Mensajes

### Nueva Reparación
```
*[Nombre del Local]*

Hemos recibido tu [Equipo]

Comprobante N°: *000123*

Revisaremos tu equipo y te mantendremos informado del estado de la reparación.

Puedes descargar tu comprobante aquí:
[URL del PDF]

Gracias por confiar en nosotros!
```

### Modificación (Diagnóstico agregado)
```
*[Nombre del Local]*

Actualización de tu reparación

Comprobante N°: *000123*
Estado: *En proceso*

DIAGNÓSTICO:
[Descripción del problema y solución propuesta]

Monto estimado: *$15,000*

Por favor confirma si deseas continuar con la reparación.

Quedamos atentos a tu respuesta.
```

### Finalizada
```
*[Nombre del Local]*

Buenas noticias! Tu [Equipo] está listo

Comprobante N°: *000123*

Ya puedes pasar a retirarlo en nuestro local.

Te esperamos!
```

### Entregada
```
*[Nombre del Local]*

Gracias por retirar tu [Equipo]

Comprobante N°: *000123*

Esperamos que todo funcione perfectamente.

Gracias por confiar en nosotros!
```

## � Requisitos

- Tener WhatsApp instalado en tu teléfono
- Tener WhatsApp Web vinculado a tu cuenta
- Permitir que el navegador abra WhatsApp Web

## 📝 Formato de Números

El sistema formatea automáticamente los números argentinos:
- `3415071726` → Se convierte en formato internacional
- `03415071726` → Se elimina el 0 y se formatea
- El código de país (+54) se agrega automáticamente

## 💡 Consejos de Uso

1. **Mantén WhatsApp Web abierto** durante tu jornada laboral
2. **Revisa el mensaje** antes de enviarlo (puedes editarlo)
3. **Cierra las pestañas** después de enviar cada mensaje
4. **Verifica el número** del cliente antes de enviar

## � Flujo Completo

```
1. Usuario crea una reparación
   ↓
2. Se genera el PDF del comprobante
   ↓
3. Se abre WhatsApp Web automáticamente
   ↓
4. Mensaje pre-llenado con datos del cliente
   ↓
5. Tú haces click en "Enviar"
   ↓
6. Cliente recibe la notificación ✅
```

## 🎨 Personalización

Para modificar las plantillas de mensajes, edita el archivo:
`/lib/whatsapp.ts`

Las plantillas están en el objeto `plantillasWhatsApp` y puedes cambiar:
- Emojis
- Textos
- Formato
- Agregar información adicional

## 🐛 Troubleshooting

### No se abre WhatsApp Web

- Verifica que tu navegador permita abrir pop-ups
- Asegúrate de que WhatsApp Web esté vinculado
- Prueba con otro navegador (Chrome funciona mejor)

### Número incorrecto

- Verifica que el número del cliente esté completo
- Debe tener 10 dígitos (sin el 0 inicial)
- Ejemplo válido: `3415071726`

### Mensaje vacío

- Verifica que la configuración del local esté completa
- El nombre del local es necesario para las plantillas

