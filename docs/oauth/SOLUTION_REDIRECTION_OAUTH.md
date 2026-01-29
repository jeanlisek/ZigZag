# ✅ Solution : Redirection OAuth vers game.zig-zag.fun

## 🎯 Problème

Après la connexion Google, Supabase redirige vers `zig-zag.fun/` au lieu de `game.zig-zag.fun/auth/callback`.

**Cause :** Supabase ignore le `redirectTo` si l'URL n'est pas dans les Redirect URLs autorisées, ou utilise le "Site URL" par défaut.

## ✅ Solution Implémentée

### Stratégie : Page de redirection intermédiaire

Au lieu de rediriger directement vers `game.zig-zag.fun/auth/callback`, on redirige vers `zig-zag.fun/oauth-callback` qui :
1. Reçoit les tokens depuis Supabase
2. Redirige automatiquement vers `game.zig-zag.fun/auth/callback` avec les tokens

**Avantages :**
- ✅ `zig-zag.fun/oauth-callback` est dans le même domaine que le "Site URL" de Supabase
- ✅ Pas de problème de Redirect URLs
- ✅ Les tokens sont préservés et transférés vers `game.zig-zag.fun`

---

## 📋 Modifications Apportées

### 1. Nouveau fichier : `oauth-callback.html`

Créé dans `Zig-Zag/oauth-callback.html` :
- Reçoit les tokens OAuth depuis l'URL hash
- Redirige vers `game.zig-zag.fun/auth/callback` avec les tokens

### 2. Modification de `jouer.html`

Le `redirectTo` pointe maintenant vers `https://zig-zag.fun/oauth-callback` au lieu de `https://game.zig-zag.fun/auth/callback`.

### 3. Modification de `.htaccess`

Ajout d'une règle pour que `/oauth-callback` fonctionne sans extension `.html`.

---

## 🔧 Configuration Requise

### Étape 1 : Supabase Dashboard

1. Allez sur [Supabase Dashboard](https://app.supabase.com/)
2. Projet : `tihrltssmpxpreadpzqm`
3. **Authentication** → **URL Configuration**
4. Dans **"Redirect URLs"**, ajoutez :
   ```
   https://zig-zag.fun/oauth-callback
   https://zig-zag.fun/jouer
   https://game.zig-zag.fun/auth/callback
   https://game.zig-zag.fun/jeu
   http://localhost:3000/auth/callback
   http://localhost:3000/jeu
   ```
5. Cliquez sur **"Save"**

### Étape 2 : Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Éditez votre OAuth 2.0 Client ID
4. Dans **"Authorized redirect URIs"**, ajoutez :
   ```
   https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
   https://zig-zag.fun/oauth-callback
   https://game.zig-zag.fun/auth/callback
   http://localhost:3000/auth/callback
   ```
5. Cliquez sur **"SAVE"**

### Étape 3 : Upload des fichiers

1. **Uploader `oauth-callback.html`** sur `zig-zag.fun` (dans `public_html/`)
2. **Uploader `jouer.html`** modifié sur `zig-zag.fun`
3. **Uploader `.htaccess`** modifié sur `zig-zag.fun`

---

## 🔄 Nouveau Flux OAuth

```
1. Utilisateur sur zig-zag.fun/jouer
   ↓
2. Clic "Continuer avec Google"
   ↓
3. Redirection vers Google (accounts.google.com)
   ↓
4. Utilisateur se connecte/autorise
   ↓
5. Google redirige vers Supabase (tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback)
   ↓
6. Supabase échange le code contre des tokens
   ↓
7. Supabase redirige vers zig-zag.fun/oauth-callback#access_token=...&refresh_token=...
   ↓
8. La page oauth-callback.html :
   - Détecte les tokens dans l'URL hash
   - Redirige vers game.zig-zag.fun/auth/callback avec les tokens
   ↓
9. La page /auth/callback sur game.zig-zag.fun :
   - Détecte les tokens
   - Stocke la session dans localStorage
   - Redirige vers /jeu
   ↓
10. Utilisateur connecté ✅
```

---

## 🧪 Test

1. Allez sur `https://zig-zag.fun/jouer`
2. Cliquez sur **"Continuer avec Google"**
3. Connectez-vous avec votre compte Google
4. **Observez l'URL** :
   - Vous devriez être sur `zig-zag.fun/oauth-callback#access_token=...`
   - Puis automatiquement redirigé vers `game.zig-zag.fun/auth/callback#access_token=...`
   - Puis vers `game.zig-zag.fun/jeu`
5. Vous devriez être connecté ✅

---

## 🐛 Dépannage

### Problème : Toujours redirigé vers zig-zag.fun

**Vérifiez :**
1. Que `oauth-callback.html` est bien uploadé sur `zig-zag.fun`
2. Que `.htaccess` est bien uploadé avec la nouvelle règle
3. Que `https://zig-zag.fun/oauth-callback` est dans les Redirect URLs de Supabase

### Problème : Les tokens sont perdus

**Vérifiez :**
1. Que les tokens sont bien dans l'URL hash après la redirection Google
2. Que `oauth-callback.html` redirige bien avec les tokens dans l'URL hash
3. Ouvrez la console du navigateur (F12) pour voir les erreurs

### Problème : Erreur 404 sur /oauth-callback

**Solution :**
1. Vérifiez que `oauth-callback.html` est uploadé
2. Vérifiez que la règle `.htaccess` pour `/oauth-callback` est présente
3. Testez l'accès direct : `https://zig-zag.fun/oauth-callback`

---

## ✅ Checklist

- [ ] **Fichier créé** : `oauth-callback.html` existe
- [ ] **Code modifié** : `jouer.html` utilise `redirectTo = 'https://zig-zag.fun/oauth-callback'`
- [ ] **.htaccess modifié** : Règle pour `/oauth-callback` ajoutée
- [ ] **Supabase** : `https://zig-zag.fun/oauth-callback` dans Redirect URLs
- [ ] **Google Cloud** : `https://zig-zag.fun/oauth-callback` dans Authorized redirect URIs
- [ ] **Upload** : Tous les fichiers uploadés sur `zig-zag.fun`
- [ ] **Test** : Le flux fonctionne de bout en bout

---

## 🎯 Pourquoi cette solution fonctionne

1. **Supabase accepte** `zig-zag.fun/oauth-callback` car c'est le même domaine que le "Site URL"
2. **Pas de problème de Redirect URLs** car on reste sur le même domaine
3. **Les tokens sont préservés** et transférés vers `game.zig-zag.fun`
4. **Solution simple** et fiable

Cette approche contourne le problème de Supabase qui ignore le `redirectTo` vers un autre domaine.
