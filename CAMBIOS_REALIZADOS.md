# Cambios Realizados para Usar Tablas Personalizadas

## Resumen
La app ahora usa las tablas personalizadas `_lms_movil` en lugar de las tablas estándar de Supabase.

## Cambios Principales

### 1. Autenticación Custom
- ✅ Creado `lib/services/authCustomService.ts`
- ✅ Usa `authenticated_users_lms_movil` en lugar de `auth.users`
- ✅ Login/registro con email y contraseña
- ✅ Sesión almacenada en AsyncStorage

### 2. Servicios de Cursos
- ✅ Actualizado `lib/services/cursoService.ts`
- ✅ Usa `courses_lms_movil` en lugar de `cursos`
- ✅ Usa `lessons_lms_movil` en lugar de `lecciones`
- ✅ Usa `user_course_enrollments_lms_movil` para inscripciones
- ✅ Usa `user_lesson_completions_lms_movil` para progreso

### 3. Pantallas Actualizadas
- ✅ `app/(auth)/login.tsx`: Logo agregado, autenticación custom
- ✅ `app/(tabs)/catalogo.tsx`: Usa email en lugar de user.id
- ✅ `app/curso/[id].tsx`: Usa nuevas tablas y email
- ✅ `app/leccion/[id].tsx`: Usa nuevas tablas y email
- ✅ `app/(tabs)/perfil.tsx`: Usa autenticación custom
- ✅ `app/_layout.tsx`: Usa autenticación custom
- ✅ `app/index.tsx`: Usa autenticación custom

### 4. Nueva Pantalla de Soporte
- ✅ Creado `app/(tabs)/soporte.tsx`
- ✅ Incluye enlaces a redes sociales (Facebook, Twitter, Instagram, YouTube, TikTok)
- ✅ Incluye opciones de soporte (WhatsApp, Telegram, Testimonios)
- ✅ Actualizado `app/(tabs)/_layout.tsx` para incluir tab de Soporte

### 5. Logo en Login
- ✅ Logo "TODOS SOMOS TRADERS" agregado al login
- ✅ Diseño con círculo azul y borde dorado
- ✅ Símbolo de dólar y gráfico

## Mapeo de Tablas

| Tabla Antigua | Tabla Nueva | Columnas Mapeadas |
|--------------|-------------|-------------------|
| `cursos` | `courses_lms_movil` | `titulo` → `title`, `url_portada` → `image_url` |
| `lecciones` | `lessons_lms_movil` | `titulo_leccion` → `title`, `url_contenido` → `video_url`, `orden` → `order_index` |
| `suscripciones_curso` | `user_course_enrollments_lms_movil` | `user_id` → `email`, `acceso_otorgado` → `progress > 0` |
| `progreso_usuario` | `user_lesson_completions_lms_movil` | `user_id` → `email`, `completada` → `completed` |
| `auth.users` | `authenticated_users_lms_movil` | `id`, `email`, `name`, `password_hash` |

## Notas Importantes

1. **Autenticación**: Los usuarios deben tener `password_hash` configurado o usar "Crear cuenta nueva" para establecer una contraseña.

2. **Email como Identificador**: La app ahora usa el email del usuario en lugar del UUID de Supabase Auth para identificar al usuario en las tablas.

3. **Sesión**: La sesión se almacena en AsyncStorage con la clave `custom_session` y `user_email`.

4. **Redes Sociales**: Los enlaces en la pantalla de Soporte deben actualizarse con las URLs reales de tus redes sociales.

## Próximos Pasos

1. Compilar el nuevo APK
2. Probar login con usuarios existentes en `authenticated_users_lms_movil`
3. Actualizar URLs de redes sociales en `app/(tabs)/soporte.tsx`
4. Verificar que los PDFs se muestren correctamente (puede necesitar usar `materiales_leccion`)




