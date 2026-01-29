# 🔧 Fix Urgent : Erreurs MIME Type sur Hostinger

## ❌ Problème

Les fichiers CSS et JS de Next.js sont servis avec le mauvais type MIME :
- CSS servis comme `text/plain` au lieu de `text/css`
- JS servis comme `text/plain` au lieu de `application/javascript`
- Erreurs 500 sur certains fichiers
- Les fichiers sont servis depuis `/_next/...` à la racine

## ✅ Solution

### 1. Mettre à jour le `.htaccess` à la racine

Le fichier `.htaccess` à la racine (`Zig-Zag/.htaccess`) a été mis à jour pour :
- ✅ Définir les types MIME corrects **AVANT** toutes les autres règles
- ✅ Forcer les headers HTTP pour garantir les bons types MIME
- ✅ Gérer spécifiquement les fichiers dans `_next/`

### 2. Uploader le `.htaccess` mis à jour

**IMPORTANT** : Le fichier `.htaccess` doit être à la **racine** de `public_html/` sur Hostinger.

**Structure sur Hostinger :**
```
public_html/
├── .htaccess          ← FICHIER CRUCIAL ICI (à la racine) !
├── index.html
├── jouer.html
├── contact.html
├── admin.html
├── _next/              ← Dossier Next.js (si déployé à la racine)
│   └── static/
│       └── chunks/
│           ├── *.js   ← Ces fichiers doivent avoir le bon MIME type
│           └── *.css  ← Ces fichiers doivent avoir le bon MIME type
└── jeu/               ← Ou ici si déployé dans /jeu/
    ├── .htaccess      ← Aussi nécessaire si déployé ici
    ├── index.html
    └── _next/
        └── ...
```

### 3. Vérifier où l'app est déployée

D'après les erreurs, les fichiers sont servis depuis `/_next/...`, ce qui signifie :
- **Option A** : L'app est déployée à la racine → Utiliser le `.htaccess` racine mis à jour
- **Option B** : L'app est dans `/jeu/` mais les fichiers sont mal référencés → Vérifier la configuration Next.js

### 4. Si l'app est dans `/jeu/`

Si l'app Next.js est déployée dans `/jeu/`, il faut aussi un `.htaccess` dans ce dossier :
- Copier `Zig-Zag/game-app/.htaccess` dans le dossier `jeu/` sur Hostinger

### 5. Vérifier les permissions

Le fichier `.htaccess` doit avoir les permissions **644**.

### 6. Vider le cache

Après upload :
1. **Vider le cache du navigateur** (Ctrl+Shift+R / Cmd+Shift+R)
2. **Vider le cache du serveur** (si possible via le panneau Hostinger)

## 🔍 Diagnostic

Pour vérifier où l'app est déployée :

1. **Ouvrir la console du navigateur** sur `https://votre-domaine.com/jeu`
2. **Regarder les URLs des erreurs** :
   - Si `/_next/...` → App à la racine → Utiliser `.htaccess` racine
   - Si `/jeu/_next/...` → App dans `/jeu/` → Utiliser `.htaccess` dans `/jeu/`

## ⚠️ Si le problème persiste

1. **Vérifier que `mod_mime` est activé** sur Hostinger (généralement activé par défaut)
2. **Vérifier que `mod_headers` est activé** sur Hostinger (généralement activé par défaut)
3. **Contacter le support Hostinger** si les modules ne sont pas activés
4. **Vérifier les logs d'erreur** dans le panneau Hostinger pour voir les erreurs 500

## 📝 Fichiers modifiés

- ✅ `Zig-Zag/.htaccess` - Mis à jour avec les types MIME en priorité
- ✅ `Zig-Zag/game-app/.htaccess` - Déjà configuré pour `/jeu/`

## 🎯 Résultat attendu

Après upload du `.htaccess` mis à jour :
- ✅ Plus d'erreurs MIME type
- ✅ Les CSS se chargent correctement
- ✅ Les JS s'exécutent correctement
- ✅ Plus d'erreurs 500 sur les chunks


