# 🚀 Déploiement Rapide sur game.zig-zag.fun

## ⚠️ IMPORTANT : Vous DEVEZ déployer sur game.zig-zag.fun !

Sans déploiement, la page `/auth/callback` n'existe pas et OAuth ne fonctionnera pas.

---

## 📋 Procédure en 3 Étapes

### ÉTAPE 1 : Build de l'application

```bash
cd Zig-Zag/game-app
rm -rf .next out
npm install
npm run build
```

**Vérifiez que ça a marché :**
```bash
ls -la out/
```

Vous devriez voir :
- `out/index.html`
- `out/auth/callback/` (dossier avec index.html)
- `out/jeu/` (dossier)
- `out/_next/` (dossier avec les chunks)

### ÉTAPE 2 : Vérifier la page /auth/callback

```bash
ls -la out/auth/callback/
```

**Vous DEVEZ voir `index.html` dans ce dossier.**

Si le dossier n'existe pas :
- Le build a échoué
- Vérifiez les erreurs dans le terminal
- Vérifiez que `src/app/auth/callback/page.tsx` existe

### ÉTAPE 3 : Uploader sur game.zig-zag.fun

**Uploadez TOUT le contenu du dossier `out/` sur `game.zig-zag.fun`**

**Structure finale sur le serveur :**
```
game.zig-zag.fun/
├── _next/
│   └── static/
│       ├── chunks/
│       └── css/
├── auth/
│   └── callback/
│       └── index.html  ← CRITIQUE
├── jeu/
│   └── index.html
├── index.html
└── .htaccess
```

**Comment uploader :**
1. Via FTP/SFTP : Connectez-vous et uploadez tout le contenu de `out/`
2. Via File Manager Hostinger : Uploadez tous les fichiers
3. **N'oubliez pas** d'uploader aussi le `.htaccess` depuis `game-app/.htaccess`

---

## ✅ Tests Après Déploiement

### Test 1 : Page /auth/callback

Allez sur : `https://game.zig-zag.fun/auth/callback`

**Résultat attendu :**
- ✅ La page se charge (même si elle redirige)
- ❌ **404** → La page n'existe pas, vérifiez l'upload

### Test 2 : Page /jeu

Allez sur : `https://game.zig-zag.fun/jeu`

**Résultat attendu :**
- ✅ L'interface de sélection de mode s'affiche
- ❌ **"Chargement..."** infini → Problème de chunks
- ❌ **Erreur** → Vérifiez la console (F12)

### Test 3 : OAuth Complet

1. Allez sur `https://zig-zag.fun/jouer`
2. Cliquez sur "Continuer avec Google"
3. Connectez-vous
4. **Observez l'URL** :
   - `zig-zag.fun/oauth-callback#tokens` → Puis
   - `game.zig-zag.fun/auth/callback#tokens` → Puis
   - `game.zig-zag.fun/jeu` ✅

---

## 🐛 Si ça ne marche pas

### Erreur : "Failed to load chunk"

**Solution :**
1. Vérifiez que `out/_next/static/chunks/` est uploadé
2. Vérifiez que le `.htaccess` est uploadé avec les règles MIME types
3. Videz le cache du navigateur (Ctrl+Shift+R)

### Erreur : 404 sur /auth/callback

**Solution :**
1. Vérifiez que `out/auth/callback/index.html` existe après le build
2. Vérifiez que ce fichier est uploadé sur `game.zig-zag.fun`
3. Rebuild si nécessaire : `npm run build`

### Toujours redirigé vers zig-zag.fun

**Solution :**
1. Vérifiez que `oauth-callback.html` est uploadé sur `zig-zag.fun`
2. Vérifiez que `https://zig-zag.fun/oauth-callback` est dans les Redirect URLs de Supabase
3. Testez en navigation privée

---

## 📝 Checklist Finale

- [ ] **Build réussi** : `npm run build` terminé sans erreur
- [ ] **out/auth/callback/index.html existe** : Vérifié avec `ls -la out/auth/callback/`
- [ ] **out/_next/ existe** : Vérifié avec `ls -la out/_next/`
- [ ] **Upload complet** : Tous les fichiers de `out/` uploadés
- [ ] **.htaccess uploadé** : Sur `game.zig-zag.fun`
- [ ] **Test /auth/callback** : `https://game.zig-zag.fun/auth/callback` se charge
- [ ] **Test /jeu** : `https://game.zig-zag.fun/jeu` affiche l'interface
- [ ] **Test OAuth** : Le flux complet fonctionne

---

## 🎯 Résumé

**OUI, vous devez déployer sur game.zig-zag.fun :**

1. **Build** : `cd game-app && npm run build`
2. **Vérifier** : `ls -la out/auth/callback/` doit montrer `index.html`
3. **Uploader** : Tout le contenu de `out/` sur `game.zig-zag.fun`
4. **Tester** : `https://game.zig-zag.fun/auth/callback` doit se charger

**Sans ça, OAuth ne fonctionnera jamais car la page `/auth/callback` n'existera pas !**
