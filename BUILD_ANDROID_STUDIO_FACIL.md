# Construir APK con Android Studio (Método Más Fácil)

Ya que el build con Gradle desde línea de comandos tiene problemas, usa Android Studio directamente:

## Pasos en Android Studio

### 1. Abrir el Proyecto
1. Abre **Android Studio**
2. Click en **"Open"** o **"File > Open"**
3. Navega a `C:\lms-mobile-app\android`
4. Click en **"OK"**
5. Espera a que Android Studio sincronice el proyecto (puede tardar varios minutos la primera vez)

### 2. Sincronizar Gradle
- Si aparece un banner diciendo "Gradle files have changed", click en **"Sync Now"**
- O manualmente: **File > Sync Project with Gradle Files**

### 3. Construir el APK

#### Opción A: APK de Debug (Más Rápido)
1. En la barra superior, busca el menú desplegable que dice **"app"**
2. Selecciona **"app"** (si no está seleccionado)
3. Click en **Build > Build Bundle(s) / APK(s) > Build APK(s)**
4. Espera a que termine (puede tardar 5-15 minutos)
5. Cuando termine, aparecerá una notificación
6. Click en **"locate"** en la notificación
7. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Opción B: APK Firmado (Para Producción)
1. **Build > Generate Signed Bundle / APK**
2. Selecciona **APK**
3. Si es primera vez, crea un keystore:
   - Click en **"Create new..."**
   - Completa el formulario
   - Guarda el keystore en un lugar seguro
4. Selecciona el keystore y completa las credenciales
5. Selecciona **release** como build variant
6. Click en **Finish**
7. El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

### 4. Instalar el APK en tu Dispositivo
1. Copia el APK a tu teléfono
2. Abre el APK desde el administrador de archivos
3. Permite "Fuentes desconocidas" si es necesario
4. Instala la app

## Solución de Problemas Comunes

### Error: "SDK location not found"
1. En Android Studio: **File > Project Structure**
2. O **Tools > SDK Manager**
3. Verifica que el SDK esté instalado en: `C:\Users\dakyo\AppData\Local\Android\Sdk`

### Error: "Gradle sync failed"
1. **File > Invalidate Caches / Restart**
2. Selecciona **"Invalidate and Restart"**
3. Espera a que Android Studio reinicie y sincronice

### Error: "Kotlin not found" o errores de compilación
1. **File > Project Structure > Project**
2. Verifica que **Android Gradle Plugin Version** esté actualizado
3. Verifica que **Gradle Version** sea compatible
4. **Tools > SDK Manager > SDK Tools**
5. Instala **Kotlin** si no está instalado

### El proyecto no compila
1. Cierra Android Studio
2. Elimina las carpetas:
   - `android/.gradle`
   - `android/app/build`
   - `android/build`
3. Abre Android Studio de nuevo
4. **File > Sync Project with Gradle Files**

## Ventajas de Android Studio

- ✅ Interfaz visual más fácil
- ✅ Maneja automáticamente muchas configuraciones
- ✅ Mejor manejo de errores
- ✅ No necesitas recordar comandos de Gradle

## Archivo APK Generado

Una vez que el build termine exitosamente:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

¡Copia el APK a tu teléfono e instálalo!





