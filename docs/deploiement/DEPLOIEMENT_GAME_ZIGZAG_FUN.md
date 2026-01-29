# 🚀 Déploiement sur game.zig-zag.fun - Guide Complet

## ✅ OUI, vous devez déployer sur game.zig-zag.fun !

L'application Next.js doit être **buildée** et **uploadée** sur `game.zig-zag.fun` pour que :
- La page `/auth/callback` existe
- La page `/jeu` fonctionne
- Tous les chunks JavaScript se chargent

---

## 📋 Procédure Complète de Déploiement

### ÉTAPE 1 : Build de l'application Next.js

```bash
cd Zig-Zag/game-app
rm -rf .next out
npm install
npm run build
```

**Vérifiez que le build a réussi :**
```bash
ls -la out/
```

Vous devriez voir :
- ✅ `out/index.html`
- ✅ `out/auth/callback/index.html` (CRITIQUE pour OAuth)
- ✅ `out/jeu/index.html`
- ✅ `out/_next/` (dossier avec les chunks)

### ÉTAPE 2 : Vérifier que la page /auth/callback existe

```bash
ls -la out/auth/callback/
```

Vous devriez voir `index.html` dans ce dossier.

**Si le dossier n'existe pas :**
- Le build n'a pas inclus la page
- Vérifiez que `src/app/auth/callback/page.tsx` existe
- Rebuild : `npm run build`

### ÉTAPE 3 : Uploader sur game.zig-zag.fun

**Structure à uploader :**

```
game.zig-zag.fun/ (racine du sous-domaine)
├── _next/
│   └── static/
│       ├── chunks/
│       └── css/
├── auth/
│   └── callback/
│       └── index.html  ← CRITIQUE pour OAuth
├── jeu/
│   ├── index.html
│   ├── matchmaking/
│   ├── privee/
│   └── ...
├── index.html
└── .htaccess  ← CRITIQUE pour les MIME types
```

**Comment uploader :**

1. **Via FTP/SFTP :**
   - Connectez-vous à votre serveur Hostinger
   - Allez dans le dossier du sous-domaine `game.zig-zag.fun`
   - **Supprimez tout** ce qui existe déjà (sauf si vous avez des fichiers importants)
   - **Uploadez TOUT le contenu** du dossier `out/`
   - **Uploadez le `.htaccess`** à la racine

2. **Via File Manager Hostinger :**
   - Allez dans le File Manager
   - Naviguez vers le dossier de `game.zig-zag.fun`
   - Uploadez tous les fichiers du dossier `out/`
   - Uploadez le `.htaccess`

### ÉTAPE 4 : Vérifier les permissions

Les fichiers doivent avoir les permissions :
- **Fichiers** : `644` (rw-r--r--)
- **Dossiers** : `755` (rwxr-xr-x)

### ÉTAPE 5 : Vérifier que le .htaccess est uploadé

Le fichier `.htaccess` doit être à la **racine** de `game.zig-zag.fun` :
```
game.zig-zag.fun/.htaccess
```

**Vérifiez que le `.htaccess` contient :**
- Les règles MIME types pour JS/CSS
- La règle pour ne pas réécrire `/_next/`
- La règle pour router vers `index.html`

---

## 🧪 Tests de Vérification

### Test 1 : Vérifier que la page /auth/callback existe

Dans votre navigateur, allez sur :
```
https://game.zig-zag.fun/auth/callback
```

**Résultat attendu :**
- ✅ La page se charge (même si elle redirige immédiatement)
- ❌ **404 Not Found** → La page n'existe pas, vérifiez l'upload

### Test 2 : Vérifier que les chunks se chargent

Dans votre navigateur, allez sur :
```
https://game.zig-zag.fun/jeu
```

**Résultat attendu :**
- ✅ La page se charge avec l'interface
- ❌ **"Chargement..."** qui ne se termine jamais → Problème de chunks
- ❌ **Erreur "Failed to load chunk"** → Vérifiez le `.htaccess` et les MIME types

### Test 3 : Vérifier l'accès direct à un chunk

Dans votre navigateur, ouvrez la console (F12) → Network, et regardez quels fichiers sont chargés.

Essayez d'accéder directement à un chunk :
```
https://game.zig-zag.fun/_next/static/chunks/[nom-du-fichier].js
```

**Résultat attendu :**
- ✅ Le fichier JavaScript se charge (vous voyez du code)
- ❌ **404 Not Found** → Le chunk n'existe pas, rebuild nécessaire
- ❌ **500 Error** → Problème serveur, vérifiez le `.htaccess`
- ❌ **MIME type incorrect** → Vérifiez les règles MIME dans `.htaccess`

---

## 🔍 Checklist de Déploiement

Avant de tester OAuth, vérifiez :

- [ ] **Build réussi** : `npm run build` s'est terminé sans erreur
- [ ] **Dossier out/ existe** : `ls -la out/` montre les fichiers
- [ ] **Page /auth/callback existe** : `ls -la out/auth/callback/index.html` existe
- [ ] **Chunks existent** : `ls -la out/_next/static/chunks/` montre des fichiers .js
- [ ] **Upload complet** : Tous les fichiers de `out/` sont uploadés sur `game.zig-zag.fun`
- [ ] **.htaccess uploadé** : Le fichier est à la racine de `game.zig-zag.fun`
- [ ] **Permissions correctes** : Fichiers 644, dossiers 755
- [ ] **Test /auth/callback** : `https://game.zig-zag.fun/auth/callback` se charge
- [ ] **Test /jeu** : `https://game.zig-zag.fun/jeu` se charge avec l'interface

---

## 🐛 Si ça ne marche toujours pas

### Problème : Page /auth/callback n'existe pas (404)

**Solution :**
1. Vérifiez que `out/auth/callback/index.html` existe après le build
2. Vérifiez que ce fichier est uploadé sur `game.zig-zag.fun`
3. Vérifiez que le dossier `auth/callback/` existe sur le serveur

### Problème : Erreur "Failed to load chunk"

**Solution :**
1. Vérifiez que le dossier `_next/static/chunks/` est uploadé
2. Vérifiez que le `.htaccess` contient les règles MIME types
3. Vérifiez que le `.htaccess` ne réécrit pas `/_next/`

### Problème : Redirige toujours vers zig-zag.fun

**Solution :**
1. Vérifiez que `oauth-callback.html` est uploadé sur `zig-zag.fun`
2. Vérifiez que `https://zig-zag.fun/oauth-callback` est dans les Redirect URLs de Supabase
3. Vérifiez que le code dans `jouer.html` utilise `redirectTo = 'https://zig-zag.fun/oauth-callback'`

---

## 📝 Résumé des Fichiers à Uploader

### Sur zig-zag.fun :
- ✅ `oauth-callback.html` (NOUVEAU)
- ✅ `jouer.html` (modifié)
- ✅ `.htaccess` (modifié)

### Sur game.zig-zag.fun :
- ✅ **TOUT le contenu** du dossier `out/` (après `npm run build`)
- ✅ `.htaccess` (depuis `game-app/.htaccess`)

---

## 🎯 Commandes Rapides

```bash
# 1. Build
cd Zig-Zag/game-app
rm -rf .next out
npm install
npm run build

# 2. Vérifier le build
ls -la out/auth/callback/
ls -la out/_next/static/chunks/ | head -5

# 3. Uploader (via FTP/SFTP)
# - Uploadez tout le contenu de out/ sur game.zig-zag.fun
# - Uploadez game-app/.htaccess sur game.zig-zag.fun
```

---

## ✅ Après le Déploiement

1. Testez : `https://game.zig-zag.fun/jeu` → Doit afficher l'interface
2. Testez : `https://game.zig-zag.fun/auth/callback` → Doit se charger
3. Testez OAuth : `https://zig-zag.fun/jouer` → Clic Google → Doit rediriger vers `game.zig-zag.fun`
