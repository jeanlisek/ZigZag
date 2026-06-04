# 🔧 Fix : CSS ne se charge pas sur le serveur

## ❌ Problème

Le design qui fonctionne en local n'apparaît pas sur le serveur déployé. L'avertissement indique :
```
The resource https://game.zig-zag.fun/_next/static/chunks/79cc8bba71cb3498.css 
was preloaded using link preload but not used within a few seconds from the window's load event.
```

**Symptômes :**
- Le design ne s'affiche pas (pas de styles)
- Les fichiers CSS sont préchargés mais non utilisés
- Possible erreur 404 pour les fichiers CSS

## 🔍 Diagnostic

### Étape 1 : Vérifier que les fichiers CSS sont uploadés

Vérifiez que ces dossiers existent sur le serveur :
- ✅ `game.zig-zag.fun/_next/static/chunks/` (doit contenir des fichiers `.css`)
- ✅ `game.zig-zag.fun/_next/static/css/` (doit contenir des fichiers `.css`)

**Test rapide :**
```bash
# Vérifier si un fichier CSS est accessible
curl -I https://game.zig-zag.fun/_next/static/chunks/79cc8bba71cb3498.css

# Doit retourner :
# HTTP/1.1 200 OK
# Content-Type: text/css; charset=utf-8
```

### Étape 2 : Vérifier le Content-Type

Ouvrez la console du navigateur (F12) et vérifiez :
1. Onglet **Network** (Réseau)
2. Filtrez par **CSS**
3. Cliquez sur un fichier CSS
4. Vérifiez que **Content-Type** est `text/css`

Si c'est `text/html` ou autre chose, le problème vient du `.htaccess`.

### Étape 3 : Vérifier les erreurs 404

Dans la console du navigateur :
1. Onglet **Console**
2. Cherchez les erreurs 404 pour les fichiers CSS
3. Si vous voyez des 404, les fichiers ne sont pas uploadés

## ✅ Solutions

### Solution 1 : Vérifier l'upload des fichiers

**CRITIQUE :** Assurez-vous d'avoir uploadé **TOUT** le contenu de `out/`, y compris :
- ✅ `out/_next/static/chunks/` (dossier complet avec tous les fichiers `.css` et `.js`)
- ✅ `out/_next/static/css/` (dossier complet)
- ✅ `out/.htaccess` (fichier à la racine)

**Structure attendue sur le serveur :**
```
game.zig-zag.fun/
├── _next/
│   └── static/
│       ├── chunks/
│       │   ├── 79cc8bba71cb3498.css  ← DOIT EXISTER
│       │   ├── [autres fichiers .css]
│       │   └── [fichiers .js]
│       └── css/
│           └── [fichiers .css]
├── .htaccess  ← DOIT EXISTER
├── index.html
└── [autres fichiers]
```

### Solution 2 : Vérifier le .htaccess

Le `.htaccess` doit être à la **racine** de `game.zig-zag.fun/` (pas dans un sous-dossier).

Vérifiez que le `.htaccess` contient bien :
```apache
# PRIORITÉ 1 : Ne JAMAIS toucher aux fichiers _next/
RewriteCond %{REQUEST_URI} ^/_next/
RewriteRule ^ - [L]
```

### Solution 3 : Forcer le rechargement

Après avoir uploadé les fichiers :
1. **Videz le cache du navigateur** (Ctrl+Shift+R ou Cmd+Shift+R)
2. Ou ouvrez en navigation privée
3. Vérifiez que les CSS se chargent maintenant

### Solution 4 : Vérifier les permissions

Sur le serveur, vérifiez que les fichiers CSS sont lisibles :
```bash
# Les fichiers doivent avoir les permissions 644
chmod 644 _next/static/chunks/*.css
chmod 644 _next/static/css/*.css
```

## 🚀 Checklist de déploiement

### Avant l'upload
- [ ] Build réussi : `npm run build` ou `./build-and-deploy.sh`
- [ ] Vérifier que `out/_next/static/chunks/` contient des fichiers `.css`
- [ ] Vérifier que `out/.htaccess` existe

### Pendant l'upload
- [ ] Uploader **TOUT** le contenu de `out/` (y compris `_next/`)
- [ ] Uploader `out/.htaccess` à la racine de `game.zig-zag.fun/`
- [ ] Vérifier que la structure des dossiers est correcte

### Après l'upload
- [ ] Tester : `https://game.zig-zag.fun/_next/static/chunks/[nom-fichier].css` (doit retourner du CSS)
- [ ] Vérifier dans la console du navigateur qu'il n'y a pas d'erreurs 404
- [ ] Vérifier que le Content-Type est `text/css`
- [ ] Vider le cache et recharger

## 🔍 Commandes de diagnostic

### Vérifier si un fichier CSS existe
```bash
curl -I https://game.zig-zag.fun/_next/static/chunks/79cc8bba71cb3498.css
```

### Vérifier le Content-Type
```bash
curl -I https://game.zig-zag.fun/_next/static/chunks/79cc8bba71cb3498.css | grep Content-Type
# Doit afficher : Content-Type: text/css; charset=utf-8
```

### Lister les fichiers CSS uploadés
```bash
# Via FTP ou SSH, vérifier :
ls -la _next/static/chunks/*.css
ls -la _next/static/css/*.css
```

## 📝 Notes importantes

- **Ne jamais oublier le dossier `_next/`** lors de l'upload
- Le `.htaccess` doit être à la racine, pas dans un sous-dossier
- Les fichiers CSS doivent avoir le Content-Type `text/css`
- Vider le cache du navigateur après chaque upload

## 🐛 Si le problème persiste

1. **Vérifiez les logs Apache** pour voir les erreurs 404
2. **Vérifiez que mod_headers est activé** sur le serveur
3. **Vérifiez que mod_rewrite est activé** sur le serveur
4. **Contactez le support Hostinger** si les modules Apache ne sont pas activés

