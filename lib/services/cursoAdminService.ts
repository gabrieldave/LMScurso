import { supabase } from '../supabase';
import { Curso, Leccion } from '../../types/database';

/**
 * Crear un nuevo curso
 */
export async function crearCurso(
  titulo: string,
  descripcion?: string,
  urlPortada?: string
): Promise<Curso> {
  const { data, error } = await supabase
    .from('cursos')
    .insert({
      titulo,
      descripcion: descripcion || null,
      url_portada: urlPortada || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar un curso
 */
export async function actualizarCurso(
  cursoId: string,
  titulo?: string,
  descripcion?: string,
  urlPortada?: string
): Promise<Curso> {
  const updates: any = {};
  if (titulo !== undefined) updates.titulo = titulo;
  if (descripcion !== undefined) updates.descripcion = descripcion;
  if (urlPortada !== undefined) updates.url_portada = urlPortada;

  const { data, error } = await supabase
    .from('cursos')
    .update(updates)
    .eq('id', cursoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar un curso
 */
export async function eliminarCurso(cursoId: string): Promise<void> {
  const { error } = await supabase
    .from('cursos')
    .delete()
    .eq('id', cursoId);

  if (error) throw error;
}

/**
 * Obtener todos los cursos (para admin)
 */
export async function obtenerTodosLosCursos(): Promise<Curso[]> {
  const { data, error } = await supabase
    .from('cursos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Crear una nueva lección
 */
export async function crearLeccion(
  cursoId: string,
  tituloLeccion: string,
  urlContenido: string,
  tipoContenido: 'VIDEO' | 'PDF',
  orden: number
): Promise<Leccion> {
  const { data, error } = await supabase
    .from('lecciones')
    .insert({
      curso_id: cursoId,
      titulo_leccion: tituloLeccion,
      url_contenido: urlContenido,
      tipo_contenido: tipoContenido,
      orden,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar una lección
 */
export async function actualizarLeccion(
  leccionId: string,
  tituloLeccion?: string,
  urlContenido?: string,
  tipoContenido?: 'VIDEO' | 'PDF',
  orden?: number
): Promise<Leccion> {
  const updates: any = {};
  if (tituloLeccion !== undefined) updates.titulo_leccion = tituloLeccion;
  if (urlContenido !== undefined) updates.url_contenido = urlContenido;
  if (tipoContenido !== undefined) updates.tipo_contenido = tipoContenido;
  if (orden !== undefined) updates.orden = orden;

  const { data, error } = await supabase
    .from('lecciones')
    .update(updates)
    .eq('id', leccionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar una lección
 */
export async function eliminarLeccion(leccionId: string): Promise<void> {
  const { error } = await supabase
    .from('lecciones')
    .delete()
    .eq('id', leccionId);

  if (error) throw error;
}

/**
 * Obtener todas las lecciones de un curso
 */
export async function obtenerLeccionesPorCurso(cursoId: string): Promise<Leccion[]> {
  const { data, error } = await supabase
    .from('lecciones')
    .select('*')
    .eq('curso_id', cursoId)
    .order('orden', { ascending: true });

  if (error) throw error;
  return data || [];
}





