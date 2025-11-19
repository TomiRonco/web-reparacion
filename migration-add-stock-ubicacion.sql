-- Migración para agregar ubicación a contenedores (Stock Adelante / Stock Atrás)
-- Ejecutar en Supabase SQL Editor

-- Agregar columna ubicacion a la tabla contenedores
ALTER TABLE contenedores 
ADD COLUMN IF NOT EXISTS ubicacion TEXT NOT NULL DEFAULT 'atras';

-- Agregar constraint para validar valores
ALTER TABLE contenedores
ADD CONSTRAINT contenedores_ubicacion_check 
CHECK (ubicacion IN ('adelante', 'atras'));

-- Crear índice para optimizar búsquedas por ubicación
CREATE INDEX IF NOT EXISTS idx_contenedores_ubicacion 
ON contenedores(user_id, ubicacion);

-- Comentarios
COMMENT ON COLUMN contenedores.ubicacion IS 'Ubicación física del contenedor: adelante o atras';
