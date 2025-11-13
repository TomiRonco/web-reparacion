# Configuración de Notificaciones de WhatsApp

Este proyecto utiliza **Twilio** para enviar notificaciones automáticas de WhatsApp a los clientes en diferentes estados de la reparación.

## 📋 Estados que Envían Notificaciones

1. **Nueva Reparación** - Cuando se crea una nueva orden de reparación
2. **Modificación** - Cuando se agrega el diagnóstico y pasa a "En proceso"
3. **Finalizada** - Cuando la reparación está lista para retirar
4. **Entregada** - Cuando el cliente retira su equipo

## 🔧 Configuración de Twilio

### Paso 1: Crear Cuenta en Twilio

1. Visita [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Crea una cuenta gratuita (incluye crédito de prueba)
3. Verifica tu número de teléfono

### Paso 2: Configurar WhatsApp Sandbox

1. En el dashboard de Twilio, ve a **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Sigue las instrucciones para activar el Sandbox:
   - Envía el código que te dan a un número de WhatsApp
   - Por ejemplo: "join [código]" al número +1 415 523 8886
3. Anota el número de WhatsApp de Twilio (formato: `whatsapp:+14155238886`)

### Paso 3: Obtener Credenciales

1. En el dashboard de Twilio, ve a **Account** > **API keys & tokens**
2. Copia tu **Account SID**
3. Copia tu **Auth Token**

### Paso 4: Configurar Variables de Entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```bash
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 📱 Formato de Números de Teléfono

Los números se formatean automáticamente para Argentina:
- Si empieza con `0`, se elimina
- Si no tiene código de país, se agrega `+54`
- Ejemplos:
  - `3415071726` → `+543415071726`
  - `03415071726` → `+543415071726`
  - `+543415071726` → `+543415071726`

## 📨 Plantillas de Mensajes

### Nueva Reparación
```
🔧 *[Nombre del Local]*

✅ Hemos recibido tu [Equipo]

📋 Comprobante N°: *000123*

Revisaremos tu equipo y te mantendremos informado del estado de la reparación.

Gracias por confiar en nosotros! 🙌
```

### Modificación (Diagnóstico agregado)
```
🔧 *[Nombre del Local]*

📝 Actualización de tu reparación

📋 Comprobante N°: *000123*
Estado: *En proceso*

Te mantendremos informado de cualquier novedad.
```

### Finalizada
```
🔧 *[Nombre del Local]*

✅ ¡Buenas noticias! Tu [Equipo] está listo

📋 Comprobante N°: *000123*

Ya puedes pasar a retirarlo en nuestro local.

¡Te esperamos! 🎉
```

### Entregada
```
🔧 *[Nombre del Local]*

✅ Gracias por retirar tu [Equipo]

📋 Comprobante N°: *000123*

Esperamos que todo funcione perfectamente.

¡Gracias por confiar en nosotros! 🙏
```

## 🚀 Producción

Para usar WhatsApp en producción (no sandbox):

1. **Solicitar Acceso a la API de WhatsApp Business**
   - En Twilio, ve a **Messaging** > **WhatsApp** > **Request Access**
   - Completa el formulario de solicitud
   - Espera la aprobación (puede tomar varios días)

2. **Verificar tu Negocio**
   - Necesitarás verificar tu negocio con Facebook
   - Proporcionar documentación legal de tu empresa

3. **Configurar Plantillas Aprobadas**
   - Las plantillas de mensajes deben ser aprobadas por WhatsApp
   - Envía tus plantillas para revisión en el dashboard de Twilio

4. **Actualizar el Número de WhatsApp**
   - Una vez aprobado, actualiza `TWILIO_WHATSAPP_NUMBER` con tu número oficial

## 💰 Costos

- **Sandbox (Pruebas)**: Gratuito (usa el crédito de prueba)
- **Producción**: 
  - WhatsApp Business API: ~$0.005 - $0.02 por mensaje (varía por país)
  - Twilio incluye $15 de crédito gratuito al registrarte

## 🔍 Testing

Para probar las notificaciones en desarrollo:

1. Activa el Sandbox de WhatsApp
2. Envía el código de activación desde tu WhatsApp
3. Crea una reparación de prueba con tu número de teléfono
4. Verifica que recibas el mensaje

## 🐛 Troubleshooting

### No llegan los mensajes

1. Verifica que las credenciales sean correctas en `.env.local`
2. Asegúrate de haber activado el Sandbox
3. Revisa que el número tenga el formato correcto
4. Verifica los logs en la consola del navegador
5. Revisa los logs de Twilio en su dashboard

### Error de autenticación

- Verifica que `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` sean correctos
- Regenera el Auth Token si es necesario

### Formato de número incorrecto

- Usa el formato internacional: `+[código país][número]`
- Para Argentina: `+54` seguido del número sin el `0` inicial

## 📚 Recursos

- [Documentación de Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Twilio Console](https://console.twilio.com/)
- [Pricing de WhatsApp](https://www.twilio.com/whatsapp/pricing)
