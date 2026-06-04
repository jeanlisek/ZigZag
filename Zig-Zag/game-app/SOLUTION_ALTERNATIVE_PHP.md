# 🔧 Solution Alternative : Script PHP pour Forcer les Types MIME

## ❌ Problème Actuel

Le `.htaccess` ne fonctionne pas (erreur 500 persistante), probablement parce que :
- `AllowOverride` est désactivé
- Les modules Apache ne sont pas activés
- Configuration Apache restrictive

---

## ✅ Solution Alternative : Script PHP

Si le `.htaccess` ne fonctionne pas, utilisez un script PHP qui force les bons types MIME.

### Étape 1 : Uploader le Script

Le fichier `serve-assets.php` a été créé dans `out/`. Uploadez-le à la racine de `game.zig-zag.fun` :

```
game.zig-zag.fun/
├── serve-assets.php  ← Nouveau fichier
├── _next/
├── index.html
└── ...
```

### Étape 2 : Modifier les URLs dans index.html (Optionnel)

**Note** : Cette étape n'est nécessaire que si vous voulez utiliser le script PHP pour tous les assets. Sinon, le script peut être utilisé comme fallback.

Si vous voulez forcer l'utilisation du script PHP, modifiez `index.html` pour remplacer :
```html
<script src="/_next/static/chunks/xxx.js"></script>
```

Par :
```html
<script src="/serve-assets.php/_next/static/chunks/xxx.js"></script>
```

**Mais** : C'est complexe et pas recommandé. Utilisez plutôt la solution avec `.htaccess` ou configuration Apache directe.

---

## 🎯 Solution Recommandée : Configuration Apache Directe

**Si vous avez accès root au serveur**, configurez directement dans Apache :

### 1. Éditer la Configuration Apache

```bash
sudo nano /etc/apache2/sites-available/game.zig-zag.fun.conf
```

### 2. Ajouter la Configuration

```apache
<VirtualHost *:80>
    ServerName game.zig-zag.fun
    DocumentRoot /var/www/game.zig-zag.fun
    
    <Directory /var/www/game.zig-zag.fun>
        Options -Indexes +FollowSymLinks
        
        # Types MIME - CRITIQUE
        AddType application/javascript .js
        AddType application/javascript .mjs
        AddType text/css .css
        AddType application/json .json
        
        # Headers pour forcer les types MIME
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
```

### 3. Activer et Recharger

```bash
sudo a2ensite game.zig-zag.fun.conf
sudo a2enmod headers
sudo a2enmod mime
sudo systemctl reload apache2
```

---

## 🆘 Si Vous N'Avez Pas Accès Root

### Option 1 : Contacter l'Hébergeur

**Demandez** :
1. Activation de `AllowOverride All` pour `game.zig-zag.fun`
2. Activation de `mod_headers` et `mod_mime`
3. Configuration des types MIME pour les fichiers `.js` et `.css`

**Fournissez** :
- Le nom de domaine : `game.zig-zag.fun`
- L'erreur exacte : "Erreur 500 avec .htaccess, fichiers servis avec text/plain"
- Le besoin : Configuration des types MIME pour Next.js

### Option 2 : Utiliser un CDN

Servez les fichiers `_next/` depuis un CDN (Cloudflare, etc.) qui gère correctement les types MIME.

### Option 3 : Utiliser Nginx

Si vous avez le choix, migrez vers Nginx qui gère mieux les types MIME par défaut.

---

## 📋 Checklist

- [ ] Script PHP uploadé (si solution alternative)
- [ ] Configuration Apache directe testée (si accès root)
- [ ] Support hébergeur contacté (si hébergement partagé)
- [ ] Modules Apache activés
- [ ] Test : `Content-Type: application/javascript` (pas `text/plain`)
- [ ] Pas d'erreur 500

---

**Date** : 30 décembre 2024  
**Priorité** : 🔴 URGENT  
**Recommandation** : Configuration Apache directe ou contact avec l'hébergeur

