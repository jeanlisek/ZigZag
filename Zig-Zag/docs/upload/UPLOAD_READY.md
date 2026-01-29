# 📤 Prêt pour Upload - Site Statique Zig-Zag

## ✅ Structure Prête pour Upload

Tous les fichiers sont prêts à être uploadés sur Hostinger pour `zig-zag.fun`.

## 📁 Structure à Uploader

```
public_html/ (ou www/) sur Hostinger
│
├── .htaccess                    ← Configuration serveur (IMPORTANT)
├── index.html                   ← Page d'accueil
├── jouer.html                   ← Page de connexion
├── contact.html                 ← Page de contact
├── mentions-legales.html        ← Mentions légales
├── presse.html                  ← Page presse
├── oauth-callback.html          ← Callback OAuth
├── 404.html                     ← Page 404
├── 500.html                     ← Page 500
│
├── style.css                    ← Styles principaux
├── script.js                    ← Scripts principaux
├── chatbot.css                  ← Styles chatbot
├── chatbot.js                   ← Script chatbot
├── cookies.css                  ← Styles cookies
├── cookies.js                   ← Script cookies
├── i18n.js                      ← Internationalisation
├── sw.js                        ← Service Worker
├── manifest.json                ← PWA Manifest
│
├── admin/                       ← DASHBOARD ADMIN (NOUVEAU)
│   ├── index.html              ← Dashboard React
│   ├── assets/                 ← Assets du dashboard
│   │   ├── index-*.js
│   │   ├── index-*.css
│   │   └── ...
│   └── vite.svg
│
└── attached_assets/             ← Images et ressources
    ├── image_*.png
    ├── generated_images/
    └── ...
```

## 🚀 Procédure d'Upload

### Option 1 : Upload Complet (Recommandé)

1. **Se connecter via FTP** (FileZilla, etc.) à `zig-zag.fun`
2. **Aller dans `public_html/`** (ou `www/`)
3. **Uploader tous les fichiers** de la racine du projet :
   - Tous les fichiers `.html`
   - Tous les fichiers `.js`
   - Tous les fichiers `.css`
   - `.htaccess`
   - `manifest.json`
   - `sw.js`
4. **Créer le dossier `admin/`** dans `public_html/`
5. **Uploader le contenu de `admin-dist/`** dans `admin/`
   - ⚠️ Le **contenu** de `admin-dist/`, pas le dossier lui-même
   - Structure finale : `public_html/admin/index.html`
6. **Uploader le dossier `attached_assets/`** complet

### Option 2 : Upload du Dashboard Seulement

Si vous avez déjà uploadé le reste du site :

1. **Créer le dossier `admin/`** dans `public_html/`
2. **Uploader le contenu de `admin-dist/`** dans `admin/`
3. **Vérifier que `.htaccess`** est à la racine avec les règles pour `/admin`

## ✅ Checklist Avant Upload

### Fichiers Principaux
- [ ] `.htaccess` (avec règles pour `/admin`)
- [ ] `index.html`
- [ ] `jouer.html`
- [ ] `contact.html`
- [ ] `oauth-callback.html`
- [ ] Tous les fichiers `.js` et `.css`

### Dashboard Admin
- [ ] `admin-dist/` a été buildé (`./build-admin.sh`)
- [ ] `admin-dist/index.html` existe
- [ ] `admin-dist/assets/` contient des fichiers
- [ ] Prêt à uploader dans `admin/`

### Assets
- [ ] `attached_assets/` prêt à uploader

## 📝 Notes Importantes

1. **Dashboard** : Le contenu de `admin-dist/` doit aller dans `admin/` (pas le dossier `admin-dist/` lui-même)
2. **.htaccess** : Doit être à la racine avec les règles pour `/admin`
3. **Permissions** : `.htaccess` doit avoir les permissions 644
4. **Structure** : `public_html/admin/index.html` (pas `public_html/admin/admin-dist/index.html`)

## 🔍 Vérification Après Upload

1. **Tester la page d'accueil** : `https://zig-zag.fun`
2. **Tester le dashboard** : `https://zig-zag.fun/admin`
3. **Vérifier la console** (F12) pour les erreurs
4. **Vérifier que les assets se chargent**

## 🐛 Si Problème

Voir `admin/GUIDE_DEPLOIEMENT_FINAL.md` pour le dépannage complet.

