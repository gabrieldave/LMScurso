# Instrucciones para Resolver el Login

## Situación Actual

Tienes usuarios en `authenticated_users_lms_movil`:
- ✅ `dulceesquivela26@gmail.com`
- ✅ `david.del.rio.colin@gmail.com`

Pero estos usuarios **NO están en `auth.users`** de Supabase, que es lo que usa la app.

## Solución Rápida (Elige una)

### Opción A: Crear Usuarios desde Supabase Dashboard ⭐ (Recomendado)

1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto: **calculadora**
3. Ve a: **Authentication > Users**
4. Haz clic en: **"Add user"** o **"Invite user"**
5. Para cada usuario:
   - **Email**: `dulceesquivela26@gmail.com`
   - **Password**: Crea una contraseña (ej: `Temp123456`)
   - **Auto Confirm User**: ✅ Marca esta casilla
   - Haz clic en **"Create user"**
6. Repite para `david.del.rio.colin@gmail.com`

**Luego:**
- Los usuarios pueden iniciar sesión en la app con esas contraseñas
- Pueden cambiar la contraseña después desde la app

### Opción B: Usar Registro en la App 📱

1. Instala el nuevo APK (ya incluye botón "Crear cuenta nueva")
2. Abre la app
3. En la pantalla de login, ingresa:
   - **Email**: `dulceesquivela26@gmail.com` o `david.del.rio.colin@gmail.com`
   - **Contraseña**: Crea una nueva contraseña
4. Toca **"Crear cuenta nueva"**
5. Si es exitoso, podrás iniciar sesión inmediatamente

### Opción C: Usar "Recuperar Contraseña"

Si los usuarios ya existen pero no recuerdan la contraseña:
1. Desde Supabase Dashboard: **Authentication > Users > [Usuario] > "Send password reset email"**
2. El usuario recibirá un email para resetear la contraseña

## Verificar que Funcionó

Después de crear los usuarios:

1. Ve a **Authentication > Users** en Supabase
2. Deberías ver los emails en la lista
3. Estado debe ser "Confirmed" ✅

## Prueba el Login

1. Abre la app
2. Ingresa:
   - **Email**: Uno de los emails creados
   - **Contraseña**: La contraseña que estableciste
3. Toca **"Iniciar sesión"**
4. Deberías entrar al catálogo de cursos

## Si Aún No Funciona

1. Verifica que el usuario esté en **Authentication > Users**
2. Verifica que el estado sea "Confirmed"
3. Ejecuta `.\obtener_logs.ps1` para ver el error exacto

## Nota

Los usuarios en `authenticated_users_lms_movil` seguirán existiendo, pero la app ahora usa `auth.users` de Supabase. Si necesitas mantener compatibilidad con ambas tablas, puedo crear una función híbrida, pero es más complejo.




