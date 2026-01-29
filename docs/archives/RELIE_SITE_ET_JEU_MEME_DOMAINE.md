# 🔗 Guide : Relier le Site et le Jeu sur le Même Domaine (zig-zag.fun)

## 📋 Situation Actuelle

- **Site principal** : `zig-zag.fun` (Hostinger)
- **Jeu actuel** : `https://darkgreen-pheasant-730781.hostingersite.com/jeu` (Hostinger)
- **Objectif** : Déplacer le jeu vers `zig-zag.fun/jeu`

---

## ✅ Solution : Déplacer le Jeu sur le Même Domaine

### Étape 1 : Accéder aux Fichiers du Jeu

Vous avez deux options :

#### Option A : Via le Gestionnaire de Fichiers Hostinger

1. **Connectez-vous** à votre panneau Hostinger
2. **Ouvrez le Gestionnaire de fichiers** (File Manager)
3. **Allez dans** le dossier correspondant à `darkgreen-pheasant-730781.hostingersite.com`
   - Cela peut être dans un sous-dossier ou un autre compte d'hébergement
4. **Trouvez le dossier** `jeu/` ou `public_html/jeu/`

#### Option B : Via FTP/SFTP

1. **Connectez-vous** via FTP/SFTP à `darkgreen-pheasant-730781.hostingersite.com`
2. **Naviguez** vers le dossier `public_html/jeu/` (ou équivalent)
3. **Téléchargez** tous les fichiers du dossier `jeu/`

---

### Étape 2 : Copier les Fichiers vers zig-zag.fun

#### Via le Gestionnaire de Fichiers Hostinger

1. **Allez dans** le dossier `public_html/` de `zig-zag.fun`
2. **Créez un dossier** `jeu/` (s'il n'existe pas)
3. **Copiez TOUS les fichiers** du dossier `jeu/` de l'ancien site vers le nouveau :
   - `index.html`
   - `_next/` (dossier complet)
   - `.htaccess` (très important !)
   - Tous les autres fichiers et dossiers

**Structure finale sur `zig-zag.fun` :**
```
public_html/ (zig-zag.fun)
├── index.html
├── jouer.html
├── contact.html
├── admin.html
├── .htaccess          ← Fichier à la racine (types MIME)
└── jeu/               ← NOUVEAU : Dossier avec l'app Next.js
    ├── index.html
    ├── .htaccess      ← CRITIQUE : Routing Next.js
    ├── _next/
    │   └── static/
    │       └── chunks/
    └── jeu/
        ├── matchmaking/
        ├── privee/
        └── [game_id]/
```

---

### Étape 3 : Vérifier les Fichiers .htaccess

#### 3.1 .htaccess à la Racine (zig-zag.fun)

Le fichier `Zig-Zag/.htaccess` doit être à la racine de `public_html/` de `zig-zag.fun`.

**Vérifiez qu'il contient** :
- Types MIME pour CSS et JS
- Headers HTTP pour forcer les bons types MIME
- Routing pour les pages HTML statiques

**Action** : Si le fichier n'existe pas ou est incomplet, uploadez `Zig-Zag/.htaccess`.

#### 3.2 .htaccess dans /jeu/

Le fichier `Zig-Zag/game-app/.htaccess` doit être dans le dossier `jeu/` sur `zig-zag.fun`.

**Vérifiez qu'il contient** :
- Types MIME pour CSS et JS
- Routing Next.js (redirection vers `index.html`)

**Action** : Si le fichier n'existe pas ou est incomplet, uploadez `Zig-Zag/game-app/.htaccess` dans `jeu/`.

---

### Étape 4 : Vérifier la Redirection dans jouer.html

Le fichier `jouer.html` doit rediriger vers `/jeu` sur le même domaine.

**Code actuel** (lignes ~1420 et ~1492) :
```javascript
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : `${window.location.protocol}//${window.location.host}/jeu`;
window.location.href = gameUrl;
```

**✅ Ce code est correct** : Il redirige vers `/jeu` sur le même domaine (`zig-zag.fun/jeu`).

**Action** : 
- Si `jouer.html` n'est pas à jour, uploadez `Zig-Zag/jouer.html` sur `zig-zag.fun`

---

### Étape 5 : Tester

#### Test 1 : Accès Direct au Jeu

Allez sur : `https://zig-zag.fun/jeu`

**Résultat attendu** : Page de sélection de mode (Multi / Privé)

**Si erreur 404** :
- Vérifiez que le dossier `jeu/` existe dans `public_html/` de `zig-zag.fun`
- Vérifiez que `jeu/index.html` existe
- Vérifiez que le `.htaccess` est dans `jeu/`

#### Test 2 : Redirection depuis jouer.html

1. Allez sur : `https://zig-zag.fun/jouer`
2. Connectez-vous
3. **Résultat attendu** : Redirection vers `https://zig-zag.fun/jeu`

**Si la redirection ne fonctionne pas** :
- Vérifiez la console du navigateur (F12)
- Vérifiez que `jouer.html` contient le bon code de redirection

#### Test 3 : Routes Next.js

Testez les routes :
- `https://zig-zag.fun/jeu/matchmaking` → Doit afficher le matchmaking
- `https://zig-zag.fun/jeu/privee` → Doit afficher la page de partie privée

**Si erreur 404** :
- Vérifiez que le `.htaccess` dans `jeu/` contient les règles de routing
- Vérifiez que les fichiers sont bien uploadés

#### Test 4 : Assets (CSS/JS)

Ouvrez la console du navigateur (F12) et vérifiez :
- ✅ Pas d'erreurs MIME type
- ✅ Les fichiers CSS se chargent
- ✅ Les fichiers JS s'exécutent

**Si erreurs MIME type** :
- Vérifiez que le `.htaccess` à la racine contient les types MIME
- Vérifiez que le `.htaccess` dans `jeu/` contient les types MIME

---

## 🔄 Alternative : Redirection depuis l'Ancien Site

Si vous ne pouvez pas déplacer les fichiers immédiatement, vous pouvez créer une redirection depuis l'ancien site vers le nouveau :

### Créer une Redirection sur darkgreen-pheasant-730781.hostingersite.com

Créez un fichier `.htaccess` dans le dossier `jeu/` de l'ancien site :

```apache
RewriteEngine On
RewriteBase /jeu/

# Rediriger vers zig-zag.fun/jeu
RewriteRule ^(.*)$ https://zig-zag.fun/jeu/$1 [R=301,L]
```

**⚠️ Note** : Cette solution est temporaire. Il est préférable de déplacer les fichiers.

---

## 📝 Checklist

- [ ] Fichiers du jeu copiés dans `public_html/jeu/` de `zig-zag.fun`
- [ ] `.htaccess` racine uploadé sur `zig-zag.fun`
- [ ] `.htaccess` dans `jeu/` uploadé sur `zig-zag.fun`
- [ ] `jouer.html` mis à jour sur `zig-zag.fun`
- [ ] Test `/jeu` fonctionne
- [ ] Test redirection depuis `jouer.html` fonctionne
- [ ] Test routes Next.js fonctionnent
- [ ] Pas d'erreurs dans la console

---

## 🐛 Dépannage

### Erreur 404 sur `/jeu`

**Causes possibles** :
- Le dossier `jeu/` n'existe pas dans `public_html/` de `zig-zag.fun`
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
2. Videz le cache du navigateur (Ctrl+Shift+R / Cmd+Shift+R)
3. Vérifiez la console du navigateur (F12)

---

## 🎯 Résumé

**Architecture finale** :
- Site statique : `zig-zag.fun` (index.html, jouer.html, etc.)
- Application Next.js : `zig-zag.fun/jeu` (dans le dossier `jeu/`)

**Flux utilisateur** :
1. Utilisateur → `zig-zag.fun`
2. Clique "Jouer" → `zig-zag.fun/jouer`
3. Se connecte → Redirigé vers `zig-zag.fun/jeu`
4. Joue sur l'application Next.js

**Fichiers critiques** :
- `.htaccess` à la racine (types MIME, routing site)
- `.htaccess` dans `jeu/` (types MIME, routing Next.js)
- `jouer.html` (redirection vers `/jeu`)

---

**Besoin d'aide ?** Dites-moi à quelle étape vous êtes bloqué !


