import { supabase } from '../supabase';

export interface MaterialLeccion {
  id: string;
  leccion_id: string;
  nombre_archivo: string;
  url_archivo: string;
  tipo_archivo: string;
  descripcion: string | null;
  orden: number;
}

/**
 * Obtener materiales adicionales de una lección
 */
export async function getMaterialesPorLeccion(leccionId: string): Promise<MaterialLeccion[]> {
  const { data, error } = await supabase
    .from('materiales_leccion')
    .select('*')
    .eq('leccion_id', leccionId)
    .order('orden', { ascending: true });

  if (error) {
    console.error('Error obteniendo materiales:', error);
    throw error;
  }

  return (data || []).map((material: any) => ({
    id: material.id,
    leccion_id: material.leccion_id,
    nombre_archivo: material.nombre_archivo,
    url_archivo: material.url_archivo,
    tipo_archivo: material.tipo_archivo,
    descripcion: material.descripcion,
    orden: material.orden || 0,
  }));
}


