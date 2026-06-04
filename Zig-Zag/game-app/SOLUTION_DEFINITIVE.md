# 🚨 SOLUTION DÉFINITIVE : Erreur 500 + MIME Type

## ❌ Problème Persistant

- ❌ **Erreur 500** : Le serveur retourne toujours une erreur interne
- ❌ **MIME type 'text/plain'** : Les fichiers sont servis avec le mauvais type
- ❌ **Le `.htaccess` n'est PAS appliqué**

---

## 🔍 Diagnostic : Le .htaccess est-il lu ?

### Test 1 : Vérifier que le .htaccess est présent

```bash
# Sur le serveur
ssh user@game.zig-zag.fun
cd /var/www/game.zig-zag.fun  # OU le chemin correct

ls -la .htaccess
cat .htaccess
```

**Si le fichier n'existe pas** :
- ❌ Il n'a pas été uploadé
- 👉 Uploadez-le maintenant

---

### Test 2 : Vérifier les Logs Apache (CRITIQUE)

```bash
# Sur le serveur
tail -n 100 /var/log/apache2/error.log | grep -i "htaccess\|500"

# OU si hébergement partagé
tail -n 100 ~/logs/error.log | grep -i "htaccess\|500"
```

**Erreurs courantes** :
- `.htaccess: Invalid command 'AddType'` → Module `mod_mime` non activé
- `.htaccess: Invalid command 'Header'` → Module `mod_headers` non activé
- `AllowOverride not allowed here` → `.htaccess` ignoré par Apache
- `Syntax error on line X` → Erreur de syntaxe

---

### Test 3 : Tester avec une Version Ultra-Minimale

**J'ai créé `.htaccess.ultra-minimal`** qui contient seulement :

```apache
AddType application/javascript .js
AddType text/css .css
```

**Si cette version cause encore une erreur 500** :
- Le problème vient de la **configuration Apache** (pas du `.htaccess`)
- `AllowOverride` est probablement désactivé
- OU les modules ne sont pas activés

---

## ✅ Solutions selon le Diagnostic

### Solution 1 : AllowOverride Désactivé

**Symptôme** : Aucune erreur dans les logs, mais le `.htaccess` est ignoré

**Si vous avez accès root** :

```bash
# Éditer la configuration Apache
sudo nano /etc/apache2/sites-available/game.zig-zag.fun.conf

# Ajouter ou modifier :
<Directory /var/www/game.zig-zag.fun>
    AllowOverride All
    Options -Indexes +FollowSymLinks
</Directory>

# Activer et recharger
sudo a2ensite game.zig-zag.fun.conf
sudo systemctl reload apache2
```

**Si vous n'avez PAS accès root** :
- Contactez votre hébergeur
- Demandez l'activation de `AllowOverride All` pour `game.zig-zag.fun`

---

### Solution 2 : Modules Non Activés

**Symptôme** : Erreur dans les logs comme `Invalid command 'AddType'`

**Si vous avez accès root** :

```bash
sudo a2enmod mime
sudo a2enmod headers
sudo systemctl reload apache2
```

**Si vous n'avez PAS accès root** :
- Contactez votre hébergeur
- Demandez l'activation de `mod_mime` et `mod_headers`

---

### Solution 3 : Configuration Directe dans Apache (Si .htaccess ne fonctionne pas)

**Si `.htaccess` est complètement désactivé**, configurez directement dans Apache :

```apache
# Dans /etc/apache2/sites-available/game.zig-zag.fun.conf
<VirtualHost *:80>
    ServerName game.zig-zag.fun
    DocumentRoot /var/www/game.zig-zag.fun
    
    <Directory /var/www/game.zig-zag.fun>
        # Types MIME
        AddType application/javascript .js
        AddType text/css .css
        
        # Headers (si mod_headers est disponible)
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

### Solution 4 : Hébergement Partagé (Hostinger, OVH, etc.)

**Si vous êtes sur un hébergement partagé** :

1. **Contactez le support** avec ces informations :
   - Domaine : `game.zig-zag.fun`
   - Problème : Erreur 500 avec `.htaccess`
   - Besoin : Activation de `AllowOverride All` et des modules `mod_mime` et `mod_headers`

2. **Alternative** : Utilisez un fichier `.htaccess` dans le dossier parent si possible

3. **Alternative** : Utilisez un fichier `php.ini` ou configuration via le panneau d'administration

---

## 🔧 Actions Immédiates

### Étape 1 : Tester la Version Ultra-Minimale

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun

# Sauvegarder l'ancien
cp .htaccess .htaccess.backup

# Utiliser la version ultra-minimale
# (Uploadez .htaccess.ultra-minimal et renommez-le)
chmod 644 .htaccess
sudo systemctl reload apache2
```

### Étape 2 : Vérifier les Logs

```bash
# Sur le serveur
tail -f /var/log/apache2/error.log

# Dans un autre terminal, testez :
curl -I https://game.zig-zag.fun/_next/static/chunks/b58108dde82d1a97.js

# Regardez les logs pour voir l'erreur exacte
```

### Étape 3 : Tester

```bash
# Depuis votre machine
curl -I https://game.zig-zag.fun/_next/static/chunks/b58108dde82d1a97.js

# Doit retourner :
# HTTP/1.1 200 OK
# Content-Type: application/javascript
```

---

## 📋 Checklist Finale

- [ ] `.htaccess` présent sur le serveur
- [ ] Version ultra-minimale testée
- [ ] Logs Apache vérifiés (erreur identifiée)
- [ ] `AllowOverride All` configuré (si accès root)
- [ ] Modules `mod_mime` et `mod_headers` activés (si accès root)
- [ ] Configuration Apache directe testée (si `.htaccess` ne fonctionne pas)
- [ ] Support hébergeur contacté (si hébergement partagé)
- [ ] Test : `Content-Type: application/javascript` (pas `text/plain`)
- [ ] Pas d'erreur 500

---

## 🆘 Si Rien Ne Fonctionne

### Option 1 : Utiliser Nginx au lieu d'Apache

Si vous avez le choix, Nginx gère mieux les types MIME par défaut.

### Option 2 : Utiliser un CDN

Servez les fichiers statiques via un CDN (Cloudflare, etc.) qui gère correctement les types MIME.

### Option 3 : Modifier Next.js pour servir depuis un sous-domaine

Servez les fichiers `_next/` depuis un sous-domaine différent avec une configuration Apache propre.

---

## 📁 Fichiers Disponibles

1. **`.htaccess`** : Version complète
2. **`.htaccess.simple`** : Version simplifiée
3. **`.htaccess.minimal`** : Version minimale
4. **`.htaccess.ultra-minimal`** : Version ultra-minimale (2 lignes seulement) ⭐

**Commencez par la version ultra-minimale** - si elle cause encore une erreur 500, le problème vient de la configuration Apache, pas du `.htaccess`.

---

**Date** : 30 décembre 2024  
**Priorité** : 🔴 URGENT  
**Action immédiate** : Tester `.htaccess.ultra-minimal` et vérifier les logs Apache !

