import { supabase } from '../supabase';
import { digestStringSHA256, getRandomBytes } from '../crypto/webCrypto';
import { universalStorage } from '../storage/webStorage';

/**
 * Servicio de autenticación custom usando authenticated_users_lms_movil
 */

export interface UsuarioAutenticado {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
}

/**
 * Iniciar sesión con email y contraseña usando authenticated_users_lms_movil
 */
export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UsuarioAutenticado; error?: string }> {
  try {
    // Buscar usuario por email
    const { data: usuario, error } = await supabase
      .from('authenticated_users_lms_movil')
      .select('id, email, name, password_hash, is_active')
      .eq('email', email.trim().toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !usuario) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Verificar contraseña
    // Si password_hash es NULL, permitir login sin contraseña (para usuarios existentes)
    if (usuario.password_hash) {
      // Hash de la contraseña ingresada
      const passwordHash = await digestStringSHA256(password);

      // Comparar hashes (en producción, usar bcrypt o similar)
      if (usuario.password_hash !== passwordHash) {
        return { success: false, error: 'Contraseña incorrecta' };
      }
    }

    // Guardar sesión en almacenamiento universal
    const sessionData = {
      user: {
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
      },
      timestamp: Date.now(),
    };

    await universalStorage.setItem('custom_session', JSON.stringify(sessionData));
    await universalStorage.setItem('user_email', usuario.email);

    return {
      success: true,
      user: {
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
        is_active: usuario.is_active,
      },
    };
  } catch (error: any) {
    console.error('Error en login:', error);
    return { success: false, error: error.message || 'Error al iniciar sesión' };
  }
}

/**
 * Registrar nuevo usuario en authenticated_users_lms_movil
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; user?: UsuarioAutenticado; error?: string }> {
  try {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('authenticated_users_lms_movil')
      .select('email')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (existingUser) {
      return { success: false, error: 'El email ya está registrado' };
    }

    // Hash de la contraseña
    const passwordHash = await digestStringSHA256(password);

    // Generar UUID usando crypto universal
    const uuidBytes = await getRandomBytes(16);
    const uuid = Array.from(uuidBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const uuidFormatted = `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
    
    // Crear nuevo usuario
    const nuevoUsuario = {
      id: uuidFormatted,
      email: email.trim().toLowerCase(),
      name: name || email.split('@')[0],
      password_hash: passwordHash,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('authenticated_users_lms_movil')
      .insert([nuevoUsuario])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message || 'Error al registrarse' };
    }

    // Guardar sesión
    const sessionData = {
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
      },
      timestamp: Date.now(),
    };

    await universalStorage.setItem('custom_session', JSON.stringify(sessionData));
    await universalStorage.setItem('user_email', data.email);

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        is_active: data.is_active,
      },
    };
  } catch (error: any) {
    console.error('Error en registro:', error);
    return { success: false, error: error.message || 'Error al registrarse' };
  }
}

/**
 * Obtener sesión actual
 */
export async function getCurrentSession(): Promise<UsuarioAutenticado | null> {
  try {
    const sessionStr = await universalStorage.getItem('custom_session');

    if (!sessionStr) return null;

    const sessionData = JSON.parse(sessionStr);
    const { user } = sessionData;

    // Verificar que el usuario sigue activo
    const { data: usuario } = await supabase
      .from('authenticated_users_lms_movil')
      .select('id, email, name, is_active')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    return usuario || null;
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return null;
  }
}

/**
 * Cerrar sesión
 */
export async function logout(): Promise<void> {
  try {
    await universalStorage.removeItem('custom_session');
    await universalStorage.removeItem('user_email');
  } catch (error) {
    console.error('Error cerrando sesión:', error);
  }
}

