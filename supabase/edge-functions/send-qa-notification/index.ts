// Supabase Edge Function para enviar notificaciones por email
// cuando se crea una nueva pregunta

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const EMAIL_TO = 'todossomostr4ders@gmail.com'

serve(async (req) => {
  try {
    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtener datos del webhook/trigger
    const { record } = await req.json()

    // Obtener información de la lección y usuario
    const { data: leccion } = await supabaseClient
      .from('lecciones')
      .select('titulo_leccion, curso_id, cursos(titulo)')
      .eq('id', record.leccion_id)
      .single()

    const { data: usuario } = await supabaseClient
      .from('perfiles')
      .select('*')
      .eq('id', record.user_id)
      .single()

    // Preparar el email
    const emailSubject = `Nueva pregunta en: ${leccion?.titulo_leccion || 'Lección'}`
    const emailBody = `
      Nueva pregunta recibida:
      
      Curso: ${leccion?.cursos?.titulo || 'N/A'}
      Lección: ${leccion?.titulo_leccion || 'N/A'}
      Usuario: ${usuario?.id || 'N/A'}
      
      Pregunta:
      ${record.pregunta}
      
      Puedes responder en el panel de administración de la aplicación.
    `

    // Enviar email usando Resend (o el servicio que prefieras)
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'noreply@tu-dominio.com',
          to: EMAIL_TO,
          subject: emailSubject,
          text: emailBody,
        }),
      })

      if (!resendResponse.ok) {
        throw new Error('Error al enviar email')
      }
    } else {
      // Fallback: usar console.log si no hay API key configurada
      console.log('Email que se enviaría:', emailSubject, emailBody)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notificación enviada' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

