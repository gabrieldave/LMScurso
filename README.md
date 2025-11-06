# Academia TodosSomosTraders - LMS Mobile App

Aplicación móvil educativa desarrollada con React Native (Expo) y Supabase para gestión de cursos y lecciones.

**Versión**: 1.0.0  
**Última actualización**: 11 de Junio, 2025

---

## 📱 Características Principales

- ✅ Autenticación personalizada (email/password)
- ✅ Catálogo de cursos estilo Netflix
- ✅ Reproductor de videos de YouTube embebido
- ✅ Sistema de materiales PDF adicionales
- ✅ Seguimiento de progreso por lección
- ✅ Barra de navegación inferior personalizada
- ✅ Panel de administración
- ✅ Sistema de solicitud de acceso a cursos

---

## 🚀 Inicio Rápido

### Prerrequisitos

1. **Node.js** (versión 18 o superior)
2. **npm** o **yarn**
3. **Expo CLI**: `npm install -g expo-cli`
4. **Android Studio** (para compilar APK)
5. **Cuenta de Supabase**: https://supabase.com
6. **Git** (para clonar el repositorio)

### Instalación en Nueva Máquina

1. **Clonar el repositorio**:
```bash
git clone https://github.com/gabrieldave/LMScurso.git
cd LMScurso
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
# Crear archivo .env en la raíz del proyecto
touch .env
```

Editar `.env` con tus credenciales:
```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
```

**⚠️ IMPORTANTE**: El archivo `.env` NO debe subirse a Git (ya está en `.gitignore`)

4. **Configurar Supabase** (ver sección "Configuración de Base de Datos" más abajo)

5. **Iniciar la aplicación**:
```bash
npm start
```

---

## 🗄️ Configuración de Base de Datos

### 1. Crear Proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu **URL del proyecto** y **Anon Key** (Settings → API)

### 2. Ejecutar Scripts SQL

En Supabase Dashboard → SQL Editor, ejecuta en este orden:

1. **Schema principal**: `supabase/schema.sql`
2. **Políticas RLS** (si es necesario): Configurar Row Level Security

### 3. Configurar Storage para PDFs

1. Ve a **Storage** en Supabase Dashboard
2. Crea un bucket llamado `pdfs`
3. Configura como **Público** (Public bucket)
4. Ver detalles en: `supabase/STORAGE_SETUP.md`

### 4. Estructura de Tablas Principales

#### `courses_lms_movil` - Cursos
- `id` (text) - ID del curso
- `title` (text) - Título del curso
- `description` (text) - Descripción
- `image_url` (text) - URL de la portada
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `lessons_lms_movil` - Lecciones
- `id` (text) - ID de la lección (ej: "ID-001", "ID-005")
- `course_id` (text) - ID del curso padre
- `title` (text) - Título de la lección
- `video_url` (text) - URL del video de YouTube
- `description` (text) - Descripción
- `duration` (integer) - Duración en minutos
- `order_index` (integer) - Orden de la lección
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `materiales_leccion` - Materiales PDF
- `id` (UUID) - ID único (auto-generado)
- `leccion_id` (text) - ID de la lección (ej: "ID-005")
- `nombre_archivo` (text) - Nombre del PDF
- `url_archivo` (text) - URL pública de Supabase Storage
- `tipo_archivo` (text) - "application/pdf"
- `descripcion` (text, nullable) - Descripción opcional
- `orden` (integer) - Orden de visualización
- `created_at` (timestamp)

#### `user_course_enrollments_lms_movil` - Inscripciones
- `id` (UUID)
- `email` (text) - Email del usuario
- `course_id` (text) - ID del curso
- `progress` (integer) - Progreso (0-100)
- `created_at` (timestamp)

#### `user_lesson_completions_lms_movil` - Completadas
- `id` (UUID)
- `email` (text) - Email del usuario
- `course_id` (text) - ID del curso
- `lesson_id` (text) - ID de la lección
- `completed` (boolean) - Si está completada
- `created_at` (timestamp)

#### `authenticated_users_lms_movil` - Usuarios
- `id` (UUID)
- `email` (text) - Email único
- `name` (text) - Nombre del usuario
- `password_hash` (text) - Hash de contraseña
- `created_at` (timestamp)

---

## 📦 Dependencias Principales

```json
{
  "expo": "~51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.5",
  "@supabase/supabase-js": "^2.39.0",
  "react-native-youtube-iframe": "^2.3.1",
  "expo-router": "~3.5.0",
  "@react-native-async-storage/async-storage": "1.23.1",
  "expo-local-authentication": "~14.0.0"
}
```

Ver `package.json` para lista completa.

---

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web
```

### Compilación APK

#### Prebuild (primera vez o después de cambios en app.json)
```bash
npx expo prebuild --platform android --clean
```

#### Exportar bundle
```bash
npx expo export --platform android --output-dir android/app/src/main/assets --clear
```

#### Compilar APK Release
```bash
cd android
# Windows
$env:ANDROID_HOME = "C:\Users\tu-usuario\AppData\Local\Android\Sdk"
.\gradlew assembleRelease --no-daemon

# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
./gradlew assembleRelease --no-daemon
```

El APK se generará en: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📁 Estructura del Proyecto

```
lms-mobile-app/
├── app/                    # Pantallas y rutas (Expo Router)
│   ├── (auth)/            # Pantallas de autenticación
│   ├── (tabs)/            # Pantallas principales con tabs
│   ├── curso/[id].tsx     # Detalle de curso
│   ├── leccion/[id].tsx   # Detalle de lección
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes reutilizables
│   ├── CustomTabBar.tsx   # Barra de navegación inferior
│   └── ...
├── lib/                   # Utilidades y configuración
│   ├── contexts/          # Contextos de React
│   │   └── TabBarContext.tsx
│   ├── services/          # Servicios de API
│   │   ├── authCustomService.ts
│   │   ├── cursoService.ts
│   │   ├── materialService.ts
│   │   └── storageService.ts
│   └── supabase.ts       # Cliente de Supabase
├── types/                 # Tipos TypeScript
│   └── database.ts
├── supabase/             # Scripts SQL y configuración
│   ├── schema.sql        # Schema de base de datos
│   └── STORAGE_SETUP.md  # Configuración de Storage
├── android/              # Código nativo Android
├── assets/              # Imágenes y recursos
├── .env                 # Variables de entorno (NO subir a Git)
├── app.json             # Configuración de Expo
├── package.json         # Dependencias
└── README.md           # Este archivo
```

---

## 🔐 Variables de Entorno

### Archivo `.env` (crear en la raíz)

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui

# Google OAuth (opcional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id
```

**⚠️ IMPORTANTE**: 
- El archivo `.env` está en `.gitignore` y NO se sube a Git
- Cada desarrollador debe crear su propio `.env` con sus credenciales
- Las variables deben empezar con `EXPO_PUBLIC_` para que Expo las incluya en el bundle

### Obtener Credenciales de Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Settings → API
3. Copia:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 📚 Agregar Materiales PDF

### Procedimiento Completo

1. **Subir PDF a Supabase Storage**:
   - Ve a Supabase Dashboard → Storage
   - Abre el bucket `pdfs`
   - Sube el archivo PDF
   - Copia la URL pública

2. **Obtener ID de la Lección**:
   ```sql
   SELECT id, title FROM lessons_lms_movil WHERE title = 'Nombre de la lección';
   ```
   El `id` será algo como "ID-005" (tipo text)

3. **Insertar en Base de Datos**:
   - Ve a Table Editor → `materiales_leccion`
   - Insertar nuevo registro:
     - `leccion_id`: "ID-005" (o el ID de tu lección)
     - `nombre_archivo`: "Mi PDF.pdf"
     - `url_archivo`: URL pública del PDF
     - `tipo_archivo`: "application/pdf"
     - `descripcion`: (opcional)
     - `orden`: 0, 1, 2, etc.

4. **Verificar**: El PDF aparecerá automáticamente en la sección "📚 Materiales" de la lección

Ver `CHANGELOG_COMPLETO.md` para más detalles.

---

## 🐛 Troubleshooting

### La app no inicia
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- Ejecuta `npm install` para reinstalar dependencias
- Limpia la caché: `npx expo start -c`

### Error al compilar APK
- Verifica que `ANDROID_HOME` esté configurado correctamente
- Ejecuta `npx expo prebuild --platform android --clean`
- Limpia el proyecto: `cd android && ./gradlew clean`

### Videos de YouTube no se reproducen
- Verifica que la URL del video sea válida
- La app usa `react-native-youtube-iframe` para reproducir videos
- Si falla, ofrece abrir en YouTube nativo

### No se muestran los materiales PDF
- Verifica que el bucket `pdfs` en Supabase Storage esté configurado como público
- Verifica que la URL del PDF sea accesible
- Revisa que `leccion_id` en `materiales_leccion` coincida con el `id` de la lección

### Problemas de autenticación
- Verifica que la tabla `authenticated_users_lms_movil` tenga usuarios
- Las contraseñas deben estar hasheadas
- Ver `SOLUCION_LOGIN.md` para más detalles

---

## 📖 Documentación Adicional

- `CHANGELOG_COMPLETO.md` - Historial completo de cambios
- `INSTALACION.md` - Guía detallada de instalación
- `supabase/STORAGE_SETUP.md` - Configuración de Storage
- `SOLUCION_LOGIN.md` - Solución de problemas de login
- `DEBUG_LECCIONES.md` - Debug de problemas con lecciones

---

## 🔄 Actualizaciones y Versiones

### Versión 1.0.0 (11/06/2025)
- ✅ Nombre de app: "Academia TodosSomosTraders"
- ✅ Botón "Regresar a Inicio" en curso y lección
- ✅ Barra de navegación inferior personalizada
- ✅ Reproductor de YouTube funcional
- ✅ Sistema de materiales PDF
- ✅ Mejoras de navegación y UI

Ver `CHANGELOG_COMPLETO.md` para detalles completos.

---

## 👥 Contribución

Para compartir el proyecto:

1. **Clonar el repositorio**:
```bash
git clone https://github.com/gabrieldave/LMScurso.git
```

2. **Crear archivo `.env`** con las credenciales de Supabase

3. **Configurar la base de datos** en Supabase (ver sección "Configuración de Base de Datos")

4. **Instalar dependencias**:
```bash
npm install
```

5. **Iniciar desarrollo**:
```bash
npm start
```

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar la documentación en los archivos `.md`
2. Verificar logs de la aplicación
3. Revisar configuración de Supabase
4. Consultar `CHANGELOG_COMPLETO.md` para cambios recientes

---

## 📝 Notas Importantes

- **Credenciales**: Nunca subas el archivo `.env` a Git
- **Base de Datos**: Los IDs de lecciones son tipo `text` (ej: "ID-005"), no UUID
- **Storage**: El bucket `pdfs` debe ser público para que los PDFs sean accesibles
- **APK**: El tamaño aproximado del APK es ~92 MB

---

**Desarrollado con ❤️ usando React Native, Expo y Supabase**
