#!/bin/bash
# Script de test pour diagnostiquer les problèmes MIME type

echo "🔍 Test du serveur game.zig-zag.fun"
echo "=================================="
echo ""

# Test 1 : Vérifier qu'un chunk existe
echo "1️⃣ Test d'un chunk JavaScript :"
CHUNK="b58108dde82d1a97.js"
curl -I "https://game.zig-zag.fun/_next/static/chunks/$CHUNK" 2>&1 | head -10
echo ""

# Test 2 : Vérifier le Content-Type
echo "2️⃣ Vérification du Content-Type :"
CONTENT_TYPE=$(curl -I "https://game.zig-zag.fun/_next/static/chunks/$CHUNK" 2>&1 | grep -i "content-type" | head -1)
echo "$CONTENT_TYPE"

if echo "$CONTENT_TYPE" | grep -qi "application/javascript"; then
    echo "✅ Content-Type correct : application/javascript"
else
    echo "❌ Content-Type incorrect : $CONTENT_TYPE"
    echo "   Attendu : application/javascript"
fi
echo ""

# Test 3 : Vérifier le status HTTP
echo "3️⃣ Vérification du status HTTP :"
STATUS=$(curl -I "https://game.zig-zag.fun/_next/static/chunks/$CHUNK" 2>&1 | head -1)
echo "$STATUS"

if echo "$STATUS" | grep -qi "200 OK"; then
    echo "✅ Status OK : 200"
else
    if echo "$STATUS" | grep -qi "500"; then
        echo "❌ Erreur 500 : Problème de configuration Apache"
        echo "   → Vérifiez les logs Apache"
        echo "   → Utilisez .htaccess.minimal"
    elif echo "$STATUS" | grep -qi "404"; then
        echo "❌ Erreur 404 : Fichier non trouvé"
        echo "   → Le chunk n'a pas été uploadé"
    else
        echo "❌ Status inattendu : $STATUS"
    fi
fi
echo ""

# Test 4 : Vérifier un fichier CSS
echo "4️⃣ Test d'un fichier CSS :"
CSS_FILE="0289f4ffd7ddfd3f.css"
curl -I "https://game.zig-zag.fun/_next/static/chunks/$CSS_FILE" 2>&1 | head -5
echo ""

echo "=================================="
echo "📝 Actions recommandées :"
echo ""
echo "Si erreur 500 :"
echo "  1. Vérifiez les logs Apache : tail -n 50 /var/log/apache2/error.log"
echo "  2. Utilisez .htaccess.minimal"
echo "  3. Vérifiez AllowOverride All"
echo ""
echo "Si Content-Type incorrect :"
echo "  1. Vérifiez que mod_headers et mod_mime sont activés"
echo "  2. Vérifiez que .htaccess est présent sur le serveur"
echo "  3. Vérifiez les permissions (644)"
echo ""

