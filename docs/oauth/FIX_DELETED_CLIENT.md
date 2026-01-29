# 🔧 Fix : Erreur "The OAuth client was deleted" (Erreur 401 : deleted_client)

## 🎯 Problème

Vous voyez l'erreur :
```
The OAuth client was deleted.
Erreur 401 : deleted_client
```

**Cause :** Vous avez créé un **nouveau Client ID OAuth 2.0** dans Google Cloud Console, mais Supabase utilise toujours l'**ancien Client ID** qui a été supprimé.

---

## ✅ Solution : Mettre à jour les credentials dans Supabase

### Étape 1 : Récupérer le nouveau Client ID et Secret

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Trouvez votre **nouveau OAuth 2.0 Client ID** (celui que vous venez de créer)
4. Cliquez dessus pour voir les détails
5. **Copiez le Client ID** (ex: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
6. **Copiez le Client Secret** (ex: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

**⚠️ IMPORTANT :** Copiez-les **exactement** sans espaces avant/après.

### Étape 2 : Mettre à jour dans Supabase Dashboard

1. Allez sur [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionnez votre projet : **`tihrltssmpxpreadpzqm`**
3. Menu : **Authentication** → **Providers**
4. Trouvez **"Google"** dans la liste
5. **Remplacez les credentials :**
   - **Client ID (for OAuth)** : Collez le **nouveau Client ID** de Google Cloud
   - **Client Secret (for OAuth)** : Collez le **nouveau Client Secret** de Google Cloud
6. Vérifiez que le toggle **"Enable Google provider"** est **ACTIVÉ** (vert)
7. Cliquez sur **"Save"**

### Étape 3 : Vérifier la configuration Google Cloud

Assurez-vous que votre **nouveau Client ID** a bien les bonnes URLs configurées :

1. Dans Google Cloud Console, éditez votre **nouveau OAuth Client ID**
2. **Authorized JavaScript origins** doit contenir :
   ```
   https://tihrltssmpxpreadpzqm.supabase.co
   https://zig-zag.fun
   https://game.zig-zag.fun
   http://localhost:3000
   ```

3. **Authorized redirect URIs** doit contenir :
   ```
   https://tihrltssmpxpreadpzqm.supabase.co/auth/v1/callback
   https://game.zig-zag.fun/auth/callback
   https://zig-zag.fun/jouer
   http://localhost:3000/auth/callback
   ```

4. Cliquez sur **"SAVE"**

### Étape 4 : Tester

1. Allez sur `https://zig-zag.fun/jouer`
2. Cliquez sur **"Continuer avec Google"**
3. Vous devriez être redirigé vers Google (plus d'erreur "deleted_client")
4. Connectez-vous avec votre compte Google
5. Vous devriez être redirigé vers `game.zig-zag.fun/auth/callback`

---

## 🐛 Si ça ne marche toujours pas

### Vérification 1 : Les credentials sont bien copiés

1. Vérifiez qu'il n'y a **pas d'espaces** avant/après le Client ID et Secret dans Supabase
2. Vérifiez que vous avez copié le **bon** Client ID (le nouveau, pas l'ancien)
3. Vérifiez que le Client ID commence par des chiffres (ex: `123456789-...`)
4. Vérifiez que le Client Secret commence par `GOCSPX-`

### Vérification 2 : Le Client ID est actif

1. Dans Google Cloud Console, vérifiez que votre Client ID est **actif** (pas supprimé)
2. Vérifiez qu'il est bien de type **"Web application"**

### Vérification 3 : Les URLs sont correctes

1. Vérifiez que toutes les URLs sont bien dans :
   - Les "Authorized redirect URIs" de Google Cloud
   - Les "Redirect URLs" de Supabase

---

## 📝 Checklist Rapide

- [ ] **Google Cloud** : Nouveau Client ID créé et actif
- [ ] **Google Cloud** : Client ID et Secret copiés
- [ ] **Supabase** : Client ID mis à jour (nouveau)
- [ ] **Supabase** : Client Secret mis à jour (nouveau)
- [ ] **Supabase** : Google OAuth activé
- [ ] **Google Cloud** : URLs de redirection configurées
- [ ] **Test** : Plus d'erreur "deleted_client"

---

## 🎯 Résumé

**Le problème :** Supabase utilise un ancien Client ID qui a été supprimé.

**La solution :** Mettre à jour le Client ID et Secret dans Supabase Dashboard avec les nouveaux credentials de Google Cloud Console.

**Temps estimé :** 2 minutes (juste copier-coller)
