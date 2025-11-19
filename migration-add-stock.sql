-- Migración: Crear tabla de contenedores para gestión de stock
-- Fecha: 18 de noviembre de 2025
-- Descripción: Tabla para gestionar contenedores (cajas) con items de stock

-- Crear tabla de contenedores
CREATE TABLE IF NOT EXISTS contenedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios de las columnas
COMMENT ON TABLE contenedores IS 'Contenedores/cajas para gestión de stock';
COMMENT ON COLUMN contenedores.nombre IS 'Nombre o número identificador del contenedor/caja';
COMMENT ON COLUMN contenedores.items IS 'Array JSON con items de stock: [{detalle: string, cantidad: number}]';

-- Habilitar Row Level Security (RLS)
ALTER TABLE contenedores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para contenedores
CREATE POLICY "Los usuarios pueden ver sus propios contenedores"
  ON contenedores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios contenedores"
  ON contenedores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios contenedores"
  ON contenedores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios contenedores"
  ON contenedores FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_contenedores_updated_at
  BEFORE UPDATE ON contenedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX idx_contenedores_user_id ON contenedores(user_id);
CREATE INDEX idx_contenedores_nombre ON contenedores(nombre);
