/**
 * Servicio de almacenamiento universal que funciona tanto en web como en móvil
 * Usa localStorage en web y AsyncStorage en móvil
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detectar si estamos en web
const isWeb = Platform.OS === 'web';

class UniversalStorage {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    } else {
      return await AsyncStorage.getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    } else {
      await AsyncStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    } else {
      await AsyncStorage.removeItem(key);
    }
  }

  async getAllKeys(): Promise<string[]> {
    if (isWeb) {
      try {
        return Object.keys(localStorage);
      } catch (error) {
        console.error('Error getting keys from localStorage:', error);
        return [];
      }
    } else {
      return await AsyncStorage.getAllKeys();
    }
  }

  async clear(): Promise<void> {
    if (isWeb) {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    } else {
      await AsyncStorage.clear();
    }
  }
}

export const universalStorage = new UniversalStorage();
