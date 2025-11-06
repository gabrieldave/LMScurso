# Construir APK con Android Studio (Windows)

Si EAS Build falla, puedes construir el APK localmente usando Android Studio.

## Requisitos Previos

1. **Android Studio** instalado
2. **Java JDK 17** o superior
3. **Android SDK** configurado

## Pasos

### 1. Preparar el proyecto

```bash
# Eliminar carpeta android si existe
Remove-Item -Recurse -Force android -ErrorAction SilentlyContinue

# Generar proyecto nativo de Android
npx expo prebuild --platform android
```

### 2. Abrir en Android Studio

1. Abre Android Studio
2. Selecciona "Open an Existing Project"
3. Navega a la carpeta `android` dentro de tu proyecto
4. Espera a que Android Studio sincronice el proyecto

### 3. Construir el APK

#### Opción A: Desde Android Studio
1. Ve a `Build > Generate Signed Bundle / APK`
2. Selecciona `APK`
3. Crea un keystore (si es primera vez) o usa uno existente
4. Selecciona `release` como build variant
5. Click en `Finish`

#### Opción B: Desde Terminal (en la carpeta android)

```bash
cd android
.\gradlew assembleRelease
```

El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

### 4. APK de Debug (más rápido para pruebas)

```bash
cd android
.\gradlew assembleDebug
```

El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

## Solución de Problemas

### Error: "SDK not found"
- Abre Android Studio
- Ve a `Tools > SDK Manager`
- Instala Android SDK Platform 33 o superior

### Error: "Gradle sync failed"
- En Android Studio: `File > Sync Project with Gradle Files`
- O ejecuta: `cd android && .\gradlew clean`

### Error: "NDK not configured"
- Generalmente no es necesario para React Native
- Si aparece, instala NDK desde SDK Manager

## Notas

- El APK de debug es más rápido de construir pero no está optimizado
- El APK de release está optimizado y listo para distribución
- Para firmar el APK para producción, necesitas un keystore





