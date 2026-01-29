# 🔍 Diagnostic Complet - OAuth Ne Fonctionne Pas

## ❓ Questions à Répondre

Pour diagnostiquer le problème, j'ai besoin de savoir **exactement** ce qui se passe :

### 1. Où ça bloque ?

- [ ] **A. Sur `zig-zag.fun/jouer`** : Le bouton Google ne fait rien / erreur
- [ ] **B. Après Google** : Redirige vers `zig-zag.fun/` au lieu de `game.zig-zag.fun`
- [ ] **C. Sur `game.zig-zag.fun/auth/callback`** : Erreur 404
- [ ] **D. Sur `game.zig-zag.fun/jeu`** : L'utilisateur n'est pas connecté
- [ ] **E. Autre** : Décrivez

### 2. Messages d'erreur exacts

Ouvrez la console du navigateur (F12) et copiez :
- Les erreurs en rouge
- Les requêtes qui échouent (onglet Network)
- Les messages dans la console

### 3. URLs observées

Quand vous cliquez sur "Continuer avec Google", notez toutes les URLs dans la barre d'adresse :
1. `zig-zag.fun/jouer` → 
2. `accounts.google.com/...` → 
3. `???` → 
4. `???` → 
5. Finalement : `???`

---

## ✅ Checklist de Vérification

### ÉTAPE 1 : Build de l'application Next.js

```bash
cd Zig-Zag/game-app
rm -rf .next out
npm install
npm run build
```

**Vérifiez :**
```bash
ls -la out/auth/callback/
```

**Résultat attendu :** Vous devez voir `index.html`

**Si ça n'existe pas :** Le build a échoué ou la page n'existe pas dans le code.

---

### ÉTAPE 2 : Upload sur game.zig-zag.fun

**Vérifiez que ces fichiers existent sur le serveur :**

- [ ] `game.zig-zag.fun/auth/callback/index.html` existe
- [ ] `game.zig-zag.fun/jeu/index.html` existe
- [ ] `game.zig-zag.fun/_next/static/chunks/` contient des fichiers .js
- [ ] `game.zig-zag.fun/.htaccess` existe

**Test direct :**
Allez sur `https://game.zig-zag.fun/auth/callback` dans votre navigateur.

**Résultat attendu :**
- ✅ La page se charge (même si elle redirige)
- ❌ **404 Not Found** → La page n'est pas uploadée

---

### ÉTAPE 3 : Configuration Supabase

**Vérifiez dans Supabase Dashboard :**

1. Allez sur [Supabase Dashboard](https://app.supabase.com/)
2. Projet : `tihrltssmpxpreadpzqm`
3. **Authentication** → **URL Configuration**

**Dans "Redirect URLs", vous DEVEZ avoir :**
```
https://zig-zag.fun/oauth-callback
https://zig-zag.fun/jouer
https://game.zig-zag.fun/auth/callback
https://game.zig-zag.fun/jeu
```

**Dans "Site URL", vous DEVEZ avoir :**
```
https://zig-zag.fun
```

**Vérifiez aussi :**
- **Authentication** → **Providers** → **Google**
- Client ID et Client Secret sont bien configurés
- Le provider Google est **activé**

---

### ÉTAPE 4 : Configuration Google Cloud

**Vérifiez dans Google Cloud Console :**

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Éditez votre OAuth 2.0 Client ID

**Dans "Authorized redirect URIs", vous DEVEZ avoir :**
```
https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
https://zig-zag.fun/oauth-callback
https://game.zig-zag.fun/auth/callback
http://localhost:3000/auth/callback
```

---

### ÉTAPE 5 : Fichiers sur zig-zag.fun

**Vérifiez que ces fichiers existent sur `zig-zag.fun` :**

- [ ] `zig-zag.fun/oauth-callback.html` existe
- [ ] `zig-zag.fun/jouer.html` existe (version modifiée)
- [ ] `zig-zag.fun/.htaccess` contient la règle pour `/oauth-callback`

**Test direct :**
Allez sur `https://zig-zag.fun/oauth-callback` dans votre navigateur.

**Résultat attendu :**
- ✅ La page se charge avec "Connexion en cours..."
- ❌ **404 Not Found** → Le fichier n'est pas uploadé

---

### ÉTAPE 6 : Code dans jouer.html

**Vérifiez que `jouer.html` contient :**

```javascript
redirectTo = 'https://zig-zag.fun/oauth-callback';
```

**Pas :**
```javascript
redirectTo = 'https://game.zig-zag.fun/auth/callback';  // ❌ MAUVAIS
```

**Où vérifier :**
- Recherchez `signInWithOAuth` dans `jouer.html`
- Vérifiez que `redirectTo` pointe vers `zig-zag.fun/oauth-callback`

---

## 🐛 Problèmes Courants et Solutions

### Problème 1 : Erreur 404 sur /auth/callback

**Cause :** La page n'existe pas sur `game.zig-zag.fun`

**Solution :**
1. Build : `cd game-app && npm run build`
2. Vérifiez : `ls -la out/auth/callback/`
3. Uploadez : Tout le contenu de `out/` sur `game.zig-zag.fun`

---

### Problème 2 : Redirige toujours vers zig-zag.fun/

**Cause :** Supabase ignore le `redirectTo` et utilise le "Site URL"

**Solution :**
1. Vérifiez que `redirectTo = 'https://zig-zag.fun/oauth-callback'` dans `jouer.html`
2. Vérifiez que `oauth-callback.html` existe sur `zig-zag.fun`
3. Vérifiez que `https://zig-zag.fun/oauth-callback` est dans les Redirect URLs de Supabase
4. Testez en navigation privée (cache)

---

### Problème 3 : Erreur "redirect_uri_mismatch"

**Cause :** L'URL n'est pas dans les Authorized redirect URIs de Google

**Solution :**
1. Allez dans Google Cloud Console
2. Ajoutez `https://zig-zag.fun/oauth-callback` dans Authorized redirect URIs
3. Attendez 1-2 minutes pour la propagation

---

### Problème 4 : L'utilisateur n'est pas connecté sur game.zig-zag.fun

**Cause :** Les tokens ne sont pas transférés correctement

**Solution :**
1. Vérifiez que `oauth-callback.html` transfère bien les tokens dans l'URL hash
2. Vérifiez que `game.zig-zag.fun/auth/callback` détecte les tokens
3. Vérifiez la console du navigateur pour les erreurs

---

## 📝 Informations à Me Fournir

Pour que je puisse vous aider, j'ai besoin de :

1. **Où ça bloque exactement ?** (A, B, C, D, ou E ci-dessus)

2. **Messages d'erreur de la console** (F12 → Console)

3. **URLs observées** lors du flux OAuth complet

4. **Résultats des tests :**
   - `https://game.zig-zag.fun/auth/callback` → ???
   - `https://zig-zag.fun/oauth-callback` → ???

5. **Checklist complétée :**
   - [ ] Build fait
   - [ ] Upload sur game.zig-zag.fun fait
   - [ ] Supabase configuré
   - [ ] Google Cloud configuré
   - [ ] Fichiers sur zig-zag.fun uploadés

---

## 🎯 Actions Immédiates

1. **Faites le build :**
   ```bash
   cd Zig-Zag/game-app
   npm run build
   ```

2. **Vérifiez que la page existe :**
   ```bash
   ls -la out/auth/callback/
   ```

3. **Uploadez sur game.zig-zag.fun :**
   - Tout le contenu de `out/`
   - Le fichier `.htaccess` depuis `game-app/.htaccess`

4. **Testez :**
   - `https://game.zig-zag.fun/auth/callback`
   - `https://zig-zag.fun/oauth-callback`

5. **Testez OAuth complet :**
   - `https://zig-zag.fun/jouer` → Google → Observez les URLs

6. **Envoyez-moi :**
   - Où ça bloque
   - Les erreurs de la console
   - Les URLs observées
