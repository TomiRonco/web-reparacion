# 🚀 Guía para Subir el Proyecto a GitHub

## 📋 Pasos Completos

### 1️⃣ Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Click en el botón **"+"** (arriba derecha) → **"New repository"**
3. Completa:
   - **Repository name**: `web-reparacion` o `sistema-reparaciones`
   - **Description**: "Sistema profesional para gestión de reparaciones"
   - **Visibility**: 
     - ✅ **Private** (recomendado - solo tú puedes verlo)
     - ⚪ Public (todos pueden verlo)
   - ❌ **NO marcar** "Add a README file" (ya tienes uno)
   - ❌ **NO marcar** "Add .gitignore" (ya tienes uno)
4. Click en **"Create repository"**

---

### 2️⃣ Conectar Repositorio Local con GitHub

Copia la URL de tu repositorio. GitHub te mostrará algo como:

```
https://github.com/tu-usuario/web-reparacion.git
```

Luego ejecuta estos comandos:

```bash
cd /Users/tomasroncoroni/Documents/Web-Reparacion/web-reparacion

# Configurar el remoto (usa TU URL del paso anterior)
git remote add origin https://github.com/TU-USUARIO/web-reparacion.git

# Verificar que se agregó correctamente
git remote -v
```

---

### 3️⃣ Subir el Código a GitHub

```bash
# Subir todos los archivos a la rama main
git push -u origin main
```

Si es tu primera vez, GitHub te pedirá autenticación:

**Opción A: GitHub CLI (Recomendado)**
```bash
# Instalar GitHub CLI si no lo tienes
brew install gh

# Autenticarte
gh auth login

# Subir
git push -u origin main
```

**Opción B: Personal Access Token**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un token con permisos `repo`
3. Usa el token como contraseña cuando Git lo pida

**Opción C: SSH (Más seguro)**
```bash
# Generar clave SSH si no tienes
ssh-keygen -t ed25519 -C "tu@email.com"

# Agregar a GitHub
cat ~/.ssh/id_ed25519.pub
# Copiar y pegar en GitHub → Settings → SSH Keys

# Cambiar remote a SSH
git remote set-url origin git@github.com:TU-USUARIO/web-reparacion.git

# Subir
git push -u origin main
```

---

### 4️⃣ Verificar en GitHub

1. Ve a tu repositorio en GitHub
2. Deberías ver todos tus archivos
3. Verifica que el README.md se vea bien

---

## 📦 Comandos Resumidos

```bash
# 1. Ya hicimos el commit (completado ✅)
git add .
git commit -m "feat: Sistema completo de gestión de reparaciones"

# 2. Configurar GitHub como remoto (CAMBIA LA URL)
git remote add origin https://github.com/TU-USUARIO/web-reparacion.git

# 3. Subir a GitHub
git push -u origin main
```

---

## 🔐 Proteger Información Sensible

### ⚠️ IMPORTANTE: Variables de Entorno

Asegúrate que tu `.env.local` esté en `.gitignore`:

```bash
# Verificar que .env.local NO se suba
cat .gitignore | grep .env
```

Deberías ver:
```
.env*
```

✅ **Perfecto**: Tus claves de Supabase NO se subirán a GitHub

---

## 📝 Para Actualizar el Repositorio Después

Cada vez que hagas cambios:

```bash
# 1. Ver qué cambió
git status

# 2. Agregar cambios
git add .

# 3. Hacer commit
git commit -m "feat: descripción del cambio"

# 4. Subir a GitHub
git push
```

---

## 🎯 Ejemplos de Mensajes de Commit

Usa estos prefijos:

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `docs:` - Cambios en documentación
- `style:` - Cambios de estilo/formato
- `refactor:` - Refactorización de código
- `test:` - Agregar tests
- `chore:` - Tareas de mantenimiento

**Ejemplos:**
```bash
git commit -m "feat: agregar exportación a Excel"
git commit -m "fix: corregir error en filtros"
git commit -m "docs: actualizar README"
git commit -m "style: mejorar diseño del sidebar"
```

---

## 🌿 Trabajar con Ramas (Opcional)

Para desarrollar nuevas funcionalidades sin afectar el código principal:

```bash
# Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git add .
git commit -m "feat: nueva funcionalidad"

# Subir rama a GitHub
git push -u origin feature/nueva-funcionalidad

# Volver a main
git checkout main

# Traer cambios del remoto
git pull origin main
```

---

## 🔄 Clonar el Repositorio en Otra Máquina

Si quieres trabajar desde otra computadora:

```bash
# Clonar
git clone https://github.com/TU-USUARIO/web-reparacion.git
cd web-reparacion

# Instalar dependencias
npm install

# Crear .env.local con tus variables
touch .env.local
# Agregar tus claves de Supabase

# Ejecutar
npm run dev
```

---

## 🎉 ¡Listo!

Tu código ya está en GitHub y puedes:

✅ **Acceder** desde cualquier lugar  
✅ **Compartir** con otros (si es público)  
✅ **Colaborar** con otros desarrolladores  
✅ **Tener respaldo** automático  
✅ **Ver historial** completo de cambios  
✅ **Volver** a versiones anteriores  

---

## 🆘 Problemas Comunes

### Error: "remote origin already exists"
```bash
# Eliminar el remoto existente
git remote remove origin

# Agregarlo de nuevo
git remote add origin https://github.com/TU-USUARIO/web-reparacion.git
```

### Error: "failed to push"
```bash
# Traer cambios primero
git pull origin main --rebase

# Subir de nuevo
git push origin main
```

### Error: Authentication failed
```bash
# Usar GitHub CLI
gh auth login

# O generar Personal Access Token en GitHub
```

---

## 📚 Recursos Útiles

- [Documentación Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [GitHub CLI](https://cli.github.com)
- [Conventional Commits](https://www.conventionalcommits.org)

---

## 🎯 Próximos Pasos

Después de subir a GitHub, considera:

1. **Agregar badges** al README
2. **Configurar GitHub Actions** (CI/CD)
3. **Habilitar GitHub Pages** (documentación)
4. **Configurar Dependabot** (actualizaciones automáticas)
5. **Agregar CONTRIBUTING.md** (guía para contribuir)
6. **Configurar Issues y Projects** (organización)

---

¡Todo listo para subir tu proyecto a GitHub! 🚀
