#!/bin/bash

# Script de build pour le dashboard admin ZigZag
# Ce script build le dashboard React et le place dans admin-dist/

set -e

echo "🔨 Building ZigZag Admin Dashboard..."
echo ""

# Aller dans le dossier du dashboard
DASHBOARD_DIR="$(dirname "$0")/admin/frontend/dashboard"
cd "$DASHBOARD_DIR"

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
else
    # Vérifier si TypeScript est installé
    if [ ! -f "node_modules/.bin/tsc" ]; then
        echo "📦 Installation des dépendances manquantes..."
        npm install
        echo ""
    fi
fi

# Build du dashboard
echo "🏗️  Building dashboard..."
if [ -f "node_modules/vite/bin/vite.js" ]; then
    node node_modules/vite/bin/vite.js build
else
    npm run build
fi

echo ""
echo "✅ Build terminé ! Le dashboard est disponible dans admin-dist/"
echo "🌐 Accessible via: zig-zag.fun/admin"

