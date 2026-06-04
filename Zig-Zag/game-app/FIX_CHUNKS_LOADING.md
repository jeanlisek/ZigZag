# 🔧 Fix : Erreur de chargement des chunks Next.js

## ❌ Problème

Erreur rencontrée sur `game.zig-zag.fun` :
```
Error: Failed to load chunk /_next/static/chunks/556d6d4846cff6b4.js from module 64893
```

**Symptômes :**
- Erreur 404 pour les fichiers `/_next/static/chunks/*.js`
- Erreur 404 pour les fichiers `/_next/static/css/*.css`
- Erreur MIME type : `X-Content-Type-Options: nosniff` refuse l'exécution des scripts

## ✅ Solutions appliquées

### 1. Réorganisation du `.htaccess`

**Problème :** Les règles de réécriture Apache traitaient les fichiers `_next/` après les autres règles, causant des 404.

**Solution :** Réorganisé les règles pour que `_next/` soit traité **EN PREMIER** :

```apache
# PRIORITÉ 1 : Ne JAMAIS toucher aux fichiers _next/
RewriteCond %{REQUEST_URI} ^/_next/
RewriteRule ^ - [L]
```

### 2. Headers MIME Type pour `_next/`

**Problème :** Le serveur ne renvoyait pas toujours le bon `Content-Type` pour les fichiers `_next/`, causant le refus d'exécution avec `nosniff`.

**Solution :** Ajouté des règles spécifiques pour forcer le bon Content-Type :

```apache
<LocationMatch "^/_next/.*\.js$">
    Header set Content-Type "application/javascript; charset=utf-8"
    Header unset X-Content-Type-Options
</LocationMatch>
```

### 3. Amélioration du script de build

**Problème :** Le script ne vérifiait pas assez strictement la présence des chunks.

**Solution :** 
- Vérification stricte des chunks (erreur si absent)
- Vérification des fichiers CSS
- Copie automatique du `.htaccess` dans `out/`
- Instructions claires pour l'upload

## 📋 Checklist de déploiement

### Étape 1 : Build
```bash
cd Zig-Zag/game-app
./build-and-deploy.sh
```

### Étape 2 : Vérification locale
Vérifiez que ces dossiers existent dans `out/` :
- ✅ `out/_next/static/chunks/` (doit contenir des fichiers `.js`)
- ✅ `out/_next/static/css/` (doit contenir des fichiers `.css`)
- ✅ `out/.htaccess` (copié automatiquement)

### Étape 3 : Upload sur le serveur

**CRITIQUE :** Uploadez **TOUT** le contenu de `out/`, y compris :
- ✅ `out/_next/` → `game.zig-zag.fun/_next/` (dossier complet avec tous les sous-dossiers)
- ✅ `out/.htaccess` → `game.zig-zag.fun/.htaccess`
- ✅ Tous les autres fichiers de `out/`

**⚠️ ATTENTION :** Ne pas oublier le dossier `_next/` ! C'est la cause principale des erreurs 404.

### Étape 4 : Vérification sur le serveur

Vérifiez que ces URLs sont accessibles :
- ✅ `https://game.zig-zag.fun/_next/static/chunks/[nom-fichier].js` (doit retourner du JavaScript)
- ✅ `https://game.zig-zag.fun/_next/static/css/[nom-fichier].css` (doit retourner du CSS)

**Test rapide :**
```bash
curl -I https://game.zig-zag.fun/_next/static/chunks/main-[hash].js
# Doit retourner : Content-Type: application/javascript
```

## 🔍 Diagnostic

Si les erreurs persistent après l'upload :

1. **Vérifiez que `_next/` est bien uploadé :**
   - Accédez à `https://game.zig-zag.fun/_next/static/chunks/` dans le navigateur
   - Vous devriez voir une liste de fichiers `.js` (ou une erreur 403, mais pas 404)

2. **Vérifiez les permissions :**
   - Les fichiers dans `_next/` doivent être lisibles (chmod 644)

3. **Vérifiez le `.htaccess` :**
   - Le fichier doit être à la racine de `game.zig-zag.fun/`
   - Vérifiez qu'Apache lit bien le `.htaccess` (peut nécessiter `AllowOverride All`)

4. **Vérifiez les logs Apache :**
   - Regardez les logs d'erreur pour voir pourquoi les fichiers ne sont pas servis

## 📝 Notes techniques

- Le header `X-Content-Type-Options: nosniff` dans `next.config.js` est conservé pour les pages HTML
- Pour les fichiers `_next/`, le `.htaccess` force le bon Content-Type et retire temporairement `nosniff` si nécessaire
- Les règles de réécriture sont dans l'ordre de priorité : `_next/` → fichiers existants → dossiers → index.html

## 🚀 Après le fix

Une fois le fix appliqué et les fichiers uploadés :
- ✅ Les chunks se chargent correctement
- ✅ Les fichiers CSS se chargent correctement
- ✅ Plus d'erreurs 404 pour `_next/`
- ✅ Plus d'erreurs MIME type

