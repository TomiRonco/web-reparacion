-- Agregar columna codigo_barras a los items de los contenedores
-- Esta columna almacenará el código de barras único para cada item del stock

-- Nota: Como los items están almacenados en JSONB dentro de la tabla contenedores,
-- no podemos agregar una columna directamente. 
-- El campo codigo_barras se manejará dentro del objeto JSON de cada item.

-- Estructura esperada de cada item en el JSONB:
-- {
--   "id": "uuid",
--   "detalle": "string",
--   "precio": number,
--   "tipo_precio": "ARS" | "USD",
--   "cantidad": number,
--   "ubicacion": "string",
--   "codigo_barras": "string" (NUEVO - opcional)
-- }

-- No se requiere ejecutar ningún SQL ya que JSONB permite campos dinámicos.
-- Esta migración es solo informativa sobre la nueva estructura de datos.

-- Para generar códigos de barras únicos, se usará el formato:
-- STK-{timestamp}-{random} 
-- Ejemplo: STK-1701648000-A1B2C3

-- Los códigos pueden ser:
-- 1. Generados automáticamente por la aplicación
-- 2. Escaneados desde productos existentes (EAN-13, UPC, etc)
-- 3. Asignados manualmente por el usuario
