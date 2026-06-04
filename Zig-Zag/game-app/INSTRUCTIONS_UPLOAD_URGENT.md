# 🚨 INSTRUCTIONS UPLOAD URGENT - Fix Chunks + MIME Type

## ✅ Build Terminé

Le build a été généré avec succès :
- ✅ 23 fichiers JavaScript dans `out/_next/static/chunks/`
- ✅ `.htaccess` amélioré copié dans `out/.htaccess`
- ✅ Tous les fichiers statiques générés

**⚠️ IMPORTANT** : Le chunk `220f7eda15ec2b40.js` n'existe plus car Next.js génère des noms de chunks différents à chaque build. C'est normal !

---

## 📤 ÉTAPE 1 : Upload Complet sur game.zig-zag.fun

### Option A : Via FTP/FileZilla (Recommandé)

1. **Connectez-vous** à votre serveur `game.zig-zag.fun`
2. **Allez dans le dossier racine** :
   - `/var/www/game.zig-zag.fun/` (VPS)
   - OU `public_html/` (hébergement partagé)
3. **Sauvegarder l'ancien** (optionnel mais recommandé) :
   - Renommez le dossier actuel en `backup_$(date +%Y%m%d)`
4. **UPLOADER TOUT le contenu de `out/`** :
   ```
   📁 Structure à uploader :
   
   out/
   ├── _next/                    ← CRITIQUE : Tous les chunks
   │   └── static/
   │       ├── chunks/           ← 23 fichiers .js
   │       └── css/              ← Fichiers CSS
   ├── .htaccess                 ← CRITIQUE : Configuration MIME type
   ├── index.html
   ├── auth/
   ├── jeu/
   └── ... (tous les autres fichiers)
   ```

5. **Vérifications après upload** :
   - ✅ `_next/static/chunks/` contient au moins 20 fichiers `.js`
   - ✅ `.htaccess` est présent à la racine
   - ✅ Les permissions sont correctes (644 pour `.htaccess`, 755 pour les dossiers)

### Option B : Via SSH/rsync

```bash
# Depuis votre machine
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

# Upload (ADAPTER user@server et chemin selon votre configuration)
rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    out/ user@game.zig-zag.fun:/var/www/game.zig-zag.fun/

# OU si vous utilisez un chemin différent
rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    out/ user@game.zig-zag.fun:/home/user/public_html/
```

---

## 🔧 ÉTAPE 2 : Vérifications sur le Serveur

### Via SSH

```bash
# Se connecter
ssh user@game.zig-zag.fun

# Aller dans le dossier
cd /var/www/game.zig-zag.fun  # OU cd /home/user/public_html/

# VÉRIFIER que _next/ existe
ls -la _next/
ls -la _next/static/chunks/ | wc -l  # Doit afficher au moins 20 fichiers

# VÉRIFIER que .htaccess existe et contient les bonnes règles
ls -la .htaccess
cat .htaccess | grep -A 3 "LocationMatch.*_next"  # Doit afficher les règles spécifiques

# VÉRIFIER les permissions
chmod 644 .htaccess
chmod -R 755 _next/

# Recharger Apache (si nécessaire)
sudo service apache2 reload
# OU
sudo systemctl reload apache2
```

### Vérifier les Modules Apache

```bash
# Vérifier que mod_headers et mod_mime sont activés
apache2ctl -M | grep headers
apache2ctl -M | grep mime

# Si manquants, activer :
sudo a2enmod headers
sudo a2enmod mime
sudo systemctl reload apache2
```

---

## 🧪 ÉTAPE 3 : Tests

### 1. Test Direct d'un Chunk

```bash
# Tester un chunk spécifique (remplacer par un nom de chunk réel)
curl -I https://game.zig-zag.fun/_next/static/chunks/3a94daa1c77c8122.js

# Doit retourner :
# HTTP/1.1 200 OK
# Content-Type: application/javascript; charset=utf-8
```

### 2. Test dans le Navigateur

1. **Vider le cache navigateur** :
   - Chrome/Edge : `Ctrl + Shift + Delete` (Windows) ou `Cmd + Shift + Delete` (Mac)
   - Firefox : `Ctrl + Shift + Delete`
   - Safari : `Cmd + Option + E`

2. **Hard refresh** :
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

3. **Aller sur** : `https://game.zig-zag.fun/jeu/matchmaking`

4. **Ouvrir la console (F12)** et vérifier :
   - ✅ Pas d'erreur "Failed to load chunk"
   - ✅ Pas d'erreur MIME type
   - ✅ Les chunks se chargent avec `Content-Type: application/javascript`
   - ✅ L'application fonctionne correctement

---

## 🔍 Diagnostic si le Problème Persiste

### Vérifier le .htaccess sur le Serveur

```bash
# Sur le serveur
cat /var/www/game.zig-zag.fun/.htaccess | head -60
```

**Doit contenir** :
```apache
<LocationMatch "^/_next/static/chunks/.*\.js$">
    Header always set Content-Type "application/javascript; charset=utf-8"
    Header always unset X-Content-Type-Options
</LocationMatch>
```

### Vérifier les Logs Apache

```bash
# Sur le serveur
tail -n 50 /var/log/apache2/error.log
```

### Test Local du Build

```bash
# Sur votre machine
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app/out"
python3 -m http.server 8000

# Ouvrir http://localhost:8000/jeu/matchmaking
# Si ça marche en local, le build est OK, le problème est sur le serveur
```

---

## 📝 Checklist de Déploiement

- [ ] Build local réussi (`npm run build` ou `./node_modules/.bin/next build`)
- [ ] `.htaccess` copié dans `out/` (fait automatiquement)
- [ ] Tous les fichiers de `out/` uploadés sur le serveur
- [ ] `.htaccess` présent sur le serveur à la racine
- [ ] Permissions correctes (644 pour `.htaccess`, 755 pour les dossiers)
- [ ] Modules Apache activés (`mod_headers`, `mod_mime`)
- [ ] Apache rechargé (`sudo service apache2 reload`)
- [ ] Cache navigateur vidé
- [ ] Test en ligne réussi (pas d'erreur console)

---

## 💡 Explication du Problème

### Pourquoi le chunk `220f7eda15ec2b40.js` n'existe plus ?

Next.js génère des noms de chunks avec des hash aléatoires à chaque build. Le chunk `220f7eda15ec2b40.js` était d'un ancien build. Le nouveau build a généré de nouveaux chunks avec des noms différents.

**C'est normal !** Il faut simplement uploader tous les nouveaux chunks.

### Pourquoi le MIME type était incorrect ?

Le serveur servait les fichiers `.js` avec `Content-Type: text/plain` au lieu de `application/javascript`. Le `.htaccess` amélioré force maintenant le bon type MIME avec `Header always set`.

---

## 🆘 Support

Si le problème persiste après tout ça, envoyez :

1. Le résultat de :
   ```bash
   curl -I https://game.zig-zag.fun/_next/static/chunks/[UN_CHUNK_REEL].js
   ```

2. Le contenu de votre `.htaccess` sur le serveur :
   ```bash
   cat /var/www/game.zig-zag.fun/.htaccess
   ```

3. Les logs Apache (si accessible) :
   ```bash
   tail -n 50 /var/log/apache2/error.log
   ```

---

**Date** : 30 décembre 2024  
**Priorité** : 🔴 URGENT  
**Build** : ✅ Terminé - Prêt pour upload

