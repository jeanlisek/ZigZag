# 🔧 Fix : Erreur de chargement des chunks Next.js sur Hostinger

## 🚨 Problème Identifié

L'erreur `Failed to load chunk /_next/static/chunks/11e31d8eb1fee314.js` indique que les fichiers statiques Next.js ne sont pas accessibles.

**Causes possibles** :
1. Configuration `basePath` manquante si l'app est servie sur un sous-chemin
2. Serveur Node.js ne sert pas correctement les fichiers statiques
3. Configuration Hostinger incorrecte pour les routes Next.js

---

## ✅ Solution 1 : Configuration basePath (si app sur sous-chemin)

Si votre application est accessible sur `darkgreen-pheasant-730781.hostingersite.com/jeu`, vous devez configurer `basePath` :

```javascript
// next.config.js
const nextConfig = {
  basePath: '/jeu',  // Ajoutez cette ligne si l'app est sur un sous-chemin
  // ... reste de la config
};
```

**⚠️ Important** : Si vous ajoutez `basePath`, tous vos liens doivent être relatifs ou utiliser le préfixe `/jeu`.

---

## ✅ Solution 2 : Configuration pour serveur Node.js (Recommandé)

Hostinger Cloud Startup devrait servir l'application Next.js directement à la racine. Vérifiez :

1. **Dans Hostinger Cloud Startup** :
   - L'application doit être configurée pour servir sur `/` (racine)
   - Pas de sous-chemin `/jeu` dans la configuration

2. **Si vous devez servir sur `/jeu`** :
   - Utilisez un reverse proxy (Nginx/Apache) au lieu de `basePath`
   - Ou configurez Hostinger pour servir directement à la racine

---

## ✅ Solution 3 : Vérifier le build et le déploiement

1. **Vérifier que le build est complet** :
   ```bash
   npm run build
   ```
   - Vérifiez que le dossier `.next/` contient tous les chunks
   - Vérifiez qu'il n'y a pas d'erreurs de build

2. **Vérifier les fichiers uploadés** :
   - Le dossier `.next/` doit être uploadé sur Hostinger
   - Les fichiers `node_modules/` doivent être installés sur le serveur
   - Le fichier `package.json` doit être présent

3. **Vérifier la commande de start** :
   - Dans Hostinger : `npm start` (pas `npm run dev`)
   - L'application doit utiliser `next start` en production

---

## ✅ Solution 4 : Configuration Next.js optimale pour Hostinger

Mettez à jour `next.config.js` :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Si l'app est servie sur un sous-chemin, décommentez :
  // basePath: '/jeu',
  
  // Important : Ne pas utiliser output: 'export' pour un serveur Node.js
  // output: 'export',  // ❌ NE PAS UTILISER pour Hostinger Cloud Startup
  
  // Optimisations
  compress: true,
  poweredByHeader: false,
  
  // ... reste de la config
};
```

---

## 🔍 Diagnostic

Pour diagnostiquer le problème :

1. **Vérifier les logs Hostinger** :
   - Regardez les logs de build
   - Vérifiez les logs de l'application en cours d'exécution

2. **Vérifier les routes** :
   - Accédez à `https://votre-domaine.hostingersite.com/_next/static/chunks/`
   - Si vous obtenez une 404, le problème est la configuration du serveur

3. **Vérifier la console navigateur** :
   - Regardez l'onglet Network
   - Vérifiez quelles URLs sont appelées pour les chunks
   - Vérifiez si les URLs sont correctes

---

## 📝 Checklist de Résolution

- [ ] Vérifier que `basePath` est correctement configuré (ou absent si racine)
- [ ] Vérifier que le build est complet (`.next/` présent)
- [ ] Vérifier que `npm start` est utilisé (pas `npm run dev`)
- [ ] Vérifier que tous les fichiers sont uploadés
- [ ] Vérifier la configuration Hostinger (racine vs sous-chemin)
- [ ] Vérifier les logs Hostinger pour erreurs
- [ ] Tester l'accès direct aux chunks dans le navigateur

---

## 🚀 Solution Rapide (Si app à la racine)

Si votre application est servie à la racine (`darkgreen-pheasant-730781.hostingersite.com`), **ne mettez PAS** `basePath` dans `next.config.js`.

Le fichier `next.config.js` actuel devrait fonctionner. Le problème vient probablement de :
1. Build incomplet
2. Fichiers non uploadés
3. Configuration Hostinger incorrecte

---

## 📞 Support Hostinger

Si le problème persiste, contactez le support Hostinger avec :
- Les logs de build
- Les logs de l'application
- L'URL exacte de votre application
- La configuration de votre application Cloud Startup



