-- Script para generar datos de prueba para la funcionalidad de Stock
-- Este script crea múltiples contenedores con varios items para probar la generación de PDF
-- Incluye datos para Stock Adelante y Stock Atrás

-- IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con tu user_id real de auth.users
-- Puedes obtener tu user_id ejecutando: SELECT id FROM auth.users WHERE email = 'tu_email@ejemplo.com';

-- Variable de usuario (CAMBIAR ESTO)
DO $$
DECLARE
  v_user_id UUID := '8d063842-fe3a-4314-b7e9-17f457f1cfc7'; -- ⚠️ CAMBIAR POR TU USER_ID REAL
BEGIN

-- Limpiar datos de prueba anteriores (opcional)
-- DELETE FROM contenedores WHERE user_id = v_user_id;

-- ============================================
-- STOCK ADELANTE (15 contenedores)
-- ============================================

-- Contenedores de Electrónica Stock Adelante (5 contenedores)
INSERT INTO contenedores (user_id, nombre, items, ubicacion) VALUES
(v_user_id, 'CAJÓN A1 - Resistencias', '[
  {"detalle": "Resistencias 220Ω 1/4W", "cantidad": 500},
  {"detalle": "Resistencias 330Ω 1/4W", "cantidad": 450},
  {"detalle": "Resistencias 1kΩ 1/4W", "cantidad": 600},
  {"detalle": "Resistencias 10kΩ 1/4W", "cantidad": 400},
  {"detalle": "Resistencias 100kΩ 1/4W", "cantidad": 350}
]'::jsonb, 'adelante'),

(v_user_id, 'CAJÓN A2 - Capacitores', '[
  {"detalle": "Capacitores cerámicos 100nF", "cantidad": 200},
  {"detalle": "Capacitores electrolíticos 10µF", "cantidad": 150},
  {"detalle": "Capacitores electrolíticos 100µF", "cantidad": 120},
  {"detalle": "Capacitores 1µF 50V", "cantidad": 180}
]'::jsonb, 'adelante'),
  {"detalle": "Capacitores 1µF 50V", "cantidad": 180}
]'::jsonb),

(v_user_id, 'CAJÓN A3 - Diodos y LEDs', '[
  {"detalle": "Diodos 1N4007", "cantidad": 300},
  {"detalle": "LEDs rojos 5mm", "cantidad": 250},
  {"detalle": "LEDs verdes 5mm", "cantidad": 200},
  {"detalle": "LEDs azules 5mm", "cantidad": 180},
  {"detalle": "LEDs blancos 5mm", "cantidad": 150},
  {"detalle": "Diodos Zener 5.1V", "cantidad": 100}
]'::jsonb, 'adelante'),

(v_user_id, 'CAJÓN A4 - Transistores', '[
  {"detalle": "Transistores BC548 NPN", "cantidad": 200},
  {"detalle": "Transistores BC558 PNP", "cantidad": 180},
  {"detalle": "Transistores 2N2222", "cantidad": 150},
  {"detalle": "Transistores TIP41C", "cantidad": 80},
  {"detalle": "MOSFETs IRF540N", "cantidad": 60}
]'::jsonb, 'adelante'),

(v_user_id, 'CAJÓN A5 - Circuitos Integrados', '[
  {"detalle": "LM358 Amplificador operacional", "cantidad": 50},
  {"detalle": "NE555 Timer", "cantidad": 80},
  {"detalle": "7805 Regulador 5V", "cantidad": 60},
  {"detalle": "LM317 Regulador ajustable", "cantidad": 40},
  {"detalle": "Arduino Nano compatible", "cantidad": 15}
]'::jsonb, 'adelante');

(v_user_id, 'CAJÓN B1 - Conectores', '[
  {"detalle": "Headers macho 40 pines", "cantidad": 100},
  {"detalle": "Headers hembra 40 pines", "cantidad": 80},
  {"detalle": "Conectores JST 2 pines", "cantidad": 120},
  {"detalle": "Conectores USB Mini", "cantidad": 30},
  {"detalle": "Conectores USB Micro", "cantidad": 45}
]'::jsonb),

(v_user_id, 'CAJÓN B2 - Cables y Alambres', '[
  {"detalle": "Cable UTP Cat5e azul (metros)", "cantidad": 150},
  {"detalle": "Cable duplex 2x1mm rojo/negro (metros)", "cantidad": 80},
  {"detalle": "Alambre magneto 0.2mm", "cantidad": 50},
  {"detalle": "Cable telefonico 2 pares (metros)", "cantidad": 100}
]'::jsonb),

(v_user_id, 'CAJÓN B3 - Pantallas LCD/OLED', '[
  {"detalle": "Display LCD 16x2 con I2C", "cantidad": 12},
  {"detalle": "Display OLED 0.96 I2C", "cantidad": 8},
  {"detalle": "Display 7 segmentos 4 dígitos", "cantidad": 10},
  {"detalle": "Display Nokia 5110", "cantidad": 6}
]'::jsonb),

(v_user_id, 'CAJÓN B4 - Sensores', '[
  {"detalle": "Sensor temperatura DHT11", "cantidad": 15},
  {"detalle": "Sensor temperatura DHT22", "cantidad": 10},
  {"detalle": "Sensor ultrasonido HC-SR04", "cantidad": 12},
  {"detalle": "Sensor PIR movimiento", "cantidad": 8},
  {"detalle": "Sensor gas MQ-2", "cantidad": 6},
  {"detalle": "Fotoresistencia LDR", "cantidad": 50}
]'::jsonb),

(v_user_id, 'CAJÓN B5 - Módulos RF', '[
  {"detalle": "Módulo Bluetooth HC-05", "cantidad": 8},
  {"detalle": "Módulo WiFi ESP8266", "cantidad": 12},
  {"detalle": "Módulo WiFi ESP32", "cantidad": 10},
  {"detalle": "Módulo RF 433MHz transmisor", "cantidad": 15},
  {"detalle": "Módulo RF 433MHz receptor", "cantidad": 15}
]'::jsonb);

-- Contenedores de Herramientas (10 contenedores)
INSERT INTO contenedores (user_id, nombre, items) VALUES
(v_user_id, 'CAJÓN C1 - Destornilladores', '[
  {"detalle": "Destornillador Philips PH0", "cantidad": 3},
  {"detalle": "Destornillador Philips PH1", "cantidad": 4},
  {"detalle": "Destornillador Philips PH2", "cantidad": 5},
  {"detalle": "Destornillador plano 3mm", "cantidad": 3},
  {"detalle": "Destornillador plano 5mm", "cantidad": 4},
  {"detalle": "Set mini destornilladores precisión", "cantidad": 2}
]'::jsonb),

(v_user_id, 'CAJÓN C2 - Pinzas', '[
  {"detalle": "Pinza punta recta", "cantidad": 3},
  {"detalle": "Pinza punta curva", "cantidad": 2},
  {"detalle": "Pinza corte diagonal", "cantidad": 3},
  {"detalle": "Pinza pelacables", "cantidad": 2},
  {"detalle": "Pinza antiestática", "cantidad": 4}
]'::jsonb),

(v_user_id, 'CAJÓN C3 - Soldadura', '[
  {"detalle": "Estaño 60/40 carrete 100g", "cantidad": 8},
  {"detalle": "Pasta flux en jeringa", "cantidad": 5},
  {"detalle": "Puntas soldador T12-D24", "cantidad": 6},
  {"detalle": "Malla desoldadora", "cantidad": 10},
  {"detalle": "Limpiador puntas soldador", "cantidad": 3}
]'::jsonb),

(v_user_id, 'CAJÓN C4 - Medición', '[
  {"detalle": "Tester digital DT-830B", "cantidad": 4},
  {"detalle": "Pinza amperométrica", "cantidad": 2},
  {"detalle": "Termómetro infrarrojo", "cantidad": 1},
  {"detalle": "Puntas para tester", "cantidad": 8}
]'::jsonb),

(v_user_id, 'CAJÓN C5 - Adhesivos', '[
  {"detalle": "Pegamento cianoacrilato 3g", "cantidad": 12},
  {"detalle": "Pistola silicona caliente", "cantidad": 2},
  {"detalle": "Barras silicona caliente", "cantidad": 50},
  {"detalle": "Cinta aisladora negra", "cantidad": 15},
  {"detalle": "Cinta térmica conductiva", "cantidad": 8}
]'::jsonb),

(v_user_id, 'ESTANTE D1 - Tornillería', '[
  {"detalle": "Tornillos M3x10mm", "cantidad": 500},
  {"detalle": "Tornillos M3x16mm", "cantidad": 400},
  {"detalle": "Tuercas M3", "cantidad": 600},
  {"detalle": "Arandelas M3", "cantidad": 500},
  {"detalle": "Tornillos autoperforantes 3x10", "cantidad": 300},
  {"detalle": "Tornillos madera 3x16", "cantidad": 250}
]'::jsonb),

(v_user_id, 'ESTANTE D2 - Organización', '[
  {"detalle": "Cajas plásticas pequeñas", "cantidad": 50},
  {"detalle": "Bolsas ziplock 5x7cm", "cantidad": 200},
  {"detalle": "Etiquetas adhesivas blancas", "cantidad": 100},
  {"detalle": "Marcadores permanentes", "cantidad": 8},
  {"detalle": "Organizador compartimientos", "cantidad": 6}
]'::jsonb),

(v_user_id, 'ESTANTE D3 - Protoboard y PCB', '[
  {"detalle": "Protoboard 830 puntos", "cantidad": 10},
  {"detalle": "Mini protoboard 170 puntos", "cantidad": 15},
  {"detalle": "PCB virgen simple faz 10x10cm", "cantidad": 20},
  {"detalle": "PCB virgen doble faz 10x10cm", "cantidad": 15},
  {"detalle": "Baquelita perforada 5x7cm", "cantidad": 25}
]'::jsonb),

(v_user_id, 'ESTANTE D4 - Fuentes y Baterías', '[
  {"detalle": "Fuente 5V 2A USB", "cantidad": 8},
  {"detalle": "Fuente 12V 1A", "cantidad": 6},
  {"detalle": "Baterías 9V", "cantidad": 12},
  {"detalle": "Pilas AA recargables", "cantidad": 20},
  {"detalle": "Cargador pilas AA/AAA", "cantidad": 2}
]'::jsonb),

(v_user_id, 'ESTANTE D5 - Varios Electrónica', '[
  {"detalle": "Potenciómetros 10kΩ lineales", "cantidad": 30},
  {"detalle": "Pulsadores táctiles 6x6mm", "cantidad": 100},
  {"detalle": "Buzzers activos 5V", "cantidad": 20},
  {"detalle": "Relés 5V 10A", "cantidad": 15},
  {"detalle": "Disipadores aluminio TO-220", "cantidad": 25}
]'::jsonb);

-- Contenedores de Repuestos (10 contenedores)
INSERT INTO contenedores (user_id, nombre, items) VALUES
(v_user_id, 'REPUESTOS A - Cargadores', '[
  {"detalle": "Cargador Samsung original", "cantidad": 5},
  {"detalle": "Cargador iPhone Lightning", "cantidad": 4},
  {"detalle": "Cargador USB-C PD 20W", "cantidad": 6},
  {"detalle": "Cargador universal notebook", "cantidad": 3}
]'::jsonb),

(v_user_id, 'REPUESTOS B - Pantallas', '[
  {"detalle": "Pantalla iPhone 8 negro", "cantidad": 2},
  {"detalle": "Pantalla Samsung A10", "cantidad": 3},
  {"detalle": "Vidrio templado universal 6.5\"", "cantidad": 15}
]'::jsonb),

(v_user_id, 'REPUESTOS C - Baterías Celular', '[
  {"detalle": "Batería iPhone 7", "cantidad": 4},
  {"detalle": "Batería iPhone 8", "cantidad": 3},
  {"detalle": "Batería Samsung J5", "cantidad": 5},
  {"detalle": "Batería Motorola G6", "cantidad": 2}
]'::jsonb),

(v_user_id, 'REPUESTOS D - Cables', '[
  {"detalle": "Cable Lightning 1m", "cantidad": 12},
  {"detalle": "Cable USB-C 1m", "cantidad": 15},
  {"detalle": "Cable Micro USB 1m", "cantidad": 10},
  {"detalle": "Cable HDMI 2m", "cantidad": 8},
  {"detalle": "Cable auxiliar 3.5mm", "cantidad": 6}
]'::jsonb),

(v_user_id, 'REPUESTOS E - Auriculares', '[
  {"detalle": "Auriculares in-ear genéricos", "cantidad": 20},
  {"detalle": "Auriculares Bluetooth TWS", "cantidad": 8},
  {"detalle": "Auriculares vincha económicos", "cantidad": 5}
]'::jsonb),

(v_user_id, 'REPUESTOS F - Mouse y Teclado', '[
  {"detalle": "Mouse USB óptico", "cantidad": 10},
  {"detalle": "Mouse inalámbrico", "cantidad": 6},
  {"detalle": "Teclado USB español", "cantidad": 4},
  {"detalle": "Combo teclado + mouse", "cantidad": 3}
]'::jsonb),

(v_user_id, 'REPUESTOS G - Memorias', '[
  {"detalle": "Pendrive 16GB", "cantidad": 12},
  {"detalle": "Pendrive 32GB", "cantidad": 8},
  {"detalle": "Micro SD 32GB", "cantidad": 15},
  {"detalle": "Micro SD 64GB", "cantidad": 10}
]'::jsonb),

(v_user_id, 'REPUESTOS H - Webcam y Audio', '[
  {"detalle": "Webcam USB 720p", "cantidad": 6},
  {"detalle": "Micrófono USB económico", "cantidad": 4},
  {"detalle": "Parlantes 2.0 USB", "cantidad": 5}
]'::jsonb),

(v_user_id, 'REPUESTOS I - Adaptadores', '[
  {"detalle": "Adaptador USB a Ethernet", "cantidad": 8},
  {"detalle": "Adaptador USB-C a USB-A", "cantidad": 15},
  {"detalle": "Adaptador HDMI a VGA", "cantidad": 6},
  {"detalle": "Hub USB 4 puertos", "cantidad": 5},
  {"detalle": "Lector tarjetas SD/microSD", "cantidad": 10}
]'::jsonb),

(v_user_id, 'REPUESTOS J - Varios', '[
  {"detalle": "Fundas silicona genéricas", "cantidad": 25},
  {"detalle": "Soportes celular auto", "cantidad": 8},
  {"detalle": "Protectores cámara iPhone", "cantidad": 20},
  {"detalle": "Limpiadores pantalla kit", "cantidad": 12}
]'::jsonb);

END $$;

-- Verificar inserción
SELECT 
  COUNT(*) as total_contenedores,
  SUM(jsonb_array_length(items)) as total_items
FROM contenedores 
WHERE user_id = 'TU_USER_ID_AQUI'; -- ⚠️ CAMBIAR POR TU USER_ID REAL
