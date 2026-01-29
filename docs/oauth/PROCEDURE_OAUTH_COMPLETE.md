# 🔄 Procédure Complète : Configuration OAuth Google depuis Zéro

## 🎯 Objectif

Configurer OAuth Google pour que :
1. L'utilisateur clique sur "Continuer avec Google" sur `zig-zag.fun/jouer`
2. Après connexion Google, il soit redirigé vers `game.zig-zag.fun/auth/callback`
3. Puis automatiquement vers `game.zig-zag.fun/jeu`
4. L'utilisateur soit connecté avec son compte Google

---

## 📋 ÉTAPE 1 : Configuration Supabase Dashboard

### 1.1 Accéder à Supabase

1. Allez sur [https://app.supabase.com/](https://app.supabase.com/)
2. Connectez-vous
3. Sélectionnez votre projet : **`tihrltssmpxpreadpzqm`**

### 1.2 Configurer les Redirect URLs

1. Dans le menu de gauche : **Authentication** → **URL Configuration**
2. Dans **"Site URL"**, mettez :
   ```
   https://zig-zag.fun
   ```

3. Dans **"Redirect URLs"** (champ texte, une URL par ligne), ajoutez **EXACTEMENT** ces URLs :

```
https://game.zig-zag.fun/auth/callback
https://game.zig-zag.fun/jeu
https://zig-zag.fun/jouer
http://localhost:3000/auth/callback
http://localhost:3000/jeu
```

**⚠️ IMPORTANT :**
- Une URL par ligne
- Pas d'espace avant/après
- Pas de `/` en trop à la fin
- Copiez-collez exactement comme ci-dessus

4. Cliquez sur **"Save"** (en bas de la page)

### 1.3 Vérifier/Configurer Google OAuth Provider

1. Dans le menu de gauche : **Authentication** → **Providers**
2. Trouvez **"Google"** dans la liste
3. Vérifiez que :
   - ✅ Le toggle **"Enable Google provider"** est **ACTIVÉ** (vert)
   - ✅ Le champ **"Client ID (for OAuth)"** est rempli
   - ✅ Le champ **"Client Secret (for OAuth)"** est rempli

**Si Google OAuth n'est PAS configuré :**
- Passez à l'ÉTAPE 2 pour créer les credentials Google d'abord
- Puis revenez ici pour les ajouter dans Supabase

4. Si tout est rempli, cliquez sur **"Save"**

---

## 📋 ÉTAPE 2 : Configuration Google Cloud Console

### 2.1 Accéder à Google Cloud Console

1. Allez sur [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Sélectionnez votre projet (ou créez-en un si nécessaire)

### 2.2 Créer/Modifier l'OAuth Client ID

1. Dans le menu de gauche : **APIs & Services** → **Credentials**
2. Cherchez votre **OAuth 2.0 Client ID** (celui pour ZigZag)
   - Si vous n'en avez pas, cliquez sur **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - Si c'est la première fois, configurez l'écran de consentement OAuth d'abord

3. Cliquez sur votre **OAuth 2.0 Client ID** pour l'éditer

### 2.3 Configurer les Authorized JavaScript origins

Dans **"Authorized JavaScript origins"**, ajoutez ces URLs (une par ligne) :

```
https://tihrltssmpxpreadpzqm.supabase.co
https://zig-zag.fun
https://game.zig-zag.fun
http://localhost:3000
```

### 2.4 Configurer les Authorized redirect URIs

Dans **"Authorized redirect URIs"**, ajoutez ces URLs (une par ligne) :

```
https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
https://game.zig-zag.fun/auth/callback
https://zig-zag.fun/jouer
http://localhost:3000/auth/callback
```

**⚠️ IMPORTANT :**
- Une URL par ligne
- Pas d'espace avant/après
- Pas de `/` en trop à la fin
- Copiez-collez exactement comme ci-dessus

5. Cliquez sur **"SAVE"** (en bas de la page)

### 2.5 Si vous avez créé un nouveau Client ID

1. **Copiez le Client ID** qui s'affiche
2. **Copiez le Client Secret** qui s'affiche
3. Retournez dans **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
4. Collez le **Client ID** dans "Client ID (for OAuth)"
5. Collez le **Client Secret** dans "Client Secret (for OAuth)"
6. Activez le toggle **"Enable Google provider"**
7. Cliquez sur **"Save"**

---

## 📋 ÉTAPE 3 : Vérifier le code dans jouer.html

### 3.1 Vérifier la configuration Supabase

Ouvrez `Zig-Zag/jouer.html` et vérifiez que les lignes ~889-891 contiennent :

```javascript
const SUPABASE_URL = "https://tihrltssmpxpreadpzqm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaHJsdHNzbXB4cHJlYWRwenFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjEwNDksImV4cCI6MjA3OTczNzA0OX0.lXbPKA8tYj7o582onzj8c9y1vhkdXrk5SN8WmIahJpY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 3.2 Vérifier le redirectTo pour Google OAuth

Vérifiez que les lignes ~1454-1459 et ~1487-1492 contiennent :

```javascript
// Pour l'inscription Google
let redirectTo;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    redirectTo = 'http://localhost:3000/auth/callback';
} else {
    redirectTo = 'https://game.zig-zag.fun/auth/callback';
}

const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: redirectTo
    }
});
```

**✅ Si c'est correct, passez à l'étape 4**
**❌ Si ce n'est pas correct, corrigez-le**

---

## 📋 ÉTAPE 4 : Vérifier la page de callback Next.js

### 4.1 Vérifier que la page existe

Le fichier doit exister : `Zig-Zag/game-app/src/app/auth/callback/page.tsx`

### 4.2 Vérifier le contenu

La page doit :
1. Détecter les tokens dans l'URL hash
2. Stocker la session dans localStorage
3. Rediriger vers `/jeu`

**✅ Si le fichier existe et contient le bon code, passez à l'étape 5**

---

## 📋 ÉTAPE 5 : Build et Upload

### 5.1 Build de l'application Next.js

```bash
cd Zig-Zag/game-app
rm -rf .next out
npm run build
```

### 5.2 Vérifier que le build contient la page de callback

```bash
ls -la out/auth/callback/
```

Vous devriez voir un fichier `index.html` dans ce dossier.

### 5.3 Uploader sur game.zig-zag.fun

1. Uploadez **TOUT le contenu** du dossier `out/` sur `game.zig-zag.fun`
2. Assurez-vous que le dossier `auth/callback/` est bien uploadé
3. Uploadez aussi le `.htaccess` à la racine de `game.zig-zag.fun`

---

## 📋 ÉTAPE 6 : Test Complet

### 6.1 Test 1 : Vérifier que la page de callback existe

Dans votre navigateur, allez sur :
```
https://game.zig-zag.fun/auth/callback
```

**Résultat attendu :**
- ✅ La page se charge (même si elle redirige immédiatement)
- ❌ **404 Not Found** → La page n'existe pas, vérifiez l'upload

### 6.2 Test 2 : Test OAuth complet

1. Allez sur `https://zig-zag.fun/jouer`
2. Cliquez sur **"Continuer avec Google"**
3. Connectez-vous avec votre compte Google
4. **Observez l'URL dans la barre d'adresse** :
   - Après Google, vous devriez être sur `game.zig-zag.fun/auth/callback#access_token=...`
   - Puis automatiquement redirigé vers `game.zig-zag.fun/jeu`

**Si vous êtes redirigé vers `zig-zag.fun` au lieu de `game.zig-zag.fun` :**
- Le problème vient de la configuration Supabase
- Vérifiez l'ÉTAPE 1.2 (Redirect URLs)

---

## 🐛 Dépannage

### Problème : Redirige toujours vers zig-zag.fun

**Cause :** Supabase utilise le "Site URL" par défaut au lieu du `redirectTo`.

**Solution :**
1. Vérifiez que **"Site URL"** dans Supabase est bien `https://zig-zag.fun`
2. Vérifiez que `https://game.zig-zag.fun/auth/callback` est bien dans les **"Redirect URLs"**
3. **IMPORTANT :** Le `redirectTo` dans le code doit être **exactement** `https://game.zig-zag.fun/auth/callback`
4. Videz le cache du navigateur (Ctrl+Shift+R)
5. Testez en navigation privée

### Problème : Erreur "redirect_uri_mismatch"

**Cause :** L'URL de redirection n'est pas autorisée.

**Solution :**
1. Vérifiez que `https://game.zig-zag.fun/auth/callback` est dans :
   - Les "Redirect URLs" de Supabase (ÉTAPE 1.2)
   - Les "Authorized redirect URIs" de Google Cloud (ÉTAPE 2.4)
2. Les URLs doivent correspondre **EXACTEMENT** (majuscules/minuscules, pas d'espace)

### Problème : La page /auth/callback n'existe pas (404)

**Cause :** Le build Next.js n'inclut pas la page ou elle n'est pas uploadée.

**Solution :**
1. Vérifiez que `out/auth/callback/index.html` existe après le build
2. Vérifiez que ce fichier est uploadé sur `game.zig-zag.fun`
3. Rebuild et re-upload si nécessaire

### Problème : La session n'est pas stockée

**Cause :** Le client Supabase ne détecte pas les tokens dans l'URL.

**Solution :**
1. Vérifiez que `detectSessionInUrl: true` est dans `game-app/src/lib/supabase/client.ts`
2. Vérifiez que les tokens sont bien dans l'URL hash après la redirection Google
3. Ouvrez la console du navigateur (F12) pour voir les erreurs

---

## ✅ Checklist Finale

Avant de tester, vérifiez que :

- [ ] **Supabase** : Site URL = `https://zig-zag.fun`
- [ ] **Supabase** : Redirect URLs contient `https://game.zig-zag.fun/auth/callback`
- [ ] **Supabase** : Google OAuth activé avec Client ID/Secret
- [ ] **Google Cloud** : Authorized redirect URIs contient `https://game.zig-zag.fun/auth/callback`
- [ ] **Google Cloud** : Authorized JavaScript origins contient `https://game.zig-zag.fun`
- [ ] **jouer.html** : `redirectTo = 'https://game.zig-zag.fun/auth/callback'` (en production)
- [ ] **Next.js** : La page `/auth/callback` existe et est buildée
- [ ] **Upload** : Le dossier `auth/callback/` est uploadé sur `game.zig-zag.fun`
- [ ] **.htaccess** : Uploadé sur `game.zig-zag.fun` avec les bonnes règles

---

## 🎯 Résumé du Flux Attendu

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
7. Supabase redirige vers game.zig-zag.fun/auth/callback#access_token=...&refresh_token=...
   ↓
8. La page /auth/callback détecte les tokens et stocke la session
   ↓
9. Redirection automatique vers game.zig-zag.fun/jeu
   ↓
10. Utilisateur connecté ✅
```

---

## 📞 Si ça ne marche toujours pas

1. **Ouvrez la console du navigateur** (F12) et regardez les erreurs
2. **Vérifiez l'onglet Network** pour voir quelles URLs sont appelées
3. **Vérifiez les logs Supabase** dans le dashboard
4. **Testez en navigation privée** pour éviter les problèmes de cache
