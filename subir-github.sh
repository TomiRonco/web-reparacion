#!/bin/bash

# 🚀 Script para Subir a GitHub
# Ejecuta este script después de crear el repositorio en GitHub

echo "🚀 Subiendo proyecto a GitHub..."
echo ""

# Pedir URL del repositorio
echo "📝 Paso 1: Ingresa la URL de tu repositorio de GitHub"
echo "Ejemplo: https://github.com/tu-usuario/web-reparacion.git"
read -p "URL del repositorio: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Debes ingresar una URL"
    exit 1
fi

echo ""
echo "🔗 Configurando repositorio remoto..."

# Verificar si ya existe un remoto llamado origin
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Ya existe un remoto 'origin', actualizándolo..."
    git remote set-url origin "$REPO_URL"
else
    echo "➕ Agregando remoto 'origin'..."
    git remote add origin "$REPO_URL"
fi

echo ""
echo "✅ Remoto configurado:"
git remote -v

echo ""
echo "📤 Subiendo archivos a GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Éxito! Tu proyecto está en GitHub"
    echo "📍 Visítalo en: ${REPO_URL%.git}"
else
    echo ""
    echo "❌ Error al subir. Posibles soluciones:"
    echo ""
    echo "1. Autenticarte con GitHub CLI:"
    echo "   gh auth login"
    echo ""
    echo "2. O usar SSH en lugar de HTTPS:"
    echo "   git remote set-url origin git@github.com:usuario/web-reparacion.git"
    echo ""
    echo "3. O generar Personal Access Token en GitHub"
fi
