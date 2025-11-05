import { View, StyleSheet } from 'react-native';

interface ProgresoBarraProps {
  progreso: number; // 0-100
  altura?: number;
}

export default function ProgresoBarra({ progreso, altura = 4 }: ProgresoBarraProps) {
  const progresoNormalizado = Math.min(Math.max(progreso, 0), 100);

  return (
    <View style={[styles.container, { height: altura }]}>
      <View
        style={[
          styles.barra,
          { width: `${progresoNormalizado}%`, height: altura },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barra: {
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
});

