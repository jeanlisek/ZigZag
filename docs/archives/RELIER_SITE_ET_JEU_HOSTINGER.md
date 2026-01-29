# 🔗 Guide : Relier le Site et le Jeu sur Hostinger

## 📋 Vue d'ensemble

Votre projet a **deux parties** :
1. **Site statique** (HTML/CSS/JS) : `index.html`, `jouer.html`, `contact.html`, etc.
2. **Application Next.js** : `game-app/` (le jeu multijoueur)

Ce guide explique comment les déployer **tous les deux sur Hostinger** et les relier correctement.

---

## 🎯 Architecture Finale

```
public_html/ (Hostinger)
├── index.html          ← Landing page
├── jouer.html          ← Page de connexion → Redirige vers /jeu
├── contact.html        ← Contact
├── admin.html          ← Admin
├── style.css           ← Styles du site
├── script.js           ← Scripts du site
├── .htaccess           ← Configuration Apache (types MIME, routing)
└── jeu/                ← Application Next.js (export statique)
    ├── index.html      ← Page d'accueil du jeu
    ├── .htaccess        ← Configuration pour le routing Next.js
    ├── _next/           ← Assets Next.js (CSS, JS, images)
    │   └── static/
    │       └── chunks/
    └── jeu/             ← Routes Next.js
        ├── matchmaking/
        ├── privee/
        └── [game_id]/
```

**Flux utilisateur** :
1. Utilisateur va sur `votre-domaine.com` → `index.html`
2. Clique sur "Jouer" → `votre-domaine.com/jouer` → `jouer.html`
3. Se connecte → Redirigé vers `votre-domaine.com/jeu` → Application Next.js

---

## ✅ Étape 1 : Préparer l'Application Next.js

### 1.1 Vérifier la Configuration

Vérifiez que `game-app/next.config.js` est configuré pour l'export statique :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // ← CRITIQUE : Export statique
  trailingSlash: true,  // ← Recommandé pour les fichiers statiques
  images: {
    unoptimized: true,  // ← Nécessaire pour l'export statique
  },
  // ... autres configurations
};

module.exports = nextConfig;
```

**⚠️ Si `output: 'export'` n'est pas présent**, ajoutez-le.

### 1.2 Vérifier les Variables d'Environnement

Créez ou vérifiez `game-app/.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tihrltssmpxpreadpzqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_ici
```

**Important** : Ces variables sont intégrées au build, donc elles doivent être définies **avant** le build.

### 1.3 Build l'Application

```bash
cd Zig-Zag/game-app
npm install  # Si pas déjà fait
npm run build
```

Cela crée un dossier `out/` avec tous les fichiers statiques.

### 1.4 Tester Localement (Optionnel)

```bash
cd out
npx serve .
# Ou avec Python
python3 -m http.server 8000
```

Allez sur `http://localhost:8000/jeu` pour vérifier que tout fonctionne.

---

## ✅ Étape 2 : Uploader sur Hostinger

### 2.1 Structure sur Hostinger

**Via FTP/SFTP Hostinger :**

1. **Connectez-vous** à votre FTP Hostinger
2. **Allez dans** `public_html/`
3. **Créez un dossier** `jeu/` (s'il n'existe pas)
4. **Uploadez TOUT le contenu** du dossier `out/` dans `jeu/`

**Structure finale :**
```
public_html/
├── index.html          ← Déjà présent
├── jouer.html          ← Déjà présent
├── contact.html        ← Déjà présent
├── admin.html          ← Déjà présent
├── style.css           ← Déjà présent
├── script.js           ← Déjà présent
├── .htaccess           ← À mettre à jour (voir étape 3)
└── jeu/                ← NOUVEAU : Contenu du dossier out/
    ├── index.html
    ├── .htaccess       ← CRITIQUE (voir étape 3)
    ├── _next/
    │   └── static/
    │       └── chunks/
    │           ├── *.js
    │           └── *.css
    └── jeu/
        ├── matchmaking/
        ├── privee/
        └── [game_id]/
```

### 2.2 Fichiers à Uploader

**Depuis le dossier `out/` :**
- ✅ `index.html`
- ✅ `_next/` (dossier complet avec tous les sous-dossiers)
- ✅ `.htaccess` (voir étape 3)
- ✅ Tous les autres fichiers et dossiers

**⚠️ IMPORTANT** : Uploadez **TOUT le contenu** de `out/`, pas le dossier `out/` lui-même.

---

## ✅ Étape 3 : Configurer les Fichiers .htaccess

### 3.1 .htaccess à la Racine

Le fichier `Zig-Zag/.htaccess` doit être à la racine de `public_html/` et doit contenir :

1. **Types MIME** (pour corriger les erreurs MIME type)
2. **Headers HTTP** (pour forcer les bons types MIME)
3. **Routing** (pour les pages HTML statiques)

**Le fichier `Zig-Zag/.htaccess` est déjà configuré** ✅

**Action** : Uploadez `Zig-Zag/.htaccess` à la racine de `public_html/` sur Hostinger.

### 3.2 .htaccess dans /jeu/

Le fichier `Zig-Zag/game-app/.htaccess` doit être dans le dossier `jeu/` sur Hostinger.

**Le fichier `Zig-Zag/game-app/.htaccess` est déjà configuré** ✅

**Action** : 
1. Copiez `Zig-Zag/game-app/.htaccess` dans le dossier `out/` avant l'upload
2. Ou uploadez-le directement dans `jeu/` sur Hostinger après avoir uploadé les autres fichiers

**Contenu du fichier** (déjà présent dans `game-app/.htaccess`) :
```apache
RewriteEngine On
RewriteBase /jeu/

# Types MIME
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType text/css .css
    # ... autres types
</IfModule>

# Headers pour forcer les types MIME
<IfModule mod_headers.c>
    <FilesMatch "\.js$">
        Header set Content-Type "application/javascript; charset=utf-8"
    </FilesMatch>
    <FilesMatch "\.css$">
        Header set Content-Type "text/css; charset=utf-8"
    </FilesMatch>
</IfModule>

# Routing Next.js (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/_next/
RewriteRule ^(.*)$ index.html [L]
```

---

## ✅ Étape 4 : Vérifier la Redirection dans jouer.html

### 4.1 Vérifier le Code

Le fichier `jouer.html` doit rediriger vers `/jeu` après connexion.

**Code actuel** (lignes ~1420 et ~1492) :
```javascript
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : `${window.location.protocol}//${window.location.host}/jeu`;
window.location.href = gameUrl;
```

**✅ Ce code est correct** : Il redirige vers `/jeu` en production (sur Hostinger).

### 4.2 Si la Redirection ne Fonctionne pas

Si après connexion, vous n'êtes pas redirigé vers `/jeu`, vérifiez :

1. **Le fichier `jouer.html` est bien uploadé** sur Hostinger
2. **Le cache du navigateur est vidé** (Ctrl+Shift+R / Cmd+Shift+R)
3. **La console du navigateur** (F12) pour voir les erreurs

---

## ✅ Étape 5 : Tester

### 5.1 Test 1 : Accès Direct au Jeu

Allez sur : `https://votre-domaine.com/jeu`

**Résultat attendu** : Page de sélection de mode (Multi / Privé)

**Si erreur 404** :
- Vérifiez que le dossier `jeu/` existe dans `public_html/`
- Vérifiez que `jeu/index.html` existe
- Vérifiez que le `.htaccess` est dans `jeu/`

### 5.2 Test 2 : Redirection depuis jouer.html

1. Allez sur : `https://votre-domaine.com/jouer`
2. Connectez-vous
3. **Résultat attendu** : Redirection vers `/jeu`

**Si la redirection ne fonctionne pas** :
- Vérifiez la console du navigateur (F12)
- Vérifiez que `jouer.html` contient le bon code de redirection

### 5.3 Test 3 : Routes Next.js

Testez les routes :
- `https://votre-domaine.com/jeu/matchmaking` → Doit afficher le matchmaking
- `https://votre-domaine.com/jeu/privee` → Doit afficher la page de partie privée

**Si erreur 404** :
- Vérifiez que le `.htaccess` dans `jeu/` contient les règles de routing
- Vérifiez que les fichiers sont bien uploadés

### 5.4 Test 4 : Assets (CSS/JS)

Ouvrez la console du navigateur (F12) et vérifiez :
- ✅ Pas d'erreurs MIME type
- ✅ Les fichiers CSS se chargent
- ✅ Les fichiers JS s'exécutent

**Si erreurs MIME type** :
- Vérifiez que le `.htaccess` à la racine contient les types MIME
- Vérifiez que le `.htaccess` dans `jeu/` contient les types MIME

---

## 🔄 Mise à Jour Future

### Mettre à Jour le Site (Pages HTML)

1. Modifiez les fichiers en local (`index.html`, `jouer.html`, etc.)
2. Testez en local
3. Uploadez via FTP/SFTP sur Hostinger (remplacez les anciens fichiers)
4. Videz le cache du navigateur

### Mettre à Jour l'Application Next.js

1. Modifiez le code dans `game-app/src/`
2. **Rebuild** :
   ```bash
   cd Zig-Zag/game-app
   npm run build
   ```
3. **Uploadez le nouveau dossier `out/`** :
   - Supprimez l'ancien dossier `jeu/` sur Hostinger
   - Uploadez le nouveau contenu de `out/` dans `jeu/`
   - **N'oubliez pas** de ré-uploader le `.htaccess` dans `jeu/`
4. Videz le cache du navigateur

---

## 🐛 Dépannage

### Erreur 404 sur `/jeu`

**Causes possibles** :
- Le dossier `jeu/` n'existe pas dans `public_html/`
- Le fichier `jeu/index.html` n'existe pas
- Le `.htaccess` dans `jeu/` n'est pas configuré

**Solution** :
1. Vérifiez la structure sur Hostinger
2. Vérifiez que tous les fichiers sont uploadés
3. Vérifiez le `.htaccess` dans `jeu/`

### Erreurs MIME Type (CSS/JS non chargés)

**Causes possibles** :
- Le `.htaccess` à la racine ne contient pas les types MIME
- Le `.htaccess` dans `jeu/` ne contient pas les types MIME
- Les modules Apache (`mod_mime`, `mod_headers`) ne sont pas activés

**Solution** :
1. Vérifiez que les deux `.htaccess` sont bien uploadés
2. Vérifiez que les types MIME sont définis
3. Contactez le support Hostinger si les modules ne sont pas activés

### La Redirection ne Fonctionne pas

**Causes possibles** :
- Le code de redirection dans `jouer.html` est incorrect
- Le cache du navigateur
- Erreur JavaScript

**Solution** :
1. Vérifiez le code dans `jouer.html` (lignes ~1420 et ~1492)
2. Videz le cache du navigateur
3. Vérifiez la console du navigateur (F12)

### Erreur 500 sur les Assets

**Causes possibles** :
- Syntaxe incorrecte dans `.htaccess`
- Permissions incorrectes
- Modules Apache non activés

**Solution** :
1. Vérifiez la syntaxe du `.htaccess` (pas d'erreurs de syntaxe)
2. Vérifiez les permissions (644 pour `.htaccess`)
3. Contactez le support Hostinger

---

## 📝 Checklist de Déploiement

- [ ] Configuration Next.js : `output: 'export'` dans `next.config.js`
- [ ] Variables d'environnement : `.env.local` configuré
- [ ] Build : `npm run build` exécuté avec succès
- [ ] Test local : `out/` testé localement
- [ ] Upload : Contenu de `out/` uploadé dans `jeu/` sur Hostinger
- [ ] `.htaccess` racine : Uploadé à la racine de `public_html/`
- [ ] `.htaccess` jeu : Uploadé dans `jeu/` sur Hostinger
- [ ] Test 1 : Accès direct à `/jeu` fonctionne
- [ ] Test 2 : Redirection depuis `jouer.html` fonctionne
- [ ] Test 3 : Routes Next.js fonctionnent
- [ ] Test 4 : Pas d'erreurs MIME type dans la console

---

## 🎯 Résumé

**Architecture** :
- Site statique à la racine (`index.html`, `jouer.html`, etc.)
- Application Next.js dans `/jeu/` (export statique)

**Flux** :
1. Utilisateur → `votre-domaine.com`
2. Clique "Jouer" → `votre-domaine.com/jouer`
3. Se connecte → Redirigé vers `votre-domaine.com/jeu`
4. Joue sur l'application Next.js

**Fichiers critiques** :
- `.htaccess` à la racine (types MIME, routing site)
- `.htaccess` dans `jeu/` (types MIME, routing Next.js)
- `jouer.html` (redirection vers `/jeu`)

---

**Besoin d'aide ?** Dites-moi à quelle étape vous êtes bloqué !


