-- Migración para agregar ubicación a contenedores (Stock Adelante / Stock Atrás)
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Agregar columna ubicacion a la tabla contenedores
-- Los contenedores existentes se quedarán como 'atras' (stock actual)
ALTER TABLE contenedores 
ADD COLUMN IF NOT EXISTS ubicacion TEXT NOT NULL DEFAULT 'atras';

-- PASO 2: Agregar constraint para validar valores
ALTER TABLE contenedores
ADD CONSTRAINT contenedores_ubicacion_check 
CHECK (ubicacion IN ('adelante', 'atras'));

-- PASO 3: Actualizar todos los registros existentes a 'atras'
-- Esto asegura que el stock actual quede como "Stock Atrás"
UPDATE contenedores 
SET ubicacion = 'atras' 
WHERE ubicacion IS NULL OR ubicacion = '';

-- PASO 4: Cambiar el default a 'adelante' para nuevos registros
ALTER TABLE contenedores 
ALTER COLUMN ubicacion SET DEFAULT 'adelante';

-- PASO 5: Crear índice para optimizar búsquedas por ubicación
CREATE INDEX IF NOT EXISTS idx_contenedores_ubicacion 
ON contenedores(user_id, ubicacion);

-- Comentarios
COMMENT ON COLUMN contenedores.ubicacion IS 'Ubicación física del contenedor: adelante (nuevos) o atras (stock existente)';

-- Verificar migración
SELECT 
  ubicacion,
  COUNT(*) as total_contenedores
FROM contenedores 
GROUP BY ubicacion
ORDER BY ubicacion;
