# 🚨 ACTION FINALE : Résoudre l'Erreur 500

## ❌ Situation

L'erreur 500 persiste même avec la version ultra-minimale du `.htaccess`. Cela signifie que :

**Le problème vient de la configuration Apache, PAS du contenu du `.htaccess`.**

---

## ✅ Solutions selon Votre Situation

### Situation 1 : Vous avez accès ROOT au serveur

**Solution** : Configuration Apache directe (RECOMMANDÉ)

```bash
# 1. Éditer la configuration Apache
sudo nano /etc/apache2/sites-available/game.zig-zag.fun.conf

# 2. Ajouter cette configuration :
<VirtualHost *:80>
    ServerName game.zig-zag.fun
    DocumentRoot /var/www/game.zig-zag.fun
    
    <Directory /var/www/game.zig-zag.fun>
        Options -Indexes +FollowSymLinks
        
        # Types MIME
        AddType application/javascript .js
        AddType text/css .css
        
        # Headers
        <IfModule mod_headers.c>
            <FilesMatch "\.js$">
                Header set Content-Type "application/javascript; charset=utf-8"
            </FilesMatch>
            <FilesMatch "\.css$">
                Header set Content-Type "text/css; charset=utf-8"
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

# 3. Activer et recharger
sudo a2ensite game.zig-zag.fun.conf
sudo a2enmod headers
sudo a2enmod mime
sudo systemctl reload apache2
```

---

### Situation 2 : Hébergement partagé (Hostinger, OVH, etc.)

**Solution** : Contacter le support

**Message à envoyer au support** :

```
Bonjour,

J'ai un problème avec mon sous-domaine game.zig-zag.fun.

Problème :
- Erreur 500 lorsque j'utilise un fichier .htaccess
- Les fichiers JavaScript et CSS sont servis avec le type MIME 'text/plain' au lieu de 'application/javascript' et 'text/css'
- Cela empêche mon application Next.js de fonctionner

Demandes :
1. Activation de AllowOverride All pour game.zig-zag.fun
2. Activation des modules mod_headers et mod_mime
3. Configuration des types MIME pour les fichiers .js et .css dans _next/static/

Informations :
- Domaine : game.zig-zag.fun
- Type d'application : Next.js (framework React)
- Fichiers problématiques : /_next/static/chunks/*.js et *.css

Merci de votre aide.
```

---

### Situation 3 : Vous pouvez modifier la configuration Apache mais pas root

**Solution** : Vérifier les fichiers de configuration disponibles

```bash
# Chercher les fichiers de configuration
ls -la /etc/apache2/sites-available/
ls -la /etc/apache2/conf-available/

# Vérifier si vous pouvez modifier
sudo nano /etc/apache2/sites-available/game.zig-zag.fun.conf
```

---

## 🔍 Diagnostic Final

### Test 1 : Vérifier les Logs Apache

```bash
ssh user@game.zig-zag.fun
tail -n 100 /var/log/apache2/error.log | grep -i "htaccess\|500\|mime\|headers"
```

**Erreurs courantes** :
- `AllowOverride not allowed here` → Contactez l'hébergeur
- `Invalid command 'AddType'` → Module `mod_mime` non activé
- `Invalid command 'Header'` → Module `mod_headers` non activé

### Test 2 : Vérifier AllowOverride

```bash
# Sur le serveur
cat /etc/apache2/sites-available/game.zig-zag.fun.conf | grep -A 5 "DocumentRoot"
```

**Doit contenir** :
```apache
<Directory /var/www/game.zig-zag.fun>
    AllowOverride All
</Directory>
```

### Test 3 : Vérifier les Modules

```bash
# Sur le serveur
apache2ctl -M | grep -E "headers|mime"
```

**Doit afficher** :
```
headers_module (shared)
mime_module (shared)
```

---

## 📝 Actions Immédiates

1. **Vérifier les logs Apache** pour identifier l'erreur exacte
2. **Déterminer votre situation** (accès root, hébergement partagé, etc.)
3. **Appliquer la solution correspondante** :
   - Accès root → Configuration Apache directe
   - Hébergement partagé → Contacter le support
4. **Tester** : `curl -I https://game.zig-zag.fun/_next/static/chunks/b58108dde82d1a97.js`

---

## 🆘 Si Rien Ne Fonctionne

### Option 1 : Utiliser un CDN

Servez les fichiers `_next/` depuis un CDN (Cloudflare, etc.) qui gère correctement les types MIME.

### Option 2 : Modifier Next.js

Configurez Next.js pour servir les assets depuis un sous-domaine différent avec une configuration propre.

### Option 3 : Utiliser Nginx

Si possible, migrez vers Nginx qui gère mieux les types MIME par défaut.

---

## 📁 Fichiers Disponibles

1. **`.htaccess.ultra-minimal`** : Version avec 2 lignes seulement
2. **`serve-assets.php`** : Script PHP alternatif (dans `out/`)
3. **`SOLUTION_ALTERNATIVE_PHP.md`** : Guide pour le script PHP
4. **`SOLUTION_DEFINITIVE.md`** : Guide complet avec toutes les solutions

---

**Date** : 30 décembre 2024  
**Priorité** : 🔴 URGENT  
**Action immédiate** : Vérifier les logs Apache et déterminer votre situation (accès root ou hébergement partagé)

