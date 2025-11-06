# Solución al Problema de Login

Tienes usuarios en `authenticated_users_lms_movil`, pero la app usa `auth.users` de Supabase.

## Problema Identificado

- ✅ Tienes usuarios: `dulceesquivela26@gmail.com` y `david.del.rio.colin@gmail.com`
- ❌ Estos usuarios NO están en `auth.users` de Supabase
- ❌ Los `password_hash` están en NULL (no se pueden migrar)

## Soluciones

### Opción 1: Crear Usuarios en Supabase Auth (Más Rápido)

**Desde Supabase Dashboard:**

1. Ve a https://app.supabase.com → Tu Proyecto → **Authentication > Users**
2. Haz clic en **"Add user"** o **"Invite user"**
3. Para cada usuario:
   - **Email**: `dulceesquivela26@gmail.com`
   - **Password**: Crea una contraseña temporal (ej: `Temp123456`)
   - **Auto Confirm User**: ✅ Activa esta opción
   - Haz clic en **"Create user"**
4. Repite para `david.del.rio.colin@gmail.com`

**Luego:**
- Los usuarios pueden iniciar sesión con esas contraseñas temporales
- Pueden cambiar la contraseña desde la app después

### Opción 2: Registro desde la App (Recomendado)

1. Usa el botón **"Crear cuenta nueva"** en la app
2. Ingresa el email: `dulceesquivela26@gmail.com` o `david.del.rio.colin@gmail.com`
3. Establece una contraseña nueva
4. Inicia sesión inmediatamente

### Opción 3: Recuperar Contraseña

Si los usuarios ya existen en `auth.users` pero no recuerdan la contraseña:

1. En la app, agrega un botón "¿Olvidaste tu contraseña?"
2. O desde Supabase Dashboard: **Authentication > Users > [Usuario] > "Send password reset email"**

## Verificar Usuarios Creados

Para verificar que los usuarios están en `auth.users`:

1. Ve a **Authentication > Users** en Supabase Dashboard
2. Deberías ver los emails en la lista
3. Estado debe ser "Confirmed"

## Próximos Pasos

1. **Crea los usuarios en Supabase Auth** (Opción 1 o 2)
2. **Regenera el APK** con la funcionalidad de registro
3. **Prueba iniciar sesión** con los emails y contraseñas

## Nota Importante

Los usuarios en `authenticated_users_lms_movil` seguirán existiendo, pero la app usará `auth.users` de Supabase. Si necesitas mantener compatibilidad con ambas tablas, puedo crear una función de autenticación híbrida, pero es más complejo.




