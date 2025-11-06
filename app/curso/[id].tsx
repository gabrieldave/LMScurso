import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Alert } from 'react-native';
import {
  getCursoPorId,
  getLeccionesPorCursoConEstado,
  solicitarAccesoCurso,
  tieneAccesoCurso,
} from '../../lib/services/cursoService';
import { Curso, Leccion } from '../../types/database';
import ProgresoBarra from '../../components/ProgresoBarra';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CursoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [lecciones, setLecciones] = useState<(Leccion & { completada: boolean; duration?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);
  const [solicitandoAcceso, setSolicitandoAcceso] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
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

      console.log('🔍 Cargando curso ID:', id);
      
      // Cargar curso
      const cursoData = await getCursoPorId(id);
      if (!cursoData) {
        Alert.alert('Error', 'Curso no encontrado');
        router.back();
        return;
      }
      setCurso(cursoData);

      // Cargar lecciones
      const leccionesData = await getLeccionesPorCursoConEstado(id, userEmail);
      console.log('📖 Lecciones cargadas:', leccionesData.length);
      setLecciones(leccionesData);

      // Verificar acceso
      const acceso = await tieneAccesoCurso(userEmail, id);
      setTieneAcceso(acceso);
    } catch (error: any) {
      console.error('❌ Error cargando datos:', error);
      Alert.alert('Error', error.message || 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarAcceso = async () => {
    try {
      setSolicitandoAcceso(true);
      const userEmail = await AsyncStorage.getItem('user_email');
      
      if (!userEmail) {
        Alert.alert('Error', 'No hay sesión activa');
        return;
      }

      console.log('📝 Intentando solicitar acceso para:', userEmail, 'curso:', id);
      await solicitarAccesoCurso(userEmail, id);
      
      // Verificar que se creó correctamente
      const acceso = await tieneAccesoCurso(userEmail, id);
      setTieneAcceso(acceso);
      
      if (acceso) {
        Alert.alert('Éxito', 'Acceso otorgado al curso');
        await cargarDatos();
      } else {
        Alert.alert('Error', 'No se pudo verificar el acceso');
      }
    } catch (error: any) {
      console.error('❌ Error solicitando acceso:', error);
      Alert.alert('Error', error.message || 'No se pudo solicitar acceso. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setSolicitandoAcceso(false);
    }
  };

  const handleLeccionPress = (leccion: Leccion) => {
    if (!tieneAcceso) {
      Alert.alert('Acceso requerido', 'Debes solicitar acceso al curso primero');
      return;
    }
    router.push(`/leccion/${leccion.id}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (!curso) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Curso no encontrado</Text>
      </View>
    );
  }

  const leccionesCompletadas = lecciones.filter(l => l.completada).length;
  const totalLecciones = lecciones.length;
  const progreso = totalLecciones > 0 ? Math.round((leccionesCompletadas / totalLecciones) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
      {/* Portada */}
      {curso.url_portada && (
        <Image
          source={{ uri: curso.url_portada }}
          style={styles.portada}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        {/* Botón regresar a cursos */}
        <TouchableOpacity
          style={styles.regresarButton}
          onPress={() => router.push('/(tabs)/catalogo')}
        >
          <Text style={styles.regresarButtonText}>← Regresar a Inicio</Text>
        </TouchableOpacity>
        
        {/* Título */}
        <Text style={styles.titulo}>{curso.titulo}</Text>
        
        {/* Descripción */}
        {curso.descripcion && (
          <View style={styles.descripcionContainer}>
            <Text style={styles.descripcionLabel}>Descripción</Text>
            <Text style={styles.descripcion}>{curso.descripcion}</Text>
          </View>
        )}

        {/* Progreso */}
        {tieneAcceso && totalLecciones > 0 && (
          <View style={styles.progresoContainer}>
            <View style={styles.progresoHeader}>
              <Text style={styles.progresoTexto}>
                Progreso: {progreso}%
              </Text>
              <Text style={styles.progresoContador}>
                {leccionesCompletadas}/{totalLecciones} lecciones
              </Text>
            </View>
            <ProgresoBarra progreso={progreso} />
          </View>
        )}

        {/* Botón solicitar acceso */}
        {!tieneAcceso && (
          <TouchableOpacity
            style={styles.solicitarButton}
            onPress={handleSolicitarAcceso}
            disabled={solicitandoAcceso}
          >
            <Text style={styles.solicitarButtonText}>
              {solicitandoAcceso ? 'Solicitando...' : 'Solicitar Acceso'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Lista de lecciones */}
        {tieneAcceso && (
          <>
            <Text style={styles.leccionesTitulo}>
              Lecciones ({totalLecciones})
            </Text>
            {totalLecciones === 0 ? (
              <Text style={styles.emptyText}>No hay lecciones disponibles</Text>
            ) : (
              <FlatList
                data={lecciones}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.leccionItem,
                      item.completada && styles.leccionItemCompletada
                    ]}
                    onPress={() => handleLeccionPress(item)}
                  >
                    <View style={styles.leccionLeft}>
                      {item.completada ? (
                        <View style={styles.checkCircle}>
                          <Text style={styles.checkIcon}>✓</Text>
                        </View>
                      ) : (
                        <View style={styles.numberCircle}>
                          <Text style={styles.numberText}>{index + 1}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.leccionCenter}>
                      <Text style={styles.leccionTitulo}>{item.titulo_leccion}</Text>
                      <Text style={styles.leccionSubtitulo}>{item.titulo_leccion}</Text>
                      {item.duration && (
                        <View style={styles.leccionMeta}>
                          <Text style={styles.leccionDuration}>🕐 {item.duration} min</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.leccionRight}>
                      {item.completada ? (
                        <Text style={styles.checkIcon}>✓</Text>
                      ) : (
                        <Text style={styles.playIcon}>▶</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            )}
          </>
        )}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  portada: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
    paddingBottom: 80, // Espacio para el tab bar
  },
  regresarButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  regresarButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  descripcionContainer: {
    marginBottom: 20,
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
  progresoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  progresoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progresoTexto: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  progresoContador: {
    fontSize: 14,
    color: '#666',
  },
  solicitarButton: {
    backgroundColor: '#1a237e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  solicitarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  leccionesTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  leccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leccionItemCompletada: {
    backgroundColor: '#f5f5f5',
    opacity: 0.9,
  },
  leccionLeft: {
    marginRight: 16,
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  numberText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leccionCenter: {
    flex: 1,
  },
  leccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  leccionSubtitulo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  leccionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leccionDuration: {
    fontSize: 12,
    color: '#666',
  },
  leccionRight: {
    marginLeft: 12,
  },
  playIcon: {
    fontSize: 20,
    color: '#999',
  },
  emptyText: {
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
