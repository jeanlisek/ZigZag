# 🚨 FIX URGENT - Erreur "Failed to load chunk"

## Problème Identifié

❌ **MIME types incorrects** : Les fichiers `.js` et `.css` sont servis comme `text/plain`  
❌ **Fichiers manquants** : Certains chunks ne sont pas sur le serveur

---

## ✅ Solution en 4 Étapes (15 minutes)

### 1️⃣ Vérifier le Build Local

```bash
cd /Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/game-app

# Vérifier que out/ existe et contient _next/
ls -la out/
ls -la out/_next/static/chunks/

# Vous devez voir b3b5886d7d5fae1e.js
ls out/_next/static/chunks/ | grep b3b5886d7d5fae1e.js
```

**Si le fichier n'existe pas** :
```bash
rm -rf .next out
npm run build
```

---

### 2️⃣ Vérifier le .htaccess

**IMPORTANT** : Un nouveau `.htaccess` a été créé dans `game-app/out/.htaccess`

✅ **Ce fichier DOIT être uploadé avec le reste !**

---

### 3️⃣ Upload Complet

#### Étape A : Sauvegarder l'ancien (si besoin)

```bash
# Sur le serveur game.zig-zag.fun
mv /var/www/game.zig-zag.fun /var/www/game.zig-zag.fun.backup
```

#### Étape B : Upload TOUT le dossier out/

**Via FTP/FileZilla** :
1. Connexion à `game.zig-zag.fun`
2. Aller dans le dossier racine (`/var/www/game.zig-zag.fun/` ou `public_html/`)
3. **SUPPRIMER** tout sauf `.htaccess` si personnalisé
4. **UPLOADER** tout le contenu de `game-app/out/` (Y COMPRIS le .htaccess !)

**Via SSH/rsync** :
```bash
# Depuis votre machine
cd /Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/game-app

# Upload (adapter user@server et chemin)
rsync -avz --delete out/ user@game.zig-zag.fun:/var/www/game.zig-zag.fun/
```

---

### 4️⃣ Vérifications Post-Upload

#### A. Sur le Serveur (SSH)

```bash
# Se connecter
ssh user@game.zig-zag.fun

# Aller dans le dossier
cd /var/www/game.zig-zag.fun  # ou public_html/

# VÉRIFIER que _next/ existe
ls -la _next/

# VÉRIFIER que le chunk existe
ls -la _next/static/chunks/b3b5886d7d5fae1e.js

# VÉRIFIER que .htaccess existe
ls -la .htaccess
cat .htaccess  # Afficher le contenu

# VÉRIFIER les permissions
chmod 644 .htaccess
chmod 755 _next
chmod -R 644 _next/static/chunks/*.js
chmod -R 644 _next/static/chunks/*.css
```

#### B. Test MIME Types

```bash
# Tester si le serveur retourne le bon MIME type
curl -I https://game.zig-zag.fun/_next/static/chunks/b3b5886d7d5fae1e.js

# Vous DEVEZ voir :
# Content-Type: application/javascript
# OU
# Content-Type: text/javascript
```

**Si vous voyez `Content-Type: text/plain`** :
- Le .htaccess n'est pas appliqué
- Vérifier que `AllowOverride All` est configuré dans Apache/Nginx

---

### 5️⃣ Test Final

1. **Vider le cache** : `Ctrl + Shift + Delete`
2. **Hard refresh** : `Ctrl + Shift + R`
3. Aller sur https://game.zig-zag.fun/jeu/matchmaking
4. ✅ **Pas d'erreur** dans la console
5. ✅ **ColorPicker fonctionne**

---

## 🔧 Si Ça Ne Marche Toujours Pas

### Diagnostic Avancé

#### Vérifier le VirtualHost Apache

```bash
# Sur le serveur
sudo nano /etc/apache2/sites-available/game.zig-zag.fun.conf

# S'assurer que AllowOverride est à All :
<Directory /var/www/game.zig-zag.fun>
    AllowOverride All
    Require all granted
</Directory>

# Recharger Apache
sudo systemctl reload apache2
```

#### Vérifier les Logs Apache

```bash
# Logs d'erreur
tail -f /var/log/apache2/error.log

# Logs d'accès
tail -f /var/log/apache2/access.log | grep "_next"
```

#### Forcer les MIME Types au Niveau Apache

Si `.htaccess` ne fonctionne pas, ajouter dans le VirtualHost :

```apache
<VirtualHost *:443>
    ServerName game.zig-zag.fun
    DocumentRoot /var/www/game.zig-zag.fun
    
    # FORCER les MIME types
    <Directory /var/www/game.zig-zag.fun>
        AllowOverride All
        
        <FilesMatch "\.(js|mjs)$">
            ForceType application/javascript
        </FilesMatch>
        
        <FilesMatch "\.css$">
            ForceType text/css
        </FilesMatch>
    </Directory>
</VirtualHost>
```

---

## 📊 Checklist de Vérification

- [ ] `game-app/out/` contient `_next/static/chunks/b3b5886d7d5fae1e.js`
- [ ] `game-app/out/.htaccess` existe
- [ ] Tous les fichiers de `out/` ont été uploadés
- [ ] `.htaccess` est sur le serveur avec les bons droits (644)
- [ ] `curl -I` retourne `Content-Type: application/javascript`
- [ ] Console du navigateur : pas d'erreur MIME type
- [ ] Site fonctionne : https://game.zig-zag.fun/jeu/matchmaking

---

## 🆘 Contact Support Hébergeur

Si après tout ça, les MIME types sont toujours incorrects :

**Contacter votre hébergeur** et demander :
1. Activer `AllowOverride All` pour le domaine `game.zig-zag.fun`
2. Vérifier que `mod_mime` et `mod_headers` sont activés
3. Configurer les MIME types par défaut pour `.js` et `.css`

---

## ✅ Résolution Rapide (TL;DR)

```bash
# 1. Re-build
cd game-app
rm -rf .next out
npm run build

# 2. Vérifier le .htaccess
ls out/.htaccess  # DOIT exister

# 3. Upload TOUT
rsync -avz out/ server:/var/www/game.zig-zag.fun/

# 4. Test
curl -I https://game.zig-zag.fun/_next/static/chunks/XXX.js
# DOIT retourner: Content-Type: application/javascript
```

---

**Date** : 2024  
**Priorité** : 🚨 CRITIQUE
