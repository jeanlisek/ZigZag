#!/bin/bash
# Script pour compresser UNIQUEMENT le dossier out/ (build final)
# C'est ce qu'il faut uploader sur le serveur

set -e

echo "📦 Compression du build out/ pour le déploiement..."
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
OUTPUT_FILE="out-deploy-$(date +%Y%m%d-%H%M%S).zip"

echo "🔍 Compression du dossier out/..."
echo ""

# Créer l'archive en excluant les fichiers problématiques macOS
cd out
zip -r "../$OUTPUT_FILE" . \
    -x "*.DS_Store" \
    -x ".DS_Store" \
    -x "*/._*" \
    -x "__MACOSX/*" \
    > /dev/null 2>&1
cd ..

if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Archive créée avec succès : $OUTPUT_FILE"
    echo "📊 Taille : $FILE_SIZE"
    echo ""
    echo "📁 Emplacement : $(pwd)/$OUTPUT_FILE"
    echo ""
    echo "💡 Instructions :"
    echo "1. Uploadez ce fichier sur votre serveur"
    echo "2. Décompressez-le dans le dossier de game.zig-zag.fun"
    echo "3. Assurez-vous que .htaccess est présent à la racine"
else
    echo "❌ Erreur lors de la compression"
    exit 1
fi

