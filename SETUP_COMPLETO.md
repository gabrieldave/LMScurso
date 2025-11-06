# Guía de Configuración Completa - Academia TodosSomosTraders

Esta guía te ayudará a configurar el proyecto desde cero en una nueva máquina.

---

## 📋 Checklist de Configuración

- [ ] Node.js instalado (v18+)
- [ ] Git instalado
- [ ] Expo CLI instalado
- [ ] Android Studio instalado (para compilar APK)
- [ ] Cuenta de Supabase creada
- [ ] Proyecto clonado desde GitHub
- [ ] Variables de entorno configuradas
- [ ] Base de datos configurada
- [ ] Storage configurado
- [ ] Dependencias instaladas

---

## 🔧 Paso 1: Instalación de Prerrequisitos

### Node.js
1. Descarga desde: https://nodejs.org/
2. Instala la versión LTS (18 o superior)
3. Verifica instalación:
```bash
node --version
npm --version
```

### Git
1. Descarga desde: https://git-scm.com/
2. Verifica instalación:
```bash
git --version
```

### Expo CLI
```bash
npm install -g expo-cli
```

### Android Studio (solo para compilar APK)
1. Descarga desde: https://developer.android.com/studio
2. Instala Android SDK
3. Configura variable de entorno `ANDROID_HOME`:
   - Windows: `C:\Users\tu-usuario\AppData\Local\Android\Sdk`
   - Linux/Mac: `$HOME/Android/Sdk`

---

## 📥 Paso 2: Clonar el Repositorio

```bash
git clone https://github.com/gabrieldave/LMScurso.git
cd LMScurso
```

---

## 📦 Paso 3: Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`.

---

## 🔐 Paso 4: Configurar Variables de Entorno

### Crear archivo `.env`

En la raíz del proyecto, crea un archivo llamado `.env`:

```bash
# Windows
type nul > .env

# Linux/Mac
touch .env
```

### Contenido del archivo `.env`

```env
# Supabase - OBLIGATORIO
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui

# Google OAuth - OPCIONAL
EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id
```

### Obtener Credenciales de Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**⚠️ IMPORTANTE**: 
- El archivo `.env` NO debe subirse a Git
- Ya está en `.gitignore`
- Cada desarrollador debe tener su propio `.env`

---

## 🗄️ Paso 5: Configurar Base de Datos en Supabase

### 5.1 Crear Proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto:
   - Nombre: Tu elección
   - Database Password: Guarda esta contraseña
   - Region: Elige la más cercana
   - Plan: Free tier es suficiente para desarrollo

### 5.2 Ejecutar Scripts SQL

1. En Supabase Dashboard, ve a **SQL Editor**
2. Ejecuta el script completo de `supabase/schema.sql`
3. Verifica que las tablas se hayan creado:
   - `courses_lms_movil`
   - `lessons_lms_movil`
   - `materiales_leccion`
   - `user_course_enrollments_lms_movil`
   - `user_lesson_completions_lms_movil`
   - `authenticated_users_lms_movil`

### 5.3 Crear Usuario de Prueba

En SQL Editor, ejecuta:

```sql
-- Insertar usuario de prueba
INSERT INTO authenticated_users_lms_movil (email, name, password_hash)
VALUES (
  'test@example.com',
  'Usuario de Prueba',
  '$2a$10$TuHashDeContraseñaAqui'  -- Reemplaza con hash real
);
```

**Nota**: Para generar el hash de contraseña, puedes usar un servicio online o implementar bcrypt.

### 5.4 Verificar Estructura de Tablas

Ejecuta estas consultas para verificar:

```sql
-- Ver cursos
SELECT * FROM courses_lms_movil LIMIT 5;

-- Ver lecciones
SELECT id, title, course_id FROM lessons_lms_movil LIMIT 5;

-- Ver estructura de materiales
SELECT * FROM materiales_leccion LIMIT 5;
```

---

## 📦 Paso 6: Configurar Supabase Storage

### 6.1 Crear Bucket para PDFs

1. En Supabase Dashboard, ve a **Storage**
2. Haz clic en **New bucket**
3. Configuración:
   - **Name**: `pdfs`
   - **Public bucket**: ✅ Marcar (para acceso público)
   - Haz clic en **Create bucket**

### 6.2 Configurar Políticas de Acceso

1. Haz clic en el bucket `pdfs`
2. Ve a la pestaña **Policies**
3. Crea políticas para lectura pública:

```sql
-- Política para lectura pública
CREATE POLICY "Public PDF access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pdfs');
```

### 6.3 Verificar Storage

1. Sube un archivo PDF de prueba al bucket `pdfs`
2. Copia la URL pública
3. Verifica que puedas acceder a la URL en el navegador

---

## 🚀 Paso 7: Iniciar la Aplicación

### Modo Desarrollo

```bash
npm start
```

Esto iniciará el servidor de Expo. Luego:
- Presiona `a` para abrir en Android
- Presiona `i` para abrir en iOS
- Escanea el QR con Expo Go app

### Verificar que Todo Funciona

1. La app debería iniciar sin errores
2. Deberías poder hacer login con el usuario de prueba
3. Deberías ver el catálogo de cursos (si hay cursos en la BD)
4. Deberías poder navegar entre pantallas

---

## 📱 Paso 8: Compilar APK (Opcional)

### Prebuild (primera vez)

```bash
npx expo prebuild --platform android --clean
```

### Exportar Bundle

```bash
npx expo export --platform android --output-dir android/app/src/main/assets --clear
```

### Compilar APK

```bash
cd android

# Windows
$env:ANDROID_HOME = "C:\Users\tu-usuario\AppData\Local\Android\Sdk"
.\gradlew assembleRelease --no-daemon

# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
./gradlew assembleRelease --no-daemon
```

El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

---

## ✅ Verificación Final

### Checklist de Verificación

- [ ] La app inicia sin errores
- [ ] Puedo hacer login con usuario de prueba
- [ ] Veo el catálogo de cursos
- [ ] Puedo abrir un curso
- [ ] Puedo abrir una lección
- [ ] Los videos de YouTube se reproducen
- [ ] La barra de navegación inferior funciona
- [ ] Puedo navegar entre Catálogo, Soporte y Perfil
- [ ] El botón "Regresar a Inicio" funciona

---

## 🔍 Solución de Problemas Comunes

### Error: "Faltan las variables de entorno"
- Verifica que el archivo `.env` existe en la raíz
- Verifica que las variables empiezan con `EXPO_PUBLIC_`
- Reinicia el servidor de Expo después de crear `.env`

### Error: "Cannot connect to Supabase"
- Verifica que `EXPO_PUBLIC_SUPABASE_URL` es correcta
- Verifica que `EXPO_PUBLIC_SUPABASE_ANON_KEY` es correcta
- Verifica que el proyecto de Supabase está activo

### Error al compilar APK
- Verifica que `ANDROID_HOME` está configurado
- Ejecuta `npx expo prebuild --platform android --clean`
- Limpia el proyecto: `cd android && ./gradlew clean`

### No se muestran cursos/lecciones
- Verifica que hay datos en las tablas de Supabase
- Verifica las políticas RLS en Supabase
- Revisa los logs de la consola para errores

---

## 📚 Recursos Adicionales

- **Documentación de Expo**: https://docs.expo.dev/
- **Documentación de Supabase**: https://supabase.com/docs
- **React Native**: https://reactnative.dev/
- **Expo Router**: https://docs.expo.dev/router/introduction/

---

## 📝 Notas Importantes

1. **Credenciales**: Nunca compartas tu archivo `.env` o tus claves de Supabase
2. **Base de Datos**: Los IDs de lecciones son tipo `text` (ej: "ID-005"), no UUID
3. **Storage**: El bucket `pdfs` debe ser público para acceso a PDFs
4. **Git**: El archivo `.env` está en `.gitignore` y no se sube al repositorio
5. **Versiones**: Usa las versiones exactas de las dependencias para evitar conflictos

---

## 🆘 ¿Necesitas Ayuda?

1. Revisa `CHANGELOG_COMPLETO.md` para cambios recientes
2. Revisa los archivos de documentación en el proyecto
3. Verifica los logs de la aplicación
4. Consulta la documentación oficial de Expo y Supabase

---

**Última actualización**: 11 de Junio, 2025

