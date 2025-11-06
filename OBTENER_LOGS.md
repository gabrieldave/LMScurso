# Obtener Logs de Android para Diagnosticar el Crash

Para identificar por qué la aplicación se cierra, necesitamos ver los logs de Android.

## Pasos:

1. **Conecta tu dispositivo Android a la computadora** (o usa un emulador)

2. **Habilita USB Debugging en tu dispositivo:**
   - Ve a Configuración > Acerca del teléfono
   - Toca "Número de compilación" 7 veces para activar el modo desarrollador
   - Ve a Configuración > Opciones de desarrollador
   - Activa "Depuración USB"

3. **Verifica que el dispositivo esté conectado:**
```powershell
$env:ANDROID_HOME = "C:\Users\dakyo\AppData\Local\Android\Sdk"
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices
```

4. **Limpia los logs anteriores y captura nuevos logs:**
```powershell
$env:ANDROID_HOME = "C:\Users\dakyo\AppData\Local\Android\Sdk"
& "$env:ANDROID_HOME\platform-tools\adb.exe" logcat -c
& "$env:ANDROID_HOME\platform-tools\adb.exe" logcat *:E ReactNative:V ReactNativeJS:V AndroidRuntime:E > crash_logs.txt
```

5. **Abre la aplicación en tu dispositivo** (seguirá capturando logs)

6. **Cuando la app se cierre, presiona Ctrl+C** para detener la captura

7. **Revisa el archivo `crash_logs.txt`** y busca líneas que contengan:
   - `FATAL EXCEPTION`
   - `AndroidRuntime`
   - `ReactNativeJS`
   - `Error`

## Alternativa: Ver logs en tiempo real

Si prefieres ver los logs en tiempo real:

```powershell
$env:ANDROID_HOME = "C:\Users\dakyo\AppData\Local\Android\Sdk"
& "$env:ANDROID_HOME\platform-tools\adb.exe" logcat *:E ReactNative:V ReactNativeJS:V AndroidRuntime:E
```

Luego abre la app y verás los errores en tiempo real.

## Problemas Comunes y Soluciones:

### Si ves "Unable to load script"
- El bundle no se generó correctamente
- Solución: Regenera el APK con el bundle incluido

### Si ves "SoLoader initialization failed"
- Problema con bibliotecas nativas
- Solución: Verifica que todas las dependencias nativas estén correctamente configuradas

### Si ves errores de "MainActivity"
- Problema en la configuración de la actividad principal
- Solución: Verifica que MainActivity esté correctamente configurada

### Si ves errores de "Hermes"
- Problema con el motor JavaScript
- Solución: Verifica la configuración de Hermes en build.gradle




