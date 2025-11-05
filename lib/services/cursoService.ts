import { supabase } from '../supabase';
import { Curso, CursoConProgreso, Leccion, ProgresoUsuario } from '../../types/database';

/**
 * Obtener todos los cursos con progreso del usuario
 */
export async function getCursosConProgreso(userId: string): Promise<CursoConProgreso[]> {
  try {
    // Obtener cursos
    const { data: cursos, error: cursosError } = await supabase
      .from('cursos')
      .select('*')
      .order('created_at', { ascending: false });

    if (cursosError) throw cursosError;

    // Obtener suscripciones del usuario
    const { data: suscripciones } = await supabase
      .from('suscripciones_curso')
      .select('curso_id, acceso_otorgado')
      .eq('user_id', userId);

    // Obtener progreso del usuario
    const { data: progreso } = await supabase
      .from('progreso_usuario')
      .select('leccion_id, completada')
      .eq('user_id', userId)
      .eq('completada', true);

    // Obtener todas las lecciones con sus curso_id
    const { data: todasLasLecciones } = await supabase
      .from('lecciones')
      .select('id, curso_id');

    // Obtener IDs de lecciones completadas
    const leccionesCompletadasIds = new Set(
      progreso?.map(p => p.leccion_id) || []
    );

    // Calcular progreso para cada curso
    const cursosConProgreso: CursoConProgreso[] = cursos.map((curso) => {
      // Filtrar lecciones del curso
      const leccionesDelCurso = todasLasLecciones?.filter(
        l => l.curso_id === curso.id
      ) || [];
      
      const leccionesCount = leccionesDelCurso.length;
      
      // Contar lecciones completadas del curso
      const leccionesCompletadasDelCurso = leccionesDelCurso.filter(
        l => leccionesCompletadasIds.has(l.id)
      ).length;

      const progresoCalculado = leccionesCount > 0 
        ? (leccionesCompletadasDelCurso / leccionesCount) * 100 
        : 0;

      return {
        ...curso,
        progreso: progresoCalculado,
        lecciones_count: leccionesCount,
        lecciones_completadas: leccionesCompletadasDelCurso,
      };
    });

    return cursosConProgreso;
  } catch (error: any) {
    console.error('Error obteniendo cursos:', error);
    throw error;
  }
}

/**
 * Obtener curso por ID
 */
export async function getCursoPorId(cursoId: string): Promise<Curso | null> {
  const { data, error } = await supabase
    .from('cursos')
    .select('*')
    .eq('id', cursoId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtener lecciones de un curso
 */
export async function getLeccionesPorCurso(cursoId: string): Promise<Leccion[]> {
  const { data, error } = await supabase
    .from('lecciones')
    .select('*')
    .eq('curso_id', cursoId)
    .order('orden', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Solicitar acceso a un curso
 */
export async function solicitarAccesoCurso(userId: string, cursoId: string): Promise<void> {
  const { error } = await supabase
    .from('suscripciones_curso')
    .insert({
      user_id: userId,
      curso_id: cursoId,
      acceso_otorgado: false,
    });

  if (error) throw error;
}

/**
 * Obtener progreso del curso para un usuario
 */
export async function getProgresoCurso(userId: string, cursoId: string): Promise<number> {
  // Obtener total de lecciones del curso
  const { data: lecciones } = await supabase
    .from('lecciones')
    .select('id')
    .eq('curso_id', cursoId);

  if (!lecciones || lecciones.length === 0) return 0;

  // Obtener lecciones completadas
  const leccionesIds = lecciones.map(l => l.id);
  const { data: progreso } = await supabase
    .from('progreso_usuario')
    .select('leccion_id')
    .eq('user_id', userId)
    .eq('completada', true)
    .in('leccion_id', leccionesIds);

  const completadas = progreso?.length || 0;
  return (completadas / lecciones.length) * 100;
}

/**
 * Marcar lección como completada
 */
export async function marcarLeccionCompletada(
  userId: string, 
  leccionId: string
): Promise<void> {
  const { error } = await supabase
    .from('progreso_usuario')
    .upsert({
      user_id: userId,
      leccion_id: leccionId,
      completada: true,
    }, {
      onConflict: 'user_id,leccion_id'
    });

  if (error) throw error;
}

