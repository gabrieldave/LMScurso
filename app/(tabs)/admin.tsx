import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import {
  esAdmin,
  getSuscripcionesPendientes,
  otorgarAcceso,
  rechazarAcceso,
} from '../../lib/services/adminService';
import { SuscripcionPendiente } from '../../lib/services/adminService';

export default function AdminScreen() {
  const [esAdminUsuario, setEsAdminUsuario] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [suscripciones, setSuscripciones] = useState<SuscripcionPendiente[]>([]);
  const [cargando, setCargando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    verificarAdmin();
  }, []);

  const verificarAdmin = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEsAdminUsuario(false);
        setVerificando(false);
        return;
      }

      const admin = await esAdmin(user.id);
      setEsAdminUsuario(admin);

      if (admin) {
        cargarSuscripciones();
      }
    } catch (error) {
      console.error('Error verificando admin:', error);
    } finally {
      setVerificando(false);
    }
  };

  const cargarSuscripciones = async () => {
    try {
      setCargando(true);
      const datos = await getSuscripcionesPendientes();
      setSuscripciones(datos);
    } catch (error) {
      console.error('Error cargando suscripciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarSuscripciones();
  };

  const handleToggleAcceso = async (suscripcion: SuscripcionPendiente, otorgar: boolean) => {
    try {
      if (otorgar) {
        await otorgarAcceso(suscripcion.id);
        Alert.alert('Éxito', 'Acceso otorgado correctamente');
      } else {
        Alert.alert(
          'Rechazar solicitud',
          '¿Estás seguro de que deseas rechazar esta solicitud?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Rechazar',
              style: 'destructive',
              onPress: async () => {
                await rechazarAcceso(suscripcion.id);
                Alert.alert('Éxito', 'Solicitud rechazada');
                cargarSuscripciones();
              },
            },
          ]
        );
        return;
      }

      cargarSuscripciones();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el acceso');
    }
  };

  if (verificando) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (!esAdminUsuario) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          No tienes permisos de administrador
        </Text>
      </View>
    );
  }

  if (cargando && suscripciones.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Solicitudes de Acceso</Text>
      <Text style={styles.subtitulo}>
        {suscripciones.length} solicitud(es) pendiente(s)
      </Text>

      <FlatList
        data={suscripciones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.suscripcionItem}>
            <View style={styles.suscripcionInfo}>
              <Text style={styles.cursoNombre}>
                {item.curso?.titulo || 'Curso sin título'}
              </Text>
              <Text style={styles.usuarioId}>Usuario: {item.user_id}</Text>
              {item.curso?.descripcion && (
                <Text style={styles.cursoDescripcion} numberOfLines={2}>
                  {item.curso.descripcion}
                </Text>
              )}
            </View>

            <View style={styles.accionesContainer}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                  {item.acceso_otorgado ? 'Acceso otorgado' : 'Pendiente'}
                </Text>
                <Switch
                  value={item.acceso_otorgado}
                  onValueChange={(value) => handleToggleAcceso(item, value)}
                  trackColor={{ false: '#767577', true: '#4285F4' }}
                  thumbColor={item.acceso_otorgado ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay solicitudes pendientes
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  suscripcionItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  suscripcionInfo: {
    marginBottom: 12,
  },
  cursoNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  usuarioId: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  cursoDescripcion: {
    fontSize: 14,
    color: '#ccc',
  },
  accionesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  errorText: {
    color: '#999',
    fontSize: 16,
  },
});

