# 🚨 FIX URGENT : Erreur 500 + MIME Type Incorrect

## ❌ Problèmes Identifiés

1. **Erreur 500** : Le serveur retourne une erreur interne
2. **MIME type 'text/plain'** : Les fichiers `.js` sont servis avec le mauvais type
3. **Chunk manquant** : `b58108dde82d1a97.js` ne peut pas être chargé

---

## 🔍 Diagnostic Immédiat

### Étape 1 : Vérifier les Logs Apache

**Sur le serveur, connectez-vous en SSH** :

```bash
ssh user@game.zig-zag.fun

# Voir les dernières erreurs
tail -n 50 /var/log/apache2/error.log

# OU si c'est un hébergement partagé
tail -n 50 ~/logs/error.log
```

**Cherchez** :
- Erreurs de syntaxe dans `.htaccess`
- Problèmes avec `mod_headers` ou `mod_mime`
- Erreurs de permissions

---

### Étape 2 : Vérifier le .htaccess sur le Serveur

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun  # OU le chemin correct

# Vérifier que le fichier existe
ls -la .htaccess

# Voir le contenu (premières lignes)
head -60 .htaccess

# Vérifier les permissions
chmod 644 .htaccess
```

**Le `.htaccess` doit contenir** (au début) :

```apache
<IfModule mod_mime.c>
    AddType application/javascript .js .mjs
    AddType text/css .css
</IfModule>

<IfModule mod_headers.c>
    <LocationMatch "^/_next/">
        Header always unset X-Content-Type-Options
    </LocationMatch>
    
    <LocationMatch "^/_next/static/chunks/.*\.js$">
        Header always unset X-Content-Type-Options
        Header always set Content-Type "application/javascript; charset=utf-8"
    </LocationMatch>
</IfModule>
```

---

### Étape 3 : Vérifier les Modules Apache

```bash
# Sur le serveur
apache2ctl -M | grep headers
apache2ctl -M | grep mime

# Si manquants, activer :
sudo a2enmod headers
sudo a2enmod mime
sudo systemctl reload apache2
```

---

## ✅ Solution : .htaccess Simplifié (Si Erreur 500)

Si l'erreur 500 persiste, le `.htaccess` actuel peut être trop complexe. Utilisez cette version **simplifiée** :

```apache
# Configuration .htaccess SIMPLIFIÉE pour Next.js
# À placer à la racine de game.zig-zag.fun

RewriteEngine On

# ============================================
# TYPES MIME - PRIORITÉ ABSOLUE
# ============================================
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType application/javascript .mjs
    AddType text/css .css
    AddType application/json .json
</IfModule>

# ============================================
# HEADERS POUR FORCER LES TYPES MIME
# ============================================
<IfModule mod_headers.c>
    # Désactiver nosniff pour _next/
    <LocationMatch "^/_next/">
        Header always unset X-Content-Type-Options
    </LocationMatch>
    
    # Forcer le bon type MIME pour les chunks JS
    <FilesMatch "\.js$">
        Header always set Content-Type "application/javascript; charset=utf-8"
    </FilesMatch>
    
    # Forcer le bon type MIME pour les CSS
    <FilesMatch "\.css$">
        Header always set Content-Type "text/css; charset=utf-8"
    </FilesMatch>
</IfModule>

# ============================================
# ROUTING NEXT.JS
# ============================================
# Ne JAMAIS toucher aux fichiers _next/
RewriteCond %{REQUEST_URI} ^/_next/
RewriteRule ^ - [L]

# Ne pas réécrire les fichiers existants
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Ne pas réécrire les dossiers existants
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Rediriger vers index.html pour le routing côté client
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/_next/
RewriteRule ^(.*)$ index.html [L]

# ============================================
# GESTION DES ERREURS
# ============================================
ErrorDocument 404 /index.html
ErrorDocument 500 /index.html
```

**Sauvegardez ce contenu dans** : `/var/www/game.zig-zag.fun/.htaccess`

---

## 🔧 Actions Immédiates

### 1. Tester le .htaccess

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun

# Tester la syntaxe Apache
apache2ctl configtest

# Si erreur, corriger le .htaccess
```

### 2. Vérifier AllowOverride

```bash
# Sur le serveur
cat /etc/apache2/sites-available/game.zig-zag.fun.conf | grep AllowOverride

# Doit contenir : AllowOverride All
# Si non, modifier le fichier de configuration
```

### 3. Recharger Apache

```bash
# Sur le serveur
sudo systemctl reload apache2
# OU
sudo service apache2 reload
```

### 4. Tester un Chunk

```bash
# Depuis votre machine
curl -I https://game.zig-zag.fun/_next/static/chunks/b58108dde82d1a97.js

# Doit retourner :
# HTTP/1.1 200 OK
# Content-Type: application/javascript; charset=utf-8
```

---

## 🆘 Si l'Erreur 500 Persiste

### Option 1 : Désactiver Temporairement le .htaccess

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun
mv .htaccess .htaccess.backup

# Tester si le site fonctionne
# Si oui, le problème vient du .htaccess
```

### Option 2 : Utiliser une Configuration Apache Directe

Si `.htaccess` ne fonctionne pas, configurez directement dans Apache :

```apache
# Dans /etc/apache2/sites-available/game.zig-zag.fun.conf
<VirtualHost *:80>
    ServerName game.zig-zag.fun
    DocumentRoot /var/www/game.zig-zag.fun
    
    <Directory /var/www/game.zig-zag.fun>
        AllowOverride All
        Options -Indexes +FollowSymLinks
        
        # Types MIME
        <IfModule mod_mime.c>
            AddType application/javascript .js
            AddType text/css .css
        </IfModule>
        
        # Headers
        <IfModule mod_headers.c>
            <LocationMatch "^/_next/">
                Header always unset X-Content-Type-Options
            </LocationMatch>
            <FilesMatch "\.js$">
                Header always set Content-Type "application/javascript; charset=utf-8"
            </FilesMatch>
        </IfModule>
    </Directory>
</VirtualHost>
```

Puis :
```bash
sudo a2ensite game.zig-zag.fun.conf
sudo systemctl reload apache2
```

---

## 📝 Checklist de Résolution

- [ ] Logs Apache vérifiés (erreur 500 identifiée)
- [ ] `.htaccess` présent sur le serveur
- [ ] `.htaccess` avec syntaxe correcte (testé avec `apache2ctl configtest`)
- [ ] Modules `mod_headers` et `mod_mime` activés
- [ ] `AllowOverride All` dans la configuration Apache
- [ ] Permissions correctes (644 pour `.htaccess`)
- [ ] Apache rechargé
- [ ] Test d'un chunk : `Content-Type: application/javascript`
- [ ] Site fonctionne sans erreur 500

---

## 💡 Causes Possibles de l'Erreur 500

1. **Syntaxe incorrecte dans `.htaccess`**
   - Vérifier avec `apache2ctl configtest`

2. **Modules manquants**
   - `mod_headers` ou `mod_mime` non activés

3. **AllowOverride désactivé**
   - `.htaccess` ignoré par Apache

4. **Permissions incorrectes**
   - `.htaccess` non lisible

5. **Configuration Apache restrictive**
   - Certaines directives interdites

---

**Date** : 30 décembre 2024  
**Priorité** : 🔴 URGENT  
**Action** : Vérifier les logs Apache en premier !

