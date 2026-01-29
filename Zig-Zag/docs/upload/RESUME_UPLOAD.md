# 📤 Résumé - Ce qui doit être uploadé

## ✅ À UPLOADER

### 1. Fichiers du site (racine)
- Tous les fichiers `.html`, `.js`, `.css`
- `.htaccess`
- `manifest.json`, `sw.js`

### 2. Dossier `attached_assets/`
- Dossier complet avec toutes les images

### 3. Dashboard Admin
- **Créer** le dossier `admin/` sur le serveur
- **Uploader le CONTENU** de `admin-dist/` dans `admin/`
  - `index.html`
  - `assets/` (dossier)
  - `vite.svg`

## ❌ À NE PAS UPLOADER

### ❌ `admin/` (dossier source)
**Pourquoi ?** C'est le code source React avec :
- `node_modules/` (dépendances - très lourd)
- Code TypeScript/React (pas nécessaire sur le serveur)
- Fichiers de développement

**Ce qu'il faut** : Seulement le build (contenu de `admin-dist/`)

### ❌ `admin-dist/` (dossier build)
**Pourquoi ?** Ne pas uploader le dossier lui-même
**Ce qu'il faut** : Uploader son **contenu** dans `admin/` sur le serveur

### ❌ Autres
- `game-app/` → Déployé sur Vercel
- `node_modules/` → Jamais uploader
- `docs/`, `sql/` → Documentation, pas nécessaire
- `build-admin.sh` → Script local

## 🎯 Structure Finale sur le Serveur

```
public_html/
├── .htaccess
├── index.html
├── jouer.html
├── ... (autres fichiers)
│
├── admin/              ← VOUS créez ce dossier
│   ├── index.html     ← De admin-dist/index.html
│   ├── assets/        ← De admin-dist/assets/
│   └── vite.svg      ← De admin-dist/vite.svg
│
└── attached_assets/    ← Dossier complet
```

## 📝 Résumé Simple

1. **Uploader** : Fichiers du site + contenu de `admin-dist/` dans `admin/`
2. **Ne PAS uploader** : `admin/` (source), `admin-dist/` (dossier), `node_modules/`

**Le dossier `admin/` local reste sur votre ordinateur, seul le build (contenu de `admin-dist/`) va sur le serveur !**

