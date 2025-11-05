import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const STORAGE_KEY_BIOMETRIC = '@lms_biometric_enabled';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

/**
 * Autenticación con Google usando OAuth
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return { success: false, error: 'Google Client ID no configurado' };
    }

    const redirectUri = makeRedirectUri({
      scheme: 'lmsapp',
      path: 'auth',
    });

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri,
      extraParams: {},
    });

    const result = await request.promptAsync(discovery);

    if (result.type !== 'success') {
      return { success: false, error: 'Autenticación cancelada' };
    }

    const { id_token } = result.params;

    if (!id_token) {
      return { success: false, error: 'No se recibió el token de autenticación' };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Error en autenticación Google:', error);
    return { success: false, error: error.message || 'Error al autenticar con Google' };
  }
}

/**
 * Autenticación biométrica
 */
export async function authenticateWithBiometric(): Promise<AuthResult> {
  try {
    // Verificar si la biométrica está disponible
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return { success: false, error: 'La autenticación biométrica no está disponible en este dispositivo' };
    }

    // Verificar si hay credenciales guardadas
    const biometricEnabled = await AsyncStorage.getItem(STORAGE_KEY_BIOMETRIC);
    if (!biometricEnabled) {
      return { success: false, error: 'La autenticación biométrica no está configurada' };
    }

    // Autenticar con biométrica
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticación biométrica',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });

    if (!result.success) {
      return { success: false, error: 'Autenticación biométrica fallida' };
    }

    // Si la autenticación es exitosa, obtener la sesión guardada
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return { success: false, error: 'No hay sesión guardada. Por favor, inicia sesión primero con Google' };
    }

    return { success: true, user: session.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Habilitar autenticación biométrica para el usuario actual
 */
export async function enableBiometric(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Configurar autenticación biométrica',
      cancelLabel: 'Cancelar',
    });

    if (result.success) {
      await AsyncStorage.setItem(STORAGE_KEY_BIOMETRIC, 'true');
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Cerrar sesión
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  await AsyncStorage.removeItem(STORAGE_KEY_BIOMETRIC);
}

/**
 * Verificar si la biométrica está habilitada
 */
export async function isBiometricEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEY_BIOMETRIC);
  return value === 'true';
}

