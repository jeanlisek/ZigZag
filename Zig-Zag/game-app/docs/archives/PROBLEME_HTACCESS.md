# 🔧 Problème Identifié : .htaccess Interfère avec Next.js

## 🎯 Problème

Le fichier `.htaccess` redirige toutes les requêtes vers `/jeu/index.html`, ce qui **interfère avec le serveur Next.js** qui tourne sur Node.js.

### Pourquoi c'est un problème ?

1. **Next.js sur Node.js** gère le routing lui-même via son serveur
2. Le `.htaccess` essaie de rediriger vers un fichier statique `index.html` qui n'existe pas
3. Cela cause des erreurs 500 car le serveur ne peut pas servir les chunks correctement

## ✅ Solution Appliquée

### 1. Script de build nettoyé
Le script `build` ne copie plus le `.htaccess` dans `out/` car :
- L'app tourne sur Node.js (pas d'export statique)
- Next.js gère le routing lui-même

### 2. Fichier `.htaccess` à supprimer ou ignorer
Pour une app Next.js sur Node.js (Hostinger Cloud Startup), le `.htaccess` n'est **pas nécessaire**.

## 🚀 Actions à Faire

### Option 1 : Supprimer le `.htaccess` (Recommandé)
Supprimez le fichier `.htaccess` du dossier `game-app/` sur Hostinger.

### Option 2 : Le laisser mais l'ignorer
Si vous ne pouvez pas le supprimer, assurez-vous qu'il n'interfère pas. Hostinger Cloud Startup devrait ignorer les fichiers `.htaccess` pour les apps Node.js.

## 📋 Vérification

Après avoir supprimé/modifié le `.htaccess` :

1. **Rebuild complet** sur Hostinger
2. **Redémarrer l'application** Node.js
3. **Tester** que les chunks se chargent correctement

## 🔍 Comment Vérifier

1. Ouvrez la console (F12)
2. Regardez l'onglet Network
3. Vérifiez que les chunks se chargent depuis `/jeu/_next/static/chunks/...`
4. Status code : **200** (pas 500)

## ⚠️ Important

Pour **Hostinger Cloud Startup avec Node.js** :
- ✅ Next.js gère le routing automatiquement
- ✅ Pas besoin de `.htaccess` pour le routing
- ✅ Le serveur Node.js sert directement l'application

Le `.htaccess` est uniquement nécessaire pour :
- ❌ Export statique (HTML/CSS/JS statiques)
- ❌ Hébergement Apache classique sans Node.js

---

**Dernière mise à jour** : Suppression de la copie du `.htaccess` dans le script de build



