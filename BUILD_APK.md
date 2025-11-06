# Guía para Crear APK de la Aplicación

## Opción 1: EAS Build (Recomendado - Requiere cuenta de Expo)

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Iniciar sesión en Expo

```bash
eas login
```

### 3. Configurar EAS Build

```bash
eas build:configure
```

Esto creará un archivo `eas.json` con la configuración.

### 4. Construir APK para Android

```bash
eas build --platform android --profile preview
```

O para un APK de producción:

```bash
eas build --platform android --profile production
```

El APK se generará en la nube y recibirás un enlace para descargarlo.

---

## Opción 2: Build Local con EAS (Sin cuenta de Expo)

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Instalar dependencias de Android

Asegúrate de tener instalado:
- Android Studio
- Java JDK
- Android SDK

### 3. Configurar build local

```bash
eas build:configure
```

Edita `eas.json` y agrega:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 4. Construir localmente

```bash
eas build --platform android --profile preview --local
```

---

## Opción 3: Build Manual con Expo (Más complejo)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Prebuild Android

```bash
npx expo prebuild --platform android
```

### 3. Construir APK

```bash
cd android
./gradlew assembleRelease
```

El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

---

## Notas Importantes

1. **Antes de construir**, asegúrate de:
   - Instalar todas las dependencias: `npm install`
   - Configurar correctamente las variables de entorno en `.env`
   - Verificar que todos los assets existan (icon.png, splash.png, etc.)

2. **Para subir PDFs**, recuerda configurar Supabase Storage:
   - Crear bucket `pdfs` en Supabase Dashboard
   - Configurar políticas RLS (ver `supabase/STORAGE_SETUP.md`)

3. **Permisos de Android**:
   - READ_EXTERNAL_STORAGE: Para seleccionar PDFs
   - WRITE_EXTERNAL_STORAGE: Para guardar PDFs descargados
   - INTERNET: Para conexión a Supabase

4. **Versionamiento**: Actualiza la versión en `app.json` antes de construir:

```json
"version": "1.0.1"  // Incrementa la versión
```

---

## Solución de Problemas

### Error: "No se encuentra eas.json"
Ejecuta: `eas build:configure`

### Error: "Missing Android SDK"
Instala Android Studio y configura las variables de entorno ANDROID_HOME

### Error: "Build failed"
Revisa los logs en la consola para ver el error específico





