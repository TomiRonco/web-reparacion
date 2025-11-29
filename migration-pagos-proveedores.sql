-- Migración: Sistema de Pagos a Proveedores
-- Fecha: 2025-11-28
-- Descripción: Gestión completa de deudas con proveedores (comprobantes y pagos)

-- Tabla de Proveedores (tabs)
CREATE TABLE IF NOT EXISTS proveedores_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Comprobantes (Facturas, Remitos, Presupuestos, Notas de Crédito)
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

-- Tabla de Pagos Realizados
CREATE TABLE IF NOT EXISTS pagos_realizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proveedor_id UUID REFERENCES proveedores_pago(id) ON DELETE CASCADE NOT NULL,
  comprobante_ids UUID[] NOT NULL, -- Array de IDs de comprobantes pagados
  fecha_pago DATE NOT NULL,
  monto_pagado DECIMAL(12, 2) NOT NULL,
  moneda TEXT NOT NULL CHECK (moneda IN ('ARS', 'USD')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE proveedores_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_realizados ENABLE ROW LEVEL SECURITY;

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

-- Triggers para updated_at
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

-- Índices para optimizar consultas
CREATE INDEX idx_proveedores_pago_user_id ON proveedores_pago(user_id);
CREATE INDEX idx_comprobantes_user_id ON comprobantes(user_id);
CREATE INDEX idx_comprobantes_proveedor_id ON comprobantes(proveedor_id);
CREATE INDEX idx_comprobantes_pagado ON comprobantes(pagado);
CREATE INDEX idx_pagos_realizados_user_id ON pagos_realizados(user_id);
CREATE INDEX idx_pagos_realizados_proveedor_id ON pagos_realizados(proveedor_id);
