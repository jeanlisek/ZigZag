#!/bin/bash
# Script pour compresser le dossier out/ avec tar (plus fiable sur macOS)
# C'est ce qu'il faut uploader sur le serveur

set -e

echo "📦 Compression du build out/ avec tar (recommandé pour macOS)..."
echo ""

# Aller dans le dossier game-app
cd "$(dirname "$0")"

# Vérifier que out/ existe
if [ ! -d "out" ]; then
    echo "❌ Erreur : Le dossier out/ n'existe pas"
    echo "Lancez d'abord : npm run build"
    exit 1
fi

# Nom du fichier de sortie
OUTPUT_FILE="out-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "🔍 Compression du dossier out/ avec tar..."
echo ""

# Créer l'archive tar.gz en excluant les fichiers problématiques macOS
tar -czf "$OUTPUT_FILE" \
    --exclude=".DS_Store" \
    --exclude="._*" \
    --exclude="__MACOSX" \
    -C out .

if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Archive créée avec succès : $OUTPUT_FILE"
    echo "📊 Taille : $FILE_SIZE"
    echo ""
    echo "📁 Emplacement : $(pwd)/$OUTPUT_FILE"
    echo ""
    echo "💡 Instructions :"
    echo "1. Uploadez ce fichier sur votre serveur"
    echo "2. Décompressez-le : tar -xzf $OUTPUT_FILE"
    echo "3. Déplacez les fichiers dans le dossier de game.zig-zag.fun"
    echo "4. Assurez-vous que .htaccess est présent à la racine"
else
    echo "❌ Erreur lors de la compression"
    exit 1
fi

