export interface Perfil {
  id: string;
  es_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Curso {
  id: string;
  titulo: string;
  descripcion: string | null;
  url_portada: string | null;
  created_at: string;
  updated_at: string;
}

export interface Leccion {
  id: string;
  curso_id: string;
  titulo_leccion: string;
  url_contenido: string;
  tipo_contenido: 'VIDEO' | 'PDF';
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface SuscripcionCurso {
  id: string;
  user_id: string;
  curso_id: string;
  acceso_otorgado: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgresoUsuario {
  id: string;
  user_id: string;
  leccion_id: string;
  completada: boolean;
  created_at: string;
  updated_at: string;
}

export interface PreguntaLeccion {
  id: string;
  leccion_id: string;
  user_id: string;
  pregunta: string;
  respuesta_admin: string | null;
  created_at: string;
  updated_at: string;
}

export interface CursoConProgreso extends Curso {
  progreso?: number;
  lecciones_count?: number;
  lecciones_completadas?: number;
}

