import { supabase } from '../supabase';
import { PreguntaLeccion } from '../../types/database';

export interface PreguntaConUsuario extends PreguntaLeccion {
  usuario?: {
    id: string;
    email?: string;
  };
}

/**
 * Obtener preguntas de una lección
 */
export async function getPreguntasPorLeccion(leccionId: string): Promise<PreguntaConUsuario[]> {
  const { data, error } = await supabase
    .from('preguntas_leccion')
    .select('*')
    .eq('leccion_id', leccionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Crear una nueva pregunta
 */
export async function crearPregunta(
  leccionId: string,
  userId: string,
  pregunta: string
): Promise<PreguntaLeccion> {
  const { data, error } = await supabase
    .from('preguntas_leccion')
    .insert({
      leccion_id: leccionId,
      user_id: userId,
      pregunta: pregunta.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Responder una pregunta (solo admins)
 */
export async function responderPregunta(
  preguntaId: string,
  respuesta: string
): Promise<void> {
  const { error } = await supabase
    .from('preguntas_leccion')
    .update({
      respuesta_admin: respuesta.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', preguntaId);

  if (error) throw error;
}

