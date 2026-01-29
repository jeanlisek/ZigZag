#!/bin/bash
# Script de déploiement automatique pour game.zig-zag.fun

# Configuration (À ADAPTER)
SERVER_USER="votre_user"
SERVER_HOST="game.zig-zag.fun"
SERVER_PATH="/var/www/game.zig-zag.fun"  # ou public_html
LOCAL_BUILD="/Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/game-app/out"

echo "🚀 Déploiement de ZigZag sur game.zig-zag.fun"
echo "=============================================="

# Vérifier que le build existe
if [ ! -d "$LOCAL_BUILD" ]; then
    echo "❌ Erreur : Le dossier $LOCAL_BUILD n'existe pas"
    echo "Lancez d'abord : cd game-app && npm run build"
    exit 1
fi

# Vérifier que .htaccess existe
if [ ! -f "$LOCAL_BUILD/.htaccess" ]; then
    echo "⚠️  Attention : .htaccess manquant dans $LOCAL_BUILD"
    exit 1
fi

echo "✅ Build trouvé : $LOCAL_BUILD"
echo "✅ .htaccess trouvé"
echo ""

# Compter les fichiers
FILE_COUNT=$(find "$LOCAL_BUILD" -type f | wc -l)
echo "📦 Nombre de fichiers à uploader : $FILE_COUNT"
echo ""

# Demander confirmation
read -p "Continuer le déploiement ? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

echo ""
echo "🔄 Upload en cours..."
echo "=============================================="

# Upload via rsync (préserve les permissions et supprime les anciens fichiers)
rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    "$LOCAL_BUILD/" \
    "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Déploiement réussi !"
    echo ""
    echo "🔍 Vérifications post-déploiement :"
    echo "1. Testez : https://game.zig-zag.fun/jeu/matchmaking"
    echo "2. Console (F12) : pas d'erreur MIME type"
    echo "3. ColorPicker fonctionne"
    echo ""
    echo "📝 Si erreur MIME type persiste :"
    echo "   ssh $SERVER_USER@$SERVER_HOST"
    echo "   cd $SERVER_PATH"
    echo "   cat .htaccess  # Vérifier que le fichier est bien là"
    echo "   chmod 644 .htaccess"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi
