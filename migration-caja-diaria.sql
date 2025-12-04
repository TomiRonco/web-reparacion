-- Crear tabla para gestionar transacciones de caja diaria
CREATE TABLE IF NOT EXISTS transacciones_caja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
  detalle TEXT NOT NULL,
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para optimizar búsquedas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_transacciones_caja_user_fecha 
ON transacciones_caja(user_id, fecha_hora DESC);

-- Habilitar Row Level Security
ALTER TABLE transacciones_caja ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propias transacciones
CREATE POLICY "Los usuarios solo pueden ver sus propias transacciones"
ON transacciones_caja
FOR SELECT
USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan insertar sus propias transacciones
CREATE POLICY "Los usuarios solo pueden insertar sus propias transacciones"
ON transacciones_caja
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan actualizar sus propias transacciones
CREATE POLICY "Los usuarios solo pueden actualizar sus propias transacciones"
ON transacciones_caja
FOR UPDATE
USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan eliminar sus propias transacciones
CREATE POLICY "Los usuarios solo pueden eliminar sus propias transacciones"
ON transacciones_caja
FOR DELETE
USING (auth.uid() = user_id);
