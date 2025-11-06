# Changelog Completo - Academia TodosSomosTraders

## Fecha: 11 de Junio, 2025

### Versión: 1.0.0 (Final)

---

## 📋 Resumen de Cambios

### 1. Nombre de la Aplicación
- **Cambio**: Nombre actualizado de "LMS Mobile App" a **"Academia TodosSomosTraders"**
- **Archivos modificados**:
  - `app.json` - Campo `name` actualizado
  - `android/app/src/main/res/values/strings.xml` - `app_name` actualizado

### 2. Botón de Navegación "Regresar a Inicio"
- **Implementación**: Botón agregado en pantallas de curso y lección para regresar al catálogo
- **Ubicación**:
  - `app/curso/[id].tsx` - Al inicio del contenido, antes del título del curso
  - `app/leccion/[id].tsx` - Al final del contenido, después del botón "Volver al Curso"
- **Texto**: "← Regresar a Inicio"
- **Funcionalidad**: Navega a `/(tabs)/catalogo`
- **Estilo**: Botón gris claro con borde y texto azul (#4285F4)

### 3. Barra de Navegación Inferior (CustomTabBar)
- **Estado**: Restaurada y funcionando
- **Componentes**:
  - `components/CustomTabBar.tsx` - Componente de barra de navegación personalizada
  - `lib/contexts/TabBarContext.tsx` - Contexto para controlar visibilidad
- **Iconos y Rutas**:
  - 🏠 **Catálogo** → `/(tabs)/catalogo`
  - 🎧 **Soporte** → `/(tabs)/soporte`
  - 👤 **Perfil** → `/(tabs)/perfil`
- **Pantallas donde aparece**:
  - `app/(tabs)/catalogo.tsx`
  - `app/(tabs)/soporte.tsx`
  - `app/(tabs)/perfil.tsx`
- **Características**:
  - Se oculta automáticamente cuando un video está reproduciéndose (funcionalidad preparada)
  - Resalta el tab activo con color azul
  - Posición fija en la parte inferior

### 4. Reproductor de YouTube
- **Librería**: `react-native-youtube-iframe` (v2.3.1)
- **Funcionalidades**:
  - Reproducción de videos de YouTube embebidos
  - Control de estado de reproducción (playing, paused, ended)
  - Marcado automático de lecciones como completadas cuando el video termina
  - Manejo de errores con opción de abrir en YouTube nativo
- **Archivo**: `app/leccion/[id].tsx`

### 5. Sistema de Materiales PDF
- **Tabla de Base de Datos**: `materiales_leccion`
- **Estructura**:
  ```sql
  - id (UUID, auto-generado)
  - leccion_id (text) - ID de la lección (ej: "ID-005")
  - nombre_archivo (text)
  - url_archivo (text) - URL pública de Supabase Storage
  - tipo_archivo (text) - "application/pdf"
  - descripcion (text, nullable)
  - orden (integer)
  - created_at (timestamp)
  ```
- **Storage**: Supabase Storage bucket `pdfs`
- **Servicio**: `lib/services/materialService.ts`
- **Visualización**: Sección "📚 Materiales" en pantalla de lección

### 6. Mantenimiento de Pantalla Encendida
- **Estado**: Preparado pero no activo (problemas de compatibilidad con Expo)
- **Librería considerada**: `react-native-keep-screen-on`
- **Nota**: Funcionalidad deshabilitada temporalmente para evitar errores de compilación

---

## 📁 Archivos Creados/Modificados

### Archivos Nuevos
- `components/CustomTabBar.tsx` - Barra de navegación personalizada
- `lib/contexts/TabBarContext.tsx` - Contexto para control de visibilidad del tab bar
- `CHANGELOG_COMPLETO.md` - Este archivo

### Archivos Modificados
- `app.json` - Nombre de la aplicación
- `android/app/src/main/res/values/strings.xml` - Nombre de la app en Android
- `app/_layout.tsx` - Agregado TabBarProvider
- `app/curso/[id].tsx` - Botón "Regresar a Inicio" agregado
- `app/leccion/[id].tsx` - Botón "Regresar a Inicio" agregado, reproductor YouTube
- `app/(tabs)/catalogo.tsx` - CustomTabBar agregado
- `app/(tabs)/soporte.tsx` - CustomTabBar agregado
- `app/(tabs)/perfil.tsx` - CustomTabBar agregado

### Archivos de Servicios
- `lib/services/materialService.ts` - Servicio para obtener materiales de lecciones
- `lib/services/storageService.ts` - Servicio para subir PDFs a Supabase Storage

---

## 🔧 Dependencias

### Agregadas
- `react-native-youtube-iframe`: ^2.3.1
- `react-native-keep-screen-on`: ^1.2.0 (instalada pero no activa)

### Removidas
- `react-native-webview`: 13.8.6 (reemplazada por youtube-iframe)
- `expo-keep-awake` (removida por problemas de compilación)

---

## 📱 Compilación APK

### Última Versión Compilada
- **Nombre**: Academia TodosSomosTraders
- **Tamaño**: 91.88 MB
- **Fecha**: 11/06/2025 12:12:47
- **Ubicación**: `android/app/build/outputs/apk/release/app-release.apk`

### Comandos de Compilación
```bash
# Exportar bundle
npx expo export --platform android --output-dir android/app/src/main/assets --clear

# Compilar APK
cd android
.\gradlew assembleRelease --no-daemon
```

---

## 🗄️ Base de Datos

### Tablas Principales
- `courses_lms_movil` - Cursos
- `lessons_lms_movil` - Lecciones (campo `id` es tipo `text`, ej: "ID-005")
- `materiales_leccion` - Materiales PDF adicionales
- `user_course_enrollments_lms_movil` - Inscripciones de usuarios
- `user_lesson_completions_lms_movil` - Progreso de lecciones

### Supabase Storage
- **Bucket**: `pdfs`
- **Configuración**: Público (para acceso directo a PDFs)
- **Estructura recomendada**: `{cursoId}/{nombreArchivo}.pdf`

---

## 📝 Procedimiento para Agregar PDFs

### Paso 1: Subir PDF a Supabase Storage
1. Ve a Supabase Dashboard → Storage
2. Abre el bucket `pdfs`
3. Sube el archivo PDF
4. Copia la URL pública

### Paso 2: Insertar en Base de Datos
1. Ve a Table Editor → `materiales_leccion`
2. Insertar nuevo registro:
   - `leccion_id`: ID de la lección (ej: "ID-005")
   - `nombre_archivo`: Nombre del PDF
   - `url_archivo`: URL pública del PDF
   - `tipo_archivo`: "application/pdf"
   - `descripcion`: (opcional)
   - `orden`: Número para ordenar

### Paso 3: Verificar
- El PDF aparecerá automáticamente en la sección "📚 Materiales" de la lección

---

## 🐛 Problemas Resueltos

### 1. Error de Reproducción de YouTube
- **Problema**: Videos de YouTube no se reproducían
- **Solución**: Reemplazado WebView por `react-native-youtube-iframe`

### 2. Pantalla se Apaga Durante Video
- **Problema**: Pantalla se apagaba durante reproducción
- **Estado**: Preparado pero no activo (problemas de compatibilidad)

### 3. Barra de Navegación Desaparecía
- **Problema**: Tab bar no aparecía en todas las pantallas
- **Solución**: Implementado CustomTabBar con contexto global

### 4. Error UUID en materiales_leccion
- **Problema**: Error al insertar materiales (esperaba UUID)
- **Solución**: Campo `leccion_id` es tipo `text`, usar IDs como "ID-005"

---

## 🎨 Estilos y Diseño

### Colores Principales
- **Azul Principal**: #4285F4
- **Fondo Tab Bar**: #1a1a1a
- **Texto Activo**: #4285F4
- **Texto Inactivo**: #999

### Componentes de UI
- CustomTabBar: Barra inferior fija con 3 tabs
- Botones de navegación: Estilo consistente con bordes redondeados
- Reproductor de video: Altura 220px, fondo negro

---

## 📚 Notas Técnicas

### Navegación
- Expo Router con estructura de tabs
- Rutas principales: `/(tabs)/catalogo`, `/(tabs)/soporte`, `/(tabs)/perfil`
- Rutas dinámicas: `/curso/[id]`, `/leccion/[id]`

### Estado y Contexto
- TabBarContext: Controla visibilidad del tab bar globalmente
- AsyncStorage: Almacena sesión de usuario y email

### Autenticación
- Sistema personalizado con `authenticated_users_lms_movil`
- Email como identificador principal (no UUID de Supabase Auth)

---

## 🚀 Próximas Mejoras Sugeridas

1. Activar funcionalidad de mantener pantalla encendida durante videos
2. Agregar descarga de PDFs para uso offline
3. Mejorar manejo de errores en reproductor de video
4. Agregar indicador de progreso de video
5. Implementar búsqueda de cursos/lecciones

---

## 📞 Soporte

Para cualquier problema o pregunta sobre la implementación, revisar:
- `DEBUG_LECCIONES.md` - Debug de problemas con lecciones
- `supabase/STORAGE_SETUP.md` - Configuración de Storage
- Logs de la aplicación para debugging

---

**Última actualización**: 11 de Junio, 2025
**Versión APK**: 1.0.0
**Estado**: ✅ Estable y funcionando

