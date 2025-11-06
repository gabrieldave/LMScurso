import { supabase } from '../supabase';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

/**
 * Subir un archivo PDF a Supabase Storage
 */
export async function subirPdf(
  fileUri: string,
  fileName: string,
  cursoId: string
): Promise<string> {
  try {
    // Leer el archivo como base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convertir base64 a ArrayBuffer para React Native
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Crear nombre único para el archivo
    const timestamp = Date.now();
    const nombreArchivo = `${cursoId}/${timestamp}_${fileName.replace(/[^a-z0-9.-]/gi, '_')}`;

    // Subir a Supabase Storage usando ArrayBuffer
    const { data, error } = await supabase.storage
      .from('pdfs')
      .upload(nombreArchivo, byteArray, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) throw error;

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error subiendo PDF:', error);
    throw error;
  }
}

/**
 * Seleccionar un archivo PDF desde el dispositivo
 */
export async function seleccionarPdf(): Promise<{
  uri: string;
  name: string;
  type: string;
} | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    return {
      uri: file.uri,
      name: file.name || 'documento.pdf',
      type: file.mimeType || 'application/pdf',
    };
  } catch (error) {
    console.error('Error seleccionando PDF:', error);
    throw error;
  }
}

/**
 * Eliminar un PDF de Supabase Storage
 */
export async function eliminarPdf(filePath: string): Promise<void> {
  try {
    // Extraer la ruta del archivo desde la URL completa
    const urlParts = filePath.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const cursoId = urlParts[urlParts.length - 2];
    const path = `${cursoId}/${fileName}`;

    const { error } = await supabase.storage
      .from('pdfs')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error eliminando PDF:', error);
    throw error;
  }
}

