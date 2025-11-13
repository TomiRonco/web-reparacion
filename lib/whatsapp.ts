// Servicio de notificaciones de WhatsApp
// Abre WhatsApp Web con el mensaje predefinido

export interface WhatsAppMessage {
  to: string // Número de teléfono con código de país (ej: +5493415071726)
  message: string
}

// Plantillas de mensajes para cada estado
export const plantillasWhatsApp = {
  nueva_reparacion: (numeroComprobante: string, tipoEquipo: string, nombreLocal: string, comprobanteURL?: string) => {
    let mensaje = `*${nombreLocal}*\n\n` +
      `Hemos recibido tu ${tipoEquipo}\n\n` +
      `Comprobante N°: *${numeroComprobante}*\n\n` +
      `Revisaremos tu equipo y te mantendremos informado del estado de la reparación.\n\n`
    
    if (comprobanteURL) {
      mensaje += `Puedes descargar tu comprobante aquí:\n${comprobanteURL}\n\n`
    }
    
    mensaje += `Gracias por confiar en nosotros!`
    return mensaje
  },

  modificacion: (numeroComprobante: string, diagnostico: string, monto: number, nombreLocal: string) =>
    `*${nombreLocal}*\n\n` +
    `Actualización de tu reparación\n\n` +
    `Comprobante N°: *${numeroComprobante}*\n` +
    `Estado: *En proceso*\n\n` +
    `DIAGNÓSTICO:\n${diagnostico}\n\n` +
    `Monto estimado: *$${monto.toLocaleString('es-AR')}*\n\n` +
    `Por favor confirma si deseas continuar con la reparación.\n\n` +
    `Quedamos atentos a tu respuesta.`,

  finalizada: (numeroComprobante: string, tipoEquipo: string, nombreLocal: string) =>
    `*${nombreLocal}*\n\n` +
    `Buenas noticias! Tu ${tipoEquipo} está listo\n\n` +
    `Comprobante N°: *${numeroComprobante}*\n\n` +
    `Ya puedes pasar a retirarlo en nuestro local.\n\n` +
    `Te esperamos!`,

  entregada: (numeroComprobante: string, tipoEquipo: string, nombreLocal: string) =>
    `*${nombreLocal}*\n\n` +
    `Gracias por retirar tu ${tipoEquipo}\n\n` +
    `Comprobante N°: *${numeroComprobante}*\n\n` +
    `Esperamos que todo funcione perfectamente.\n\n` +
    `GARANTÍA: Tu equipo cuenta con garantía por el trabajo realizado.\n\n` +
    `Si tuviste una buena experiencia, nos ayudaría mucho que nos dejes una reseña en Google:\n` +
    `https://g.co/kgs/8F7xMpS\n\n` +
    `Gracias por confiar en nosotros!`
}

// Función para abrir WhatsApp Web con el mensaje predefinido
export function abrirWhatsApp(data: WhatsAppMessage): void {
  try {
    // Validar que el número tenga el formato correcto
    let phoneNumber = data.to.replace(/[\s\-\(\)]/g, '') // Remover espacios y caracteres
    
    // Si empieza con 0, removerlo
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1)
    }
    
    // Si no tiene código de país, agregar 54 (Argentina)
    if (!phoneNumber.startsWith('54') && !phoneNumber.startsWith('+')) {
      phoneNumber = '54' + phoneNumber
    }
    
    // Remover el + si existe (la URL no lo necesita)
    phoneNumber = phoneNumber.replace('+', '')
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(data.message)
    
    // Crear la URL de WhatsApp Web
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${mensajeCodificado}`
    
    // Abrir en una nueva pestaña
    window.open(whatsappURL, '_blank')
  } catch (error) {
    console.error('Error al abrir WhatsApp:', error)
  }
}

// Función para formatear número de teléfono argentino
export function formatearTelefonoArgentino(telefono: string): string {
  // Remover espacios, guiones y paréntesis
  let numero = telefono.replace(/[\s\-\(\)]/g, '')
  
  // Si empieza con 0, removerlo
  if (numero.startsWith('0')) {
    numero = numero.substring(1)
  }
  
  // Si no tiene código de país, agregar +54 (Argentina)
  if (!numero.startsWith('+')) {
    // Si empieza con 54, agregar solo el +
    if (numero.startsWith('54')) {
      numero = '+' + numero
    } else {
      // Si no, agregar +54
      numero = '+54' + numero
    }
  }
  
  return numero
}
