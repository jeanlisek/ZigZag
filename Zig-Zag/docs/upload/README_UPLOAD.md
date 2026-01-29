# 📤 Guide d'Upload - Site Statique Zig-Zag

## 🎯 Objectif

Uploader tous les fichiers du site statique sur Hostinger (`zig-zag.fun`), **y compris le dashboard admin**.

## ✅ Avant de Commencer

### 1. Builder le Dashboard

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag"
./build-admin.sh
```

**Vérification** :
```bash
ls -la admin-dist/
# Doit afficher : index.html, assets/, vite.svg
```

### 2. Vérifier les Fichiers

Tous les fichiers suivants doivent être présents :
- ✅ `.htaccess` (à la racine)
- ✅ Tous les fichiers `.html`
- ✅ Tous les fichiers `.js` et `.css`
- ✅ `admin-dist/` (buildé)

## 📁 Structure sur Hostinger

```
public_html/ (ou www/)
│
├── .htaccess                    ← Configuration serveur
├── index.html
├── jouer.html
├── contact.html
├── mentions-legales.html
├── presse.html
├── oauth-callback.html
├── 404.html
├── 500.html
│
├── style.css
├── script.js
├── chatbot.css
├── chatbot.js
├── cookies.css
├── cookies.js
├── i18n.js
├── sw.js
├── manifest.json
│
├── admin/                       ← CRÉER ce dossier
│   ├── index.html              ← De admin-dist/index.html
│   ├── assets/                 ← De admin-dist/assets/
│   └── vite.svg
│
└── attached_assets/             ← Dossier complet
    ├── image_*.png
    └── generated_images/
```

## 🚀 Étapes d'Upload

### Étape 1 : Fichiers Principaux

1. Se connecter via FTP à `zig-zag.fun`
2. Aller dans `public_html/` (ou `www/`)
3. Uploader tous les fichiers de la racine :
   - `.htaccess`
   - Tous les `.html`
   - Tous les `.js` et `.css`
   - `manifest.json`
   - `sw.js`

### Étape 2 : Dashboard Admin

1. **Créer le dossier `admin/`** dans `public_html/`
2. **Uploader le contenu de `admin-dist/`** dans `admin/`
   - ⚠️ **PAS** le dossier `admin-dist/` lui-même
   - ⚠️ Le **contenu** de `admin-dist/`
   - Structure finale : `public_html/admin/index.html`

### Étape 3 : Assets

1. Uploader le dossier `attached_assets/` complet
2. Conserver la structure avec `generated_images/`

## ✅ Vérification

### Après Upload

1. **Page d'accueil** : `https://zig-zag.fun` ✅
2. **Dashboard** : `https://zig-zag.fun/admin` ✅
3. **Console (F12)** : Pas d'erreurs ✅

### Vérifications Techniques

```bash
# Via SSH (si disponible)
ls -la public_html/admin/
ls -la public_html/admin/index.html
ls -la public_html/admin/assets/
cat public_html/.htaccess | grep -A 5 "DASHBOARD"
```

## 📝 Notes Importantes

1. **Dashboard** : Le contenu de `admin-dist/` → `admin/` (pas le dossier lui-même)
2. **.htaccess** : Doit être à la racine avec les règles pour `/admin`
3. **Permissions** : `.htaccess` en 644
4. **Structure** : `public_html/admin/index.html` (pas `admin/admin-dist/index.html`)

## 🐛 Dépannage

Voir `admin/GUIDE_DEPLOIEMENT_FINAL.md` pour le dépannage complet.

---

**Le site statique est maintenant prêt à être uploadé !** 🚀

