# 🔍 Diagnostic : Erreur Chunk 220f7eda15ec2b40.js

## ❌ Erreur Actuelle

```
Failed to load resource: the server responded with a status of 404
Refused to execute script because its MIME type ('text/plain') is not executable
Error: Failed to load chunk /_next/static/chunks/220f7eda15ec2b40.js
```

## 🔎 Analyse du Problème

### Problème 1 : Chunk 404 (Not Found)
- Le chunk `220f7eda15ec2b40.js` n'existe **pas** sur le serveur `game.zig-zag.fun`
- Cela signifie que :
  - ❌ L'upload n'a **pas encore été fait**, OU
  - ❌ L'upload est **incomplet** (certains fichiers manquent), OU
  - ❌ Le build sur le serveur est **ancien** (chunk d'un build précédent)

### Problème 2 : MIME Type Incorrect
- Même si le chunk existait, il serait servi avec `text/plain` au lieu de `application/javascript`
- Cela signifie que :
  - ❌ Le `.htaccess` n'est **pas présent** sur `game.zig-zag.fun`, OU
  - ❌ Le `.htaccess` est **incorrect** (pas les bonnes règles), OU
  - ❌ Les modules Apache `mod_headers` et `mod_mime` ne sont **pas activés**

---

## ✅ Solution en 3 Étapes

### ÉTAPE 1 : Vérifier le Build Local

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

# Vérifier que out/ existe
ls -la out/

# Vérifier que _next/ existe
ls -la out/_next/static/chunks/ | wc -l  # Doit afficher au moins 20 fichiers

# Vérifier que .htaccess est dans out/
ls -la out/.htaccess
```

**Si `out/` n'existe pas ou est vide** :
```bash
# Re-builder
rm -rf .next out
./node_modules/.bin/next build
cp .htaccess out/.htaccess
```

---

### ÉTAPE 2 : Upload sur game.zig-zag.fun

**⚠️ IMPORTANT** : Le problème est sur `game.zig-zag.fun`, **PAS** sur `zig-zag.fun` !

#### Option A : Via FTP/FileZilla

1. **Connectez-vous** à votre serveur
2. **Allez dans le dossier de `game.zig-zag.fun`** :
   - `/var/www/game.zig-zag.fun/` (VPS)
   - OU `/home/user/public_html/game.zig-zag.fun/` (hébergement partagé)
   - OU le dossier configuré pour le sous-domaine

3. **Vérifier la structure actuelle** :
   ```
   game.zig-zag.fun/
   ├── _next/          ← Doit exister avec des chunks
   ├── .htaccess       ← Doit exister (CRITIQUE)
   └── ...
   ```

4. **UPLOADER TOUT le contenu de `game-app/out/`** :
   - ✅ `out/_next/` → `game.zig-zag.fun/_next/` (TOUS les chunks)
   - ✅ `out/.htaccess` → `game.zig-zag.fun/.htaccess` (CRITIQUE)
   - ✅ `out/index.html` → `game.zig-zag.fun/index.html`
   - ✅ Tous les autres fichiers

#### Option B : Via SSH

```bash
# Depuis votre machine
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

# Upload (ADAPTER selon votre configuration)
rsync -avz --delete \
    --exclude='.DS_Store' \
    out/ user@game.zig-zag.fun:/var/www/game.zig-zag.fun/
```

---

### ÉTAPE 3 : Vérifications sur le Serveur

#### A. Vérifier que les fichiers sont présents

```bash
# Se connecter au serveur
ssh user@game.zig-zag.fun

# Aller dans le dossier
cd /var/www/game.zig-zag.fun  # OU le chemin correct

# Vérifier _next/
ls -la _next/static/chunks/ | wc -l  # Doit afficher au moins 20 fichiers

# Vérifier .htaccess
ls -la .htaccess
cat .htaccess | head -60  # Vérifier le contenu
```

#### B. Vérifier le .htaccess

Le `.htaccess` sur `game.zig-zag.fun` doit contenir :

```apache
<LocationMatch "^/_next/static/chunks/.*\.js$">
    Header always set Content-Type "application/javascript; charset=utf-8"
    Header always unset X-Content-Type-Options
</LocationMatch>
```

**Si ce n'est pas le cas**, copier le `.htaccess` depuis `game-app/.htaccess` :

```bash
# Sur le serveur
cat > /var/www/game.zig-zag.fun/.htaccess << 'EOF'
# [Copier le contenu de game-app/.htaccess]
EOF

# OU uploader via FTP le fichier game-app/.htaccess
```

#### C. Vérifier les modules Apache

```bash
# Sur le serveur
apache2ctl -M | grep headers
apache2ctl -M | grep mime

# Si manquants :
sudo a2enmod headers
sudo a2enmod mime
sudo systemctl reload apache2
```

#### D. Vérifier les permissions

```bash
# Sur le serveur
chmod 644 /var/www/game.zig-zag.fun/.htaccess
chmod -R 755 /var/www/game.zig-zag.fun/_next/
```

---

## 🧪 Tests Après Upload

### Test 1 : Vérifier qu'un chunk existe

```bash
# Sur le serveur
ls /var/www/game.zig-zag.fun/_next/static/chunks/*.js | head -1
# Notez le nom d'un chunk réel

# Tester depuis votre machine
curl -I https://game.zig-zag.fun/_next/static/chunks/[NOM_DU_CHUNK].js

# Doit retourner :
# HTTP/1.1 200 OK
# Content-Type: application/javascript; charset=utf-8
```

### Test 2 : Dans le navigateur

1. **Vider le cache** : `Ctrl + Shift + Delete`
2. **Hard refresh** : `Ctrl + Shift + R`
3. **Aller sur** : `https://game.zig-zag.fun/jeu/matchmaking`
4. **Console (F12)** : Plus d'erreur 404 ou MIME type

---

## 🔧 Si le Problème Persiste

### Vérifier les logs Apache

```bash
# Sur le serveur
tail -n 50 /var/log/apache2/error.log
```

### Vérifier la configuration du VirtualHost

```bash
# Sur le serveur
cat /etc/apache2/sites-available/game.zig-zag.fun.conf | grep -A 5 "DocumentRoot"
```

**Doit pointer vers** : `/var/www/game.zig-zag.fun` (ou le bon chemin)

### Vérifier AllowOverride

```bash
# Sur le serveur
cat /etc/apache2/sites-available/game.zig-zag.fun.conf | grep AllowOverride
```

**Doit contenir** : `AllowOverride All`

---

## 📝 Checklist Complète

- [ ] Build local réussi (`out/` existe avec des chunks)
- [ ] `.htaccess` présent dans `out/`
- [ ] Upload complet de `out/` sur `game.zig-zag.fun`
- [ ] `_next/static/chunks/` contient au moins 20 fichiers `.js` sur le serveur
- [ ] `.htaccess` présent à la racine de `game.zig-zag.fun` sur le serveur
- [ ] `.htaccess` contient les règles `LocationMatch` pour `_next/static/chunks/`
- [ ] Modules Apache `mod_headers` et `mod_mime` activés
- [ ] Permissions correctes (644 pour `.htaccess`, 755 pour `_next/`)
- [ ] Apache rechargé (`sudo systemctl reload apache2`)
- [ ] Cache navigateur vidé
- [ ] Test en ligne réussi

---

## ⚠️ Confusion à Éviter

**NE PAS confondre** :
- ❌ `zig-zag.fun/.htaccess` (site principal) → **N'EST PAS** le bon fichier
- ✅ `game.zig-zag.fun/.htaccess` (sous-domaine jeu) → **EST** le bon fichier

Le `.htaccess` à utiliser est celui dans `game-app/.htaccess`, **PAS** celui dans `Zig-Zag/.htaccess`.

---

**Date** : 30 décembre 2024  
**Priorité** : 🔴 URGENT

