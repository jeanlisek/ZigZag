# ✅ Actions Requises : Configuration OAuth Google

## 🎯 Résumé

Oui, vous devez configurer **2 choses** :
1. **Supabase Dashboard** : Ajouter les URLs de redirection
2. **Google Cloud Console** : Ajouter les URLs de redirection autorisées

---

## 📋 Action 1 : Configuration Supabase Dashboard

### Étape 1 : Accéder à la configuration

1. Allez sur [Supabase Dashboard](https://app.supabase.com/)
2. Connectez-vous avec votre compte
3. Sélectionnez votre projet : **`tihrltssmpxpreadpzqm`**
4. Dans le menu de gauche, allez dans **"Authentication"**
5. Cliquez sur **"URL Configuration"** (dans le sous-menu)

### Étape 2 : Configurer les Redirect URLs

Dans la section **"Redirect URLs"**, vous devez ajouter ces URLs (une par ligne) :

```
https://game.zig-zag.fun/auth/callback
https://game.zig-zag.fun/jeu
https://zig-zag.fun/jouer
http://localhost:3000/auth/callback
http://localhost:3000/jeu
```

**Comment faire :**
1. Cliquez dans le champ "Redirect URLs"
2. Ajoutez chaque URL sur une nouvelle ligne
3. Cliquez sur **"Save"** en bas de la page

### Étape 3 : Vérifier la configuration Google OAuth

1. Toujours dans **"Authentication"**, cliquez sur **"Providers"** (dans le sous-menu)
2. Trouvez **"Google"** dans la liste des providers
3. Vérifiez que :
   - ✅ Le toggle **"Enable Google provider"** est **ACTIVÉ** (vert)
   - ✅ Le champ **"Client ID (for OAuth)"** est rempli
   - ✅ Le champ **"Client Secret (for OAuth)"** est rempli

**Si Google OAuth n'est pas configuré :**
- Suivez le guide complet dans `docs/GOOGLE_OAUTH_SETUP.md`
- Vous devrez créer des credentials dans Google Cloud Console d'abord

---

## 📋 Action 2 : Configuration Google Cloud Console

### Étape 1 : Accéder à Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Sélectionnez votre projet (ou créez-en un si nécessaire)

### Étape 2 : Trouver votre OAuth Client ID

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"Credentials"**
2. Cherchez votre **OAuth 2.0 Client ID** (celui utilisé pour ZigZag)
3. Si vous n'en avez pas, suivez le guide `docs/GOOGLE_OAUTH_SETUP.md`

### Étape 3 : Configurer les Authorized redirect URIs

1. Cliquez sur votre **OAuth 2.0 Client ID** pour l'éditer
2. Dans la section **"Authorized redirect URIs"**, vous devez avoir ces URLs :

```
https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
https://game.zig-zag.fun/auth/callback
https://zig-zag.fun/jouer
http://localhost:3000/auth/callback
```

**Comment faire :**
1. Cliquez sur **"+ ADD URI"** pour chaque URL
2. Ou modifiez les URLs existantes si elles sont déjà là
3. Cliquez sur **"SAVE"** en bas de la page

### Étape 4 : Vérifier les Authorized JavaScript origins

Dans la même page, vérifiez que **"Authorized JavaScript origins"** contient :

```
https://tihrltssmpxpreadpzqm.supabase.co
https://zig-zag.fun
https://game.zig-zag.fun
http://localhost:3000
```

---

## ✅ Checklist de vérification

### Supabase Dashboard
- [ ] Redirect URLs configurées (5 URLs ajoutées)
- [ ] Google OAuth provider activé
- [ ] Client ID rempli
- [ ] Client Secret rempli

### Google Cloud Console
- [ ] Authorized redirect URIs configurées (4 URLs minimum)
- [ ] Authorized JavaScript origins configurées (4 URLs minimum)
- [ ] OAuth Client ID existe et est actif

---

## 🧪 Test après configuration

1. Allez sur `https://zig-zag.fun/jouer`
2. Cliquez sur **"Continuer avec Google"**
3. Vous devriez être redirigé vers Google pour vous connecter
4. Après connexion, vous devriez être redirigé vers `https://game.zig-zag.fun/auth/callback`
5. Puis automatiquement vers `https://game.zig-zag.fun/jeu`
6. Vous devriez être connecté (vérifiez avec le menu utilisateur dans le header)

---

## 🐛 Si ça ne fonctionne pas

### Erreur : "redirect_uri_mismatch"

**Cause :** L'URL de redirection n'est pas dans la liste autorisée.

**Solution :**
1. Vérifiez que `https://game.zig-zag.fun/auth/callback` est bien dans :
   - Les "Redirect URLs" de Supabase
   - Les "Authorized redirect URIs" de Google Cloud Console
2. Les URLs doivent correspondre **exactement** (pas d'espace, pas de `/` en trop)

### Erreur : "invalid_client"

**Cause :** Le Client ID ou Client Secret est incorrect.

**Solution :**
1. Vérifiez les credentials dans Supabase Dashboard → Authentication → Providers → Google
2. Vérifiez qu'ils correspondent à ceux dans Google Cloud Console
3. Recopiez-les si nécessaire

### La connexion fonctionne mais la redirection ne marche pas

**Cause :** La page `/auth/callback` n'existe pas ou les URLs ne sont pas configurées.

**Solution :**
1. Vérifiez que `https://game.zig-zag.fun/auth/callback` est dans les Redirect URLs de Supabase
2. Vérifiez que le build Next.js inclut la page `/auth/callback`
3. Vérifiez les logs dans la console du navigateur (F12)

---

## 📝 Notes importantes

- ⚠️ **Les URLs doivent correspondre EXACTEMENT** (majuscules/minuscules, avec/sans trailing slash)
- ⚠️ **Les changements peuvent prendre quelques minutes** à se propager
- ⚠️ **Testez en navigation privée** pour éviter les problèmes de cache
- ✅ **En développement local** : Utilisez `http://localhost:3000/auth/callback`
- ✅ **En production** : Utilisez `https://game.zig-zag.fun/auth/callback`

---

## 🎯 Résumé rapide

**OUI, vous devez faire 2 choses :**

1. **Supabase** → Authentication → URL Configuration → Ajouter les Redirect URLs
2. **Google Cloud** → APIs & Services → Credentials → Éditer OAuth Client ID → Ajouter les Authorized redirect URIs

**Temps estimé :** 5-10 minutes

**Difficulté :** Facile (juste copier-coller des URLs)
