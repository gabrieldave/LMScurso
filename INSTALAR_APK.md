# Instalar el APK en tu Dispositivo Android

## Ubicación del APK

El APK está en:
```
android\app\build\outputs\apk\release\app-release.apk
```

## Método 1: Transferir por USB (Recomendado)

### Paso 1: Conectar tu dispositivo
1. Conecta tu dispositivo Android a la computadora con un cable USB
2. En tu dispositivo, cuando aparezca la notificación "Cargando USB", tócala
3. Selecciona "Transferir archivos" o "MTP"

### Paso 2: Copiar el APK
1. Abre el explorador de archivos en tu computadora
2. Navega a: `C:\lms-mobile-app\android\app\build\outputs\apk\release\`
3. Copia `app-release.apk`
4. Pégalo en tu dispositivo (por ejemplo, en la carpeta Descargas o Documentos)

### Paso 3: Instalar
1. En tu dispositivo, abre el administrador de archivos
2. Navega a donde copiaste el APK
3. Toca el archivo `app-release.apk`
4. Si aparece una advertencia de "Orígenes desconocidos", ve a Configuración y permite la instalación
5. Toca "Instalar"
6. Cuando termine, toca "Abrir" o busca "LMS Mobile App" en tus aplicaciones

## Método 2: Instalar directamente con ADB

### Requisitos
- Dispositivo conectado por USB
- Depuración USB habilitada en el dispositivo

### Comando
```powershell
$env:ANDROID_HOME = "C:\Users\dakyo\AppData\Local\Android\Sdk"
& "$env:ANDROID_HOME\platform-tools\adb.exe" install -r android\app\build\outputs\apk\release\app-release.apk
```

El flag `-r` reemplaza la aplicación si ya está instalada.

## Método 3: Transferir por correo/cloud

1. Sube el APK a Google Drive, Dropbox, o envíalo por correo
2. Descárgalo en tu dispositivo
3. Instálalo siguiendo el paso 3 del Método 1

## Habilitar "Orígenes Desconocidos"

Si tu dispositivo no permite instalar APKs:

**Android 8.0 y superior:**
1. Ve a Configuración > Aplicaciones
2. Busca el administrador de archivos que estás usando (p. ej., "Archivos")
3. Toca "Instalar aplicaciones desconocidas"
4. Activa "Permitir desde esta fuente"

**Android 7.0 y anteriores:**
1. Ve a Configuración > Seguridad
2. Activa "Orígenes desconocidos"

## Verificar la Instalación

1. **Abre la aplicación** desde el menú de aplicaciones
2. **Verifica que se inicie correctamente** - ahora debería cargar sin crashear
3. **Si aún hay problemas**, ejecuta `.\obtener_logs.ps1` para ver los logs

## Problemas Comunes

### "La aplicación no se instaló"
- Verifica que tengas suficiente espacio
- Desinstala versiones anteriores si existen
- Asegúrate de que "Orígenes desconocidos" esté habilitado

### "La aplicación se sigue cerrando"
- Verifica que el bundle se haya generado correctamente
- Ejecuta `.\obtener_logs.ps1` para ver el error exacto
- Asegúrate de que el archivo `.env` tenga las credenciales correctas

### "No se puede conectar a Supabase"
- Verifica que el archivo `.env` tenga las credenciales correctas
- Revisa que el bundle se haya generado con las variables de entorno incluidas

## Nota Importante

Este APK es una versión de **release** que incluye:
- ✅ Bundle de JavaScript embebido
- ✅ Variables de entorno de Supabase
- ✅ Todas las dependencias nativas
- ✅ Optimizaciones de producción

¡La aplicación debería funcionar correctamente ahora!




