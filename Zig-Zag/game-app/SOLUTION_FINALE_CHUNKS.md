# 🚨 SOLUTION FINALE : Erreur Chunks + X-Content-Type-Options

## ❌ Problèmes Identifiés

1. **Chunk 404** : `220f7eda15ec2b40.js` n'existe pas sur le serveur
   - L'upload n'a **pas été fait** ou est **incomplet**
   - Le build sur le serveur est **ancien**

2. **X-Content-Type-Options: nosniff** bloque l'exécution
   - Même si le chunk existait, il serait bloqué par ce header
   - Le `.htaccess` doit **désactiver** ce header pour les fichiers `_next/`

---

## ✅ Solution en 3 Étapes

### ÉTAPE 1 : Vérifier le Build Local

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

# Vérifier que out/ existe
ls -la out/

# Vérifier les chunks
ls -la out/_next/static/chunks/ | wc -l  # Doit afficher au moins 20 fichiers

# Vérifier que .htaccess est présent
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

### ÉTAPE 2 : Compresser et Uploader

#### Option A : Utiliser le script tar (RECOMMANDÉ)

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"
./compress-out-tar.sh
```

Cela crée : `out-deploy-YYYYMMDD-HHMMSS.tar.gz`

#### Option B : Utiliser rsync (SANS compression)

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='._*' \
    out/ user@game.zig-zag.fun:/var/www/game.zig-zag.fun/
```

**Avantages** :
- ✅ Pas besoin de compresser
- ✅ Transfert direct
- ✅ Plus rapide

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
```

#### B. Vérifier le .htaccess

Le `.htaccess` doit contenir cette règle **EN PREMIER** :

```apache
<LocationMatch "^/_next/">
    Header always unset X-Content-Type-Options
</LocationMatch>
```

**Vérifier** :
```bash
cat .htaccess | grep -A 3 "LocationMatch.*_next"
```

#### C. Recharger Apache

```bash
# Sur le serveur
sudo service apache2 reload
# OU
sudo systemctl reload apache2
```

#### D. Vérifier les modules Apache

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

## 🧪 Tests

### Test 1 : Vérifier un chunk

```bash
# Sur le serveur, lister les chunks
ls /var/www/game.zig-zag.fun/_next/static/chunks/*.js | head -1
# Notez le nom d'un chunk réel

# Tester depuis votre machine
curl -I https://game.zig-zag.fun/_next/static/chunks/[NOM_DU_CHUNK].js
```

**Doit retourner** :
```
HTTP/1.1 200 OK
Content-Type: application/javascript; charset=utf-8
```

**NE DOIT PAS contenir** :
```
X-Content-Type-Options: nosniff
```

### Test 2 : Dans le navigateur

1. **Vider le cache** : `Ctrl + Shift + Delete` (ou `Cmd + Shift + Delete` sur Mac)
2. **Hard refresh** : `Ctrl + Shift + R` (ou `Cmd + Shift + R` sur Mac)
3. **Aller sur** : `https://game.zig-zag.fun/jeu/matchmaking`
4. **Console (F12)** :
   - ✅ Pas d'erreur 404
   - ✅ Pas d'erreur MIME type
   - ✅ Pas d'erreur "X-Content-Type-Options"

---

## 🔧 Améliorations Apportées au .htaccess

### Avant
```apache
<LocationMatch "^/_next/static/chunks/.*\.js$">
    Header always set Content-Type "application/javascript; charset=utf-8"
    Header always unset X-Content-Type-Options
</LocationMatch>
```

### Après (AMÉLIORÉ)
```apache
# DÉSACTIVER X-Content-Type-Options pour TOUS les fichiers _next/
<LocationMatch "^/_next/">
    Header always unset X-Content-Type-Options
</LocationMatch>

# PUIS définir le Content-Type
<LocationMatch "^/_next/static/chunks/.*\.js$">
    Header always unset X-Content-Type-Options
    Header always set Content-Type "application/javascript; charset=utf-8"
</LocationMatch>
```

**Pourquoi** :
- La règle globale `^/_next/` désactive `X-Content-Type-Options` pour **tous** les fichiers `_next/`
- Les règles spécifiques définissent ensuite le bon `Content-Type`
- L'ordre est **critique** : `unset` avant `set`

---

## 📝 Checklist Complète

- [ ] Build local réussi (`out/` existe avec des chunks)
- [ ] `.htaccess` présent dans `out/` (avec les nouvelles règles)
- [ ] Archive créée (`out-deploy-*.tar.gz`) OU rsync prêt
- [ ] Upload complet de `out/` sur `game.zig-zag.fun`
- [ ] `_next/static/chunks/` contient au moins 20 fichiers `.js` sur le serveur
- [ ] `.htaccess` présent à la racine de `game.zig-zag.fun` sur le serveur
- [ ] `.htaccess` contient la règle `<LocationMatch "^/_next/">` pour désactiver `X-Content-Type-Options`
- [ ] Modules Apache `mod_headers` et `mod_mime` activés
- [ ] Permissions correctes (644 pour `.htaccess`, 755 pour `_next/`)
- [ ] Apache rechargé (`sudo systemctl reload apache2`)
- [ ] Cache navigateur vidé
- [ ] Test en ligne réussi (pas d'erreur console)

---

## 🆘 Si le Problème Persiste

### Vérifier les logs Apache

```bash
# Sur le serveur
tail -n 50 /var/log/apache2/error.log
```

### Vérifier la configuration du VirtualHost

```bash
# Sur le serveur
cat /etc/apache2/sites-available/game.zig-zag.fun.conf | grep AllowOverride
```

**Doit contenir** : `AllowOverride All`

### Test Direct

```bash
# Tester un chunk spécifique
curl -v https://game.zig-zag.fun/_next/static/chunks/[NOM_DU_CHUNK].js 2>&1 | grep -i "content-type\|x-content-type"
```

**Doit afficher** :
- `Content-Type: application/javascript`
- **PAS** de `X-Content-Type-Options: nosniff`

---

**Date** : 30 décembre 2024  
**Priorité** : 🔴 URGENT  
**Fichiers modifiés** : `game-app/.htaccess` (amélioré pour désactiver `X-Content-Type-Options`)

