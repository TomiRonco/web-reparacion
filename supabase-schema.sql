-- Crear tabla de configuración del local
CREATE TABLE IF NOT EXISTS configuracion_local (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nombre_local TEXT,
  logo_url TEXT,
  ubicacion TEXT,
  telefono TEXT,
  celular TEXT,
  email TEXT,
  facebook TEXT,
  instagram TEXT,
  whatsapp TEXT,
  horarios TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  celular TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de reparaciones
CREATE TABLE IF NOT EXISTS reparaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  numero_comprobante INTEGER NOT NULL,
  
  -- Datos del cliente
  cliente_nombre TEXT NOT NULL,
  cliente_apellido TEXT NOT NULL,
  cliente_celular TEXT NOT NULL,
  
  -- Datos del producto
  producto TEXT NOT NULL,
  marca TEXT NOT NULL,
  tiene_cargador BOOLEAN NOT NULL,
  observacion TEXT,
  
  -- Asignación y estado
  tecnico_id UUID REFERENCES tecnicos(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'finalizada', 'entregada')),
  
  -- Diagnóstico y costo
  diagnostico TEXT,
  monto DECIMAL(10, 2),
  
  -- Fechas
  fecha_ingreso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_finalizado TIMESTAMP WITH TIME ZONE,
  fecha_entregado TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, numero_comprobante)
);

-- Crear tabla de presupuestos
CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  numero_presupuesto INTEGER NOT NULL,
  
  -- Datos del cliente (opcionales)
  cliente_nombre TEXT,
  cliente_cuit TEXT,
  cliente_direccion TEXT,
  
  -- Items del presupuesto (JSON array)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Observaciones opcionales
  observaciones TEXT,
  
  -- Total calculado
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Fechas
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, numero_presupuesto)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE configuracion_local ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reparaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para configuracion_local
CREATE POLICY "Los usuarios pueden ver su propia configuración"
  ON configuracion_local FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar su propia configuración"
  ON configuracion_local FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su propia configuración"
  ON configuracion_local FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas RLS para tecnicos
CREATE POLICY "Los usuarios pueden ver sus propios técnicos"
  ON tecnicos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios técnicos"
  ON tecnicos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios técnicos"
  ON tecnicos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios técnicos"
  ON tecnicos FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para reparaciones
CREATE POLICY "Los usuarios pueden ver sus propias reparaciones"
  ON reparaciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propias reparaciones"
  ON reparaciones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias reparaciones"
  ON reparaciones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias reparaciones"
  ON reparaciones FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para presupuestos
CREATE POLICY "Los usuarios pueden ver sus propios presupuestos"
  ON presupuestos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios presupuestos"
  ON presupuestos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios presupuestos"
  ON presupuestos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios presupuestos"
  ON presupuestos FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_configuracion_local_updated_at
  BEFORE UPDATE ON configuracion_local
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tecnicos_updated_at
  BEFORE UPDATE ON tecnicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reparaciones_updated_at
  BEFORE UPDATE ON reparaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presupuestos_updated_at
  BEFORE UPDATE ON presupuestos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX idx_configuracion_local_user_id ON configuracion_local(user_id);
CREATE INDEX idx_tecnicos_user_id ON tecnicos(user_id);
CREATE INDEX idx_reparaciones_user_id ON reparaciones(user_id);
CREATE INDEX idx_reparaciones_estado ON reparaciones(estado);
CREATE INDEX idx_reparaciones_numero_comprobante ON reparaciones(numero_comprobante);
CREATE INDEX idx_reparaciones_tecnico_id ON reparaciones(tecnico_id);
CREATE INDEX idx_presupuestos_user_id ON presupuestos(user_id);
CREATE INDEX idx_presupuestos_numero_presupuesto ON presupuestos(numero_presupuesto);
