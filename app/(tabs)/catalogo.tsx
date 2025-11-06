import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCursosConProgreso } from '../../lib/services/cursoService';
import { CursoConProgreso } from '../../types/database';
import CursoCard from '../../components/CursoCard';
import CustomTabBar from '../../components/CustomTabBar';

export default function CatalogoScreen() {
  const [cursos, setCursos] = useState<CursoConProgreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('user_email');

      if (!userEmail) {
        console.error('No hay email de usuario');
        return;
      }

      const cursosData = await getCursosConProgreso(userEmail);
      setCursos(cursosData);
    } catch (error) {
      console.error('Error cargando cursos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarCursos();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cursos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CursoCard curso={item} />}
        contentContainerStyle={styles.listContent}
        horizontal
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay cursos disponibles</Text>
          </View>
        }
      />
      <CustomTabBar />
    </View>
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
  listContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
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
});

