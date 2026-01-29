# ✅ Checklist : Configuration OAuth Google

## 🔴 Actions OBLIGATOIRES à faire

### 📋 1. Configuration dans Supabase Dashboard

**URL :** https://app.supabase.com/project/tihrltssmpxpreadpzqm/auth/url-configuration

#### Étape 1.1 : Configurer les Redirect URLs

1. Allez dans **"Authentication"** → **"URL Configuration"**
2. Dans la section **"Redirect URLs"**, ajoutez ces URLs (une par ligne) :

```
https://game.zig-zag.fun/auth/callback
https://game.zig-zag.fun/jeu
https://zig-zag.fun/jouer
http://localhost:3000/auth/callback
http://localhost:3000/jeu
```

3. Cliquez sur **"Save"**

**⚠️ IMPORTANT :** Ces URLs doivent être ajoutées pour que Supabase accepte les redirections OAuth.

#### Étape 1.2 : Vérifier la configuration Google OAuth

1. Allez dans **"Authentication"** → **"Providers"**
2. Trouvez **"Google"** dans la liste
3. Vérifiez que :
   - ✅ Le toggle **"Enable Google provider"** est **ACTIVÉ**
   - ✅ Le **Client ID (for OAuth)** est rempli
   - ✅ Le **Client Secret (for OAuth)** est rempli

**Si Google OAuth n'est pas configuré :**
- Suivez le guide `GOOGLE_OAUTH_SETUP.md` pour créer les credentials dans Google Cloud Console
- Puis revenez ici pour les ajouter dans Supabase

---

### 📋 2. Configuration dans Google Cloud Console

**URL :** https://console.cloud.google.com/apis/credentials

#### Étape 2.1 : Vérifier les Authorized redirect URIs

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet (celui utilisé pour ZigZag)
3. Allez dans **"APIs & Services"** → **"Credentials"**
4. Trouvez votre **OAuth 2.0 Client ID** (celui utilisé pour ZigZag)
5. Cliquez dessus pour l'éditer
6. Dans la section **"Authorized redirect URIs"**, vérifiez que vous avez **AU MOINS** :

```
https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
https://game.zig-zag.fun/auth/callback
```

**Si ces URLs ne sont pas présentes :**
- Cliquez sur **"+ ADD URI"**
- Ajoutez chaque URL une par une
- Cliquez sur **"Save"**

#### Étape 2.2 : Vérifier les Authorized JavaScript origins

Dans la même page, vérifiez que vous avez dans **"Authorized JavaScript origins"** :

```
https://tihrltssmpxpreadpzqm.supabase.co
https://zig-zag.fun
https://game.zig-zag.fun
http://localhost:3000
```

**Si ces URLs ne sont pas présentes :**
- Cliquez sur **"+ ADD URI"**
- Ajoutez chaque URL une par une
- Cliquez sur **"Save"**

---

## ✅ Vérification rapide

### Checklist Supabase
- [ ] Redirect URLs configurées (5 URLs minimum)
- [ ] Google OAuth provider activé
- [ ] Client ID rempli
- [ ] Client Secret rempli

### Checklist Google Cloud Console
- [ ] `https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback` dans Authorized redirect URIs
- [ ] `https://game.zig-zag.fun/auth/callback` dans Authorized redirect URIs
- [ ] Les origins JavaScript sont configurées

---

## 🧪 Test après configuration

1. Allez sur `https://zig-zag.fun/jouer`
2. Cliquez sur **"Continuer avec Google"**
3. Connectez-vous avec votre compte Google
4. **Résultat attendu :**
   - ✅ Redirection vers `https://game.zig-zag.fun/auth/callback`
   - ✅ Puis redirection automatique vers `https://game.zig-zag.fun/jeu`
   - ✅ Vous êtes connecté (menu utilisateur visible dans le header)

---

## 🐛 Si ça ne fonctionne pas

### Erreur : "redirect_uri_mismatch"

**Cause :** L'URL de redirection n'est pas autorisée.

**Solution :**
1. Vérifiez que `https://game.zig-zag.fun/auth/callback` est dans :
   - ✅ Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
   - ✅ Google Cloud Console → OAuth Client → Authorized redirect URIs
2. Les URLs doivent correspondre **exactement** (pas d'espace, pas de `/` en trop)

### Erreur : "invalid_client"

**Cause :** Le Client ID ou Client Secret est incorrect.

**Solution :**
1. Vérifiez les credentials dans Supabase Dashboard → Authentication → Providers → Google
2. Vérifiez qu'il n'y a pas d'espaces avant/après les credentials
3. Recopiez les credentials depuis Google Cloud Console si nécessaire

### La connexion fonctionne mais la redirection ne marche pas

**Cause :** La page `/auth/callback` n'existe pas ou ne fonctionne pas.

**Solution :**
1. Vérifiez que le build Next.js inclut la page `/auth/callback`
2. Vérifiez que le fichier existe : `game-app/src/app/auth/callback/page.tsx`
3. Rebuild l'application : `npm run build` dans `game-app/`

---

## 📝 Notes importantes

- **Temps de propagation :** Les changements dans Google Cloud Console peuvent prendre quelques minutes à se propager
- **Cache :** Videz le cache du navigateur (Ctrl+Shift+R) après les modifications
- **Sécurité :** Ne partagez jamais le Client Secret publiquement
- **Environnement local :** Utilisez `http://localhost:3000/auth/callback` pour tester en local

---

## 🎯 Résumé des URLs à configurer

### Supabase Dashboard → Redirect URLs
```
https://game.zig-zag.fun/auth/callback
https://game.zig-zag.fun/jeu
https://zig-zag.fun/jouer
http://localhost:3000/auth/callback
http://localhost:3000/jeu
```

### Google Cloud Console → Authorized redirect URIs
```
https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
https://game.zig-zag.fun/auth/callback
```

### Google Cloud Console → Authorized JavaScript origins
```
https://tihrltssmpxpreadpzqm.supabase.co
https://zig-zag.fun
https://game.zig-zag.fun
http://localhost:3000
```
