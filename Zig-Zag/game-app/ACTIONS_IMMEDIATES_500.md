# 🚨 ACTIONS IMMÉDIATES : Erreur 500 + MIME Type

## ⚠️ Situation Critique

- ❌ **Erreur 500** : Le serveur Apache retourne une erreur interne
- ❌ **MIME type 'text/plain'** : Le `.htaccess` n'est pas appliqué
- ❌ **Chunk non chargé** : `b58108dde82d1a97.js` ne peut pas être exécuté

---

## 🔧 SOLUTION IMMÉDIATE (5 minutes)

### Étape 1 : Vérifier les Logs Apache

**Connectez-vous en SSH sur votre serveur** :

```bash
ssh user@game.zig-zag.fun

# Voir les dernières erreurs
tail -n 50 /var/log/apache2/error.log

# OU si hébergement partagé (Hostinger, etc.)
tail -n 50 ~/logs/error.log
```

**Cherchez** :
- `Syntax error on line X of .htaccess`
- `Invalid command`
- `mod_headers not loaded`
- `mod_mime not loaded`

---

### Étape 2 : Tester la Syntaxe du .htaccess

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun  # OU le chemin correct

# Tester la syntaxe
apache2ctl configtest

# Si erreur, notez le numéro de ligne
```

---

### Étape 3 : Remplacer par la Version Simplifiée

**Si l'erreur 500 persiste**, remplacez le `.htaccess` par la version simplifiée :

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun

# Sauvegarder l'ancien
cp .htaccess .htaccess.backup

# Utiliser la version simplifiée
# (Copiez le contenu de .htaccess.simple depuis votre machine)
```

**OU** uploadez directement le fichier `out/.htaccess.simple` et renommez-le :

```bash
# Sur le serveur
mv .htaccess.simple .htaccess
chmod 644 .htaccess
```

---

### Étape 4 : Vérifier les Modules Apache

```bash
# Sur le serveur
apache2ctl -M | grep headers
apache2ctl -M | grep mime

# Si manquants :
sudo a2enmod headers
sudo a2enmod mime
sudo systemctl reload apache2
```

---

### Étape 5 : Vérifier AllowOverride

```bash
# Sur le serveur
cat /etc/apache2/sites-available/game.zig-zag.fun.conf | grep -A 5 "DocumentRoot"

# Doit contenir :
# AllowOverride All
```

**Si `AllowOverride None`** :
1. Modifier le fichier de configuration
2. Changer en `AllowOverride All`
3. Recharger Apache : `sudo systemctl reload apache2`

---

### Étape 6 : Recharger Apache

```bash
# Sur le serveur
sudo systemctl reload apache2
# OU
sudo service apache2 reload
```

---

### Étape 7 : Tester

```bash
# Depuis votre machine
curl -I https://game.zig-zag.fun/_next/static/chunks/b58108dde82d1a97.js

# Doit retourner :
# HTTP/1.1 200 OK
# Content-Type: application/javascript; charset=utf-8
```

**Si toujours erreur 500** :
```bash
# Voir les logs en temps réel
tail -f /var/log/apache2/error.log

# Puis rechargez la page dans le navigateur
# Vous verrez l'erreur exacte dans les logs
```

---

## 📋 Checklist Rapide

- [ ] Logs Apache vérifiés (erreur identifiée)
- [ ] Syntaxe `.htaccess` testée (`apache2ctl configtest`)
- [ ] Version simplifiée uploadée (si nécessaire)
- [ ] Modules `mod_headers` et `mod_mime` activés
- [ ] `AllowOverride All` configuré
- [ ] Permissions `.htaccess` : 644
- [ ] Apache rechargé
- [ ] Test : `Content-Type: application/javascript`

---

## 🆘 Si Rien Ne Fonctionne

### Option 1 : Désactiver Complètement le .htaccess

```bash
# Sur le serveur
cd /var/www/game.zig-zag.fun
mv .htaccess .htaccess.disabled

# Tester si le site fonctionne (sans routing, mais au moins sans erreur 500)
```

### Option 2 : Configuration Directe dans Apache

Si `.htaccess` ne fonctionne pas, configurez directement dans le VirtualHost (voir `FIX_URGENT_500_MIME.md`).

---

## 📁 Fichiers Disponibles

1. **`.htaccess`** : Version complète (peut causer erreur 500 si configuration Apache restrictive)
2. **`.htaccess.simple`** : Version simplifiée (moins de directives, plus compatible)
3. **`FIX_URGENT_500_MIME.md`** : Guide complet de diagnostic

---

**Date** : 30 décembre 2024  
**Priorité** : 🔴 URGENT  
**Action immédiate** : Vérifier les logs Apache !

