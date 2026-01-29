# 🔍 Debug : Pourquoi ça redirige vers zig-zag.fun au lieu de game.zig-zag.fun

## 🎯 Problème

Après la connexion Google, l'utilisateur est redirigé vers `zig-zag.fun` au lieu de `game.zig-zag.fun/auth/callback`.

## 🔍 Causes possibles

### Cause 1 : Supabase utilise le "Site URL" par défaut

**Symptôme :** Supabase ignore le `redirectTo` et utilise le "Site URL" configuré dans le dashboard.

**Solution :**
1. Allez dans **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Vérifiez que **"Site URL"** est bien `https://zig-zag.fun`
3. **IMPORTANT :** Assurez-vous que `https://game.zig-zag.fun/auth/callback` est bien dans les **"Redirect URLs"**
4. Si `https://game.zig-zag.fun/auth/callback` n'est PAS dans les Redirect URLs, Supabase peut ignorer le `redirectTo`

### Cause 2 : Le redirectTo n'est pas dans les URLs autorisées

**Symptôme :** Supabase refuse de rediriger vers une URL non autorisée.

**Solution :**
1. Vérifiez que `https://game.zig-zag.fun/auth/callback` est dans les **"Redirect URLs"** de Supabase
2. Vérifiez que l'URL correspond **EXACTEMENT** (pas d'espace, pas de `/` en trop)

### Cause 3 : Google Cloud Console bloque la redirection

**Symptôme :** Erreur "redirect_uri_mismatch" dans la console.

**Solution :**
1. Vérifiez que `https://game.zig-zag.fun/auth/callback` est dans les **"Authorized redirect URIs"** de Google Cloud Console
2. Les URLs doivent correspondre **EXACTEMENT**

## ✅ Solution Complète

### Étape 1 : Vérifier Supabase Dashboard

1. Allez sur [Supabase Dashboard](https://app.supabase.com/)
2. Projet : `tihrltssmpxpreadpzqm`
3. **Authentication** → **URL Configuration**

**Vérifiez :**
- **Site URL** : `https://zig-zag.fun`
- **Redirect URLs** doit contenir **EXACTEMENT** :
  ```
  https://game.zig-zag.fun/auth/callback
  https://game.zig-zag.fun/jeu
  https://zig-zag.fun/jouer
  http://localhost:3000/auth/callback
  http://localhost:3000/jeu
  ```

**⚠️ CRITIQUE :** Si `https://game.zig-zag.fun/auth/callback` n'est PAS dans cette liste, Supabase **ignorera** le `redirectTo` et utilisera le "Site URL" par défaut.

### Étape 2 : Vérifier Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Éditez votre OAuth 2.0 Client ID

**Vérifiez :**
- **Authorized redirect URIs** doit contenir :
  ```
  https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
  https://game.zig-zag.fun/auth/callback
  https://zig-zag.fun/jouer
  http://localhost:3000/auth/callback
  ```

### Étape 3 : Vérifier le code

Dans `jouer.html`, le `redirectTo` doit être :

```javascript
redirectTo = 'https://game.zig-zag.fun/auth/callback';
```

**PAS :**
- ❌ `'https://game.zig-zag.fun'` (sans /auth/callback)
- ❌ `'https://zig-zag.fun/auth/callback'` (mauvais domaine)
- ❌ `'game.zig-zag.fun/auth/callback'` (sans https://)

## 🧪 Test de Diagnostic

### Test 1 : Vérifier les Redirect URLs dans Supabase

1. Allez dans Supabase Dashboard → Authentication → URL Configuration
2. Regardez la liste des "Redirect URLs"
3. **Cherchez** `https://game.zig-zag.fun/auth/callback`
4. Si elle n'y est **PAS**, ajoutez-la et sauvegardez

### Test 2 : Tester avec la console du navigateur

1. Allez sur `https://zig-zag.fun/jouer`
2. Ouvrez la console du navigateur (F12)
3. Cliquez sur "Continuer avec Google"
4. Regardez les messages dans la console
5. Regardez l'onglet **Network** pour voir quelles URLs sont appelées

### Test 3 : Vérifier l'URL après Google

1. Connectez-vous avec Google
2. **Regardez l'URL dans la barre d'adresse** juste après la connexion Google
3. Vous devriez voir quelque chose comme :
   - ✅ `game.zig-zag.fun/auth/callback#access_token=...` → **CORRECT**
   - ❌ `zig-zag.fun/jouer#access_token=...` → **PROBLÈME** (Supabase utilise le Site URL)
   - ❌ `zig-zag.fun#access_token=...` → **PROBLÈME** (Supabase utilise le Site URL)

## 🔧 Solution si Supabase ignore toujours le redirectTo

Si après avoir ajouté `https://game.zig-zag.fun/auth/callback` dans les Redirect URLs, Supabase redirige toujours vers `zig-zag.fun`, essayez :

### Option 1 : Changer le Site URL temporairement

1. Dans Supabase Dashboard → Authentication → URL Configuration
2. Changez **"Site URL"** en `https://game.zig-zag.fun`
3. Testez
4. Si ça marche, remettez `https://zig-zag.fun` et gardez `https://game.zig-zag.fun/auth/callback` dans les Redirect URLs

### Option 2 : Utiliser skipBrowserRedirect

Si le problème persiste, on peut gérer la redirection manuellement, mais c'est plus complexe.

## 📝 Checklist de Vérification

Avant de tester, vérifiez **TOUT** :

- [ ] **Supabase** : Site URL = `https://zig-zag.fun`
- [ ] **Supabase** : Redirect URLs contient `https://game.zig-zag.fun/auth/callback` (EXACTEMENT, copié-collé)
- [ ] **Supabase** : Google OAuth activé
- [ ] **Google Cloud** : Authorized redirect URIs contient `https://game.zig-zag.fun/auth/callback`
- [ ] **jouer.html** : `redirectTo = 'https://game.zig-zag.fun/auth/callback'` (en production)
- [ ] **Cache navigateur** : Vidé (Ctrl+Shift+R)
- [ ] **Test en navigation privée** : Pour éviter les problèmes de cache

## 🎯 Action Immédiate

**La chose la plus importante à vérifier MAINTENANT :**

1. Allez dans **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Regardez la liste des **"Redirect URLs"**
3. **Cherchez** `https://game.zig-zag.fun/auth/callback`
4. Si elle n'y est **PAS**, ajoutez-la **EXACTEMENT** comme ça (copiez-collez) :
   ```
   https://game.zig-zag.fun/auth/callback
   ```
5. Cliquez sur **"Save"**
6. Attendez 1-2 minutes (propagation)
7. Testez à nouveau

**C'est probablement ça le problème !** Supabase ignore le `redirectTo` si l'URL n'est pas dans la liste des Redirect URLs autorisées.
