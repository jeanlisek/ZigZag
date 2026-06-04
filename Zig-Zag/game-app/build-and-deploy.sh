#!/bin/bash

# Script de build et vérification pour game.zig-zag.fun
# Usage: ./build-and-deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Build de l'application Next.js..."
echo ""

# Aller dans le dossier game-app
cd "$(dirname "$0")"

# Nettoyer les anciens builds
echo "🧹 Nettoyage des anciens builds..."
rm -rf .next out

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Build
echo "🔨 Build en cours..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "out" ]; then
    echo "❌ ERREUR: Le dossier out/ n'existe pas après le build!"
    exit 1
fi

echo ""
echo "✅ Build réussi!"
echo ""

# Vérifier que la page /auth/callback existe
echo "🔍 Vérification de la page /auth/callback..."
if [ -f "out/auth/callback/index.html" ]; then
    echo "✅ Page /auth/callback trouvée: out/auth/callback/index.html"
else
    echo "❌ ERREUR: La page /auth/callback n'existe pas!"
    echo "   Vérifiez que src/app/auth/callback/page.tsx existe"
    exit 1
fi

# Vérifier que les chunks existent
echo "🔍 Vérification des chunks JavaScript..."
if [ -d "out/_next/static/chunks" ]; then
    CHUNK_JS_COUNT=$(find out/_next/static/chunks -name "*.js" | wc -l | tr -d ' ')
    CHUNK_CSS_COUNT=$(find out/_next/static/chunks -name "*.css" | wc -l | tr -d ' ')
    echo "✅ Chunks JS trouvés: $CHUNK_JS_COUNT fichiers .js"
    echo "✅ Chunks CSS trouvés: $CHUNK_CSS_COUNT fichiers .css"
    
    # Vérifier qu'il y a au moins quelques chunks JS
    if [ "$CHUNK_JS_COUNT" -lt 5 ]; then
        echo "⚠️  ATTENTION: Très peu de chunks JS trouvés ($CHUNK_JS_COUNT). Le build peut être incomplet."
    fi
    
    # Vérifier qu'il y a des chunks CSS (critique pour le design)
    if [ "$CHUNK_CSS_COUNT" -eq 0 ]; then
        echo "❌ ERREUR: Aucun fichier CSS trouvé dans out/_next/static/chunks!"
        echo "   Le design ne s'affichera pas correctement."
        exit 1
    else
        echo "✅ Fichiers CSS dans chunks: $CHUNK_CSS_COUNT (CRITIQUE pour le design)"
    fi
else
    echo "❌ ERREUR: Le dossier out/_next/static/chunks n'existe pas!"
    echo "   Le build Next.js n'a pas généré les fichiers statiques correctement."
    exit 1
fi

# Vérifier que les fichiers CSS existent dans le dossier css/
echo "🔍 Vérification des fichiers CSS dans css/..."
if [ -d "out/_next/static/css" ]; then
    CSS_COUNT=$(find out/_next/static/css -name "*.css" | wc -l | tr -d ' ')
    echo "✅ Fichiers CSS trouvés dans css/: $CSS_COUNT fichiers"
else
    echo "⚠️  ATTENTION: Le dossier out/_next/static/css n'existe pas"
    echo "   (Ce n'est pas critique si les CSS sont dans chunks/)"
fi

# Résumé total des fichiers CSS
TOTAL_CSS=$((CHUNK_CSS_COUNT + CSS_COUNT))
echo ""
echo "📊 RÉSUMÉ CSS: $TOTAL_CSS fichiers CSS au total"
if [ "$TOTAL_CSS" -eq 0 ]; then
    echo "❌ ERREUR CRITIQUE: Aucun fichier CSS trouvé!"
    echo "   Le design ne fonctionnera PAS sur le serveur."
    exit 1
fi

# Copier le .htaccess dans out/
echo "🔍 Copie du .htaccess..."
if [ -f ".htaccess" ]; then
    cp .htaccess out/.htaccess
    echo "✅ Fichier .htaccess copié dans out/.htaccess"
else
    echo "⚠️  ATTENTION: Le fichier .htaccess n'existe pas"
    echo "   Assurez-vous de l'uploader séparément"
fi

echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo ""
echo "1. Uploadez TOUT le contenu du dossier 'out/' sur game.zig-zag.fun"
echo "   Structure à uploader (IMPORTANT: inclure _next/):"
echo "   - out/_next/ → game.zig-zag.fun/_next/ (CRITIQUE pour les chunks!)"
echo "   - out/auth/ → game.zig-zag.fun/auth/"
echo "   - out/jeu/ → game.zig-zag.fun/jeu/"
echo "   - out/index.html → game.zig-zag.fun/index.html"
echo "   - out/.htaccess → game.zig-zag.fun/.htaccess"
echo "   - Tous les autres fichiers de out/"
echo ""
echo "2. Vérifiez que le dossier _next/ est bien uploadé:"
echo "   - game.zig-zag.fun/_next/static/chunks/ doit contenir des fichiers .js"
echo "   - game.zig-zag.fun/_next/static/css/ doit contenir des fichiers .css"
echo ""
echo "3. Testez:"
echo "   - https://game.zig-zag.fun/auth/callback"
echo "   - https://game.zig-zag.fun/jeu"
echo "   - Ouvrez la console du navigateur pour vérifier les erreurs de chargement"
echo ""

echo ""
echo "✨ Terminé! Prêt pour le déploiement."
