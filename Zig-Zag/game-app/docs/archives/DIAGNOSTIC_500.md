# 🔍 Diagnostic Erreurs 500 - Chunks Next.js

## 🚨 Problème Actuel

**Erreurs observées** :
- Status 500 (Internal Server Error) sur les chunks
- URL : `darkgreen-pheasant-730781.hostingersite.com/jeu`
- Fichiers concernés : `cbd55ab9639e1e66.js`, `turbopack-*.js`

## 🔎 Analyse

### Différence entre 404 et 500
- **404** = Fichier introuvable (problème de chemin)
- **500** = Erreur serveur (problème de configuration/routage)

Les erreurs 500 suggèrent que :
1. ✅ Le serveur reçoit bien les requêtes
2. ❌ Mais il y a un problème interne lors du traitement

## 🎯 Causes Possibles

### 1. Conflit basePath / Configuration Hostinger
Si Hostinger sert l'app **à la racine** mais que `basePath: '/jeu'` est activé :
- Next.js génère les chunks avec `/jeu/_next/...`
- Mais le serveur essaie de les servir depuis la racine
- → Erreur 500

### 2. Build Incomplet ou Corrompu
- Le build n'a pas été fait avec `basePath`
- Les chunks ne sont pas au bon endroit
- → Erreur 500

### 3. Configuration Hostinger Incorrecte
- L'app est servie à la racine mais on accède via `/jeu`
- Ou l'inverse
- → Erreur 500

## ✅ Solutions à Tester

### Solution 1 : Tester SANS basePath (App servie à la racine)

**Hypothèse** : Hostinger sert l'app à la racine, pas sur `/jeu`

**Actions** :
1. Désactiver `basePath` dans `next.config.js`
2. Remettre les liens avec `/jeu` explicitement
3. Rebuild

```javascript
// next.config.js
const nextConfig = {
  // basePath: '/jeu',  // ← Commenter
  // ... reste de la config
};
```

### Solution 2 : Vérifier la Configuration Hostinger

**Questions** :
- Où Hostinger sert-il réellement l'app ?
- Y a-t-il un sous-dossier `/jeu` configuré ?
- Ou l'app est-elle à la racine ?

**Comment vérifier** :
1. Accédez à `darkgreen-pheasant-730781.hostingersite.com/` (sans `/jeu`)
2. Que voyez-vous ?
   - Si l'app fonctionne → L'app est à la racine, pas besoin de `basePath`
   - Si 404 → L'app est peut-être sur `/jeu`

### Solution 3 : Build Propre avec basePath

Si l'app DOIT être sur `/jeu` :

1. **Nettoyer le build** :
```bash
rm -rf .next
rm -rf out
```

2. **Rebuild avec basePath** :
```bash
npm run build
```

3. **Vérifier la structure** :
- Les chunks doivent être dans `.next/static/chunks/`
- Les chemins dans le HTML doivent pointer vers `/jeu/_next/...`

## 🧪 Test Rapide

### Test 1 : Accès Direct à la Racine
```
https://darkgreen-pheasant-730781.hostingersite.com/
```
- Si ça fonctionne → L'app est à la racine, pas besoin de `basePath`
- Si 404 → L'app est peut-être sur `/jeu`

### Test 2 : Vérifier les Logs Hostinger
Regardez les logs de build et d'exécution sur Hostinger pour voir :
- Les erreurs exactes
- Où l'app est servie
- Les chemins utilisés

### Test 3 : Vérifier le Build Local
```bash
cd game-app
npm run build
# Regardez les chemins générés dans .next/
```

## 📝 Recommandation Immédiate

**Étape 1** : Tester sans `basePath`
1. Commenter `basePath: '/jeu'` dans `next.config.js`
2. Remettre les liens avec `/jeu` explicitement
3. Rebuild sur Hostinger
4. Tester

**Étape 2** : Si ça ne fonctionne pas
1. Vérifier où Hostinger sert réellement l'app
2. Adapter la configuration en conséquence

---

**Prochaine action** : Je peux modifier `next.config.js` pour désactiver `basePath` et remettre les liens explicites avec `/jeu`. Voulez-vous que je le fasse ?
