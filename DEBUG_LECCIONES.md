# Debug de Lecciones

## Problema
Las lecciones no se están mostrando en la pantalla de detalle del curso.

## Solución Implementada

1. **Logs de depuración agregados**:
   - En `getCursoPorId`: Muestra el ID del curso que se está buscando
   - En `getLeccionesPorCurso`: Muestra el ID del curso y las lecciones encontradas
   - En `cargarDatos`: Muestra el curso y lecciones cargadas

2. **Manejo mejorado de tipos**:
   - Convierte el `courseId` a string explícitamente
   - Intenta buscar con el ID como string primero
   - Si no encuentra resultados, intenta con el ID como número

3. **Mensaje cuando no hay lecciones**:
   - Muestra un mensaje "No hay lecciones disponibles" si el array está vacío
   - Muestra el conteo de lecciones en el título

## Cómo verificar

1. Instala el nuevo APK
2. Abre la app y ve a un curso
3. Revisa los logs en:
   - Android Studio Logcat
   - O usa: `adb logcat | grep -E "🔍|✅|❌|📚|📖"`
4. Busca estos mensajes:
   - `🔍 Buscando curso con ID:`
   - `🔍 Buscando lecciones para curso:`
   - `✅ Lecciones encontradas:`
   - `📖 Lecciones cargadas:`

## Posibles causas

1. **ID no coincide**: El `id` del curso no coincide con el `course_id` en las lecciones
2. **Tipo de dato**: El ID es string en un lugar y número en otro
3. **RLS (Row Level Security)**: Las políticas de seguridad pueden estar bloqueando las consultas
4. **Permisos**: El usuario no tiene permisos para leer las lecciones

## Verificación en Base de Datos

Ejecuta esta consulta para verificar:

```sql
-- Ver todos los cursos
SELECT id, title FROM courses_lms_movil;

-- Ver todas las lecciones con sus course_id
SELECT id, course_id, title, order_index FROM lessons_lms_movil ORDER BY course_id, order_index;

-- Verificar que los IDs coincidan
SELECT 
  c.id as curso_id,
  c.title as curso_title,
  COUNT(l.id) as lecciones_count
FROM courses_lms_movil c
LEFT JOIN lessons_lms_movil l ON l.course_id = c.id
GROUP BY c.id, c.title;
```




