# 🔍 Diagnostic : Erreur de chargement des chunks

## 🚨 Problème Persistant

L'erreur `Failed to load chunk /_next/static/chunks/5d286a95efa51e12.js` persiste même après l'ajout de `basePath`.

## 🔍 Causes Possibles

### 1. Build non relancé après modification de basePath
**Symptôme** : Les chunks sont toujours générés avec l'ancien chemin.

**Solution** :
- Supprimer complètement le dossier `.next/` sur le serveur
- Relancer `npm run build` sur Hostinger
- Vérifier que les nouveaux chunks sont générés

### 2. L'application est servie à la racine, pas sur /jeu
**Symptôme** : L'URL montre `/jeu/...` mais Hostinger sert l'app à la racine.

**Vérification** :
- Dans Hostinger Cloud Startup, vérifiez l'URL de base de l'application
- Si l'app est servie à la racine (`/`), **retirez** `basePath: '/jeu'`

**Solution** :
```javascript
// next.config.js - Si app servie à la racine
const nextConfig = {
  // basePath: '/jeu',  // ← Commentez ou supprimez cette ligne
  // ... reste
};
```

### 3. Problème de configuration Hostinger
**Symptôme** : Les fichiers statiques ne sont pas servis correctement.

**Vérifications** :
- Les fichiers `.next/static/` sont-ils accessibles ?
- Testez : `https://votre-domaine/_next/static/chunks/` (devrait retourner 404 ou liste)
- Vérifiez les permissions des fichiers

### 4. Cache navigateur
**Symptôme** : L'ancien build est en cache.

**Solution** :
- Vider le cache du navigateur (Ctrl+Shift+Delete)
- Tester en navigation privée
- Hard refresh (Ctrl+Shift+R)

## 🎯 Solution Recommandée : Servir à la Racine

**Si possible**, configurez Hostinger pour servir l'application **à la racine** (`/`) au lieu de `/jeu` :

1. **Dans Hostinger Cloud Startup** :
   - Configurez l'application pour servir sur `/` (racine)
   - Pas de sous-chemin

2. **Dans `next.config.js`** :
   ```javascript
   const nextConfig = {
     // basePath: '/jeu',  // ← Retirez cette ligne
     // ... reste
   };
   ```

3. **Remettez tous les liens avec `/jeu/...`** dans le code

4. **Rebuild et redéployez**

## 🔧 Alternative : Vérifier la Configuration Actuelle

Pour déterminer la bonne configuration, testez :

1. **Accédez directement à un chunk** :
   ```
   https://darkgreen-pheasant-730781.hostingersite.com/_next/static/chunks/...
   ```
   - Si 404 → L'app est probablement sur `/jeu`, gardez `basePath`
   - Si accessible → L'app est à la racine, retirez `basePath`

2. **Vérifiez l'URL de base dans Hostinger** :
   - Regardez la configuration de votre application Cloud Startup
   - Quelle est l'URL de base configurée ?

## 📝 Checklist de Diagnostic

- [ ] Le build a-t-il été relancé après modification de `basePath` ?
- [ ] Le dossier `.next/` a-t-il été régénéré ?
- [ ] L'application est-elle servie sur `/` ou `/jeu` dans Hostinger ?
- [ ] Les fichiers statiques sont-ils accessibles directement ?
- [ ] Le cache du navigateur a-t-il été vidé ?
- [ ] Y a-t-il des erreurs dans les logs Hostinger ?

## 🆘 Solution d'Urgence

Si le problème persiste, essayez cette configuration minimale :

```javascript
// next.config.js
const nextConfig = {
  // Retirez basePath temporairement pour tester
  // basePath: '/jeu',
  
  compress: true,
  poweredByHeader: false,
};
```

Puis rebuild et testez. Si ça fonctionne, le problème vient de `basePath`. Si ça ne fonctionne pas, le problème vient d'ailleurs (build, upload, permissions, etc.).



