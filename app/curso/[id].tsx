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
import { supabase } from '../../lib/supabase';
import {
  getCursoPorId,
  getLeccionesPorCurso,
  solicitarAccesoCurso,
} from '../../lib/services/cursoService';
import { Curso, Leccion } from '../../types/database';
import ProgresoBarra from '../../components/ProgresoBarra';

export default function CursoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);
  const [solicitandoAcceso, setSolicitandoAcceso] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [cursoData, leccionesData] = await Promise.all([
        getCursoPorId(id),
        getLeccionesPorCurso(id),
      ]);

      setCurso(cursoData);
      setLecciones(leccionesData);

      // Verificar acceso
      const { data: suscripcion } = await supabase
        .from('suscripciones_curso')
        .select('acceso_otorgado')
        .eq('user_id', user.id)
        .eq('curso_id', id)
        .single();

      setTieneAcceso(suscripcion?.acceso_otorgado || false);
    } catch (error) {
      console.error('Error cargando curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarAcceso = async () => {
    try {
      setSolicitandoAcceso(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await solicitarAccesoCurso(user.id, id);
      setSolicitandoAcceso(false);
      // Actualizar estado
      setTieneAcceso(false); // Esperando aprobación
    } catch (error) {
      console.error('Error solicitando acceso:', error);
      setSolicitandoAcceso(false);
    }
  };

  const handleLeccionPress = (leccion: Leccion) => {
    if (!tieneAcceso) return;
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

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: curso.url_portada || 'https://via.placeholder.com/400x300',
        }}
        style={styles.portada}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.titulo}>{curso.titulo}</Text>
        <Text style={styles.descripcion}>{curso.descripcion}</Text>

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

        {tieneAcceso && (
          <>
            <Text style={styles.leccionesTitulo}>Lecciones</Text>
            <FlatList
              data={lecciones}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.leccionItem}
                  onPress={() => handleLeccionPress(item)}
                >
                  <View style={styles.leccionInfo}>
                    <Text style={styles.leccionNumero}>{item.orden}</Text>
                    <Text style={styles.leccionTitulo}>{item.titulo_leccion}</Text>
                  </View>
                  <Text style={styles.leccionTipo}>
                    {item.tipo_contenido === 'VIDEO' ? '▶️' : '📄'}
                  </Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          </>
        )}
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
  portada: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  solicitarButton: {
    backgroundColor: '#4285F4',
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
    color: '#fff',
    marginBottom: 16,
  },
  leccionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  leccionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leccionNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
    width: 30,
  },
  leccionTitulo: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  leccionTipo: {
    fontSize: 20,
  },
  errorText: {
    color: '#999',
    fontSize: 16,
  },
});

