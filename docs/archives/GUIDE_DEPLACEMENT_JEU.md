# 🚀 Guide Rapide : Déplacer le Jeu vers zig-zag.fun/jeu

## 📋 Situation

- **Site actuel** : `zig-zag.fun` (Hostinger)
- **Jeu actuel** : `https://darkgreen-pheasant-730781.hostingersite.com/jeu`
- **Objectif** : `zig-zag.fun/jeu`

---

## ✅ Étapes Simples

### 1. Copier les Fichiers du Jeu

**Via le Gestionnaire de Fichiers Hostinger :**

1. **Connectez-vous** à votre panneau Hostinger
2. **Ouvrez le Gestionnaire de fichiers**
3. **Allez dans** le dossier de `darkgreen-pheasant-730781.hostingersite.com`
   - Cherchez le dossier `public_html/jeu/` ou `jeu/`
4. **Sélectionnez TOUS les fichiers** dans ce dossier :
   - `index.html`
   - `_next/` (dossier complet)
   - `.htaccess`
   - Tous les autres fichiers
5. **Copiez** ces fichiers (Ctrl+C / Cmd+C)
6. **Allez dans** le dossier `public_html/` de `zig-zag.fun`
7. **Créez un dossier** `jeu/` (s'il n'existe pas)
8. **Collez** les fichiers dans `public_html/jeu/`

### 2. Vérifier les Fichiers .htaccess

#### 2.1 .htaccess à la Racine

**Fichier** : `Zig-Zag/.htaccess`

**Destination** : `public_html/` de `zig-zag.fun` (à la racine)

**Action** : Uploadez ce fichier s'il n'existe pas ou s'il est incomplet.

#### 2.2 .htaccess dans /jeu/

**Fichier** : `Zig-Zag/game-app/.htaccess`

**Destination** : `public_html/jeu/` de `zig-zag.fun`

**Action** : Uploadez ce fichier dans le dossier `jeu/` s'il n'existe pas.

### 3. Vérifier jouer.html

Le fichier `jouer.html` redirige déjà correctement vers `/jeu` ✅

**Code actuel** :
```javascript
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : `${window.location.protocol}//${window.location.host}/jeu`;
```

**Action** : Aucune action nécessaire si le fichier est déjà sur `zig-zag.fun`.

### 4. Tester

1. **Test 1** : `https://zig-zag.fun/jeu` → Doit afficher la page de sélection
2. **Test 2** : `https://zig-zag.fun/jouer` → Connectez-vous → Doit rediriger vers `/jeu`
3. **Test 3** : Console (F12) → Pas d'erreurs MIME type

---

## 📁 Structure Finale sur zig-zag.fun

```
public_html/
├── .htaccess           ← Types MIME globaux
├── index.html
├── jouer.html          ← Redirige vers /jeu
├── contact.html
├── admin.html
└── jeu/                ← Application Next.js
    ├── index.html
    ├── .htaccess       ← Routing Next.js + Types MIME
    ├── _next/
    │   └── static/
    │       └── chunks/
    └── jeu/
        ├── matchmaking/
        ├── privee/
        └── [game_id]/
```

---

## ⚠️ Points Importants

1. **Les deux `.htaccess` sont nécessaires** :
   - Un à la racine (pour les types MIME globaux)
   - Un dans `jeu/` (pour le routing Next.js)

2. **La redirection est déjà configurée** :
   - `jouer.html` redirige vers `/jeu` sur le même domaine

3. **Après le déplacement** :
   - Videz le cache du navigateur (Ctrl+Shift+R / Cmd+Shift+R)
   - Testez toutes les routes

---

## 🐛 Si ça ne Fonctionne pas

### Erreur 404 sur `/jeu`
- Vérifiez que le dossier `jeu/` existe dans `public_html/`
- Vérifiez que `jeu/index.html` existe
- Vérifiez que le `.htaccess` est dans `jeu/`

### Erreurs MIME Type
- Vérifiez que les deux `.htaccess` sont uploadés
- Videz le cache du navigateur

### La Redirection ne Fonctionne pas
- Vérifiez que `jouer.html` est sur `zig-zag.fun`
- Vérifiez la console (F12)

---

**Guide complet** : Voir `docs/RELIE_SITE_ET_JEU_MEME_DOMAINE.md`


