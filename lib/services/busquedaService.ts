import { supabase } from '../supabase';
import { Curso, Leccion } from '../../types/database';

export interface ResultadoBusqueda {
  cursos: Curso[];
  lecciones: (Leccion & { curso_titulo?: string })[];
}

/**
 * Búsqueda global en cursos y lecciones
 */
export async function buscarGlobal(termino: string): Promise<ResultadoBusqueda> {
  if (!termino || termino.trim().length === 0) {
    return { cursos: [], lecciones: [] };
  }

  const searchTerm = `%${termino.trim()}%`;

  try {
    // Buscar en cursos
    const { data: cursos, error: cursosError } = await supabase
      .from('cursos')
      .select('*')
      .ilike('titulo', searchTerm)
      .order('created_at', { ascending: false });

    if (cursosError) throw cursosError;

    // Buscar en lecciones
    const { data: lecciones, error: leccionesError } = await supabase
      .from('lecciones')
      .select('*, cursos(titulo)')
      .ilike('titulo_leccion', searchTerm)
      .order('orden', { ascending: true });

    if (leccionesError) throw leccionesError;

    // Formatear lecciones con título del curso
    const leccionesFormateadas = lecciones.map((leccion: any) => ({
      ...leccion,
      curso_titulo: leccion.cursos?.titulo,
    }));

    return {
      cursos: cursos || [],
      lecciones: leccionesFormateadas,
    };
  } catch (error: any) {
    console.error('Error en búsqueda:', error);
    throw error;
  }
}

