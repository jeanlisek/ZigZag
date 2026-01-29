# 📤 Guide d'Upload - Explication Claire

## 🎯 Ce que vous devez comprendre

### Sur votre ordinateur (local)

```
Zig-Zag/
├── admin-dist/          ← Dossier de BUILD (généré par ./build-admin.sh)
│   ├── index.html
│   ├── assets/
│   └── vite.svg
│
└── admin/               ← Dossier SOURCE (code React, ne pas uploader)
    └── frontend/dashboard/
```

### Sur le serveur Hostinger (public_html/)

```
public_html/
├── index.html           ← Fichiers du site
├── .htaccess
├── style.css
│
└── admin/               ← CRÉER ce dossier sur le serveur
    ├── index.html       ← Copier depuis admin-dist/index.html
    ├── assets/          ← Copier depuis admin-dist/assets/
    └── vite.svg         ← Copier depuis admin-dist/vite.svg
```

## ✅ Ce qu'il faut faire

### ÉTAPE 1 : Sur votre ordinateur

**Rien à faire** - Le build est déjà fait dans `admin-dist/`

### ÉTAPE 2 : Sur Hostinger (via FTP)

#### A. Uploader les fichiers principaux

1. Se connecter à `zig-zag.fun` via FTP
2. Aller dans `public_html/` (ou `www/`)
3. Uploader tous les fichiers de la racine :
   - `.htaccess`
   - `index.html`
   - `jouer.html`
   - `contact.html`
   - Tous les `.js` et `.css`
   - etc.

#### B. Créer le dossier admin et uploader le dashboard

**IMPORTANT** : Vous devez créer le dossier `admin/` sur le serveur et y mettre le CONTENU de `admin-dist/`

**Méthode 1 : Via l'interface FTP (FileZilla, etc.)**

1. Dans `public_html/`, **créer un nouveau dossier** nommé `admin`
2. Ouvrir le dossier `admin-dist/` sur votre ordinateur
3. **Sélectionner TOUT le contenu** de `admin-dist/` :
   - `index.html`
   - `assets/` (dossier)
   - `vite.svg`
4. **Glisser-déposer** dans `public_html/admin/`

**Méthode 2 : Via l'explorateur de fichiers**

1. Sur votre ordinateur, ouvrir `admin-dist/`
2. **Sélectionner tout** (Ctrl+A ou Cmd+A)
3. **Copier** (Ctrl+C ou Cmd+C)
4. Sur le serveur (via FTP), aller dans `public_html/`
5. **Créer le dossier `admin/`**
6. **Ouvrir `admin/`**
7. **Coller** (Ctrl+V ou Cmd+V)

## 📋 Structure Finale sur le Serveur

```
public_html/
│
├── .htaccess                    ← À la racine
├── index.html
├── jouer.html
├── contact.html
├── style.css
├── script.js
│   ... (tous les autres fichiers)
│
└── admin/                       ← Dossier que VOUS créez
    ├── index.html              ← De admin-dist/index.html
    ├── assets/                 ← De admin-dist/assets/
    │   ├── index-*.js
    │   └── index-*.css
    └── vite.svg                ← De admin-dist/vite.svg
```

## ⚠️ Erreurs à Éviter

### ❌ NE PAS FAIRE

1. **Uploader le dossier `admin-dist/` lui-même**
   - ❌ `public_html/admin-dist/` ← MAUVAIS
   - ✅ `public_html/admin/` ← BON

2. **Uploader le dossier `admin/` (source)**
   - ❌ `public_html/admin/frontend/dashboard/` ← MAUVAIS
   - ✅ `public_html/admin/index.html` ← BON

3. **Mettre `admin-dist/` dans `admin/`**
   - ❌ `public_html/admin/admin-dist/index.html` ← MAUVAIS
   - ✅ `public_html/admin/index.html` ← BON

## ✅ Vérification

Après upload, la structure doit être :

```
public_html/
├── admin/
│   ├── index.html          ← Doit exister
│   ├── assets/             ← Doit exister
│   └── vite.svg            ← Doit exister
```

**Test** : `https://zig-zag.fun/admin` doit afficher le dashboard

## 🎯 Résumé Simple

1. **Sur votre ordinateur** : Vous avez `admin-dist/` (build)
2. **Sur le serveur** : Créer `admin/` et y mettre le **contenu** de `admin-dist/`
3. **Résultat** : `public_html/admin/index.html` existe

**C'est comme si vous copiez le contenu d'un dossier dans un autre dossier !**

