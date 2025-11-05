import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { buscarGlobal } from '../../lib/services/busquedaService';
import { ResultadoBusqueda } from '../../lib/services/busquedaService';
import { Curso, Leccion } from '../../types/database';

export default function BusquedaScreen() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState<ResultadoBusqueda>({
    cursos: [],
    lecciones: [],
  });
  const [buscando, setBuscando] = useState(false);

  const handleBuscar = async (texto: string) => {
    setTermino(texto);

    if (texto.trim().length < 2) {
      setResultados({ cursos: [], lecciones: [] });
      return;
    }

    try {
      setBuscando(true);
      const resultadosData = await buscarGlobal(texto);
      setResultados(resultadosData);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setBuscando(false);
    }
  };

  const renderResultado = ({ item, index }: any) => {
    const esCurso = 'titulo' in item;
    
    if (esCurso) {
      const curso = item as Curso;
      return (
        <TouchableOpacity
          style={styles.resultadoItem}
          onPress={() => router.push(`/curso/${curso.id}`)}
        >
          <Text style={styles.resultadoTipo}>📚 Curso</Text>
          <Text style={styles.resultadoTitulo}>{curso.titulo}</Text>
        </TouchableOpacity>
      );
    } else {
      const leccion = item as Leccion & { curso_titulo?: string };
      return (
        <TouchableOpacity
          style={styles.resultadoItem}
          onPress={() => router.push(`/leccion/${leccion.id}`)}
        >
          <Text style={styles.resultadoTipo}>📖 Lección</Text>
          <Text style={styles.resultadoTitulo}>{leccion.titulo_leccion}</Text>
          {leccion.curso_titulo && (
            <Text style={styles.resultadoSubtitulo}>{leccion.curso_titulo}</Text>
          )}
        </TouchableOpacity>
      );
    }
  };

  const todosLosResultados = [
    ...resultados.cursos.map((c) => ({ ...c, tipo: 'curso' })),
    ...resultados.lecciones.map((l) => ({ ...l, tipo: 'leccion' })),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cursos y lecciones..."
          placeholderTextColor="#999"
          value={termino}
          onChangeText={handleBuscar}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {buscando && (
          <ActivityIndicator
            style={styles.searchLoader}
            size="small"
            color="#4285F4"
          />
        )}
      </View>

      {buscando ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
      ) : todosLosResultados.length > 0 ? (
        <FlatList
          data={todosLosResultados}
          keyExtractor={(item, index) => `${item.tipo}-${item.id}-${index}`}
          renderItem={renderResultado}
          contentContainerStyle={styles.resultsList}
        />
      ) : termino.length >= 2 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noResultsText}>No se encontraron resultados</Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.placeholderText}>
            Escribe al menos 2 caracteres para buscar
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  searchLoader: {
    marginLeft: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  resultsList: {
    padding: 16,
  },
  resultadoItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultadoTipo: {
    color: '#4285F4',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultadoTitulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultadoSubtitulo: {
    color: '#999',
    fontSize: 14,
  },
  noResultsText: {
    color: '#999',
    fontSize: 16,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
});

