# 🚨 Fix Urgent : Erreur de chargement des chunks Next.js

## Problème

L'erreur `Failed to load chunk /_next/static/chunks/11e31d8eb1fee314.js` indique que Next.js ne trouve pas ses fichiers statiques.

## 🔍 Diagnostic

D'après l'URL `darkgreen-pheasant-730781.hostingersite.com/jeu/...`, votre application est servie sur le sous-chemin `/jeu`.

**Le problème** : Next.js ne sait pas qu'il est sur un sous-chemin, donc il cherche les chunks à `/_next/static/...` au lieu de `/jeu/_next/static/...`.

## ✅ Solution Immédiate

### Option 1 : Si l'app est sur `/jeu` (sous-chemin)

Modifiez `next.config.js` :

```javascript
const nextConfig = {
  basePath: '/jeu',  // ← Ajoutez cette ligne
  // ... reste de la config
};
```

**Puis** :
1. Rebuild : `npm run build`
2. Re-uploader sur Hostinger
3. Redémarrer l'application

### Option 2 : Si l'app doit être à la racine

Dans Hostinger Cloud Startup :
1. Configurez l'application pour servir à la racine `/` (pas `/jeu`)
2. Gardez `basePath` commenté dans `next.config.js`
3. Rebuild et redéployez

## ⚠️ Important après ajout de basePath

Si vous ajoutez `basePath: '/jeu'`, vous devez aussi :

1. **Mettre à jour tous les liens** dans votre code :
   ```tsx
   // ❌ Avant
   <Link href="/jeu/matchmaking">
   
   // ✅ Après (si basePath = '/jeu')
   <Link href="/matchmaking">  // Next.js ajoutera automatiquement /jeu
   ```

2. **Mettre à jour les routes dans `constants/index.ts`** :
   ```typescript
   export const ROUTES = {
     HOME: '/',
     GAME: '/',  // Devient '/' car basePath ajoute déjà /jeu
     MATCHMAKING: '/matchmaking',  // Pas besoin de /jeu
     // ...
   };
   ```

## 🔧 Alternative : Configuration Hostinger

Si possible, configurez Hostinger pour servir l'application **à la racine** au lieu d'un sous-chemin. C'est plus simple et évite les problèmes de `basePath`.

## 📝 Checklist

- [ ] Déterminer si l'app est sur `/jeu` ou à la racine
- [ ] Ajouter `basePath: '/jeu'` si nécessaire
- [ ] Mettre à jour les liens dans le code
- [ ] Rebuild : `npm run build`
- [ ] Re-uploader sur Hostinger
- [ ] Redémarrer l'application
- [ ] Tester l'accès aux chunks : `https://votre-domaine/_next/static/chunks/...`

## 🆘 Si le problème persiste

1. Vérifiez les logs Hostinger pour voir les erreurs exactes
2. Vérifiez que le dossier `.next/` est bien uploadé
3. Vérifiez que `npm start` est utilisé (pas `npm run dev`)
4. Contactez le support Hostinger avec les logs



