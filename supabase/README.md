# Configuración de Supabase

## Pasos para Configurar la Base de Datos

### 1. Ejecutar el Esquema SQL

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Abre el archivo `schema.sql` y copia todo su contenido
4. Pega el contenido en el SQL Editor y ejecuta el script
5. Verifica que todas las tablas se hayan creado correctamente

### 2. Configurar Row Level Security (RLS)

El script SQL ya incluye todas las políticas RLS necesarias. Las políticas permiten:

- **perfiles**: Los usuarios solo pueden ver/actualizar su propio perfil
- **cursos**: Todos los usuarios autenticados pueden ver cursos, solo admins pueden gestionarlos
- **lecciones**: Los usuarios solo pueden ver lecciones de cursos a los que tienen acceso
- **suscripciones_curso**: Cualquier usuario puede solicitar suscripción, solo admins pueden aprobarlas
- **progreso_usuario**: Los usuarios gestionan solo su propio progreso
- **preguntas_leccion**: Los usuarios pueden crear preguntas en lecciones accesibles, todos pueden verlas

### 3. Configurar Edge Function para Notificaciones (Opcional)

Para enviar emails cuando se crean nuevas preguntas:

1. Instala Supabase CLI:
```bash
npm install -g supabase
```

2. Inicia sesión:
```bash
supabase login
```

3. Vincula tu proyecto:
```bash
supabase link --project-ref tu-project-ref
```

4. Despliega la función:
```bash
cd supabase/edge-functions/send-qa-notification
supabase functions deploy send-qa-notification
```

5. Configura variables de entorno en Supabase Dashboard:
   - Ve a **Settings > Edge Functions > Secrets**
   - Añade `RESEND_API_KEY` con tu API key de Resend (o el servicio de email que prefieras)

6. Configura un webhook o usa Database Webhooks:
   - Ve a **Database > Webhooks**
   - Crea un webhook que se dispare en `INSERT` en la tabla `preguntas_leccion`
   - Configura la URL del webhook para llamar a tu Edge Function

### 4. Crear Usuario Administrador

Para convertir un usuario en administrador:

```sql
-- Reemplaza 'user-id-aqui' con el UUID del usuario
UPDATE perfiles 
SET es_admin = TRUE 
WHERE id = 'user-id-aqui';
```

Para encontrar el ID de usuario:
```sql
SELECT id, email FROM auth.users;
```

### 5. Datos de Prueba (Opcional)

Puedes insertar datos de ejemplo para probar la aplicación:

```sql
-- Insertar un curso de ejemplo
INSERT INTO cursos (titulo, descripcion, url_portada)
VALUES (
  'Introducción a React Native',
  'Aprende los fundamentos de React Native',
  'https://via.placeholder.com/400x300'
);

-- Insertar lecciones de ejemplo (reemplaza curso_id con el ID del curso insertado)
INSERT INTO lecciones (curso_id, titulo_leccion, url_contenido, tipo_contenido, orden)
VALUES 
  ('curso-id-aqui', 'Instalación', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'VIDEO', 1),
  ('curso-id-aqui', 'Componentes', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'VIDEO', 2);
```

## Notas Importantes

- El trigger `handle_new_user` crea automáticamente un perfil cuando un usuario se registra
- El trigger `notify_new_question` envía notificaciones cuando se crean preguntas (puede necesitar configuración adicional)
- Las políticas RLS aseguran que los usuarios solo accedan a los datos permitidos
- Asegúrate de que el servicio de autenticación de Google esté configurado correctamente en Supabase Dashboard

