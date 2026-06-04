# 🚀 Instructions de Déploiement - Solution Chunks

## ✅ Corrections Appliquées

J'ai retiré `basePath: '/jeu'` et remis tous les liens avec `/jeu/...` dans le code.

**Hypothèse** : Hostinger Cloud Startup sert l'application **à la racine** (`/`), pas sur un sous-chemin `/jeu`.

## 📋 Configuration Actuelle

### `next.config.js`
- ✅ `basePath` est **commenté** (pas de basePath)
- ✅ L'application sera servie à la racine

### Tous les liens
- ✅ Tous les liens utilisent maintenant `/jeu/...` explicitement
- ✅ Compatible avec une app servie à la racine

## 🔧 Étapes de Déploiement

### 1. Uploader les Fichiers Modifiés

Uploadez sur Hostinger :
- `next.config.js` (basePath commenté)
- Tous les fichiers modifiés dans `src/app/`
- `src/constants/index.ts`

### 2. Rebuild sur Hostinger

Dans Hostinger Cloud Startup :
- Le build devrait se lancer automatiquement
- Sinon, lancez manuellement : `npm run build`

### 3. Vérifier la Configuration Hostinger

**IMPORTANT** : Vérifiez dans Hostinger Cloud Startup :
- L'application est-elle configurée pour servir **à la racine** (`/`) ?
- Ou est-elle configurée sur un sous-chemin (`/jeu`) ?

### 4. Si l'app DOIT être sur `/jeu` dans Hostinger

Si Hostinger force l'app sur `/jeu`, alors :

1. **Décommentez `basePath`** dans `next.config.js` :
   ```javascript
   basePath: '/jeu',  // Décommentez
   ```

2. **Remettez tous les liens sans `/jeu`** (j'ai déjà fait ça avant, je peux le refaire)

3. **Rebuild et redéployez**

## 🎯 Test

Après le déploiement :

1. Accédez à votre application
2. Ouvrez la console (F12)
3. Vérifiez que :
   - ✅ Les chunks se chargent depuis `/_next/static/chunks/...` (sans `/jeu`)
   - ✅ Plus d'erreur "Failed to load chunk"
   - ✅ L'application fonctionne

## 🔍 Diagnostic

Si le problème persiste :

1. **Testez l'accès direct à un chunk** :
   ```
   https://votre-domaine/_next/static/chunks/...
   ```
   - Si accessible → L'app est à la racine, configuration actuelle OK
   - Si 404 → L'app est sur `/jeu`, il faut remettre `basePath`

2. **Vérifiez les logs Hostinger** :
   - Regardez les logs de build
   - Regardez les logs de l'application
   - Cherchez les erreurs de chargement

3. **Vérifiez la structure des fichiers** :
   - Le dossier `.next/` est-il présent ?
   - Les chunks sont-ils dans `.next/static/chunks/` ?

## 📝 Résumé

**Configuration actuelle** :
- ❌ `basePath` : Commenté (pas de basePath)
- ✅ Tous les liens : Avec `/jeu/...` explicitement
- ✅ Compatible avec : App servie à la racine

**Si ça ne fonctionne pas** :
- Remettez `basePath: '/jeu'`
- Remettez les liens sans `/jeu` (relatifs)



