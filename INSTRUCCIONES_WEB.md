# Instrucciones para Ejecutar la Versión Web del LMS

## Estado Actual

✅ **Cambios completados:**
- Registro de usuario integrado en la pantalla de login
- Adaptadores web creados (almacenamiento, crypto, autenticación)
- Todos los servicios actualizados para compatibilidad web
- Configuración web lista en `app.json`

## Cómo Ejecutar la Versión Web

### Opción 1: Desde tu máquina local (Recomendado)

Si tienes acceso al repositorio en tu máquina local:

```bash
# Instalar dependencias (si aún no lo has hecho)
npm install

# Instalar dependencias web específicas
npx expo install react-native-web react-dom

# Iniciar servidor web
npm run web
# o
expo start --web
```

La aplicación se abrirá automáticamente en `http://localhost:19006` (o el puerto que Expo asigne).

### Opción 2: Desde el entorno remoto (Cursor)

El servidor ya está iniciándose en segundo plano. Para acceder:

1. **Si estás en un entorno con acceso remoto:**
   - El servidor web estará disponible en el puerto que Expo asigne (normalmente 19006)
   - Necesitarás configurar un túnel o acceso remoto si estás en un servidor remoto

2. **Para verificar el estado del servidor:**
   ```bash
   # Ver logs del servidor
   tail -f /home/ubuntu/.cursor/projects/workspace/terminals/337707.txt
   
   # Ver puertos activos
   lsof -i -P -n | grep LISTEN | grep node
   ```

3. **Si necesitas reiniciar el servidor:**
   ```bash
   # Detener procesos de Expo
   pkill -f "expo start"
   
   # Reiniciar
   npm run web
   ```

## Características de la Versión Web

### ✅ Funcionalidades Implementadas:

1. **Autenticación:**
   - Login con email/contraseña
   - Registro de usuarios (integrado en login)
   - Login con Google OAuth (funciona en web)

2. **Almacenamiento:**
   - localStorage en web (automático)
   - AsyncStorage en móvil (automático)
   - Transparente para el código

3. **Crypto:**
   - Web Crypto API en web
   - expo-crypto en móvil
   - Compatible con SHA256

4. **Navegación:**
   - Expo Router funciona en web
   - Mismas rutas que en móvil

### 🔧 Configuración Necesaria

Asegúrate de tener configuradas las variables de entorno:

```bash
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id  # Opcional, para OAuth
```

## Solución de Problemas

### Error: "react-native-web not installed"
```bash
npx expo install react-native-web react-dom
```

### Error: "Metro bundler not starting"
```bash
# Limpiar caché
npx expo start --clear

# O reinstalar dependencias
rm -rf node_modules
npm install
```

### El servidor no responde
1. Verifica que el puerto no esté en uso:
   ```bash
   lsof -i :19006
   ```

2. Mata procesos de Expo anteriores:
   ```bash
   pkill -f expo
   ```

3. Reinicia el servidor:
   ```bash
   npm run web
   ```

## Notas Importantes

- La versión web usa las mismas rutas y componentes que la versión móvil
- El almacenamiento se maneja automáticamente (localStorage en web)
- La autenticación con Google funciona diferente en web (redirección automática)
- Algunas características móviles (como biométrica) no están disponibles en web

## Próximos Pasos

1. Probar el login y registro en web
2. Verificar que los cursos se carguen correctamente
3. Probar la navegación entre pantallas
4. Verificar que el OAuth de Google funcione correctamente
