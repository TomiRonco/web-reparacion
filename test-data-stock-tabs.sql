-- Script de datos de prueba para Stock con Tabs (Adelante/Atrás)
-- Ejecutar DESPUÉS de migration-add-stock.sql y migration-add-stock-ubicacion.sql

DO $$
DECLARE
  v_user_id UUID := '8d063842-fe3a-4314-b7e9-17f457f1cfc7'; -- ⚠️ CAMBIAR POR TU USER_ID REAL
BEGIN

-- ============================================
-- STOCK ADELANTE (15 contenedores)
-- ============================================

INSERT INTO contenedores (user_id, nombre, items, ubicacion) VALUES
-- Electrónica Adelante
(v_user_id, 'ADL-A1 Resistencias', '[
  {"detalle": "Resistencias 220Ω", "cantidad": 500},
  {"detalle": "Resistencias 1kΩ", "cantidad": 600},
  {"detalle": "Resistencias 10kΩ", "cantidad": 400}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-A2 Capacitores', '[
  {"detalle": "Capacitores 100nF", "cantidad": 200},
  {"detalle": "Capacitores 10µF", "cantidad": 150},
  {"detalle": "Capacitores 100µF", "cantidad": 120}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-A3 LEDs', '[
  {"detalle": "LEDs rojos 5mm", "cantidad": 250},
  {"detalle": "LEDs verdes 5mm", "cantidad": 200},
  {"detalle": "LEDs azules 5mm", "cantidad": 180},
  {"detalle": "LEDs blancos 5mm", "cantidad": 150}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-A4 Transistores', '[
  {"detalle": "BC548 NPN", "cantidad": 200},
  {"detalle": "BC558 PNP", "cantidad": 180},
  {"detalle": "2N2222", "cantidad": 150}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-A5 ICs Básicos', '[
  {"detalle": "LM358", "cantidad": 50},
  {"detalle": "NE555", "cantidad": 80},
  {"detalle": "7805 5V", "cantidad": 60}
]'::jsonb, 'adelante'),

-- Herramientas Adelante
(v_user_id, 'ADL-H1 Destornilladores', '[
  {"detalle": "Philips PH0", "cantidad": 3},
  {"detalle": "Philips PH1", "cantidad": 4},
  {"detalle": "Philips PH2", "cantidad": 5},
  {"detalle": "Plano 3mm", "cantidad": 3}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-H2 Pinzas', '[
  {"detalle": "Punta recta", "cantidad": 3},
  {"detalle": "Punta curva", "cantidad": 2},
  {"detalle": "Corte diagonal", "cantidad": 3}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-H3 Soldadura', '[
  {"detalle": "Estaño 60/40", "cantidad": 8},
  {"detalle": "Pasta flux", "cantidad": 5},
  {"detalle": "Puntas T12-D24", "cantidad": 6}
]'::jsonb, 'adelante'),

-- Repuestos Adelante
(v_user_id, 'ADL-R1 Cargadores', '[
  {"detalle": "Samsung original", "cantidad": 5},
  {"detalle": "iPhone Lightning", "cantidad": 4},
  {"detalle": "USB-C PD 20W", "cantidad": 6}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-R2 Pantallas', '[
  {"detalle": "iPhone 8 negro", "cantidad": 2},
  {"detalle": "Samsung A10", "cantidad": 3},
  {"detalle": "Vidrio templado 6.5\"", "cantidad": 15}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-R3 Cables USB', '[
  {"detalle": "Lightning 1m", "cantidad": 12},
  {"detalle": "USB-C 1m", "cantidad": 15},
  {"detalle": "Micro USB 1m", "cantidad": 10}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-R4 Auriculares', '[
  {"detalle": "In-ear genéricos", "cantidad": 20},
  {"detalle": "Bluetooth TWS", "cantidad": 8},
  {"detalle": "Vincha económicos", "cantidad": 5}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-R5 Mouse/Teclado', '[
  {"detalle": "Mouse USB", "cantidad": 10},
  {"detalle": "Mouse inalámbrico", "cantidad": 6},
  {"detalle": "Teclado USB", "cantidad": 4}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-R6 Memorias', '[
  {"detalle": "Pendrive 16GB", "cantidad": 12},
  {"detalle": "Pendrive 32GB", "cantidad": 8},
  {"detalle": "Micro SD 32GB", "cantidad": 15}
]'::jsonb, 'adelante'),

(v_user_id, 'ADL-R7 Adaptadores', '[
  {"detalle": "USB a Ethernet", "cantidad": 8},
  {"detalle": "USB-C a USB-A", "cantidad": 15},
  {"detalle": "HDMI a VGA", "cantidad": 6}
]'::jsonb, 'adelante');

-- ============================================
-- STOCK ATRÁS (15 contenedores)
-- ============================================

INSERT INTO contenedores (user_id, nombre, items, ubicacion) VALUES
-- Electrónica Atrás
(v_user_id, 'ATR-B1 Conectores', '[
  {"detalle": "Headers 40 pines", "cantidad": 100},
  {"detalle": "JST 2 pines", "cantidad": 120},
  {"detalle": "USB Mini", "cantidad": 30},
  {"detalle": "USB Micro", "cantidad": 45}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-B2 Cables', '[
  {"detalle": "UTP Cat5e azul (m)", "cantidad": 150},
  {"detalle": "Duplex 2x1mm (m)", "cantidad": 80},
  {"detalle": "Telefónico 2 pares (m)", "cantidad": 100}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-B3 Displays', '[
  {"detalle": "LCD 16x2 I2C", "cantidad": 12},
  {"detalle": "OLED 0.96 I2C", "cantidad": 8},
  {"detalle": "7 seg 4 dígitos", "cantidad": 10}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-B4 Sensores', '[
  {"detalle": "DHT11", "cantidad": 15},
  {"detalle": "DHT22", "cantidad": 10},
  {"detalle": "HC-SR04", "cantidad": 12},
  {"detalle": "PIR", "cantidad": 8},
  {"detalle": "LDR", "cantidad": 50}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-B5 Módulos RF', '[
  {"detalle": "HC-05 Bluetooth", "cantidad": 8},
  {"detalle": "ESP8266", "cantidad": 12},
  {"detalle": "ESP32", "cantidad": 10},
  {"detalle": "RF 433MHz TX", "cantidad": 15}
]'::jsonb, 'atras'),

-- Herramientas Atrás
(v_user_id, 'ATR-H1 Medición', '[
  {"detalle": "Tester DT-830B", "cantidad": 4},
  {"detalle": "Pinza amperométrica", "cantidad": 2},
  {"detalle": "Puntas tester", "cantidad": 8}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-H2 Adhesivos', '[
  {"detalle": "Cianoacrilato 3g", "cantidad": 12},
  {"detalle": "Pistola silicona", "cantidad": 2},
  {"detalle": "Barras silicona", "cantidad": 50},
  {"detalle": "Cinta aisladora", "cantidad": 15}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-H3 Tornillería', '[
  {"detalle": "Tornillos M3x10mm", "cantidad": 500},
  {"detalle": "Tornillos M3x16mm", "cantidad": 400},
  {"detalle": "Tuercas M3", "cantidad": 600},
  {"detalle": "Arandelas M3", "cantidad": 500}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-H4 Organización', '[
  {"detalle": "Cajas plásticas", "cantidad": 50},
  {"detalle": "Bolsas ziplock", "cantidad": 200},
  {"detalle": "Etiquetas adhesivas", "cantidad": 100}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-H5 Protoboard/PCB', '[
  {"detalle": "Protoboard 830", "cantidad": 10},
  {"detalle": "Mini protoboard 170", "cantidad": 15},
  {"detalle": "PCB simple faz 10x10", "cantidad": 20},
  {"detalle": "PCB doble faz 10x10", "cantidad": 15}
]'::jsonb, 'atras'),

-- Repuestos Atrás
(v_user_id, 'ATR-R1 Baterías Celular', '[
  {"detalle": "iPhone 7", "cantidad": 4},
  {"detalle": "iPhone 8", "cantidad": 3},
  {"detalle": "Samsung J5", "cantidad": 5}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-R2 Cables Varios', '[
  {"detalle": "HDMI 2m", "cantidad": 8},
  {"detalle": "Auxiliar 3.5mm", "cantidad": 6},
  {"detalle": "VGA", "cantidad": 5}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-R3 Webcam/Audio', '[
  {"detalle": "Webcam 720p", "cantidad": 6},
  {"detalle": "Micrófono USB", "cantidad": 4},
  {"detalle": "Parlantes 2.0", "cantidad": 5}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-R4 Fuentes', '[
  {"detalle": "Fuente 5V 2A USB", "cantidad": 8},
  {"detalle": "Fuente 12V 1A", "cantidad": 6},
  {"detalle": "Baterías 9V", "cantidad": 12}
]'::jsonb, 'atras'),

(v_user_id, 'ATR-R5 Accesorios', '[
  {"detalle": "Fundas silicona", "cantidad": 25},
  {"detalle": "Soportes auto", "cantidad": 8},
  {"detalle": "Protectores cámara", "cantidad": 20},
  {"detalle": "Kit limpieza", "cantidad": 12}
]'::jsonb, 'atras');

END $$;

-- Verificar inserción
SELECT 
  ubicacion,
  COUNT(*) as total_contenedores,
  SUM(jsonb_array_length(items)) as total_items
FROM contenedores 
WHERE user_id = '8d063842-fe3a-4314-b7e9-17f457f1cfc7' -- ⚠️ CAMBIAR
GROUP BY ubicacion
ORDER BY ubicacion;
