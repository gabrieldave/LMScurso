# Generar Bundle de JavaScript para APK

El error "Unable to load script" indica que el bundle de JavaScript no se está incluyendo en el APK.

## Solución: Generar el Bundle Manualmente

Para asegurarte de que el bundle se genere correctamente antes de crear el APK:

### Opción 1: Usar Expo para generar el bundle

```powershell
# Generar el bundle de producción
npx expo export --platform android --output-dir android/app/src/main/assets

# O si prefieres usar Metro directamente
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

### Opción 2: Build con Gradle (recomendado)

El plugin de React Native debería generar el bundle automáticamente. Asegúrate de:

1. **Limpiar el proyecto:**
```powershell
cd android
.\gradlew clean
```

2. **Generar el bundle y el APK:**
```powershell
.\gradlew assembleRelease
```

Esto debería generar automáticamente el bundle usando el comando `export:embed` configurado en `build.gradle`.

### Opción 3: Verificar que el bundle se genere

Si el bundle no se genera automáticamente, puedes verificar:

1. **Verificar que existe el directorio de assets:**
```powershell
Test-Path "android\app\src\main\assets"
```

Si no existe, créalo:
```powershell
New-Item -ItemType Directory -Path "android\app\src\main\assets" -Force
```

2. **Generar el bundle manualmente:**
```powershell
npx expo export --platform android --output-dir android/app/src/main/assets
```

3. **Verificar que el bundle se generó:**
```powershell
Test-Path "android\app\src\main\assets\index.android.bundle"
```

### Verificar la configuración

Asegúrate de que en `android/app/build.gradle` tengas:

```gradle
react {
    bundleCommand = "export:embed"
    // ... otras configuraciones
}
```

## Solución de Problemas

### Si el bundle no se genera:

1. **Verifica que Expo CLI esté instalado:**
```powershell
npx expo --version
```

2. **Limpia el caché de Metro:**
```powershell
npx expo start --clear
```

3. **Regenera el proyecto Android:**
```powershell
npx expo prebuild --clean --platform android
```

4. **Intenta generar el bundle manualmente y luego compilar:**
```powershell
# Generar bundle
npx expo export --platform android --output-dir android/app/src/main/assets

# Compilar APK
cd android
.\gradlew assembleRelease
```

### Si el bundle se genera pero no se carga:

1. Verifica que el archivo esté en `android/app/src/main/assets/index.android.bundle`
2. Verifica que el tamaño del archivo no sea 0 bytes
3. Asegúrate de que el buildType sea `release` (no `debug`)

## Nota Importante

Para builds de producción, siempre usa `assembleRelease` en lugar de `assembleDebug`, ya que `assembleDebug` no incluye el bundle en el APK por defecto.





