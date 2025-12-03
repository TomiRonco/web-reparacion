-- Migración para agregar campos detallados a reparaciones
-- Fecha: 3 de diciembre de 2025

-- 1. Agregar columnas para mano de obra y repuestos
ALTER TABLE reparaciones
ADD COLUMN IF NOT EXISTS mano_obra DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS repuestos JSONB DEFAULT '[]'::jsonb;

-- 2. Migrar datos existentes: pasar monto actual a mano_obra
-- (solo para reparaciones que ya tienen monto)
UPDATE reparaciones
SET mano_obra = COALESCE(monto, 0)
WHERE monto IS NOT NULL AND mano_obra = 0;

-- 3. Comentarios sobre las columnas
COMMENT ON COLUMN reparaciones.mano_obra IS 'Costo de la mano de obra de la reparación';
COMMENT ON COLUMN reparaciones.repuestos IS 'Array de repuestos con estructura: [{detalle: string, precio: number}]';
COMMENT ON COLUMN reparaciones.monto IS 'Monto total calculado: mano_obra + suma(repuestos.precio)';

-- Nota: El campo tecnico_id ya existe en la tabla, solo se moverá su selección
-- del formulario de crear al formulario de editar en el frontend
