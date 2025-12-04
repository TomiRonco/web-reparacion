# 📱 Lector de Código de Barras - Guía de Uso

## ✅ Funcionalidad Implementada

El sistema de gestión de stock soporta **lectores físicos de código de barras** (tipo pistola/scanner USB) para automatizar la gestión de inventario. Los códigos se cargan **manualmente** escaneando o escribiendo el código real del producto.

## 🔧 Cómo Funciona

### 1. **Lectores Soportados**
- ✅ Lectores USB tipo pistola (plug & play)
- ✅ Lectores Bluetooth emparejados como teclado
- ✅ Lectores seriales configurados como HID
- ✅ Cualquier dispositivo que emule entrada de teclado

El lector funciona como un **teclado virtual**: escanea el código y presiona Enter automáticamente.

### 2. **Cargar Código de Barras a un Item**

#### Opción A: Producto con código existente (EAN, UPC, etc.)
1. Ve al contenedor y localiza el item
2. Haz clic en el ícono de **lápiz** (✏️) junto al item
3. En el modal, el input estará enfocado
4. **Escanea el código del producto** con el lector (se escribirá automáticamente)
   - O escribe el código manualmente
5. Haz clic en **Guardar**
6. El item ahora tiene código asignado (ícono verde 📊)

#### Opción B: Producto sin código (generar e imprimir)
1. Haz clic en **"Generar Código"** en el header
2. Se genera un código único: `STK-{timestamp}-{random}`
3. **Imprime** o **descarga** el código como PNG
4. Pega la etiqueta en el producto físico
5. Ve al item y haz clic en el **lápiz** (✏️)
6. Escanea el código que acabas de imprimir
7. Guarda

### 3. **Activar el Scanner para Descuento de Stock**

Una vez que los items tienen códigos asignados:

1. Haz clic en **"Activar Scanner"** (botón en header)
2. El botón cambia a verde pulsante: **"Escuchando..."**
3. Aparece indicador verde en esquina superior derecha
4. **Escanea el producto** que vendiste/usaste
5. Se abre modal automáticamente
6. Ingresa la **cantidad a descontar**
7. Confirma
8. Stock actualizado ✅

### 4. **Ver/Reimprimir Códigos**

Items con código muestran un ícono verde de código de barras (📊):
- Haz clic en el ícono
- Se abre modal con el código
- Opciones: **Imprimir** o **Descargar**

## 🎯 Flujos de Trabajo

### Flujo 1: Entrada de Stock con Código Existente
```
1. Agregar item al contenedor
2. Clic en lápiz ✏️ del item
3. Escanear código del producto
4. Guardar
```

### Flujo 2: Entrada de Stock sin Código
```
1. Clic en "Generar Código" (header)
2. Imprimir código generado
3. Pegar etiqueta en producto
4. Agregar item al contenedor
5. Clic en lápiz ✏️ del item
6. Escanear código impreso
7. Guardar
```

### Flujo 3: Descuento de Stock (Venta/Uso)
```
1. Clic en "Activar Scanner"
2. Escanear producto vendido
3. Ingresar cantidad
4. Confirmar
5. Stock actualizado automáticamente
```

## 🔒 Características de Seguridad

- ✅ El scanner **solo funciona** cuando está activado manualmente
- ✅ **No interfiere** con inputs/textareas (puedes seguir escribiendo normal)
- ✅ Buffer de 100ms para evitar lecturas duplicadas
- ✅ Validación de cantidad disponible antes de descontar
- ✅ Búsqueda en todos los contenedores automáticamente

## 📋 Formato de Códigos

### Códigos Generados por el Sistema:
```
STK-1733356800-A1B2C3
│   │          │
│   │          └─ 6 caracteres aleatorios
│   └─ Timestamp Unix
└─ Prefijo STK (Stock)
```

### Códigos Externos:
El sistema también lee códigos EAN-13, UPC, CODE128, etc. de productos comerciales.

## ⚙️ Configuración del Lector

### Para Windows:
1. Conecta el lector USB
2. Windows lo reconocerá automáticamente como teclado
3. Abre el navegador y ve a Stock
4. ¡Listo para usar!

### Para verificar que funciona:
1. Abre el Bloc de Notas
2. Escanea un código
3. Deberías ver el código escrito + Enter automático
4. Si funciona allí, funcionará en la app

## 🐛 Solución de Problemas

### El scanner no responde:
- ✅ Verifica que el botón esté en **"Escuchando..."** (verde)
- ✅ Verifica que el lector esté encendido
- ✅ Prueba escaneando en un editor de texto primero

### El código se detecta pero no encuentra el item:
- ✅ Verifica que el item tenga un código asignado
- ✅ Verifica que el código coincida exactamente
- ✅ Los códigos son case-sensitive

### El scanner escribe caracteres extraños:
- ✅ El lector podría tener configuración incorrecta
- ✅ Consulta el manual para configurarlo como "teclado USB HID"

## 📦 Tecnologías Utilizadas

- **Detección de teclado**: Event Listener JavaScript nativo
- **Generación de códigos**: JsBarcode (CODE128)
- **Visualización**: Canvas HTML5
- **Impresión**: react-to-print

## 🎨 UI Indicators

| Estado | Color | Icono | Acción |
|--------|-------|-------|--------|
| Scanner Inactivo | Morado | 📷 | Activar scanner |
| Scanner Activo | Verde (pulse) | 📷 | Escuchando escaneo |
| Item sin código | - | ✏️ | Editar para asignar |
| Item con código | Verde | 📊 | Ver/reimprimir |
| Generar código | Morado | 📊 | Generar código nuevo |

## 🔑 Botones Principales

### Header:
- **Activar Scanner**: Activa detección de escaneos para descontar stock
- **Generar Código**: Crea código único para imprimir y usar en productos sin código
- **Exportar PDF**: Genera reporte de stock

### En cada Item:
- **✏️ (Lápiz)**: Asignar/editar código de barras del item
- **📊 (Verde)**: Ver código existente y reimprimir

---

**Ventajas de este sistema**:
- ✅ Usa códigos reales de productos (EAN-13, UPC, etc.)
- ✅ Genera códigos solo cuando el producto no tiene
- ✅ Flexible: escanea o escribe manualmente
- ✅ No asigna códigos automáticamente (control total)
- ✅ Rápido descuento de stock con scanner activo
