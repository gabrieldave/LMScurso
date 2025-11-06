import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { marcarLeccionCompletada, desmarcarLeccionCompletada, getLeccionesPorCurso } from '../../lib/services/cursoService';
import { getMaterialesPorLeccion } from '../../lib/services/materialService';
import { Leccion } from '../../types/database';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LeccionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [leccion, setLeccion] = useState<any>(null);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completada, setCompletada] = useState(false);
  const [indiceActual, setIndiceActual] = useState(-1);
  const [videoReproducido, setVideoReproducido] = useState(false);
  const [videoTerminado, setVideoTerminado] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  // Resetear estado del video cuando cambia la lección
  useEffect(() => {
    setVideoReproducido(false);
    setVideoTerminado(false);
    setPlaying(false);
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const userEmail = await AsyncStorage.getItem('user_email');

      if (!userEmail) {
        Alert.alert('Error', 'No hay sesión activa');
        router.replace('/(auth)/login');
        return;
      }

      console.log('🔍 Cargando lección ID:', id);

      // Obtener lección desde lessons_lms_movil
      const { data: leccionData, error: leccionError } = await supabase
        .from('lessons_lms_movil')
        .select('*')
        .eq('id', id)
        .single();

      if (leccionError) {
        console.error('❌ Error obteniendo lección:', leccionError);
        throw leccionError;
      }

      if (!leccionData) {
        Alert.alert('Error', 'Lección no encontrada');
        router.back();
        return;
      }

      console.log('✅ Lección encontrada:', leccionData.title);

      // Mapear datos de la lección
      const leccionMapeada = {
        id: leccionData.id,
        curso_id: String(leccionData.course_id),
        titulo_leccion: leccionData.title,
        descripcion: leccionData.description || leccionData.title,
        url_contenido: leccionData.video_url || '',
        duration: leccionData.duration || null,
        orden: leccionData.order_index || 0,
      };

      setLeccion(leccionMapeada);

      // Obtener todas las lecciones del curso para navegación
      const todasLecciones = await getLeccionesPorCurso(leccionMapeada.curso_id);
      setLecciones(todasLecciones);
      const indice = todasLecciones.findIndex(l => l.id === id);
      setIndiceActual(indice);

      // Obtener materiales adicionales
      try {
        const materialesData = await getMaterialesPorLeccion(id);
        setMateriales(materialesData);
      } catch (error) {
        console.log('No hay materiales disponibles');
        setMateriales([]);
      }

      // Verificar si está completada
      const { data: progreso } = await supabase
        .from('user_lesson_completions_lms_movil')
        .select('completed')
        .eq('email', userEmail)
        .eq('lesson_id', id)
        .single();

      const estaCompletada = progreso?.completed || false;
      setCompletada(estaCompletada);
      
      // Si está completada, marcar que el video ya fue visto
      if (estaCompletada) {
        setVideoTerminado(true);
      }
    } catch (error: any) {
      console.error('❌ Error cargando lección:', error);
      Alert.alert('Error', error.message || 'No se pudo cargar la lección');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarCompletada = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('user_email');
      if (!userEmail || !leccion) return;

      await marcarLeccionCompletada(userEmail, leccion.curso_id, leccion.id);
      setCompletada(true);
      setVideoTerminado(true);
    } catch (error: any) {
      console.error('Error marcando como completada:', error);
      Alert.alert('Error', 'No se pudo marcar la lección como completada');
    }
  };

  const handleDesmarcarCompletada = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('user_email');
      if (!userEmail || !leccion) return;

      await desmarcarLeccionCompletada(userEmail, leccion.curso_id, leccion.id);
      setCompletada(false);
      setVideoTerminado(false);
      setVideoReproducido(false);
    } catch (error: any) {
      console.error('Error desmarcando:', error);
      Alert.alert('Error', 'No se pudo desmarcar la lección');
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    // Limpiar la URL de espacios y caracteres especiales
    let cleanUrl = url.trim();
    
    // Remover protocolo si existe
    cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
    cleanUrl = cleanUrl.replace(/^www\./, '');
    
    // Si la URL ya es un embed, extraer el ID directamente
    if (cleanUrl.includes('youtube.com/embed/')) {
      const match = cleanUrl.match(/youtube\.com\/embed\/([^?&\/]+)/);
      if (match && match[1]) {
        const id = match[1].split('?')[0].split('&')[0].split('#')[0].split('/')[0].trim();
        if (id.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return id;
        }
      }
    }
    
    // Patrones para extraer el ID de YouTube (en orden de especificidad)
    const patterns = [
      // youtube.com/embed/ID
      /youtube\.com\/embed\/([^?&\/]+)/,
      // youtu.be/ID
      /youtu\.be\/([^?&\/]+)/,
      // youtube.com/watch?v=ID
      /youtube\.com\/watch\?v=([^&]+)/,
      // youtube.com/v/ID
      /youtube\.com\/v\/([^?&\/]+)/,
      // youtube.com/watch?feature=player_embedded&v=ID
      /[?&]v=([^&]+)/,
      // m.youtube.com/watch?v=ID
      /m\.youtube\.com\/watch\?v=([^&]+)/,
      // youtube.com/ID (formato corto)
      /youtube\.com\/([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        let id = match[1].split('?')[0].split('&')[0].split('#')[0].split('/')[0].trim();
        // Validar que el ID tenga 11 caracteres (formato estándar de YouTube)
        if (id.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
          console.log('✅ ID de YouTube extraído:', id, 'de URL:', url);
          return id;
        }
      }
    }
    
    // Si la URL es solo el ID (11 caracteres)
    if (cleanUrl.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      console.log('✅ ID de YouTube directo:', cleanUrl);
      return cleanUrl;
    }
    
    // Intentar extraer cualquier secuencia de 11 caracteres alfanuméricos que parezca un ID
    const idMatch = cleanUrl.match(/[a-zA-Z0-9_-]{11}/);
    if (idMatch && idMatch[0]) {
      const possibleId = idMatch[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(possibleId)) {
        console.log('✅ ID de YouTube encontrado por patrón:', possibleId, 'de URL:', url);
        return possibleId;
      }
    }
    
    console.warn('⚠️ No se pudo extraer el ID de YouTube de:', url);
    return null;
  };

  const onStateChange = (state: string) => {
    console.log('📺 Estado del video:', state);
    
    if (state === 'playing') {
      console.log('▶️ Video iniciado');
      setVideoReproducido(true);
      setPlaying(true);
      // Si estaba completada y vuelve a reproducir, desmarcar automáticamente
      if (completada) {
        console.log('🔄 Video ya estaba completado, desmarcando...');
        handleDesmarcarCompletada();
      }
    } else if (state === 'ended') {
      console.log('✅ Video terminado completamente');
      setVideoTerminado(true);
      setPlaying(false);
      // Marcar automáticamente como completada
      if (!completada) {
        console.log('✅ Marcando automáticamente como completada');
        handleMarcarCompletada();
      }
    } else if (state === 'paused') {
      setPlaying(false);
    }
  };

  const handleAbrirMaterial = async (url: string) => {
    try {
      // Si es un PDF, intentar abrirlo con el visor de PDFs
      if (url.toLowerCase().endsWith('.pdf') || url.includes('.pdf')) {
        // Abrir PDF en el navegador o visor de PDFs
        Linking.openURL(url).catch(err => {
          Alert.alert('Error', 'No se pudo abrir el PDF');
        });
      } else {
        // Otros tipos de archivo
        Linking.openURL(url).catch(err => {
          Alert.alert('Error', 'No se pudo abrir el material');
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el material');
    }
  };

  const handleAnteriorLeccion = () => {
    if (indiceActual > 0 && lecciones[indiceActual - 1]) {
      router.replace(`/leccion/${lecciones[indiceActual - 1].id}`);
    }
  };

  const handleSiguienteLeccion = () => {
    if (indiceActual < lecciones.length - 1 && lecciones[indiceActual + 1]) {
      router.replace(`/leccion/${lecciones[indiceActual + 1].id}`);
    }
  };

  const handleVolverAlCurso = () => {
    if (leccion) {
      router.push(`/curso/${leccion.curso_id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (!leccion) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Lección no encontrada</Text>
      </View>
    );
  }

  const youtubeId = leccion.url_contenido ? extractYouTubeId(leccion.url_contenido) : null;
  const tieneAnterior = indiceActual > 0;
  const tieneSiguiente = indiceActual < lecciones.length - 1;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Título de la lección */}
        <Text style={styles.titulo}>{leccion.titulo_leccion}</Text>

        {/* Información de la lección */}
        <View style={styles.infoContainer}>
          {leccion.duration && (
            <Text style={styles.infoText}>🕐 {leccion.duration} minutos</Text>
          )}
          <Text style={styles.infoText}>
            📋 Lección {indiceActual + 1} de {lecciones.length}
          </Text>
        </View>

        {/* Reproductor de video embebido */}
        {leccion.url_contenido && youtubeId ? (
          <View style={styles.videoContainer}>
            <YoutubePlayer
              height={220}
              videoId={youtubeId}
              play={playing}
              onChangeState={onStateChange}
              onError={(error) => {
                console.error('❌ Error en reproductor de YouTube:', error);
                Alert.alert(
                  'Error al reproducir video',
                  'No se pudo cargar el video. ¿Deseas abrirlo en YouTube?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Abrir en YouTube',
                      onPress: () => {
                        const youtubeUrl = leccion.url_contenido.includes('youtube.com') || leccion.url_contenido.includes('youtu.be')
                          ? leccion.url_contenido
                          : `https://www.youtube.com/watch?v=${youtubeId}`;
                        Linking.openURL(youtubeUrl).catch(err => {
                          Alert.alert('Error', 'No se pudo abrir YouTube');
                        });
                      },
                    },
                  ]
                );
              }}
              webViewStyle={{ opacity: 0.99 }}
              webViewProps={{
                androidLayerType: 'hardware',
              }}
            />
          </View>
        ) : leccion.url_contenido ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ URL de video no válida</Text>
            <Text style={styles.errorSubtext}>
              No se pudo extraer el ID de YouTube de la URL proporcionada.
            </Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                const url = leccion.url_contenido.startsWith('http')
                  ? leccion.url_contenido
                  : `https://${leccion.url_contenido}`;
                Linking.openURL(url).catch(err => {
                  Alert.alert('Error', 'No se pudo abrir el enlace');
                });
              }}
            >
              <Text style={styles.linkButtonText}>🔗 Abrir en navegador</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Descripción */}
        <View style={styles.descripcionContainer}>
          <Text style={styles.descripcionLabel}>Descripción</Text>
          <Text style={styles.descripcion}>{leccion.descripcion}</Text>
        </View>

        {/* Materiales PDF */}
        {materiales.length > 0 && (
          <View style={styles.materialesContainer}>
            <Text style={styles.materialesLabel}>📚 Materiales</Text>
            {materiales.map((material) => (
              <TouchableOpacity
                key={material.id}
                style={styles.materialItem}
                onPress={() => handleAbrirMaterial(material.url_archivo)}
              >
                <Text style={styles.materialIcon}>📄</Text>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialNombre}>{material.nombre_archivo}</Text>
                  {material.descripcion && (
                    <Text style={styles.materialDescripcion}>{material.descripcion}</Text>
                  )}
                </View>
                <Text style={styles.materialArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Estado completada - con lógica de desmarcar */}
        {completada ? (
          <TouchableOpacity
            style={styles.completadaBadge}
            onPress={handleDesmarcarCompletada}
          >
            <Text style={styles.completadaText}>✓ Completada (toca para desmarcar)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.completarButton}
            onPress={handleMarcarCompletada}
          >
            <Text style={styles.completarButtonText}>
              {videoTerminado ? 'Marcar como Completada' : 'Marcar como Completada'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Navegación entre lecciones */}
        <View style={styles.navegacionContainer}>
          <TouchableOpacity
            style={[styles.navButton, !tieneAnterior && styles.navButtonDisabled]}
            onPress={handleAnteriorLeccion}
            disabled={!tieneAnterior}
          >
            <Text style={[styles.navButtonText, !tieneAnterior && styles.navButtonTextDisabled]}>
              ← Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, !tieneSiguiente && styles.navButtonDisabled]}
            onPress={handleSiguienteLeccion}
            disabled={!tieneSiguiente}
          >
            <Text style={[styles.navButtonText, !tieneSiguiente && styles.navButtonTextDisabled]}>
              Siguiente →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón volver al curso - al final */}
        <TouchableOpacity
          style={styles.volverButton}
          onPress={handleVolverAlCurso}
        >
          <Text style={styles.volverButtonText}>← Volver al Curso</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  volverButton: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  volverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  videoContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  linkButton: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  descripcionContainer: {
    marginBottom: 24,
  },
  descripcionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  materialesContainer: {
    marginBottom: 24,
  },
  materialesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  materialIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialNombre: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 4,
  },
  materialDescripcion: {
    fontSize: 14,
    color: '#666',
  },
  materialArrow: {
    fontSize: 20,
    color: '#4285F4',
    marginLeft: 12,
  },
  completadaBadge: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  completadaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completarButton: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  completarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navegacionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  navButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#f9f9f9',
  },
  navButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
});
