# Script para obtener logs de Android
$env:ANDROID_HOME = "C:\Users\dakyo\AppData\Local\Android\Sdk"
$adb = "$env:ANDROID_HOME\platform-tools\adb.exe"

Write-Host "Verificando dispositivos conectados..."
& $adb devices

Write-Host "`nLimpiando logs anteriores..."
& $adb logcat -c

Write-Host "`nCapturando logs... (Presiona Ctrl+C cuando la app se cierre)"
Write-Host "Abre la aplicación ahora y espera a que se cierre."
Write-Host ""

& $adb logcat *:E ReactNative:V ReactNativeJS:V AndroidRuntime:E | Tee-Object -FilePath "crash_logs.txt"




