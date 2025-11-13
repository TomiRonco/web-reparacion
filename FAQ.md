# ❓ PREGUNTAS FRECUENTES (FAQ)

## 🔐 Autenticación y Seguridad

### ¿Cada local necesita un usuario diferente?
Sí, cada local debe tener su propio usuario (email/contraseña) en Supabase. Esto garantiza que cada local solo vea sus propios datos gracias a Row Level Security (RLS).

### ¿Cómo creo usuarios para los locales?
1. Ve a tu proyecto de Supabase
2. Authentication → Users → Add user
3. Completa email y contraseña
4. Marca "Auto Confirm User"
5. Click en Create

### ¿Los datos están seguros?
Sí. Row Level Security (RLS) garantiza que cada usuario solo puede ver y modificar sus propios datos. Ni siquiera tú como desarrollador puedes ver los datos de los clientes sin autenticación.

### ¿Puedo tener múltiples usuarios para un mismo local?
El sistema actual está diseñado para un usuario por local. Si necesitas múltiples usuarios (ej: dueño y empleados), se requeriría desarrollo adicional de roles y permisos.

## 💰 Costos

### ¿Cuánto cuesta mantener esto?
Con el plan gratuito de Supabase y Vercel: **$0/mes** para locales pequeños (hasta ~2000 reparaciones, 1-3 técnicos).

Para locales más grandes: ~$25-45 USD/mes (Supabase Pro + Vercel Pro opcional).

### ¿Qué pasa si el cliente supera el plan gratuito?
Recibirá un email de Supabase avisando que está cerca del límite. Puede:
1. Limpiar datos antiguos
2. Actualizar a plan Pro ($25/mes)
3. Contactarte para migrarlo

### ¿Puedo cobrar mensualmente?
Sí, puedes cobrar al cliente $30-50 USD/mes y tú pagas los $25 USD de Supabase Pro, quedándote con la diferencia como margen.

### ¿El cliente paga Vercel y Supabase o yo?
Depende de tu modelo de negocio:
- **Tú pagas:** Más control, pero más responsabilidad
- **Cliente paga:** Cliente tiene cuentas propias, menos responsabilidad para ti

## 📱 Funcionalidades

### ¿Se puede usar desde el celular?
Sí, el diseño es responsive. Funciona en celulares, tablets y computadoras. Solo necesitas un navegador web.

### ¿Necesito instalar algo?
No. Es una aplicación web. Solo necesitas:
1. Un navegador (Chrome, Safari, Firefox, Edge)
2. Conexión a internet
3. Las credenciales de acceso

### ¿Funciona offline?
No, requiere conexión a internet para funcionar ya que los datos están en la nube.

### ¿Los PDFs se guardan automáticamente?
Los PDFs se generan y descargan automáticamente al crear una reparación. NO se guardan en el servidor, solo se descargan al dispositivo del usuario.

### ¿Puedo regenerar un PDF antiguo?
Actualmente no, pero se puede agregar esta funcionalidad. El PDF solo se genera al crear la reparación.

### ¿Puedo enviar el PDF por WhatsApp/Email?
Sí, después de descargarlo, puedes enviarlo como cualquier archivo por WhatsApp, Email, etc.

## 🎨 Personalización

### ¿Puedo cambiar los colores?
Sí, pero requiere modificar el código (cambiar las clases de Tailwind). Es recomendable para diferenciarte de la competencia.

### ¿Puedo agregar mi logo en los PDFs?
Sí, el cliente puede subir su logo desde Configuración → Logo del Local. Aparecerá automáticamente en los PDFs.

### ¿Puedo cambiar el texto del footer del PDF?
Sí, pero requiere editar el archivo `lib/pdf-generator.ts`. Puedes personalizarlo por cliente.

### ¿Puedo agregar más campos a las reparaciones?
Sí, pero requiere:
1. Modificar el schema de la base de datos (agregar columnas)
2. Actualizar los tipos en TypeScript
3. Modificar los formularios
4. Actualizar el PDF generator

## 🔧 Técnico

### ¿Qué pasa si borro accidentalmente una reparación?
Los datos se eliminan permanentemente. Recomendación: enseñar al cliente a no eliminar, solo marcar como "entregada".

### ¿Puedo restaurar datos borrados?
Solo si tienes un backup. Supabase hace backups automáticos diarios en el plan Pro.

### ¿Cómo hago un backup manual?
1. Ve a Supabase → Database → Backups
2. Click en "Create backup"
3. Espera a que termine
4. Download

### ¿Puedo migrar de un Supabase a otro?
Sí:
1. Exporta los datos del Supabase antiguo (SQL dump)
2. Crea nuevo proyecto en Supabase
3. Ejecuta el schema
4. Importa los datos
5. Actualiza las variables de entorno

### ¿El sistema soporta múltiples sucursales?
No directamente. Cada sucursal necesitaría su propio usuario. Para un sistema multi-sucursal se requiere desarrollo adicional.

## 📊 Datos y Reportes

### ¿Puedo exportar las reparaciones a Excel?
Actualmente no, pero puedes:
1. Ir a Supabase → Database → Table Editor
2. Seleccionar la tabla `reparaciones`
3. Exportar a CSV
4. Abrir en Excel

O agregar un botón de "Exportar" en el sistema (requiere desarrollo adicional).

### ¿Las estadísticas son en tiempo real?
Sí, se actualizan cada vez que entras a la página de Estadísticas. No son automáticas sin recargar.

### ¿Puedo ver reportes de un período específico?
Actualmente las estadísticas son totales. Para filtrar por fecha se requiere desarrollo adicional.

## 🚀 Deploy y Hosting

### ¿Puedo usar otro hosting que no sea Vercel?
Sí, Next.js puede desplegarse en:
- Vercel (más fácil)
- Netlify
- Railway
- Render
- Tu propio servidor VPS

### ¿Necesito un dominio propio?
No, Vercel te da un dominio gratuito (ej: `tulocal.vercel.app`). Un dominio propio es opcional.

### ¿Cuánto cuesta un dominio?
$10-15 USD/año (.com, .net). Puedes comprar en Namecheap, GoDaddy, etc.

### ¿Vercel tiene límites de tráfico?
Plan gratuito: 100 GB/mes de bandwidth. Es suficiente para ~1000-2000 visitas al sitio por mes.

### ¿Puedo tener múltiples clientes en el mismo deploy?
Sí, el sistema está diseñado para eso. Cada cliente tiene su propio usuario y solo ve sus datos.

## 🐛 Problemas Comunes

### "Error al conectar con Supabase"
- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de que el proyecto de Supabase esté activo
- Verifica que no haya espacios en las variables de entorno

### "No puedo subir el logo"
- Verifica que el bucket `logos` exista
- Asegúrate de que sea público
- Revisa las políticas de storage

### "El PDF sale vacío o incompleto"
- Asegúrate de tener configuración del local completa
- Verifica que la reparación tenga todos los datos
- Revisa la consola del navegador para errores

### "No puedo crear reparaciones"
- Verifica que hayas creado al menos un técnico primero
- Asegúrate de que el schema SQL se ejecutó correctamente
- Revisa que RLS esté configurado

### "Las estadísticas no se actualizan"
- Refresca la página (F5)
- Verifica que haya reparaciones creadas
- Revisa que las reparaciones tengan montos

## 📈 Escalabilidad

### ¿Cuántas reparaciones soporta?
- Plan gratuito: ~2,000-5,000 reparaciones sin problemas
- Plan Pro: ~100,000+ reparaciones
- Depende también del tamaño de las observaciones/diagnósticos

### ¿Cuántos usuarios simultáneos soporta?
- Plan gratuito: ~50 usuarios simultáneos
- Plan Pro: ~500+ usuarios simultáneos
- Para un local típico (1-5 personas), el plan gratuito es más que suficiente

### ¿Qué pasa cuando el local crece mucho?
Simplemente actualiza a Supabase Pro ($25/mes) y listo. No requiere cambios en el código.

## 💡 Mejoras Futuras

### ¿Qué funcionalidades se podrían agregar?
- Notificaciones por WhatsApp/SMS cuando cambia el estado
- Sistema de usuarios múltiples con roles (admin, técnico, recepción)
- Reportes PDF de todas las reparaciones
- Exportar a Excel con un click
- Envío de email automático al cliente
- Sistema de inventario de repuestos
- Facturación integrada
- Multi-sucursal
- App móvil nativa

### ¿Cuánto costaría agregar estas funcionalidades?
Depende de la complejidad:
- Funcionalidad simple (ej: botón exportar): $50-100 USD
- Funcionalidad media (ej: notificaciones WhatsApp): $200-400 USD
- Funcionalidad compleja (ej: multi-sucursal): $500-1000 USD

## 📞 Soporte

### ¿Ofrezco soporte al cliente?
Depende de tu modelo de negocio. Opciones:
- **Incluido 30 días:** Luego cobrar mensualmente
- **Soporte pagado:** $20-30 USD/mes
- **Por incidente:** $50 USD por consulta

### ¿Qué tipo de soporte debo ofrecer?
Mínimo recomendado:
- Respuesta en 24-48 horas hábiles
- Por WhatsApp/Email
- Horario laboral (Lun-Vie 9-18hs)
- Actualizaciones de seguridad incluidas

## 📚 Aprendizaje

### ¿Necesito saber programar para venderlo?
No, solo para instalarlo y configurarlo. Puedes:
1. Aprender lo básico (1-2 semanas)
2. Usar los archivos de documentación como guía
3. Contratar a alguien para instalaciones complejas

### ¿Qué debo aprender si quiero modificarlo?
- HTML/CSS básico (para estilos)
- JavaScript/TypeScript (para funcionalidades)
- React básico (para componentes)
- SQL básico (para base de datos)

### ¿Hay cursos recomendados?
- Next.js: nextjs.org/learn
- React: react.dev/learn
- Supabase: supabase.com/docs
- Tailwind CSS: tailwindcss.com/docs

---

**¿No encontraste tu pregunta?** Crea un issue en el repositorio o contacta al desarrollador.
