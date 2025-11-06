# Migrar Usuarios a Supabase Auth

Tienes usuarios en la tabla `authenticated_users_lms_movil`, pero la app usa `auth.users` de Supabase.

## Opción 1: Crear Usuarios en Supabase Auth (Recomendado)

Como los `password_hash` están en NULL, necesitarás crear nuevos usuarios con contraseñas:

### Desde Supabase Dashboard:

1. Ve a **Authentication > Users**
2. Haz clic en **"Add user"**
3. Para cada usuario de `authenticated_users_lms_movil`:
   - **Email**: Usa el email del usuario
   - **Password**: Crea una contraseña nueva (el usuario la cambiará después)
   - **Auto Confirm User**: ✅ Activa esta opción
4. Crea los usuarios

### O desde la App:

1. Usa el botón **"Crear cuenta nueva"** en la app
2. Cada usuario puede crear su propia cuenta con su email
3. Los usuarios existentes pueden usar "Recuperar contraseña" si ya tienen cuenta

## Opción 2: Migrar Automáticamente (Requiere Contraseñas)

Si tienes las contraseñas originales, puedo crear una función SQL para migrarlos. Pero como los `password_hash` están en NULL, esto no es posible.

## Opción 3: Adaptar la App para Usar authenticated_users_lms_movil

Puedo modificar la app para usar tu tabla custom, pero requerirá:
- Sistema de autenticación custom
- Manejo de contraseñas manual
- Más complejidad

**Recomendación**: Usa la Opción 1 (crear usuarios en Supabase Auth) porque:
- ✅ Es más seguro (Supabase maneja las contraseñas)
- ✅ Funciona con la app actual sin cambios
- ✅ Tienes funciones de recuperación de contraseña
- ✅ Compatible con todas las características de Supabase

## Pasos Inmediatos

1. **Crea usuarios en Supabase Auth**:
   - Email: `dulceesquivela26@gmail.com`
   - Email: `david.del.rio.colin@gmail.com`
   
2. **O usa el registro en la app**:
   - Los usuarios pueden registrarse con sus emails
   - Establecerán nuevas contraseñas

3. **Luego podrán iniciar sesión** normalmente desde la app




