import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { signInWithGoogle } from '../../lib/auth';
import { loginWithEmailPassword, registerUser } from '../../lib/services/authCustomService';
import { router } from 'expo-router';
import { universalStorage } from '../../lib/storage/webStorage';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');


  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu email y contraseña');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithEmailPassword(email.trim(), password);

      if (!result.success) {
        Alert.alert('Error', result.error || 'Error al iniciar sesión');
      } else if (result.user) {
        // Guardar email en almacenamiento universal para uso en servicios
        await universalStorage.setItem('user_email', result.user.email);
        router.replace('/(tabs)/catalogo');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(email.trim(), password, name.trim());

      if (!result.success) {
        Alert.alert('Error', result.error || 'Error al registrarse');
      } else if (result.user) {
        // Guardar email en almacenamiento universal
        await universalStorage.setItem('user_email', result.user.email);
        Alert.alert(
          'Registro exitoso',
          'Tu cuenta ha sido creada correctamente.',
          [
            {
              text: 'Continuar',
              onPress: () => {
                router.replace('/(tabs)/catalogo');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
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


  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={{
            uri: 'https://vdgbqkokslhmzdvedimv.supabase.co/storage/v1/object/public/logos/Logo.jpg',
          }}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>TODOS SOMOS TRADERS LMS</Text>
      <Text style={styles.subtitle}>
        {isRegisterMode ? 'Crea tu cuenta para comenzar' : 'Inicia sesión para continuar'}
      </Text>

      {/* Toggle entre Login y Registro */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isRegisterMode && styles.toggleButtonActive]}
          onPress={() => setIsRegisterMode(false)}
          disabled={loading}
        >
          <Text style={[styles.toggleText, !isRegisterMode && styles.toggleTextActive]}>
            Iniciar Sesión
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isRegisterMode && styles.toggleButtonActive]}
          onPress={() => setIsRegisterMode(true)}
          disabled={loading}
        >
          <Text style={[styles.toggleText, isRegisterMode && styles.toggleTextActive]}>
            Registrarse
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {isRegisterMode && (
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
        />
        {isRegisterMode && (
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />
        )}

        <TouchableOpacity
          style={[styles.button, styles.emailButton]}
          onPress={isRegisterMode ? handleRegister : handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {GOOGLE_CLIENT_ID && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {isRegisterMode ? 'Registrarse con Google' : 'Iniciar sesión con Google'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a237e',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    color: '#000',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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
  emailButton: {
    backgroundColor: '#1a237e',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1a237e',
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
  signUpButtonText: {
    color: '#1a237e',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#1a237e',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
});

