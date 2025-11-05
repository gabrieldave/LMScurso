import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { getPreguntasPorLeccion, crearPregunta } from '../../lib/services/qaService';
import { marcarLeccionCompletada } from '../../lib/services/cursoService';
import { Leccion, PreguntaLeccion } from '../../types/database';
import YouTube from 'react-native-youtube-iframe';
import Pdf from 'react-native-pdf';

export default function LeccionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [preguntas, setPreguntas] = useState<PreguntaLeccion[]>([]);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviandoPregunta, setEnviandoPregunta] = useState(false);
  const [completada, setCompletada] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      // Obtener lección
      const { data: leccionData, error: leccionError } = await supabase
        .from('lecciones')
        .select('*')
        .eq('id', id)
        .single();

      if (leccionError) throw leccionError;
      setLeccion(leccionData);

      // Obtener preguntas
      const preguntasData = await getPreguntasPorLeccion(id);
      setPreguntas(preguntasData);

      // Verificar si está completada
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: progreso } = await supabase
          .from('progreso_usuario')
          .select('completada')
          .eq('user_id', user.id)
          .eq('leccion_id', id)
          .single();

        setCompletada(progreso?.completada || false);
      }
    } catch (error) {
      console.error('Error cargando lección:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletarLeccion = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !leccion) return;

      await marcarLeccionCompletada(user.id, leccion.id);
      setCompletada(true);
      Alert.alert('Éxito', 'Lección marcada como completada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo marcar la lección como completada');
    }
  };

  const handleEnviarPregunta = async () => {
    if (!nuevaPregunta.trim()) {
      Alert.alert('Error', 'Por favor ingresa una pregunta');
      return;
    }

    try {
      setEnviandoPregunta(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !leccion) return;

      const pregunta = await crearPregunta(leccion.id, user.id, nuevaPregunta);
      setPreguntas([pregunta, ...preguntas]);
      setNuevaPregunta('');
      Alert.alert('Éxito', 'Pregunta enviada. Te notificaremos cuando haya una respuesta.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la pregunta');
    } finally {
      setEnviandoPregunta(false);
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
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

  const youtubeId = leccion.tipo_contenido === 'VIDEO' 
    ? extractYouTubeId(leccion.url_contenido) 
    : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.titulo}>{leccion.titulo_leccion}</Text>

        {/* Reproductor/Visor de contenido */}
        <View style={styles.contenidoContainer}>
          {leccion.tipo_contenido === 'VIDEO' && youtubeId ? (
            <YouTube
              videoId={youtubeId}
              height={220}
              play={false}
              onChangeState={(event) => {
                if (event === 'ended') {
                  handleCompletarLeccion();
                }
              }}
            />
          ) : leccion.tipo_contenido === 'PDF' ? (
            <Pdf
              source={{ uri: leccion.url_contenido }}
              style={styles.pdf}
              onLoadComplete={(numberOfPages) => {
                console.log(`PDF cargado: ${numberOfPages} páginas`);
              }}
            />
          ) : (
            <Text style={styles.errorText}>Tipo de contenido no soportado</Text>
          )}
        </View>

        {/* Botón completar */}
        {!completada && (
          <TouchableOpacity
            style={styles.completarButton}
            onPress={handleCompletarLeccion}
          >
            <Text style={styles.completarButtonText}>Marcar como Completada</Text>
          </TouchableOpacity>
        )}

        {completada && (
          <View style={styles.completadaBadge}>
            <Text style={styles.completadaText}>✓ Completada</Text>
          </View>
        )}

        {/* Sección Q&A */}
        <View style={styles.qaSection}>
          <Text style={styles.qaTitulo}>Preguntas y Respuestas</Text>

          {/* Formulario de nueva pregunta */}
          <View style={styles.qaForm}>
            <TextInput
              style={styles.qaInput}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor="#999"
              value={nuevaPregunta}
              onChangeText={setNuevaPregunta}
              multiline
            />
            <TouchableOpacity
              style={styles.qaEnviarButton}
              onPress={handleEnviarPregunta}
              disabled={enviandoPregunta}
            >
              <Text style={styles.qaEnviarButtonText}>
                {enviandoPregunta ? 'Enviando...' : 'Enviar Pregunta'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de preguntas */}
          <View style={styles.preguntasList}>
            {preguntas.map((pregunta) => (
              <View key={pregunta.id} style={styles.preguntaItem}>
                <Text style={styles.preguntaTexto}>{pregunta.pregunta}</Text>
                {pregunta.respuesta_admin && (
                  <View style={styles.respuestaContainer}>
                    <Text style={styles.respuestaLabel}>Respuesta:</Text>
                    <Text style={styles.respuestaTexto}>
                      {pregunta.respuesta_admin}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {preguntas.length === 0 && (
              <Text style={styles.sinPreguntas}>
                Aún no hay preguntas. ¡Sé el primero en preguntar!
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  contenidoContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
  },
  pdf: {
    width: '100%',
    height: 500,
  },
  completarButton: {
    backgroundColor: '#34C759',
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
  completadaBadge: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  completadaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qaSection: {
    marginTop: 24,
  },
  qaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  qaForm: {
    marginBottom: 24,
  },
  qaInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  qaEnviarButton: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  qaEnviarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  preguntasList: {
    marginTop: 16,
  },
  preguntaItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  preguntaTexto: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  respuestaContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
    marginTop: 12,
  },
  respuestaLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  respuestaTexto: {
    color: '#ccc',
    fontSize: 16,
  },
  sinPreguntas: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    color: '#999',
    fontSize: 16,
  },
});

