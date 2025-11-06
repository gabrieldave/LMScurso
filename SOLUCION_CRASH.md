# Solución al Crash de la Aplicación

## Problemas Identificados y Soluciones

### 1. Variables de Entorno Faltantes ⚠️ (PROBABLE CAUSA)

El archivo `lib/supabase.ts` lanza un error si no encuentra las variables de entorno:

```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase...');
}
```

**Solución:**

1. **Crea un archivo `.env` en la raíz del proyecto:**

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

2. **Instala `expo-constants` para manejar variables de entorno en producción:**

```powershell
npx expo install expo-constants
```

3. **Regenera el bundle y el APK:**

```powershell
# Limpia el proyecto
cd android
.\gradlew clean

# Regenera el bundle
cd ..
npx expo export --platform android --output-dir android/app/src/main/assets --clear

# Compila el APK
cd android
$env:ANDROID_HOME = "C:\Users\dakyo\AppData\Local\Android\Sdk"
.\gradlew assembleRelease
```

### 2. Corrección en MainActivity

Ya corregimos el problema en `MainActivity.kt` donde se pasaba `null` en lugar de `savedInstanceState`.

### 3. Obtener Logs del Crash

Para identificar el error exacto:

1. **Conecta tu dispositivo Android**
2. **Ejecuta el script:**

```powershell
.\obtener_logs.ps1
```

3. **Abre la aplicación** en tu dispositivo
4. **Cuando se cierre, presiona Ctrl+C** en la terminal
5. **Revisa el archivo `crash_logs.txt`**

Busca líneas que contengan:
- `FATAL EXCEPTION`
- `Error`
- `Exception`
- `ReactNativeJS`

### 4. Verificar Variables de Entorno en el Build

Si las variables de entorno no se están incluyendo en el build, puedes verificar:

1. **En desarrollo:**
   - Las variables `EXPO_PUBLIC_*` deberían estar disponibles automáticamente

2. **En producción (APK):**
   - Expo debería incrustar las variables en el bundle
   - Verifica que el archivo `.env` exista antes de compilar

### 5. Solución Temporal: Manejo de Errores

Si necesitas una solución rápida mientras configuras las variables, puedes modificar `lib/supabase.ts` para manejar mejor los errores:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// En lugar de lanzar error, usar valores por defecto o mostrar un mensaje
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variables de entorno de Supabase no configuradas');
  // Opcional: mostrar un mensaje al usuario en lugar de crashear
}
```

**Pero esto es solo temporal - asegúrate de configurar las variables correctamente.**

## Pasos para Resolver

1. ✅ **Crea el archivo `.env`** con tus credenciales de Supabase
2. ✅ **Regenera el bundle** con `npx expo export`
3. ✅ **Recompila el APK** con `gradlew assembleRelease`
4. ✅ **Instala el nuevo APK** en tu dispositivo
5. ✅ **Si aún falla**, ejecuta `obtener_logs.ps1` para ver el error exacto

## Nota Importante

El archivo `.env` debe estar en `.gitignore` para no subir tus credenciales a Git:

```gitignore
.env
.env.local
.env.*.local
```




