-- Agregar columna precio_dolar a la tabla configuracion_local
-- Esta columna almacenará la cotización del dólar configurada por el usuario

ALTER TABLE configuracion_local 
ADD COLUMN IF NOT EXISTS precio_dolar NUMERIC(10, 2) DEFAULT 1000.00;

COMMENT ON COLUMN configuracion_local.precio_dolar IS 'Cotización del dólar en pesos argentinos para calcular el valor del inventario';
