import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { CursoConProgreso } from '../types/database';
import ProgresoBarra from './ProgresoBarra';
import { router } from 'expo-router';

interface CursoCardProps {
  curso: CursoConProgreso;
}

export default function CursoCard({ curso }: CursoCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/curso/${curso.id}`)}
    >
      <Image
        source={{
          uri: curso.url_portada || 'https://via.placeholder.com/300x200',
        }}
        style={styles.imagen}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.titulo} numberOfLines={2}>
          {curso.titulo}
        </Text>
        {curso.progreso !== undefined && curso.progreso > 0 && (
          <View style={styles.progresoContainer}>
            <ProgresoBarra progreso={curso.progreso} />
            <Text style={styles.progresoTexto}>
              {Math.round(curso.progreso)}% completado
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 200,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
  },
  titulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progresoContainer: {
    marginTop: 4,
  },
  progresoTexto: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
});

