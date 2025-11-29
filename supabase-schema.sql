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
  precio_dolar NUMERIC(10, 2) DEFAULT 1000.00,
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
  
  -- Flag para mostrar precios en el PDF
  mostrar_precios BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Total calculado
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Fechas
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, numero_presupuesto)
);

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proveedor TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  completado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de contenedores para stock
CREATE TABLE IF NOT EXISTS contenedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  ubicacion TEXT NOT NULL CHECK (ubicacion IN ('adelante', 'atras')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de proveedores para pagos
CREATE TABLE IF NOT EXISTS proveedores_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de comprobantes (Facturas, Remitos, Presupuestos, Notas de Crédito)
CREATE TABLE IF NOT EXISTS comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proveedor_id UUID REFERENCES proveedores_pago(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('factura', 'remito', 'presupuesto', 'nota_credito')),
  numero TEXT NOT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  moneda TEXT NOT NULL CHECK (moneda IN ('ARS', 'USD')),
  pagado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de pagos realizados
CREATE TABLE IF NOT EXISTS pagos_realizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proveedor_id UUID REFERENCES proveedores_pago(id) ON DELETE CASCADE NOT NULL,
  comprobante_ids UUID[] NOT NULL,
  fecha_pago DATE NOT NULL,
  monto_pagado DECIMAL(12, 2) NOT NULL,
  moneda TEXT NOT NULL CHECK (moneda IN ('ARS', 'USD')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
CREATE INDEX idx_contenedores_user_id ON contenedores(user_id);
CREATE INDEX idx_contenedores_ubicacion ON contenedores(ubicacion);

ALTER TABLE configuracion_local ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reparaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_realizados ENABLE ROW LEVEL SECURITY;

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

-- Políticas RLS para pedidos
CREATE POLICY "Los usuarios pueden ver sus propios pedidos"
  ON pedidos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios pedidos"
  ON pedidos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios pedidos"
  ON pedidos FOR DELETE
  USING (auth.uid() = user_id);

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

-- Políticas RLS para proveedores_pago
CREATE POLICY "Los usuarios pueden ver sus propios proveedores"
  ON proveedores_pago FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios proveedores"
  ON proveedores_pago FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios proveedores"
  ON proveedores_pago FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios proveedores"
  ON proveedores_pago FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para comprobantes
CREATE POLICY "Los usuarios pueden ver sus propios comprobantes"
  ON comprobantes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios comprobantes"
  ON comprobantes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios comprobantes"
  ON comprobantes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios comprobantes"
  ON comprobantes FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para pagos_realizados
CREATE POLICY "Los usuarios pueden ver sus propios pagos"
  ON pagos_realizados FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios pagos"
  ON pagos_realizados FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios pagos"
  ON pagos_realizados FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios pagos"
  ON pagos_realizados FOR DELETE
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

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contenedores_updated_at
  BEFORE UPDATE ON contenedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proveedores_pago_updated_at
  BEFORE UPDATE ON proveedores_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comprobantes_updated_at
  BEFORE UPDATE ON comprobantes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_realizados_updated_at
  BEFORE UPDATE ON pagos_realizados
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
CREATE INDEX idx_pedidos_user_id ON pedidos(user_id);
CREATE INDEX idx_pedidos_completado ON pedidos(completado);
CREATE INDEX idx_proveedores_pago_user_id ON proveedores_pago(user_id);
CREATE INDEX idx_comprobantes_user_id ON comprobantes(user_id);
CREATE INDEX idx_comprobantes_proveedor_id ON comprobantes(proveedor_id);
CREATE INDEX idx_comprobantes_pagado ON comprobantes(pagado);
CREATE INDEX idx_pagos_realizados_user_id ON pagos_realizados(user_id);
CREATE INDEX idx_pagos_realizados_proveedor_id ON pagos_realizados(proveedor_id);
