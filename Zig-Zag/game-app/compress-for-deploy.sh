#!/bin/bash
# Script pour compresser game-app en excluant les fichiers système macOS

set -e

echo "📦 Compression de game-app pour le déploiement..."
echo ""

# Aller dans le dossier parent
cd "$(dirname "$0")/.."

# Nom du fichier de sortie
OUTPUT_FILE="game-app-deploy-$(date +%Y%m%d-%H%M%S).zip"

echo "🔍 Exclusion des fichiers système macOS..."
echo ""

# Créer l'archive en excluant les fichiers problématiques
zip -r "$OUTPUT_FILE" game-app/ \
    -x "*.DS_Store" \
    -x "*/.DS_Store" \
    -x "*/._*" \
    -x "*/__MACOSX/*" \
    -x "*/node_modules/*" \
    -x "*/\.next/*" \
    -x "*/\.git/*" \
    -x "*/\.env*" \
    -x "*/\.cache/*" \
    -x "*/\.temp/*" \
    -x "*/out/*" \
    -x "*.log" \
    -x "*.swp" \
    -x "*.swo" \
    -x "*~" \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Archive créée avec succès : $OUTPUT_FILE"
    echo "📊 Taille : $FILE_SIZE"
    echo ""
    echo "📁 Emplacement : $(pwd)/$OUTPUT_FILE"
    echo ""
    echo "💡 Vous pouvez maintenant uploader ce fichier sur votre serveur"
else
    echo "❌ Erreur lors de la compression"
    exit 1
fi

