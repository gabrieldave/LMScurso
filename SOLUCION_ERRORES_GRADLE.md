# Solución de Errores de Gradle con Expo

## Error: Plugin 'expo-module-gradle-plugin' not found

Este error ocurre cuando el proyecto Android no está correctamente configurado después de prebuild.

### Solución 1: Limpiar y Regenerar (Recomendado)

```bash
# 1. Eliminar carpeta android
Remove-Item -Recurse -Force android

# 2. Limpiar cache de npm
npm cache clean --force

# 3. Reinstalar dependencias
npm install

# 4. Arreglar dependencias de Expo
npx expo install --fix

# 5. Regenerar proyecto Android
npx expo prebuild --platform android --clean
```

### Solución 2: Usar EAS Build (Más Confiable)

En lugar de construir localmente, usa EAS Build en la nube:

```bash
eas build --platform android --profile preview
```

Esto evita problemas de configuración local y es más rápido.

### Solución 3: Verificar Configuración de Gradle

Si necesitas construir localmente, verifica que:

1. **Android Studio** esté actualizado (versión 2023.x o superior)
2. **Gradle** esté en la versión correcta (8.8 o superior)
3. **Java JDK** sea versión 17 o superior

Verifica en `android/build.gradle`:
```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
    }
}
```

### Solución 4: Limpiar Cache de Gradle

```bash
cd android
.\gradlew clean
.\gradlew --stop
cd ..
```

Luego intenta construir de nuevo.

## Error: "Could not get unknown property 'release'"

Este error ocurre cuando hay un problema con la configuración de publicación de Expo.

### Solución:

1. Asegúrate de usar la versión correcta de Expo SDK
2. Ejecuta `npx expo install --fix` para corregir versiones incompatibles
3. Elimina `android` y regenera con `npx expo prebuild --clean`

## Recomendación Final

**Para Windows, EAS Build es la mejor opción** porque:
- No requiere configuración compleja
- Evita problemas de compatibilidad
- El APK se genera en la nube
- Puedes descargarlo directamente

El build local en Windows puede ser complicado debido a problemas de compatibilidad entre Expo, Gradle y Windows.





