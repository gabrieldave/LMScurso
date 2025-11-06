# Crear Usuario en Supabase

Si no puedes registrarte desde la app, puedes crear un usuario directamente en Supabase.

## Opción 1: Crear Usuario desde Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication > Users**
3. Haz clic en **"Add user"** o **"Invite user"**
4. Ingresa:
   - **Email**: tu email
   - **Password**: tu contraseña (mínimo 6 caracteres)
   - **Auto Confirm User**: Activa esta opción para que no necesite verificar email
5. Haz clic en **"Create user"**

## Opción 2: Usar la Nueva Funcionalidad de Registro

La app ahora tiene un botón **"Crear cuenta nueva"** en la pantalla de login:

1. Abre la app
2. Ingresa tu email y contraseña
3. Toca **"Crear cuenta nueva"**
4. Si el registro es exitoso, podrás iniciar sesión inmediatamente

## Opción 3: Crear Usuario desde SQL (Avanzado)

Si prefieres usar SQL directamente:

```sql
-- Nota: Esto requiere acceso de administrador
-- No es recomendable para usuarios normales, pero útil para testing

-- Crear usuario manualmente (requiere extensión pgcrypto)
-- Es mejor usar el Dashboard o la función de registro de la app
```

## Verificar Usuario Creado

Para verificar que el usuario se creó correctamente:

1. Ve a **Authentication > Users** en Supabase Dashboard
2. Deberías ver tu email en la lista
3. El usuario debería tener estado "Confirmed" si activaste "Auto Confirm User"

## Nota Importante

- La contraseña debe tener al menos 6 caracteres
- Si no activas "Auto Confirm User", necesitarás verificar el email antes de poder iniciar sesión
- El usuario se crea automáticamente en la tabla `perfiles` gracias al trigger `handle_new_user`

## Problemas Comunes

### "Email already registered"
- El usuario ya existe. Intenta iniciar sesión con ese email.

### "Invalid login credentials"
- Verifica que el email y contraseña sean correctos
- Asegúrate de que el usuario esté confirmado (verificado)

### "User not found"
- El usuario no existe. Crea uno primero usando el botón "Crear cuenta nueva"




