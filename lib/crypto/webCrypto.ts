/**
 * Adaptador de crypto que funciona tanto en web como en móvil
 * Usa Web Crypto API en web y expo-crypto en móvil
 */

import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

const isWeb = Platform.OS === 'web';

/**
 * Generar hash SHA256 de una cadena
 */
export async function digestStringSHA256(text: string): Promise<string> {
  if (isWeb && typeof window !== 'undefined' && window.crypto) {
    // Usar Web Crypto API en web
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } else {
    // Usar expo-crypto en móvil
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      text
    );
  }
}

/**
 * Generar bytes aleatorios
 */
export async function getRandomBytes(length: number): Promise<Uint8Array> {
  if (isWeb && typeof window !== 'undefined' && window.crypto) {
    // Usar Web Crypto API en web
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return array;
  } else {
    // Usar expo-crypto en móvil
    const bytes = await Crypto.getRandomBytesAsync(length);
    return new Uint8Array(bytes);
  }
}
