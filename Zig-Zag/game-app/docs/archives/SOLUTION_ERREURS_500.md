# 🔧 Solution aux Erreurs 500 - Configuration basePath

## 🎯 Problème Identifié

Les erreurs **500 (Internal Server Error)** sur les chunks JavaScript venaient d'une **mauvaise configuration** :
- `basePath` était désactivé
- Les liens contenaient explicitement `/jeu`
- Next.js générait les chunks à la racine, mais le serveur les cherchait sous `/jeu/`

## ✅ Solution Appliquée

### 1. Réactivation de `basePath: '/jeu'`
```javascript
// next.config.js
basePath: '/jeu',  // ✅ Activé
```

### 2. Tous les liens sont maintenant relatifs
- ❌ Avant : `router.push('/jeu/matchmaking')`
- ✅ Maintenant : `router.push('/matchmaking')`

Next.js ajoutera automatiquement `/jeu` à tous les liens et assets.

## 📋 Fichiers Modifiés

### Configuration
- ✅ `next.config.js` - `basePath: '/jeu'` activé
- ✅ `src/constants/index.ts` - Routes relatives

### Pages
- ✅ `src/app/page.tsx` - Redirect relatif
- ✅ `src/app/jeu/page.tsx` - Liens relatifs
- ✅ `src/app/jeu/matchmaking/page.tsx` - Liens relatifs
- ✅ `src/app/jeu/privee/page.tsx` - Liens relatifs
- ✅ `src/app/jeu/room/[room_code]/page.tsx` - Liens relatifs
- ✅ `src/app/jeu/[game_id]/page.tsx` - Liens relatifs
- ✅ `src/app/jeu/[game_id]/results/page.tsx` - Liens relatifs

### Composants
- ✅ `src/components/ui/ErrorBoundary.tsx` - Lien relatif

## 🚀 Prochaines Étapes

### 1. Uploader les fichiers modifiés sur Hostinger
Tous les fichiers modifiés doivent être uploadés.

### 2. **IMPORTANT : Supprimer l'ancien build**
Sur Hostinger, supprimez le dossier `.next/` avant de rebuilder :
```bash
# Si SSH disponible
rm -rf .next
```

Ou via le panneau Hostinger, supprimez le dossier `.next/` s'il existe.

### 3. Rebuild complet
Le build doit être relancé pour générer les chunks avec le bon chemin :
```bash
npm run build
```

### 4. Vérifier après rebuild
Après le rebuild, les chunks devraient être générés avec le bon chemin :
- ✅ Chunks : `/jeu/_next/static/chunks/...`
- ✅ CSS : `/jeu/_next/static/css/...`
- ✅ Assets : `/jeu/_next/static/...`

### 5. Tester
1. Accédez à votre application
2. Ouvrez la console (F12)
3. Vérifiez que :
   - ✅ Les chunks se chargent depuis `/jeu/_next/static/chunks/...`
   - ✅ Plus d'erreur 500
   - ✅ Plus d'erreur "Failed to load chunk"
   - ✅ L'application fonctionne

## 🔍 Comment Vérifier que ça Fonctionne

### Test 1 : Console du navigateur
- Ouvrez la console (F12)
- Regardez l'onglet Network
- Vérifiez que les chunks sont chargés depuis `/jeu/_next/static/...`
- Status code : **200** (pas 500)

### Test 2 : Accès direct à un chunk
Essayez d'accéder directement à un chunk :
```
https://votre-domaine/jeu/_next/static/chunks/...
```
- Si accessible (200) → Configuration correcte ✅
- Si 500 → Problème de build ou de déploiement

## ⚠️ Si le Problème Persiste

### Vérification 1 : Build complet
Assurez-vous que le build est complet :
```bash
# Vérifier que .next/ existe
ls -la .next/static/chunks/

# Si vide ou inexistant, rebuilder
npm run build
```

### Vérification 2 : Structure des fichiers
Vérifiez que sur Hostinger :
- Le dossier `.next/` existe
- Les chunks sont dans `.next/static/chunks/`
- Les permissions sont correctes (lecture)

### Vérification 3 : Logs Hostinger
Regardez les logs de build et d'exécution pour voir s'il y a des erreurs.

### Vérification 4 : Configuration Hostinger
Vérifiez que :
- Node.js 20 LTS (ou 18.17+) est configuré
- Les variables d'environnement sont correctes
- Le port est correctement configuré

## 📝 Résumé

**Configuration actuelle** :
- ✅ `basePath: '/jeu'` : Activé
- ✅ Tous les liens : Relatifs (sans `/jeu`)
- ✅ Compatible avec : App servie sur `/jeu` par Hostinger

**Résultat attendu** :
- Les chunks seront servis depuis `/jeu/_next/static/chunks/...`
- Tous les liens seront automatiquement préfixés avec `/jeu`
- Plus d'erreurs 500
- L'application devrait fonctionner correctement

---

**Dernière mise à jour** : Configuration avec `basePath: '/jeu'` et liens relatifs pour résoudre les erreurs 500



