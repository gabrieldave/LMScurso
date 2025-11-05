# Guía de Instalación - LMS Mobile App

## Prerrequisitos

1. **Node.js** (versión 18 o superior)
2. **npm** o **yarn**
3. **Expo CLI**: `npm install -g expo-cli`
4. **Cuenta de Supabase**: https://supabase.com
5. **Google OAuth Credentials** (para autenticación con Google)

## Pasos de Instalación

### 1. Instalar Dependencias

```bash
cd lms-mobile-app
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve al SQL Editor y ejecuta el script completo en `supabase/schema.sql`
3. Configura las variables de entorno:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id
```

### 3. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ 
4. Crea credenciales OAuth 2.0:
   - Tipo: Aplicación web
   - Orígenes autorizados: `https://auth.expo.io`
   - URI de redirección autorizados: 
     - `https://auth.expo.io/@tu-usuario/lms-mobile-app`
     - Para desarrollo: `exp://localhost:19000`
5. Copia el Client ID y añádelo a `.env`

### 4. Configurar Edge Function para Notificaciones (Opcional)

Para recibir notificaciones por email cuando haya nuevas preguntas:

1. Instala Supabase CLI: `npm install -g supabase`
2. Inicia sesión: `supabase login`
3. Vincula tu proyecto: `supabase link --project-ref tu-project-ref`
4. Despliega la función:
```bash
cd supabase/edge-functions/send-qa-notification
supabase functions deploy send-qa-notification
```
5. Configura la variable de entorno `RESEND_API_KEY` en Supabase Dashboard (Settings > Edge Functions > Secrets)

### 5. Crear Usuario Administrador

En Supabase SQL Editor, ejecuta:

```sql
-- Reemplaza 'user-id-aqui' con el UUID del usuario que quieres hacer admin
UPDATE perfiles 
SET es_admin = TRUE 
WHERE id = 'user-id-aqui';
```

### 6. Iniciar la Aplicación

```bash
npm start
```

Esto abrirá Expo Go. Escanea el código QR con:
- **iOS**: Cámara nativa o Expo Go app
- **Android**: Expo Go app

## Estructura de Base de Datos

El esquema SQL incluye:
- **perfiles**: Perfiles de usuario y roles admin
- **cursos**: Catálogo de cursos
- **lecciones**: Lecciones de cada curso (VIDEO o PDF)
- **suscripciones_curso**: Control de acceso a cursos
- **progreso_usuario**: Seguimiento de progreso
- **preguntas_leccion**: Sistema Q&A

## Funcionalidades Implementadas

✅ Autenticación con Google
✅ Autenticación Biométrica (Huella/Face ID)
✅ Catálogo de cursos estilo Netflix
✅ Visor de lecciones (YouTube y PDF)
✅ Sistema de Preguntas y Respuestas
✅ Búsqueda global
✅ Panel de administración
✅ Seguimiento de progreso

## Solución de Problemas

### Error de autenticación con Google
- Verifica que el Client ID sea correcto
- Asegúrate de que los URIs de redirección estén configurados correctamente

### Error de permisos RLS
- Verifica que hayas ejecutado el script SQL completo
- Asegúrate de que el usuario esté autenticado

### La aplicación no se conecta a Supabase
- Verifica las variables de entorno en `.env`
- Asegúrate de que las credenciales sean correctas

