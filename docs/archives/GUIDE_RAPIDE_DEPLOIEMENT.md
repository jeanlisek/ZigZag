# 🚀 Guide Rapide : Relier Site et Jeu sur Hostinger

## 📋 En Résumé

**Objectif** : Déployer le site HTML et l'application Next.js **sur le même domaine Hostinger**.

---

## ✅ Étapes Rapides

### 1. Configurer Next.js pour l'Export Statique

Le fichier `next.config.js` a été mis à jour avec :
- ✅ `output: 'export'` (export statique)
- ✅ `trailingSlash: true`
- ✅ `images.unoptimized: true`

**Action** : Aucune, c'est déjà fait ✅

### 2. Build l'Application

```bash
cd Zig-Zag/game-app
npm install  # Si pas déjà fait
npm run build
```

Cela crée un dossier `out/` avec tous les fichiers statiques.

### 3. Copier le .htaccess dans out/

```bash
# Depuis la racine du projet
cp Zig-Zag/game-app/.htaccess Zig-Zag/game-app/out/.htaccess
```

**Important** : Le `.htaccess` doit être dans `out/` pour être uploadé avec les autres fichiers.

### 4. Uploader sur Hostinger

**Via FTP/SFTP :**

1. Connectez-vous à votre FTP Hostinger
2. Allez dans `public_html/`
3. Créez un dossier `jeu/` (s'il n'existe pas)
4. **Uploadez TOUT le contenu** du dossier `out/` dans `jeu/`

**Structure finale :**
```
public_html/
├── index.html          ← Déjà présent
├── jouer.html          ← Déjà présent
├── contact.html        ← Déjà présent
├── admin.html          ← Déjà présent
├── .htaccess           ← À mettre à jour (voir étape 5)
└── jeu/                ← NOUVEAU : Contenu du dossier out/
    ├── index.html
    ├── .htaccess       ← CRITIQUE (copié depuis out/)
    ├── _next/
    └── ...
```

### 5. Mettre à Jour le .htaccess à la Racine

**Action** : Uploadez `Zig-Zag/.htaccess` à la racine de `public_html/` sur Hostinger.

Ce fichier contient :
- ✅ Types MIME (pour corriger les erreurs CSS/JS)
- ✅ Headers HTTP (pour forcer les bons types MIME)
- ✅ Routing pour les pages HTML

### 6. Vérifier la Redirection

Le fichier `jouer.html` redirige déjà vers `/jeu` ✅

**Code actuel** (lignes ~1420 et ~1492) :
```javascript
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : `${window.location.protocol}//${window.location.host}/jeu`;
window.location.href = gameUrl;
```

**✅ Ce code est correct** : Il redirige vers `/jeu` en production.

### 7. Tester

1. **Test 1** : `https://votre-domaine.com/jeu` → Doit afficher la page de sélection
2. **Test 2** : `https://votre-domaine.com/jouer` → Connectez-vous → Doit rediriger vers `/jeu`
3. **Test 3** : Vérifiez la console (F12) → Pas d'erreurs MIME type

---

## 🔄 Mise à Jour Future

### Mettre à Jour le Jeu

```bash
cd Zig-Zag/game-app
npm run build
cp .htaccess out/.htaccess
# Puis uploader le contenu de out/ dans jeu/ sur Hostinger
```

### Mettre à Jour le Site

Modifiez les fichiers HTML, puis uploadez-les directement sur Hostinger.

---

## 🐛 Problèmes Courants

### Erreur 404 sur `/jeu`
- Vérifiez que le dossier `jeu/` existe dans `public_html/`
- Vérifiez que `jeu/index.html` existe
- Vérifiez que le `.htaccess` est dans `jeu/`

### Erreurs MIME Type
- Vérifiez que le `.htaccess` à la racine est uploadé
- Vérifiez que le `.htaccess` dans `jeu/` est uploadé
- Videz le cache du navigateur

### La Redirection ne Fonctionne pas
- Vérifiez que `jouer.html` contient le bon code
- Videz le cache du navigateur
- Vérifiez la console (F12)

---

## 📝 Checklist

- [ ] `next.config.js` configuré (`output: 'export'`)
- [ ] Build exécuté (`npm run build`)
- [ ] `.htaccess` copié dans `out/`
- [ ] Contenu de `out/` uploadé dans `jeu/` sur Hostinger
- [ ] `.htaccess` racine uploadé sur Hostinger
- [ ] Test `/jeu` fonctionne
- [ ] Test redirection depuis `jouer.html` fonctionne
- [ ] Pas d'erreurs dans la console

---

**Guide complet** : Voir `docs/RELIER_SITE_ET_JEU_HOSTINGER.md`


