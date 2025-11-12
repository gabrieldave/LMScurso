import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { getCurrentSession } from '../lib/services/authCustomService';
import { supabase } from '../lib/supabase';
import { universalStorage } from '../lib/storage/webStorage';

export default function Index() {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
    
    // En web, escuchar cambios en la sesión de Supabase (para OAuth)
    if (Platform.OS === 'web') {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Guardar email del usuario de Supabase
          const email = session.user.email;
          if (email) {
            await universalStorage.setItem('user_email', email);
            // Intentar obtener o crear el usuario en nuestra tabla custom
            const customSession = await getCurrentSession();
            setSession(customSession || { email, name: session.user.user_metadata?.full_name || email });
          }
        } else if (event === 'SIGNED_OUT') {
          await universalStorage.removeItem('user_email');
          setSession(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const checkSession = async () => {
    try {
      // Primero verificar sesión custom
      const customUser = await getCurrentSession();
      
      if (customUser) {
        setSession(customUser);
        setLoading(false);
        return;
      }

      // Si no hay sesión custom, verificar sesión de Supabase (para OAuth en web)
      if (Platform.OS === 'web') {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        
        if (supabaseSession?.user) {
          const email = supabaseSession.user.email;
          if (email) {
            await universalStorage.setItem('user_email', email);
            setSession({
              email,
              name: supabaseSession.user.user_metadata?.full_name || email,
            });
            setLoading(false);
            return;
          }
        }
      }

      setSession(null);
    } catch (error) {
      console.error('Error verificando sesión:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/catalogo" />;
}

