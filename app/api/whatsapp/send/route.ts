import { NextResponse } from 'next/server'
import twilio from 'twilio'

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER // Formato: whatsapp:+14155238886

export async function POST(request: Request) {
  try {
    // Verificar que las credenciales estén configuradas
    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      return NextResponse.json(
        { error: 'Credenciales de Twilio no configuradas' },
        { status: 500 }
      )
    }

    const { to, message } = await request.json()

    // Validar datos
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (to, message)' },
        { status: 400 }
      )
    }

    // Inicializar cliente de Twilio
    const client = twilio(accountSid, authToken)

    // Enviar mensaje
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioWhatsAppNumber,
      to: `whatsapp:${to}`, // Formato: whatsapp:+5493415071726
    })

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
    })
  } catch (error) {
    console.error('Error al enviar WhatsApp:', error)
    return NextResponse.json(
      {
        error: 'Error al enviar mensaje de WhatsApp',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
