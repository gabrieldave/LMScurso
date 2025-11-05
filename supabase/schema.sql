-- ============================================
-- ESQUEMA DE BASE DE DATOS PARA LMS MOBILE APP
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: perfiles
-- ============================================
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  es_admin BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABLA: cursos
-- ============================================
CREATE TABLE IF NOT EXISTS cursos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  url_portada TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABLA: lecciones
-- ============================================
CREATE TABLE IF NOT EXISTS lecciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  titulo_leccion TEXT NOT NULL,
  url_contenido TEXT NOT NULL,
  tipo_contenido TEXT CHECK (tipo_contenido IN ('VIDEO', 'PDF')) NOT NULL,
  orden INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(curso_id, orden)
);

-- ============================================
-- TABLA: suscripciones_curso
-- ============================================
CREATE TABLE IF NOT EXISTS suscripciones_curso (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  acceso_otorgado BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, curso_id)
);

-- ============================================
-- TABLA: progreso_usuario
-- ============================================
CREATE TABLE IF NOT EXISTS progreso_usuario (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  leccion_id UUID REFERENCES lecciones(id) ON DELETE CASCADE NOT NULL,
  completada BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, leccion_id)
);

-- ============================================
-- TABLA: preguntas_leccion
-- ============================================
CREATE TABLE IF NOT EXISTS preguntas_leccion (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  leccion_id UUID REFERENCES lecciones(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pregunta TEXT NOT NULL,
  respuesta_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ÍNDICES para optimizar consultas
-- ============================================
CREATE INDEX IF NOT EXISTS idx_lecciones_curso_id ON lecciones(curso_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_user_id ON suscripciones_curso(user_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_curso_id ON suscripciones_curso(curso_id);
CREATE INDEX IF NOT EXISTS idx_progreso_user_id ON progreso_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_progreso_leccion_id ON progreso_usuario(leccion_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_leccion_id ON preguntas_leccion(leccion_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_user_id ON preguntas_leccion(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones_curso ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas_leccion ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS: perfiles
-- ============================================
-- Los usuarios pueden leer su propio perfil
CREATE POLICY "Users can view own profile" ON perfiles
  FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil (solo campos no admin)
CREATE POLICY "Users can update own profile" ON perfiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- POLÍTICAS RLS: cursos
-- ============================================
-- Todos los usuarios autenticados pueden ver los cursos
CREATE POLICY "Authenticated users can view courses" ON cursos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins pueden crear/actualizar/eliminar cursos
CREATE POLICY "Only admins can manage courses" ON cursos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid() AND perfiles.es_admin = TRUE
    )
  );

-- ============================================
-- POLÍTICAS RLS: lecciones
-- ============================================
-- Los usuarios solo pueden ver lecciones de cursos a los que tienen acceso
CREATE POLICY "Users can view accessible lessons" ON lecciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM suscripciones_curso
      WHERE suscripciones_curso.curso_id = lecciones.curso_id
      AND suscripciones_curso.user_id = auth.uid()
      AND suscripciones_curso.acceso_otorgado = TRUE
    )
  );

-- Solo admins pueden crear/actualizar/eliminar lecciones
CREATE POLICY "Only admins can manage lessons" ON lecciones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid() AND perfiles.es_admin = TRUE
    )
  );

-- ============================================
-- POLÍTICAS RLS: suscripciones_curso
-- ============================================
-- Cualquier usuario autenticado puede solicitar una suscripción (INSERT)
CREATE POLICY "Users can request course subscription" ON suscripciones_curso
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden ver sus propias suscripciones
CREATE POLICY "Users can view own subscriptions" ON suscripciones_curso
  FOR SELECT USING (auth.uid() = user_id);

-- Los admins pueden ver todas las suscripciones
CREATE POLICY "Admins can view all subscriptions" ON suscripciones_curso
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid() AND perfiles.es_admin = TRUE
    )
  );

-- Solo admins pueden actualizar suscripciones (otorgar acceso)
CREATE POLICY "Only admins can update subscriptions" ON suscripciones_curso
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid() AND perfiles.es_admin = TRUE
    )
  );

-- ============================================
-- POLÍTICAS RLS: progreso_usuario
-- ============================================
-- Los usuarios pueden ver y gestionar su propio progreso
CREATE POLICY "Users can manage own progress" ON progreso_usuario
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS RLS: preguntas_leccion
-- ============================================
-- Los usuarios pueden crear preguntas en lecciones a las que tienen acceso
CREATE POLICY "Users can create questions" ON preguntas_leccion
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM lecciones
      JOIN suscripciones_curso ON suscripciones_curso.curso_id = lecciones.curso_id
      WHERE lecciones.id = preguntas_leccion.leccion_id
      AND suscripciones_curso.user_id = auth.uid()
      AND suscripciones_curso.acceso_otorgado = TRUE
    )
  );

-- Los usuarios pueden ver preguntas de lecciones a las que tienen acceso
CREATE POLICY "Users can view questions" ON preguntas_leccion
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lecciones
      JOIN suscripciones_curso ON suscripciones_curso.curso_id = lecciones.curso_id
      WHERE lecciones.id = preguntas_leccion.leccion_id
      AND suscripciones_curso.user_id = auth.uid()
      AND suscripciones_curso.acceso_otorgado = TRUE
    )
  );

-- Los admins pueden responder preguntas
CREATE POLICY "Admins can answer questions" ON preguntas_leccion
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid() AND perfiles.es_admin = TRUE
    )
  );

-- ============================================
-- FUNCIÓN: Crear perfil automáticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, es_admin)
  VALUES (NEW.id, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCIÓN: Notificar por email cuando hay nueva pregunta
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_new_question()
RETURNS TRIGGER AS $$
BEGIN
  -- Esta función puede ser extendida para usar Supabase Edge Functions
  -- o servicios de email como SendGrid, Resend, etc.
  -- Por ahora, simplemente registramos el evento
  PERFORM pg_notify('new_question', json_build_object(
    'question_id', NEW.id,
    'leccion_id', NEW.leccion_id,
    'user_id', NEW.user_id,
    'pregunta', NEW.pregunta
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_question_created
  AFTER INSERT ON preguntas_leccion
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_question();

-- ============================================
-- NOTA: Para enviar emails reales, necesitarás crear una Edge Function
-- o configurar un servicio de email. El trigger pg_notify puede ser
-- escuchado por una Edge Function que envíe el email.
-- ============================================

