# 🍎 Guide : Compression sur macOS

## ❌ Problème : "Blocage des ressources évité"

Sur macOS, la compression native peut échouer à cause de :
- Fichiers système macOS (`.DS_Store`, `._*`)
- Fichiers avec des attributs étendus
- Permissions spéciales

---

## ✅ Solutions

### Solution 1 : Script avec tar (RECOMMANDÉ)

Le script `compress-out-tar.sh` utilise `tar` qui est plus fiable sur macOS :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"
./compress-out-tar.sh
```

**Avantages** :
- ✅ Plus fiable sur macOS
- ✅ Exclut automatiquement les fichiers système
- ✅ Format `.tar.gz` compatible avec tous les serveurs Linux

**Résultat** : `out-deploy-YYYYMMDD-HHMMSS.tar.gz`

---

### Solution 2 : Script avec zip

Le script `compress-out-only.sh` utilise `zip` :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"
./compress-out-only.sh
```

**Résultat** : `out-deploy-YYYYMMDD-HHMMSS.zip`

---

### Solution 3 : Commande manuelle avec tar

Si les scripts ne fonctionnent pas, utilisez cette commande :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

# Compresser out/
tar -czf out-deploy.tar.gz \
    --exclude=".DS_Store" \
    --exclude="._*" \
    --exclude="__MACOSX" \
    -C out .
```

---

### Solution 4 : Nettoyer les fichiers macOS d'abord

Si le problème persiste, nettoyez d'abord les fichiers système :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

# Supprimer tous les .DS_Store
find . -name ".DS_Store" -delete

# Supprimer tous les fichiers ._*
find . -name "._*" -delete

# Supprimer les attributs étendus
xattr -rc out/

# Maintenant compresser
tar -czf out-deploy.tar.gz -C out .
```

---

## 📤 Upload sur le Serveur

### Option A : Via FTP/FileZilla

1. Uploadez le fichier `.tar.gz` ou `.zip` sur votre serveur
2. Connectez-vous en SSH
3. Décompressez :

```bash
# Pour .tar.gz
cd /var/www/game.zig-zag.fun
tar -xzf /chemin/vers/out-deploy.tar.gz

# Pour .zip
cd /var/www/game.zig-zag.fun
unzip /chemin/vers/out-deploy.zip
```

### Option B : Via rsync (SANS compression)

Si la compression pose problème, utilisez `rsync` directement :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='._*' \
    --exclude='__MACOSX' \
    out/ user@game.zig-zag.fun:/var/www/game.zig-zag.fun/
```

**Avantages** :
- ✅ Pas besoin de compresser
- ✅ Transfert direct
- ✅ Exclut automatiquement les fichiers système

---

## 🔧 Alternative : Utiliser le Finder avec Terminal

1. Ouvrez Terminal
2. Allez dans le dossier `out/` :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app/out"
```

3. Compressez avec tar :

```bash
tar -czf ../out-deploy.tar.gz .
```

4. Le fichier sera créé dans `game-app/`

---

## ⚠️ Important

**Ne compressez PAS** :
- ❌ `node_modules/` (trop gros, pas nécessaire)
- ❌ `.next/` (fichiers de build temporaires)
- ❌ `.git/` (pas nécessaire sur le serveur)
- ❌ `.env*` (fichiers sensibles)

**Compressez UNIQUEMENT** :
- ✅ `out/` (le build final)
- ✅ `.htaccess` (doit être dans `out/`)

---

## 🆘 Si Rien Ne Fonctionne

Utilisez `rsync` directement (pas besoin de compression) :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag/game-app"

rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='._*' \
    out/ user@game.zig-zag.fun:/var/www/game.zig-zag.fun/
```

C'est la méthode la plus fiable et la plus rapide !

---

**Date** : 30 décembre 2024

