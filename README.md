# LMS Mobile App

Aplicación móvil tipo LMS desarrollada con React Native (Expo) y Supabase.

## Características

- Autenticación con Google y Biométrica
- Catálogo de cursos estilo Netflix
- Visor de lecciones (Videos de YouTube y PDFs)
- Sistema de Preguntas y Respuestas (Q&A)
- Búsqueda global
- Panel de administración
- Seguimiento de progreso

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

3. Configurar la base de datos:
Ejecutar el script SQL en `supabase/schema.sql` en tu proyecto de Supabase.

4. Iniciar la aplicación:
```bash
npm start
```

## Estructura del Proyecto

- `app/` - Pantallas y rutas (Expo Router)
- `components/` - Componentes reutilizables
- `lib/` - Utilidades y configuración
- `types/` - Tipos TypeScript
- `supabase/` - Scripts SQL y configuración

