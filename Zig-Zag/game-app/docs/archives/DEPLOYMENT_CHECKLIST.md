# ✅ Checklist de Déploiement - Fix Chunks

## 🔧 Corrections Appliquées

### 1. Configuration basePath
- ✅ `basePath: '/jeu'` ajouté dans `next.config.js`
- ✅ Tous les liens corrigés pour être relatifs (sans `/jeu`)

### 2. Fichiers Modifiés
- ✅ `next.config.js` - basePath configuré
- ✅ `src/constants/index.ts` - Routes mises à jour
- ✅ Tous les fichiers de pages - Liens corrigés

## 📋 Étapes de Déploiement

### 1. Rebuild Local (Optionnel - pour tester)
```bash
cd game-app
npm run build
npm start
```
Testez localement que tout fonctionne.

### 2. Upload sur Hostinger
1. **Supprimer l'ancien build** (si présent) :
   - Supprimez le dossier `.next/` sur le serveur (sera régénéré)

2. **Uploader les fichiers modifiés** :
   - `next.config.js` (avec basePath)
   - Tous les fichiers modifiés dans `src/`
   - `package.json` (si modifié)

### 3. Rebuild sur Hostinger
Dans Hostinger Cloud Startup :
- La commande `npm run build` devrait s'exécuter automatiquement
- Sinon, lancez-la manuellement

### 4. Redémarrer l'Application
- Redémarrez l'application dans Hostinger
- Utilisez `npm start` (pas `npm run dev`)

### 5. Vérification
1. Accédez à votre application
2. Ouvrez la console du navigateur (F12)
3. Vérifiez que :
   - ✅ Plus d'erreur "Failed to load chunk"
   - ✅ Les chunks se chargent depuis `/jeu/_next/static/chunks/...`
   - ✅ Plus d'avertissement GoTrueClient (si corrigé)

## 🚨 Si le Problème Persiste

### Vérifier la Configuration Hostinger
1. **L'application est-elle vraiment sur `/jeu` ?**
   - Si oui → `basePath: '/jeu'` est correct
   - Si non → Retirez `basePath` et servez à la racine

2. **Vérifier les logs Hostinger** :
   - Regardez les logs de build
   - Regardez les logs de l'application en cours d'exécution
   - Cherchez les erreurs de chargement de fichiers

3. **Vérifier les permissions** :
   - Les fichiers `.next/` doivent être accessibles
   - Vérifiez les permissions du serveur

### Alternative : Servir à la Racine
Si possible, configurez Hostinger pour servir l'application **à la racine** (`/`) au lieu de `/jeu` :
1. Retirez `basePath: '/jeu'` de `next.config.js`
2. Remettez tous les liens avec `/jeu/...`
3. Rebuild et redéployez

## 📝 Notes Importantes

- **Avec `basePath: '/jeu'`** : Tous les liens doivent être relatifs (sans `/jeu`)
- **Next.js ajoute automatiquement** `/jeu` à tous les liens relatifs
- **Les assets statiques** (`/_next/static/...`) deviennent automatiquement `/jeu/_next/static/...`

## ✅ Résultat Attendu

Après le déploiement :
- ✅ L'application se charge sans erreur
- ✅ Les chunks se chargent correctement
- ✅ La navigation fonctionne
- ✅ Plus d'erreur 404 pour les chunks



