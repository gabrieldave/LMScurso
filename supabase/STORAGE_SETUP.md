# Configuración de Supabase Storage para PDFs

Para que la funcionalidad de subida de PDFs funcione correctamente, necesitas configurar un bucket en Supabase Storage.

## Pasos para configurar

1. **Ve a tu proyecto en Supabase Dashboard**
   - Accede a https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Navega a Storage**
   - En el menú lateral, haz clic en "Storage"

3. **Crea un nuevo bucket**
   - Haz clic en "New bucket"
   - Nombre del bucket: `pdfs`
   - Marca la opción "Public bucket" si quieres que los PDFs sean accesibles públicamente
   - Haz clic en "Create bucket"

4. **Configura las políticas de acceso (RLS)**
   - Haz clic en el bucket "pdfs"
   - Ve a la pestaña "Policies"
   - Crea una política para permitir que los administradores suban archivos:

```sql
-- Política para permitir que los admins suban archivos
CREATE POLICY "Admins can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pdfs' AND
  EXISTS (
    SELECT 1 FROM perfiles
    WHERE perfiles.id = auth.uid() AND perfiles.es_admin = TRUE
  )
);

-- Política para permitir lectura pública (si el bucket es público)
CREATE POLICY "Public PDF access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pdfs');
```

5. **Verifica que todo esté funcionando**
   - Intenta subir un PDF desde la app de administración
   - Verifica que el archivo aparezca en el bucket de Storage

## Notas importantes

- Los PDFs se organizan por curso: `{cursoId}/{timestamp}_{nombreArchivo}`
- Si quieres que los PDFs sean privados, necesitarás ajustar las políticas RLS
- El tamaño máximo de archivo depende de tu plan de Supabase (gratuito: 50MB por archivo)





