# Configuration Google OAuth pour Supabase

Ce guide explique comment configurer Google OAuth pour que la connexion Google fonctionne sur la page `jouer.html`.

## 📋 Prérequis

- Un compte Supabase avec accès au dashboard
- Un compte Google (Gmail) pour créer les credentials OAuth
- Accès à [Google Cloud Console](https://console.cloud.google.com/)

---

## 🔧 Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur le sélecteur de projet en haut
3. Cliquez sur **"Nouveau projet"** (ou **"New Project"**)
4. Donnez un nom au projet (ex: "ZigZag OAuth")
5. Cliquez sur **"Créer"**

---

## 🔑 Étape 2 : Créer les credentials OAuth

1. Dans Google Cloud Console, allez dans **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Si c'est la première fois, vous devrez configurer l'écran de consentement OAuth :
   - Choisissez **"External"** (ou **"Interne"** si vous avez un compte Google Workspace)
   - Remplissez les informations requises :
     - **App name** : ZigZag
     - **User support email** : votre email
     - **Developer contact information** : votre email
   - Cliquez sur **"Save and Continue"** pour chaque étape
   - À la fin, cliquez sur **"Back to Dashboard"**

4. Maintenant, créez l'OAuth Client ID :
   - **Application type** : Choisissez **"Web application"**
   - **Name** : ZigZag Web Client
   - **Authorized JavaScript origins** : Ajoutez :
     ```
     https://tihrltssmpxpreadpzqm.supabase.co
     https://zig-zag.fun
     http://localhost:3000
     ```
   - **Authorized redirect URIs** : Ajoutez :
     ```
     https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
     https://zig-zag.fun/jouer
     http://localhost:3000/jouer
     ```
   - Cliquez sur **"Create"**

5. **IMPORTANT** : Copiez le **Client ID** et le **Client Secret** qui s'affichent
   - Vous en aurez besoin pour Supabase

---

## ⚙️ Étape 3 : Configurer Google OAuth dans Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionnez votre projet : `tihrltssmpxpreadpzqm`
3. Allez dans **"Authentication"** → **"Providers"** (dans le menu de gauche)
4. Trouvez **"Google"** dans la liste des providers
5. Activez le toggle **"Enable Google provider"**
6. Remplissez les champs :
   - **Client ID (for OAuth)** : Collez le Client ID de Google Cloud Console
   - **Client Secret (for OAuth)** : Collez le Client Secret de Google Cloud Console
7. Cliquez sur **"Save"**

---

## 🔗 Étape 4 : Configurer les URLs de redirection

Dans Supabase Dashboard, allez dans **"Authentication"** → **"URL Configuration"** :

1. **Site URL** : 
   ```
   https://zig-zag.fun
   ```
   (ou `http://localhost:3000` pour le développement local)

2. **Redirect URLs** : Ajoutez ces URLs (une par ligne) :
   ```
   https://zig-zag.fun/jouer
   https://zig-zag.fun/jeu
   http://localhost:3000/jouer
   http://localhost:3000/jeu
   https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
   ```

3. Cliquez sur **"Save"**

---

## ✅ Étape 5 : Vérifier le code dans `jouer.html`

Le code dans `jouer.html` devrait déjà être correct, mais vérifiez que les URLs de redirection correspondent :

```javascript
const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: `${window.location.origin}/jouer`
    }
});
```

Cette configuration redirigera vers `/jouer` après la connexion Google.

---

## 🧪 Étape 6 : Tester

1. Allez sur `https://zig-zag.fun/jouer` (ou `http://localhost:3000/jouer` en local)
2. Cliquez sur **"Continuer avec Google"**
3. Vous devriez être redirigé vers Google pour vous connecter
4. Après avoir autorisé, vous devriez être redirigé vers `/jouer` puis vers `/jeu`

---

## 🐛 Dépannage

### Erreur : "redirect_uri_mismatch"
- Vérifiez que toutes les URLs de redirection sont bien ajoutées dans Google Cloud Console
- Vérifiez que les URLs correspondent exactement (pas d'espace, pas de `/` en trop)

### Erreur : "invalid_client"
- Vérifiez que le Client ID et Client Secret sont correctement copiés dans Supabase
- Vérifiez qu'il n'y a pas d'espaces avant/après les credentials

### La connexion fonctionne mais la redirection ne marche pas
- Vérifiez les "Redirect URLs" dans Supabase Dashboard
- Vérifiez que l'URL de redirection dans le code correspond à une URL autorisée

### Le bouton Google ne fait rien
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Vérifiez que Supabase est bien configuré avec le provider Google activé

---

## 📝 Notes importantes

- **Environnement de développement** : Utilisez `http://localhost:3000` pour tester en local
- **Environnement de production** : Utilisez `https://zig-zag.fun` pour la production
- **Sécurité** : Ne partagez jamais le Client Secret publiquement
- **URLs de redirection** : Toutes les URLs utilisées doivent être ajoutées dans Google Cloud Console ET Supabase

---

## 🔄 Mise à jour après configuration

Une fois que tout est configuré, la connexion Google devrait fonctionner automatiquement. Si vous changez de domaine, n'oubliez pas de mettre à jour :

1. Les URLs dans Google Cloud Console (Authorized redirect URIs)
2. Les URLs dans Supabase (Redirect URLs)
3. L'URL dans le code `jouer.html` si nécessaire



