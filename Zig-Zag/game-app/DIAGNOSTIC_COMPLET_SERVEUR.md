# 🔍 Diagnostic Complet : Erreur 500 + MIME Type

## ❌ Problème Actuel

- ❌ **Erreur 500** : Le serveur retourne une erreur interne
- ❌ **MIME type 'text/plain'** : Les fichiers `.js` et `.css` sont servis avec le mauvais type
- ❌ **Chunks non chargés** : L'application ne peut pas fonctionner

**Conclusion** : Le `.htaccess` n'est **PAS appliqué** sur le serveur.

---

## 🔧 Diagnostic Étape par Étape

### ÉTAPE 1 : Vérifier que le .htaccess est sur le Serveur

```bash
# Se connecter en SSH
ssh user@game.zig-zag.fun

# Aller dans le dossier
cd /var/www/game.zig-zag.fun  # OU le chemin correct

# Vérifier que le fichier existe
ls -la .htaccess

# Voir le contenu (premières lignes)
head -20 .htaccess
```

**Si le fichier n'existe pas** :
- ❌ Il n'a pas été uploadé
- 👉 Uploadez-le maintenant

---

### ÉTAPE 2 : Vérifier les Logs Apache (CRITIQUE)

```bash
# Sur le serveur
tail -n 100 /var/log/apache2/error.log

# OU si hébergement partagé
tail -n 100 ~/logs/error.log
# OU
tail -n 100 ~/public_html/game.zig-zag.fun/logs/error.log
```

**Cherchez** :
- `Syntax error on line X of .htaccess`
- `.htaccess: Invalid command`
- `mod_headers not loaded`
- `mod_mime not loaded`
- `AllowOverride not allowed here`

**Copiez l'erreur exacte** et utilisez-la pour corriger.

---

### ÉTAPE 3 : Tester la Syntaxe

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun
apache2ctl configtest

# OU
apachectl -t
```

**Si erreur de syntaxe** :
- Notez le numéro de ligne
- Corrigez le `.htaccess`

---

### ÉTAPE 4 : Vérifier AllowOverride

```bash
# Sur le serveur
cat /etc/apache2/sites-available/game.zig-zag.fun.conf | grep -A 10 "DocumentRoot"

# OU si hébergement partagé, chercher dans :
cat ~/.htaccess  # Peut contenir des restrictions
```

**Doit contenir** :
```apache
<Directory /var/www/game.zig-zag.fun>
    AllowOverride All
    Options -Indexes +FollowSymLinks
</Directory>
```

**Si `AllowOverride None`** :
- Le `.htaccess` est **ignoré**
- Il faut modifier la configuration Apache (nécessite accès root)

---

### ÉTAPE 5 : Vérifier les Modules

```bash
# Sur le serveur
apache2ctl -M | grep headers
apache2ctl -M | grep mime

# Si manquants :
sudo a2enmod headers
sudo a2enmod mime
sudo systemctl reload apache2
```

**Si vous n'avez pas les droits root** :
- Contactez votre hébergeur
- Demandez l'activation de `mod_headers` et `mod_mime`

---

### ÉTAPE 6 : Tester Directement un Fichier

```bash
# Depuis votre machine
curl -I https://game.zig-zag.fun/_next/static/chunks/b58108dde82d1a97.js

# Vérifiez :
# - Status : 200 OK (pas 500)
# - Content-Type : application/javascript (pas text/plain)
```

---

## ✅ Solutions selon le Problème

### Solution 1 : Erreur de Syntaxe dans .htaccess

**Utilisez la version minimale** : `.htaccess.minimal`

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun
cp .htaccess .htaccess.backup
# Uploadez .htaccess.minimal et renommez-le en .htaccess
mv .htaccess.minimal .htaccess
chmod 644 .htaccess
sudo systemctl reload apache2
```

---

### Solution 2 : AllowOverride None

**Si vous avez accès root** :

```bash
# Éditer la configuration Apache
sudo nano /etc/apache2/sites-available/game.zig-zag.fun.conf

# Ajouter ou modifier :
<Directory /var/www/game.zig-zag.fun>
    AllowOverride All
    Options -Indexes +FollowSymLinks
</Directory>

# Activer le site
sudo a2ensite game.zig-zag.fun.conf
sudo systemctl reload apache2
```

**Si vous n'avez PAS accès root** :
- Contactez votre hébergeur
- Demandez l'activation de `AllowOverride All` pour votre domaine

---

### Solution 3 : Modules Manquants

**Si vous avez accès root** :

```bash
sudo a2enmod headers
sudo a2enmod mime
sudo systemctl reload apache2
```

**Si vous n'avez PAS accès root** :
- Contactez votre hébergeur
- Demandez l'activation de `mod_headers` et `mod_mime`

---

### Solution 4 : Configuration Directe dans Apache (Si .htaccess ne fonctionne pas)

**Si `.htaccess` est complètement désactivé**, configurez directement dans Apache :

```apache
# Dans /etc/apache2/sites-available/game.zig-zag.fun.conf
<VirtualHost *:80>
    ServerName game.zig-zag.fun
    DocumentRoot /var/www/game.zig-zag.fun
    
    <Directory /var/www/game.zig-zag.fun>
        AllowOverride All
        Options -Indexes +FollowSymLinks
        
        # Types MIME
        AddType application/javascript .js
        AddType text/css .css
        
        # Headers
        <IfModule mod_headers.c>
            <FilesMatch "\.js$">
                Header set Content-Type "application/javascript"
            </FilesMatch>
            <FilesMatch "\.css$">
                Header set Content-Type "text/css"
            </FilesMatch>
        </IfModule>
        
        # Routing Next.js
        RewriteEngine On
        RewriteCond %{REQUEST_URI} ^/_next/
        RewriteRule ^ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.html [L]
    </Directory>
</VirtualHost>
```

Puis :
```bash
sudo a2ensite game.zig-zag.fun.conf
sudo systemctl reload apache2
```

---

## 🆘 Si Rien Ne Fonctionne

### Option 1 : Désactiver Temporairement le .htaccess

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun
mv .htaccess .htaccess.disabled

# Tester si le site charge (sans routing, mais au moins sans erreur 500)
```

**Si le site fonctionne sans `.htaccess`** :
- Le problème vient du `.htaccess`
- Utilisez la version minimale

**Si le site ne fonctionne toujours pas** :
- Le problème est ailleurs (fichiers manquants, permissions, etc.)

---

### Option 2 : Contacter l'Hébergeur

Si vous êtes sur un **hébergement partagé** (Hostinger, OVH, etc.) :

**Demandez** :
1. Activation de `AllowOverride All` pour `game.zig-zag.fun`
2. Activation de `mod_headers` et `mod_mime`
3. Vérification des logs d'erreur Apache

**Fournissez** :
- Le nom de domaine : `game.zig-zag.fun`
- L'erreur exacte des logs
- Le fait que vous avez besoin de configurer les types MIME pour Next.js

---

## 📋 Checklist Complète

- [ ] `.htaccess` présent sur le serveur
- [ ] Logs Apache vérifiés (erreur identifiée)
- [ ] Syntaxe `.htaccess` testée (`apache2ctl configtest`)
- [ ] `AllowOverride All` configuré
- [ ] Modules `mod_headers` et `mod_mime` activés
- [ ] Permissions `.htaccess` : 644
- [ ] Apache rechargé
- [ ] Test : `Content-Type: application/javascript` (pas `text/plain`)
- [ ] Pas d'erreur 500

---

## 📁 Fichiers Disponibles

1. **`.htaccess`** : Version complète (peut causer erreur 500)
2. **`.htaccess.simple`** : Version simplifiée
3. **`.htaccess.minimal`** : Version minimale (RECOMMANDÉ si erreur 500)

---

**Date** : 30 décembre 2024  
**Priorité** : 🔴 URGENT  
**Action immédiate** : Vérifier les logs Apache pour identifier l'erreur exacte !

