# 🔧 Correction des Erreurs MIME Type sur Hostinger

## ❌ Problème

Les fichiers CSS et JS de Next.js sont servis avec le mauvais type MIME :
- CSS servis comme `text/plain` au lieu de `text/css`
- JS servis comme `text/plain` au lieu de `application/javascript`
- Erreurs 500 sur certains fichiers

## ✅ Solution

### 1. Build l'application

```bash
cd Zig-Zag/game-app
npm install
npm run build
```

Cela crée un dossier `out/` avec tous les fichiers statiques.

### 2. Copier le fichier .htaccess

**IMPORTANT** : Le fichier `.htaccess` doit être dans le dossier `out/` après le build, puis uploadé dans le dossier `jeu/` sur Hostinger.

```bash
# Copier le .htaccess dans le dossier out/
cp Zig-Zag/game-app/.htaccess Zig-Zag/game-app/out/.htaccess
```

### 3. Uploader sur Hostinger

1. **Connectez-vous** à votre FTP Hostinger
2. **Allez dans** `public_html/`
3. **Créez ou allez dans** le dossier `jeu/`
4. **Uploadez TOUT le contenu** du dossier `out/` dans `jeu/`
   - ✅ `index.html`
   - ✅ `_next/` (dossier complet)
   - ✅ `.htaccess` (très important !)
   - ✅ Tous les autres fichiers

**Structure finale sur Hostinger :**
```
public_html/
├── index.html
├── jouer.html
├── contact.html
└── jeu/                    ← Dossier avec l'app Next.js
    ├── index.html
    ├── .htaccess          ← FICHIER CRUCIAL !
    ├── _next/
    │   ├── static/
    │   │   └── chunks/
    │   │       ├── *.js
    │   │       └── *.css
    │   └── ...
    └── ...
```

### 4. Vérifier les permissions

Sur Hostinger, le fichier `.htaccess` doit avoir les permissions **644**.

## 🎯 Ce que fait le .htaccess

1. **Définit les types MIME corrects** pour CSS, JS, images, fonts
2. **Force les headers** pour garantir les bons types MIME
3. **Gère le routing Next.js** (redirection vers index.html)
4. **Active la compression GZIP** pour de meilleures performances
5. **Configure le cache** des fichiers statiques

## ⚠️ Important

- Le fichier `.htaccess` doit être **dans le dossier `jeu/`** sur Hostinger
- Il doit être nommé exactement `.htaccess` (avec le point au début)
- Après upload, **videz le cache de votre navigateur** (Ctrl+Shift+R / Cmd+Shift+R)

## 🧪 Test

Après upload, testez :
1. `https://votre-domaine.com/jeu` → doit afficher la page de sélection
2. `https://votre-domaine.com/jeu/matchmaking` → doit fonctionner sans erreur 404
3. Ouvrez la console du navigateur → **plus d'erreurs MIME type**

## 🔍 Vérification

Si les erreurs persistent :
1. Vérifiez que le `.htaccess` est bien dans `jeu/` sur Hostinger
2. Vérifiez les permissions (644)
3. Vérifiez que `mod_rewrite` et `mod_mime` sont activés sur Hostinger
4. Contactez le support Hostinger si nécessaire


