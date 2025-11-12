import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERROR: Faltan las variables de entorno de Supabase.');
  console.error('URL:', supabaseUrl ? 'OK' : 'FALTANTE');
  console.error('KEY:', supabaseAnonKey ? 'OK' : 'FALTANTE');
  console.error('Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en un archivo .env');
}

// Crear cliente Supabase con valores por defecto si faltan
// Esto evitará que la app crashee inmediatamente
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Crear adaptador de almacenamiento que funcione en web y móvil
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    // En web, usar localStorage directamente
    return {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve(null);
        return Promise.resolve(localStorage.getItem(key));
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  } else {
    // En móvil, usar AsyncStorage
    return AsyncStorage;
  }
};

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web', // Habilitar detección de sesión en URL para web
  },
});

// Verificar si las credenciales son válidas
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

