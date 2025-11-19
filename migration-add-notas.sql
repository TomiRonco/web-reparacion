-- Migración: Agregar columna 'notas' a la tabla reparaciones
-- Fecha: 18 de noviembre de 2025
-- Descripción: Agrega una columna opcional 'notas' a la tabla de reparaciones
--              para permitir agregar notas adicionales a cada reparación

-- Agregar la columna 'notas' a la tabla reparaciones
ALTER TABLE reparaciones 
ADD COLUMN IF NOT EXISTS notas TEXT;

-- Comentario de la columna para documentación
COMMENT ON COLUMN reparaciones.notas IS 'Notas adicionales opcionales sobre la reparación';
