import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { signInWithGoogle, authenticateWithBiometric, isBiometricEnabled } from '../../lib/auth';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const enabled = await isBiometricEnabled();
    setBiometricAvailable(enabled);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)/catalogo');
    } else {
      Alert.alert('Error', result.error || 'Error al iniciar sesión');
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    const result = await authenticateWithBiometric();
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)/catalogo');
    } else {
      Alert.alert('Error', result.error || 'Error en autenticación biométrica');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LMS Mobile App</Text>
      <Text style={styles.subtitle}>Plataforma de aprendizaje</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
          )}
        </TouchableOpacity>

        {biometricAvailable && (
          <TouchableOpacity
            style={[styles.button, styles.biometricButton]}
            onPress={handleBiometricLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Autenticación Biométrica</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  biometricButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

