# 🔧 Fix : Problème de redirection Google OAuth

## Problème identifié

L'authentification Google OAuth ne fonctionne pas correctement car :

1. **Le `redirectTo` pointe vers la racine** au lieu de `/auth/callback`
2. **Les URLs de redirection ne sont pas configurées** dans Supabase Dashboard
3. **Les URLs ne sont pas configurées** dans Google Cloud Console

## ✅ Corrections apportées

### 1. Correction du `redirectTo` dans `jouer.html`

**Avant :**
```javascript
redirectTo = 'https://game.zig-zag.fun';
```

**Après :**
```javascript
redirectTo = 'https://game.zig-zag.fun/auth/callback';
```

Le `redirectTo` doit maintenant pointer vers `/auth/callback` pour que la page de callback Next.js puisse traiter les tokens.

### 2. Suppression du gestionnaire de retour OAuth inutile

Le code qui gérait le retour OAuth dans `jouer.html` a été supprimé car Supabase redirige automatiquement vers l'URL spécifiée dans `redirectTo`.

## 🔧 Configuration requise dans Supabase Dashboard

### Étape 1 : Configurer les Redirect URLs

1. Allez sur [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionnez votre projet : `tihrltssmpxpreadpzqm`
3. Allez dans **"Authentication"** → **"URL Configuration"**
4. Dans **"Redirect URLs"**, ajoutez ces URLs (une par ligne) :

```
https://game.zig-zag.fun/auth/callback
https://game.zig-zag.fun/jeu
https://zig-zag.fun/jouer
http://localhost:3000/auth/callback
http://localhost:3000/jeu
```

5. Cliquez sur **"Save"**

### Étape 2 : Vérifier la configuration Google OAuth

1. Dans Supabase Dashboard, allez dans **"Authentication"** → **"Providers"**
2. Trouvez **"Google"** dans la liste
3. Vérifiez que :
   - ✅ Le toggle **"Enable Google provider"** est activé
   - ✅ Le **Client ID** est rempli
   - ✅ Le **Client Secret** est rempli
4. Si ce n'est pas le cas, suivez le guide `GOOGLE_OAUTH_SETUP.md`

## 🔧 Configuration requise dans Google Cloud Console

### Étape 1 : Vérifier les Authorized redirect URIs

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Allez dans **"APIs & Services"** → **"Credentials"**
3. Trouvez votre OAuth 2.0 Client ID
4. Cliquez pour l'éditer
5. Dans **"Authorized redirect URIs"**, assurez-vous d'avoir :

```
https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
https://game.zig-zag.fun/auth/callback
https://zig-zag.fun/jouer
http://localhost:3000/auth/callback
```

6. Cliquez sur **"Save"**

## 🔄 Flux OAuth corrigé

1. **Utilisateur clique sur "Continuer avec Google"** sur `zig-zag.fun/jouer`
2. **Redirection vers Google** pour l'authentification
3. **Google redirige vers Supabase** avec le code d'autorisation
4. **Supabase échange le code** contre des tokens
5. **Supabase redirige vers** `https://game.zig-zag.fun/auth/callback#access_token=...&refresh_token=...`
6. **La page `/auth/callback`** :
   - Détecte les tokens dans l'URL hash
   - Stocke la session dans localStorage
   - Nettoie l'URL
   - Redirige vers `/jeu`

## 🧪 Test

1. Allez sur `https://zig-zag.fun/jouer`
2. Cliquez sur **"Continuer avec Google"**
3. Connectez-vous avec votre compte Google
4. Vous devriez être redirigé vers `https://game.zig-zag.fun/auth/callback`
5. Puis automatiquement vers `https://game.zig-zag.fun/jeu`
6. Vous devriez être connecté (vérifiez avec le menu utilisateur dans le header)

## 🐛 Dépannage

### Erreur : "redirect_uri_mismatch"

**Cause :** L'URL de redirection n'est pas autorisée dans Google Cloud Console ou Supabase.

**Solution :**
1. Vérifiez que `https://game.zig-zag.fun/auth/callback` est dans les "Authorized redirect URIs" de Google Cloud Console
2. Vérifiez que `https://game.zig-zag.fun/auth/callback` est dans les "Redirect URLs" de Supabase
3. Les URLs doivent correspondre **exactement** (pas d'espace, pas de `/` en trop)

### Erreur : "invalid_client"

**Cause :** Le Client ID ou Client Secret est incorrect dans Supabase.

**Solution :**
1. Vérifiez les credentials dans Supabase Dashboard → Authentication → Providers → Google
2. Vérifiez qu'il n'y a pas d'espaces avant/après les credentials
3. Recopiez les credentials depuis Google Cloud Console si nécessaire

### La connexion fonctionne mais la redirection ne marche pas

**Cause :** La page `/auth/callback` n'existe pas ou ne fonctionne pas correctement.

**Solution :**
1. Vérifiez que le fichier `/game-app/src/app/auth/callback/page.tsx` existe
2. Vérifiez que le build Next.js inclut cette page
3. Vérifiez les logs dans la console du navigateur (F12)

### Le bouton Google ne fait rien

**Cause :** Erreur JavaScript ou configuration Supabase incorrecte.

**Solution :**
1. Ouvrez la console du navigateur (F12)
2. Regardez les erreurs affichées
3. Vérifiez que Supabase est bien configuré avec le provider Google activé
4. Vérifiez que les variables `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont correctes dans `jouer.html`

## 📝 Notes importantes

- **Environnement de développement** : Utilisez `http://localhost:3000/auth/callback`
- **Environnement de production** : Utilisez `https://game.zig-zag.fun/auth/callback`
- **Sécurité** : Ne partagez jamais le Client Secret publiquement
- **URLs de redirection** : Toutes les URLs utilisées doivent être ajoutées dans Google Cloud Console ET Supabase
