# 🧪 DATOS DE PRUEBA

Usa estos datos para hacer demos o testing del sistema.

## 👤 Usuarios de Prueba

### Usuario 1 - Local TechFix
```
Email: techfix@demo.com
Password: Demo123456!
```

### Usuario 2 - Cell Repair Center
```
Email: cellrepair@demo.com
Password: Demo123456!
```

### Usuario 3 - Electro Service
```
Email: electroservice@demo.com
Password: Demo123456!
```

## 🏢 Configuración del Local (Ejemplos)

### TechFix Reparaciones
```
Nombre: TechFix Reparaciones
Ubicación: Av. Corrientes 1234, CABA, Buenos Aires
Teléfono: 011 4567-8900
Celular: +54 9 11 1234-5678
Email: contacto@techfix.com.ar
Facebook: https://facebook.com/techfixreparaciones
Instagram: @techfixreparaciones
WhatsApp: +5491112345678
Horarios:
Lunes a Viernes: 9:00 - 19:00
Sábados: 10:00 - 14:00
Domingos: Cerrado
```

### Cell Repair Center
```
Nombre: Cell Repair Center
Ubicación: Calle Florida 567, Microcentro, CABA
Teléfono: 011 5555-0000
Celular: +54 9 11 9876-5432
Email: info@cellrepair.com
Instagram: @cellrepaircenter
WhatsApp: +5491198765432
Horarios:
Lunes a Viernes: 10:00 - 20:00
Sábados: 10:00 - 16:00
Domingos y Feriados: Cerrado
```

## 👨‍🔧 Técnicos de Ejemplo

### Técnico 1
```
Nombre: Juan
Apellido: Pérez
Celular: +54 9 11 3333-4444
```

### Técnico 2
```
Nombre: María
Apellido: González
Celular: +54 9 11 5555-6666
```

### Técnico 3
```
Nombre: Carlos
Apellido: Rodríguez
Celular: +54 9 11 7777-8888
```

### Técnico 4
```
Nombre: Ana
Apellido: Martínez
Celular: +54 9 11 9999-0000
```

## 🔧 Reparaciones de Ejemplo

### Reparación 1 - Notebook HP
```
Cliente Nombre: Roberto
Cliente Apellido: Silva
Cliente Celular: +54 9 11 2222-3333

Producto: Notebook
Marca: HP
Técnico: Juan Pérez
Tiene Cargador: Sí
Observación: Se apaga sola después de 10 minutos de uso. Cliente reporta que está muy lenta.

Diagnóstico: Necesita cambio de pasta térmica y limpieza profunda. RAM insuficiente (4GB).
Monto: 15000
```

### Reparación 2 - iPhone 12
```
Cliente Nombre: Laura
Cliente Apellido: Fernández
Cliente Celular: +54 9 11 4444-5555

Producto: iPhone 12
Marca: Apple
Técnico: María González
Tiene Cargador: Sí
Observación: Pantalla rota, funciona pero tiene vidrio quebrado. Batería dura poco.

Diagnóstico: Reemplazo de display completo y batería.
Monto: 45000
```

### Reparación 3 - PC Gamer
```
Cliente Nombre: Diego
Cliente Apellido: Morales
Cliente Celular: +54 9 11 6666-7777

Producto: PC de Escritorio
Marca: Armada
Técnico: Carlos Rodríguez
Tiene Cargador: No aplica
Observación: No enciende, se escucha un beep continuo. Olor a quemado.

Diagnóstico: Fuente quemada. RAM con problemas. Se recomienda cambio de fuente 700W y testeo de RAM.
Monto: 35000
```

### Reparación 4 - Samsung Galaxy
```
Cliente Nombre: Sofía
Cliente Apellido: Castro
Cliente Celular: +54 9 11 8888-9999

Producto: Samsung Galaxy A52
Marca: Samsung
Técnico: María González
Tiene Cargador: No
Observación: No carga la batería. Puerto USB parece suelto.

Diagnóstico: Puerto USB-C dañado, requiere microsoldadura.
Monto: 12000
```

### Reparación 5 - MacBook Pro
```
Cliente Nombre: Martín
Cliente Apellido: López
Cliente Celular: +54 9 11 1111-2222

Producto: MacBook Pro 2019
Marca: Apple
Técnico: Juan Pérez
Tiene Cargador: Sí
Observación: Teclado con teclas que no responden. Derramó café hace 1 semana.

Diagnóstico: Teclado completo a reemplazar. Limpieza de placa lógica por daño líquido.
Monto: 65000
```

### Reparación 6 - Tablet Samsung
```
Cliente Nombre: Claudia
Cliente Apellido: Vargas
Cliente Celular: +54 9 11 3333-5555

Producto: Tablet Galaxy Tab A8
Marca: Samsung
Técnico: Ana Martínez
Tiene Cargador: Sí
Observación: Se cayó, pantalla táctil no responde en la mitad derecha.

Diagnóstico: Digitalizador dañado, requiere reemplazo de touch.
Monto: 18000
```

### Reparación 7 - PS5
```
Cliente Nombre: Fernando
Cliente Apellido: Ríos
Cliente Celular: +54 9 11 7777-9999

Producto: PlayStation 5
Marca: Sony
Técnico: Carlos Rodríguez
Tiene Cargador: Sí
Observación: Sobrecalentamiento, se apaga durante partidas exigentes.

Diagnóstico: Ventilador obstruido con polvo. Pasta térmica seca. Requiere limpieza profunda y cambio de pasta térmica.
Monto: 8000
```

### Reparación 8 - Impresora HP
```
Cliente Nombre: Patricia
Cliente Apellido: Medina
Cliente Celular: +54 9 11 2222-4444

Producto: Impresora HP DeskJet
Marca: HP
Técnico: Ana Martínez
Tiene Cargador: Sí
Observación: No imprime negro, solo colores. Tiene tinta nueva.

Diagnóstico: Cabezal de impresión obstruido. Requiere limpieza profunda y alineación.
Monto: 5000
```

## 📊 Escenarios de Testing

### Escenario 1: Flujo Completo Happy Path
1. Login con usuario de prueba
2. Configurar local (logo, datos)
3. Agregar 2 técnicos
4. Crear 3 reparaciones en estado "Pendiente"
5. Agregar diagnóstico a 1ra reparación (→ En Proceso)
6. Marcar 1ra reparación como Finalizada
7. Marcar 1ra reparación como Entregada
8. Ver estadísticas actualizadas
9. Generar y descargar PDFs

### Escenario 2: Testing de Filtros
1. Crear 10 reparaciones
2. Dejar 3 en Pendiente
3. Pasar 3 a En Proceso
4. Finalizar 2
5. Entregar 2
6. Probar todos los filtros de estado
7. Verificar que cada filtro muestra lo correcto

### Escenario 3: Testing de Técnicos
1. Crear 3 técnicos
2. Asignar reparaciones a cada uno
3. Ver estadísticas (técnico más activo)
4. Editar datos de un técnico
5. Intentar eliminar técnico con reparaciones (debe fallar o preguntar)
6. Eliminar técnico sin reparaciones

### Escenario 4: Testing de Edge Cases
1. Crear reparación con observación muy larga (500+ caracteres)
2. Crear reparación sin observación
3. Crear reparación sin cargador
4. Subir logo muy grande (> 2MB)
5. Subir logo en formato no soportado
6. Intentar crear reparación sin seleccionar técnico
7. Dejar campos obligatorios vacíos

## 🎭 Demo para Cliente (Script)

### Preparación (antes de la demo)
1. Login con usuario demo
2. Configurar local con datos del cliente potencial
3. Agregar 2-3 técnicos con nombres reales del local
4. Crear 5-6 reparaciones de ejemplo (variando estados)

### Durante la Demo (15-20 min)

**1. Login (1 min)**
> "Así es como ustedes entrarían al sistema cada día. Email y contraseña segura."

**2. Dashboard - Vista General (2 min)**
> "Aquí ven todas sus reparaciones. Pueden filtrar por estado: Pendientes, En Proceso, etc."
> *Mostrar filtros*

**3. Crear Reparación (3 min)**
> "Cuando llega un cliente, hacen click aquí en Nueva Reparación."
> *Llenar formulario con datos de ejemplo*
> "Automáticamente se genera un comprobante profesional en PDF."
> *Mostrar PDF descargado*
> "Tienen original y copia en la misma hoja A4."

**4. Flujo de Trabajo (4 min)**
> "El técnico Juan recibe el equipo y lo revisa. Cuando sabe qué necesita, agrega el diagnóstico."
> *Agregar diagnóstico*
> "Automáticamente pasa a En Proceso y el cliente puede ver el costo."
> *Cambiar a Finalizada*
> "Cuando termina la reparación, la marca como Finalizada."
> *Cambiar a Entregada*
> "Y cuando el cliente la retira, se marca como Entregada."

**5. Técnicos (2 min)**
> "Aquí administran sus técnicos. Pueden agregar, editar o eliminar."
> *Mostrar lista de técnicos*

**6. Estadísticas (3 min)**
> "Acá ven todo en números: cuántas reparaciones, cuánto ingresaron, quién es el técnico más activo."
> *Mostrar dashboard de estadísticas*
> "Esto se actualiza en tiempo real."

**7. Configuración (2 min)**
> "Y acá configuran los datos de su local: suben su logo, ponen sus datos de contacto."
> *Mostrar configuración ya completada*
> "Este logo sale en todos sus comprobantes."

**8. Mobile (2 min)**
> "Y pueden usarlo desde el celular también."
> *Mostrar versión mobile*
> "Todo funciona igual."

**9. Cierre (1 min)**
> "¿Qué les parece? ¿Tienen alguna pregunta?"
> "Podemos configurarlo con sus datos reales y probarlo 30 días gratis. ¿Les interesa?"

## 💾 Script SQL para Insertar Datos de Prueba

```sql
-- Insertar técnicos (reemplazar USER_ID con el ID del usuario)
INSERT INTO tecnicos (user_id, nombre, apellido, celular) VALUES
('USER_ID', 'Juan', 'Pérez', '+54 9 11 3333-4444'),
('USER_ID', 'María', 'González', '+54 9 11 5555-6666'),
('USER_ID', 'Carlos', 'Rodríguez', '+54 9 11 7777-8888');

-- Nota: Para reparaciones es mejor crearlas desde la UI
-- para que se generen los PDFs automáticamente
```

## 🧹 Limpiar Datos de Prueba

```sql
-- CUIDADO: Esto borra TODOS los datos
-- Solo ejecutar en ambiente de prueba
DELETE FROM reparaciones WHERE user_id = 'USER_ID';
DELETE FROM tecnicos WHERE user_id = 'USER_ID';
DELETE FROM configuracion_local WHERE user_id = 'USER_ID';
```

---

**💡 Tip:** Mantén un ambiente de "demo" separado con estos datos para mostrar a clientes potenciales sin afectar datos reales.
