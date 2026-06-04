# 🚨 FIX URGENT : Erreur "Failed to load chunk" + MIME type incorrect

## Problème Identifié

❌ **Chunk manquant** : `220f7eda15ec2b40.js` retourne 404  
❌ **MIME type incorrect** : Les fichiers `.js` sont servis comme `text/plain` au lieu de `application/javascript`  
❌ **Application bloquée** : Le navigateur refuse d'exécuter les scripts avec le mauvais MIME type

---

## ✅ Solution en 4 Étapes

### 1️⃣ Re-builder l'Application

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

# Nettoyer les anciens builds
rm -rf .next out

# Re-builder
npm run build

# Vérifier que le build est complet
ls -la out/
ls -la out/_next/static/chunks/ | wc -l  # Doit afficher au moins 20 fichiers
```

### 2️⃣ Copier le .htaccess dans out/

Le `.htaccess` a été amélioré avec des règles spécifiques pour les chunks Next.js :

```bash
# Copier le .htaccess dans out/
cp .htaccess out/.htaccess

# Vérifier
ls -la out/.htaccess
cat out/.htaccess | head -60  # Vérifier les règles MIME type
```

**✅ Le `.htaccess` contient maintenant :**
- Règles spécifiques pour `/_next/static/chunks/` avec `LocationMatch`
- `Header always set` au lieu de `Header set` pour forcer les types MIME
- Désactivation de `X-Content-Type-Options` pour les chunks (si nécessaire)

### 3️⃣ Upload Complet sur game.zig-zag.fun

**⚠️ IMPORTANT** : Uploader TOUT le contenu de `out/`, y compris le `.htaccess`

#### Option A : Via FTP/FileZilla

1. Connectez-vous à votre serveur `game.zig-zag.fun`
2. Allez dans le dossier racine (`/var/www/game.zig-zag.fun/` ou `public_html/`)
3. **Sauvegarder l'ancien** (optionnel mais recommandé) :
   ```
   Renommer le dossier actuel en backup
   ```
4. **UPLOADER** tout le contenu de `game-app/out/` :
   - ✅ `out/_next/` → `game.zig-zag.fun/_next/`
   - ✅ `out/.htaccess` → `game.zig-zag.fun/.htaccess` (CRITIQUE !)
   - ✅ `out/index.html` → `game.zig-zag.fun/index.html`
   - ✅ Tous les autres fichiers et dossiers

#### Option B : Via SSH/rsync

```bash
# Depuis votre machine
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

# Upload (adapter user@server et chemin selon votre configuration)
rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    out/ user@game.zig-zag.fun:/var/www/game.zig-zag.fun/

# OU si vous utilisez le script de déploiement
./build-and-deploy.sh
```

### 4️⃣ Vérifications Post-Upload

#### A. Sur le Serveur (SSH)

```bash
# Se connecter
ssh user@game.zig-zag.fun

# Aller dans le dossier
cd /var/www/game.zig-zag.fun  # ou public_html/

# VÉRIFIER que _next/ existe
ls -la _next/
ls -la _next/static/chunks/ | wc -l  # Doit afficher au moins 20 fichiers

# VÉRIFIER que .htaccess existe et est correct
ls -la .htaccess
cat .htaccess | grep -A 5 "LocationMatch.*_next"  # Vérifier les règles spécifiques

# VÉRIFIER les permissions
chmod 644 .htaccess
chmod -R 755 _next/

# Recharger Apache (si nécessaire)
sudo service apache2 reload
# OU
sudo systemctl reload apache2
```

#### B. Test en Ligne

1. **Vider le cache navigateur** : `Ctrl + Shift + Delete` (ou `Cmd + Shift + Delete` sur Mac)
2. **Hard refresh** : `Ctrl + Shift + R` (ou `Cmd + Shift + R` sur Mac)
3. **Aller sur** : `https://game.zig-zag.fun/jeu/matchmaking`
4. **Ouvrir la console (F12)** et vérifier :
   - ✅ Pas d'erreur "Failed to load chunk"
   - ✅ Pas d'erreur MIME type
   - ✅ Les chunks se chargent avec `Content-Type: application/javascript`

#### C. Test Direct du Chunk

```bash
# Tester un chunk spécifique
curl -I https://game.zig-zag.fun/_next/static/chunks/3a94daa1c77c8122.js

# Doit retourner :
# Content-Type: application/javascript; charset=utf-8
# Status: 200 OK
```

---

## 🔧 Si Ça Ne Marche Toujours Pas

### Option 1 : Vérifier la Configuration Apache

Sur le serveur, vérifier que `mod_headers` et `mod_mime` sont activés :

```bash
# Vérifier les modules Apache
apache2ctl -M | grep headers
apache2ctl -M | grep mime

# Si manquants, activer :
sudo a2enmod headers
sudo a2enmod mime
sudo systemctl reload apache2
```

### Option 2 : Vérifier les Overrides

Sur le serveur, vérifier que les `.htaccess` sont autorisés :

```bash
# Vérifier la configuration Apache
cat /etc/apache2/sites-available/game.zig-zag.fun.conf | grep AllowOverride

# Doit contenir :
# AllowOverride All
```

### Option 3 : Test Local

Tester le build local avec un serveur HTTP simple :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app/out"
python3 -m http.server 8000

# Ouvrir http://localhost:8000/jeu/matchmaking
# Si ça marche en local, le build est OK, le problème est sur le serveur
```

---

## 💡 Explication des Améliorations

### Ce qui a été corrigé dans le `.htaccess` :

1. **Règles spécifiques pour `_next/static/chunks/`** :
   ```apache
   <LocationMatch "^/_next/static/chunks/.*\.js$">
       Header always set Content-Type "application/javascript; charset=utf-8"
   </LocationMatch>
   ```

2. **`Header always set` au lieu de `Header set`** :
   - Force le header même si une autre directive l'a déjà défini
   - Plus robuste face aux configurations serveur

3. **Désactivation de `X-Content-Type-Options`** :
   - Permet au navigateur d'accepter le Content-Type défini
   - Nécessaire si le serveur force `nosniff`

---

## 📝 Checklist de Déploiement

- [ ] Build local réussi (`npm run build`)
- [ ] `.htaccess` copié dans `out/`
- [ ] Tous les fichiers de `out/` uploadés sur le serveur
- [ ] `.htaccess` présent sur le serveur à la racine
- [ ] Permissions correctes (644 pour `.htaccess`, 755 pour les dossiers)
- [ ] Modules Apache activés (`mod_headers`, `mod_mime`)
- [ ] Cache navigateur vidé
- [ ] Test en ligne réussi (pas d'erreur console)

---

## 🆘 Support

Si le problème persiste après tout ça, envoyez :

1. Le résultat de :
   ```bash
   curl -I https://game.zig-zag.fun/_next/static/chunks/3a94daa1c77c8122.js
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
**Fichier modifié** : `game-app/.htaccess`

