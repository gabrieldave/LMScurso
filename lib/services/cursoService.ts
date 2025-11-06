import { supabase } from '../supabase';
import { Curso, CursoConProgreso, Leccion } from '../../types/database';

/**
 * Obtener todos los cursos con progreso del usuario
 */
export async function getCursosConProgreso(userEmail: string): Promise<CursoConProgreso[]> {
  try {
    console.log('📚 Obteniendo cursos para:', userEmail);
    
    // Obtener cursos desde courses_lms_movil
    const { data: cursos, error: cursosError } = await supabase
      .from('courses_lms_movil')
      .select('*')
      .order('created_at', { ascending: false });

    if (cursosError) {
      console.error('❌ Error obteniendo cursos:', cursosError);
      throw cursosError;
    }

    if (!cursos || cursos.length === 0) {
      console.log('⚠️ No se encontraron cursos');
      return [];
    }

    console.log('✅ Cursos encontrados:', cursos.length);

    // Obtener enrollments del usuario
    const { data: enrollments } = await supabase
      .from('user_course_enrollments_lms_movil')
      .select('course_id, progress')
      .eq('email', userEmail);

    // Obtener lecciones completadas del usuario
    const { data: completions } = await supabase
      .from('user_lesson_completions_lms_movil')
      .select('course_id, lesson_id, completed')
      .eq('email', userEmail)
      .eq('completed', true);

    // Obtener todas las lecciones con sus course_id
    const { data: todasLasLecciones } = await supabase
      .from('lessons_lms_movil')
      .select('id, course_id');

    // Asegurar que sean arrays
    const leccionesArray = Array.isArray(todasLasLecciones) ? todasLasLecciones : [];
    const completionsArray = Array.isArray(completions) ? completions : [];
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];

    // Calcular progreso para cada curso
    const cursosConProgreso: CursoConProgreso[] = cursos.map((curso: any) => {
      const cursoIdStr = String(curso.id);
      
      // Filtrar lecciones del curso
      const leccionesDelCurso = leccionesArray.filter(
        (l: any) => l && l.course_id && String(l.course_id) === cursoIdStr
      );
      const leccionesCount = leccionesDelCurso.length;
      
      // Contar lecciones completadas
      const leccionesCompletadasDelCurso = completionsArray.filter(
        (c: any) => c && c.course_id && String(c.course_id) === cursoIdStr
      ).length;

      // Usar progress del enrollment si existe, sino calcular
      const enrollment = enrollmentsArray.find(
        (e: any) => e && e.course_id && String(e.course_id) === cursoIdStr
      );
      const progresoCalculado = (enrollment && typeof enrollment.progress === 'number') 
        ? enrollment.progress 
        : (leccionesCount > 0 
          ? Math.round((leccionesCompletadasDelCurso / leccionesCount) * 100)
          : 0);

      return {
        id: String(curso.id),
        titulo: curso.title || 'Sin título',
        descripcion: curso.description || null,
        url_portada: curso.image_url || null,
        created_at: curso.created_at || new Date().toISOString(),
        updated_at: curso.updated_at || new Date().toISOString(),
        progreso: progresoCalculado,
        lecciones_count: leccionesCount,
        lecciones_completadas: leccionesCompletadasDelCurso,
      };
    });

    return cursosConProgreso;
  } catch (error: any) {
    console.error('❌ Error obteniendo cursos:', error);
    throw error;
  }
}

/**
 * Obtener curso por ID
 */
export async function getCursoPorId(cursoId: string): Promise<Curso | null> {
  try {
    const courseIdStr = String(cursoId);
    console.log('🔍 Buscando curso con ID:', courseIdStr);
    
    const { data, error } = await supabase
      .from('courses_lms_movil')
      .select('*')
      .eq('id', courseIdStr)
      .single();

    if (error) {
      console.error('❌ Error obteniendo curso:', error);
      return null;
    }

    if (!data) {
      console.log('⚠️ Curso no encontrado');
      return null;
    }

    console.log('✅ Curso encontrado:', data.title);

    return {
      id: String(data.id),
      titulo: data.title || 'Sin título',
      descripcion: data.description || null,
      url_portada: data.image_url || null,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('❌ Error en getCursoPorId:', error);
    return null;
  }
}

/**
 * Obtener lecciones de un curso con estado de completadas
 */
export async function getLeccionesPorCursoConEstado(
  cursoId: string, 
  userEmail: string
): Promise<(Leccion & { completada: boolean; duration?: number })[]> {
  try {
    const courseIdStr = String(cursoId);
    console.log('🔍 Buscando lecciones para curso:', courseIdStr);
    
    // Obtener lecciones
    const { data, error } = await supabase
      .from('lessons_lms_movil')
      .select('*')
      .eq('course_id', courseIdStr)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo lecciones:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron lecciones');
      return [];
    }

    console.log('✅ Lecciones encontradas:', data.length);

    // Obtener lecciones completadas del usuario
    let leccionesCompletadasIds = new Set<string>();
    try {
      const { data: completions } = await supabase
        .from('user_lesson_completions_lms_movil')
        .select('lesson_id')
        .eq('email', userEmail)
        .eq('course_id', courseIdStr)
        .eq('completed', true);

      if (completions && Array.isArray(completions)) {
        leccionesCompletadasIds = new Set(completions.map((c: any) => c.lesson_id));
      }
    } catch (completionsErr) {
      console.warn('⚠️ Error obteniendo completions:', completionsErr);
    }

    // Mapear a formato Leccion con estado
    const leccionesMapeadas = data.map((lesson: any) => {
      const tieneVideo = lesson.video_url && lesson.video_url.trim() !== '';
      
      return {
        id: String(lesson.id),
        curso_id: String(lesson.course_id),
        titulo_leccion: lesson.title || 'Sin título',
        url_contenido: lesson.video_url || '',
        tipo_contenido: tieneVideo ? 'VIDEO' : 'PDF',
        orden: lesson.order_index !== null && lesson.order_index !== undefined ? lesson.order_index : 0,
        created_at: lesson.created_at || new Date().toISOString(),
        updated_at: lesson.updated_at || lesson.created_at || new Date().toISOString(),
        completada: leccionesCompletadasIds.has(String(lesson.id)),
        duration: lesson.duration || null,
      };
    });

    console.log('📦 Lecciones mapeadas:', leccionesMapeadas.length);
    return leccionesMapeadas;
  } catch (error: any) {
    console.error('❌ Error en getLeccionesPorCursoConEstado:', error);
    throw error;
  }
}

/**
 * Obtener lecciones de un curso (sin estado de completadas)
 */
export async function getLeccionesPorCurso(cursoId: string): Promise<Leccion[]> {
  try {
    const courseIdStr = String(cursoId);
    console.log('🔍 Buscando lecciones (sin estado) para curso:', courseIdStr);
    
    const { data, error } = await supabase
      .from('lessons_lms_movil')
      .select('*')
      .eq('course_id', courseIdStr)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo lecciones:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((lesson: any) => {
      const tieneVideo = lesson.video_url && lesson.video_url.trim() !== '';
      
      return {
        id: String(lesson.id),
        curso_id: String(lesson.course_id),
        titulo_leccion: lesson.title || 'Sin título',
        url_contenido: lesson.video_url || '',
        tipo_contenido: tieneVideo ? 'VIDEO' : 'PDF',
        orden: lesson.order_index !== null && lesson.order_index !== undefined ? lesson.order_index : 0,
        created_at: lesson.created_at || new Date().toISOString(),
        updated_at: lesson.updated_at || lesson.created_at || new Date().toISOString(),
      };
    });
  } catch (error: any) {
    console.error('❌ Error en getLeccionesPorCurso:', error);
    throw error;
  }
}

/**
 * Solicitar acceso a un curso (crear enrollment)
 */
export async function solicitarAccesoCurso(userEmail: string, cursoId: string): Promise<void> {
  try {
    const courseIdStr = String(cursoId);
    console.log('📝 Solicitando acceso:', { email: userEmail, course_id: courseIdStr });
    
    // Verificar si ya existe un enrollment
    const { data: existing } = await supabase
      .from('user_course_enrollments_lms_movil')
      .select('id')
      .eq('email', userEmail)
      .eq('course_id', courseIdStr)
      .single();

    if (existing) {
      console.log('✅ Ya tiene acceso al curso');
      return; // Ya tiene acceso, no hacer nada
    }

    // Insertar nuevo enrollment
    // Nota: El campo 'id' se genera automáticamente con uuid_generate_v4()
    const { data, error } = await supabase
      .from('user_course_enrollments_lms_movil')
      .insert({
        email: userEmail,
        course_id: courseIdStr,
        enrolled_at: new Date().toISOString(),
        progress: 0,
      })
      .select();

    if (error) {
      console.error('❌ Error solicitando acceso:', error);
      console.error('❌ Código del error:', error.code);
      console.error('❌ Detalles del error:', JSON.stringify(error, null, 2));
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al solicitar acceso al curso';
      if (error.code === '42501') {
        errorMessage = 'No tienes permisos para solicitar acceso. Contacta al administrador.';
      } else if (error.code === '23505') {
        errorMessage = 'Ya tienes acceso a este curso';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
    
    console.log('✅ Acceso solicitado correctamente:', data);
  } catch (error: any) {
    console.error('❌ Error en solicitarAccesoCurso:', error);
    throw error;
  }
}

/**
 * Verificar si el usuario tiene acceso a un curso
 */
export async function tieneAccesoCurso(userEmail: string, cursoId: string): Promise<boolean> {
  try {
    const courseIdStr = String(cursoId);
    console.log('🔍 Verificando acceso:', { email: userEmail, course_id: courseIdStr });
    
    const { data, error } = await supabase
      .from('user_course_enrollments_lms_movil')
      .select('id')
      .eq('email', userEmail)
      .eq('course_id', courseIdStr)
      .single();

    const tieneAcceso = !!data;
    console.log('✅ Tiene acceso:', tieneAcceso);
    
    return tieneAcceso;
  } catch (error: any) {
    // Si no encuentra registro, no tiene acceso
    console.log('⚠️ No tiene acceso o error:', error);
    return false;
  }
}

/**
 * Marcar lección como completada
 */
export async function marcarLeccionCompletada(
  userEmail: string,
  cursoId: string,
  leccionId: string
): Promise<void> {
  try {
    console.log('✅ Marcando lección como completada:', { email: userEmail, course_id: cursoId, lesson_id: leccionId });
    
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('user_lesson_completions_lms_movil')
      .select('id')
      .eq('email', userEmail)
      .eq('course_id', String(cursoId))
      .eq('lesson_id', String(leccionId))
      .single();

    if (existing) {
      // Actualizar
      const { error } = await supabase
        .from('user_lesson_completions_lms_movil')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('email', userEmail)
        .eq('course_id', String(cursoId))
        .eq('lesson_id', String(leccionId));

      if (error) throw error;
    } else {
      // Insertar
      const { error } = await supabase
        .from('user_lesson_completions_lms_movil')
        .insert({
          email: userEmail,
          course_id: String(cursoId),
          lesson_id: String(leccionId),
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
    }

    console.log('✅ Lección marcada como completada');
  } catch (error: any) {
    console.error('❌ Error marcando lección:', error);
    throw error;
  }
}

/**
 * Desmarcar lección como completada
 */
export async function desmarcarLeccionCompletada(
  userEmail: string,
  cursoId: string,
  leccionId: string
): Promise<void> {
  try {
    console.log('🔄 Desmarcando lección:', { email: userEmail, course_id: cursoId, lesson_id: leccionId });
    
    // Actualizar a completada = false
    const { error } = await supabase
      .from('user_lesson_completions_lms_movil')
      .update({ completed: false, completed_at: null })
      .eq('email', userEmail)
      .eq('course_id', String(cursoId))
      .eq('lesson_id', String(leccionId));

    if (error) {
      // Si no existe el registro, no hay problema
      if (error.code !== 'PGRST116') {
        throw error;
      }
    }

    console.log('✅ Lección desmarcada');
  } catch (error: any) {
    console.error('❌ Error desmarcando lección:', error);
    throw error;
  }
}
