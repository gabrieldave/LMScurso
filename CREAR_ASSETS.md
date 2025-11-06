# Crear Assets para la Aplicación

Para generar el APK, necesitas crear los siguientes archivos en la carpeta `assets/`:

## Assets Requeridos:

1. **icon.png** - 1024x1024 px (Icono de la app)
2. **splash.png** - 1242x2436 px (Pantalla de inicio)
3. **adaptive-icon.png** - 1024x1024 px (Icono adaptativo para Android)
4. **favicon.png** - 48x48 px (Icono para web)

## Opción 1: Usar Herramienta Online (Rápido)

1. Ve a: https://www.appicon.co
2. Sube una imagen cuadrada (1024x1024)
3. Descarga los assets generados
4. Coloca los archivos en la carpeta `assets/`

## Opción 2: Crear Assets Manualmente

### icon.png y adaptive-icon.png
- Tamaño: 1024x1024 px
- Formato: PNG
- Fondo transparente (para adaptive-icon)
- Fondo sólido (para icon)

### splash.png
- Tamaño: 1242x2436 px (o 1284x2778 para iPhone)
- Formato: PNG
- Color de fondo: #ffffff (blanco)

### favicon.png
- Tamaño: 48x48 px
- Formato: PNG

## Opción 3: Usar Assets Temporales Simples

Puedes crear imágenes simples con cualquier editor de imágenes:
- Un cuadrado de color sólido para icon.png
- Una imagen con el logo/nombre de tu app para splash.png
- Mismo icono para adaptive-icon.png
- Versión pequeña para favicon.png

Después de crear los assets, ejecuta:
```bash
npx expo prebuild --platform android
eas build --platform android --profile preview
```





