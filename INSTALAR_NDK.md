# Instalar NDK en Android Studio

El proyecto requiere el **NDK (Native Development Kit)** versión **25.1.8937393** para compilar.

## ⚠️ IMPORTANTE: Instalar NDK desde Android Studio

**No tienes el NDK instalado.** Debes instalarlo desde Android Studio antes de poder compilar.

### Pasos detallados:

1. **Abre Android Studio**
2. **Abre el SDK Manager:**
   - En Windows: `File` → `Settings` → `Appearance & Behavior` → `System Settings` → `Android SDK`
   - O directamente: `Tools` → `SDK Manager`
3. **Selecciona la pestaña "SDK Tools"**
4. **Marca la casilla "Show Package Details"** (en la parte inferior derecha)
5. **Expande "NDK (Side by side)"** en la lista
6. **Busca y marca la versión "25.1.8937393"**
   - Si no aparece exactamente esta versión, marca la más reciente disponible (ej: 25.1.8937393 o superior)
7. **Haz clic en "Apply"**
8. **Acepta la licencia** cuando aparezca
9. **Espera a que se descargue e instale** (puede tardar varios minutos)

## Imagen de referencia

En el SDK Manager, deberías ver algo como esto:

```
☑ NDK (Side by side)
  ☑ 25.1.8937393
  ☐ 26.1.10909125
  ☐ 27.0.12077987
```

Marca la versión **25.1.8937393** (o la más cercana disponible).

## Verificar la instalación

Después de instalar, verifica que el NDK esté en:
```
C:\Users\dakyo\AppData\Local\Android\Sdk\ndk\25.1.8937393
```

## Después de instalar

Una vez instalado el NDK, intenta compilar nuevamente desde Android Studio o ejecuta:

```powershell
cd android
$env:ANDROID_HOME = "C:\Users\dakyo\AppData\Local\Android\Sdk"
.\gradlew assembleDebug
```

## Nota importante

Si Android Studio no muestra la versión exacta **25.1.8937393**, puedes:
1. Instalar la versión más reciente disponible del NDK (ej: 26.x o 27.x)
2. Luego actualizar el archivo `android/build.gradle` con la versión instalada

Para ver qué versiones de NDK tienes instaladas después de la instalación, revisa:
```
C:\Users\dakyo\AppData\Local\Android\Sdk\ndk\
```

## Solución de problemas

### Si el SDK Manager no abre:
- Asegúrate de que Android Studio esté completamente abierto
- Intenta cerrar y volver a abrir Android Studio

### Si no aparece la opción "Show Package Details":
- Puede estar en la parte inferior derecha del diálogo
- O puede estar en la parte superior como un checkbox pequeño

### Si la instalación falla:
- Verifica tu conexión a internet
- Asegúrate de tener suficiente espacio en disco (el NDK ocupa ~1GB)
- Intenta cerrar Android Studio y abrirlo como administrador

