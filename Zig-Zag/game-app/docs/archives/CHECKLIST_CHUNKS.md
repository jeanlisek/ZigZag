# ✅ Checklist : Résoudre l'erreur "Failed to load chunk"

## Problème
L'erreur `Failed to load chunk /_next/static/chunks/3543f5afe05bb4ed.js` indique que Next.js ne trouve pas ses fichiers de chunks JavaScript.

## Causes possibles

1. **Les chunks ne sont pas uploadés sur le serveur**
2. **Le dossier `_next/` n'est pas accessible**
3. **Les chemins dans le HTML sont incorrects**
4. **Le .htaccess bloque l'accès aux chunks**

## Solutions

### 1. Vérifier que le build est complet

```bash
cd Zig-Zag/game-app
npm run build
```

Vérifiez que le dossier `out/` contient :
- ✅ `out/_next/static/chunks/` (dossier avec les fichiers .js)
- ✅ `out/_next/static/css/` (dossier avec les fichiers .css)
- ✅ `out/index.html`
- ✅ Tous les autres fichiers

### 2. Vérifier la structure sur le serveur

Sur `game.zig-zag.fun`, la structure doit être :
```
/
├── _next/
│   └── static/
│       ├── chunks/
│       │   └── [fichiers .js]
│       └── css/
│           └── [fichiers .css]
├── index.html
├── jeu/
│   ├── index.html
│   └── ...
└── .htaccess
```

### 3. Vérifier le .htaccess

Le `.htaccess` doit :
- ✅ Ne PAS réécrire les URLs `/_next/`
- ✅ Servir les fichiers JS avec le bon MIME type
- ✅ Permettre l'accès aux fichiers statiques

### 4. Tester l'accès direct aux chunks

Dans votre navigateur, essayez d'accéder directement à un chunk :
```
https://game.zig-zag.fun/_next/static/chunks/3543f5afe05bb4ed.js
```

**Résultats attendus :**
- ✅ **200 OK** : Le fichier existe et est accessible
- ❌ **404 Not Found** : Le fichier n'existe pas → Vérifier l'upload
- ❌ **500 Error** : Problème serveur → Vérifier le .htaccess
- ❌ **MIME type incorrect** : Vérifier les règles MIME dans .htaccess

### 5. Vérifier les chemins dans le HTML

Ouvrez `out/index.html` et cherchez les références aux chunks :
```html
<script src="/_next/static/chunks/3543f5afe05bb4ed.js"></script>
```

Les chemins doivent commencer par `/_next/` (chemin absolu depuis la racine).

### 6. Vider le cache

1. **Cache navigateur** : Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
2. **Cache serveur** : Vider le cache du CDN/serveur si applicable

## Actions immédiates

1. ✅ **Rebuild complet** :
   ```bash
   cd Zig-Zag/game-app
   rm -rf .next out
   npm run build
   ```

2. ✅ **Vérifier le dossier out/** :
   ```bash
   ls -la out/_next/static/chunks/ | head -5
   ```

3. ✅ **Uploader TOUT le contenu de `out/`** sur `game.zig-zag.fun`

4. ✅ **Vérifier que `.htaccess` est uploadé** à la racine

5. ✅ **Tester l'accès direct** à un chunk dans le navigateur

## Si le problème persiste

1. **Vérifier les logs serveur** (erreurs Apache/Nginx)
2. **Vérifier les permissions** des fichiers (644 pour les fichiers, 755 pour les dossiers)
3. **Vérifier que mod_rewrite est activé** sur Apache
4. **Vérifier que mod_headers est activé** sur Apache

## Test final

Après toutes ces étapes, la page devrait :
- ✅ Charger sans erreur "Failed to load chunk"
- ✅ Afficher l'interface utilisateur
- ✅ Les fichiers JS/CSS doivent être chargés (vérifier dans l'onglet Network)
