import { supabase } from '../supabase';
import { SuscripcionCurso } from '../../types/database';

export interface SuscripcionPendiente extends SuscripcionCurso {
  curso?: {
    id: string;
    titulo: string;
    descripcion: string | null;
  };
  usuario?: {
    id: string;
    email: string;
  };
}

/**
 * Verificar si el usuario es admin
 */
export async function esAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('es_admin')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.es_admin;
}

/**
 * Obtener todas las solicitudes de suscripción pendientes
 */
export async function getSuscripcionesPendientes(): Promise<SuscripcionPendiente[]> {
  const { data, error } = await supabase
    .from('suscripciones_curso')
    .select(`
      *,
      cursos(id, titulo, descripcion),
      perfiles!suscripciones_curso_user_id_fkey(id)
    `)
    .eq('acceso_otorgado', false)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Necesitamos obtener el email del usuario desde auth.users
  // Esto requeriría una función en Supabase o consultar por separado
  const suscripcionesFormateadas = data.map((suscripcion: any) => ({
    ...suscripcion,
    curso: suscripcion.cursos,
    usuario: suscripcion.perfiles,
  }));

  return suscripcionesFormateadas;
}

/**
 * Otorgar acceso a un curso
 */
export async function otorgarAcceso(suscripcionId: string): Promise<void> {
  const { error } = await supabase
    .from('suscripciones_curso')
    .update({ acceso_otorgado: true })
    .eq('id', suscripcionId);

  if (error) throw error;
}

/**
 * Rechazar solicitud de acceso
 */
export async function rechazarAcceso(suscripcionId: string): Promise<void> {
  const { error } = await supabase
    .from('suscripciones_curso')
    .delete()
    .eq('id', suscripcionId);

  if (error) throw error;
}

