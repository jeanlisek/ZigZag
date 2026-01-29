# 🔧 Fix : Redirection vers zig-zag.fun/# au lieu de /oauth-callback

## ❌ Problème

Après connexion/inscription via Google, vous êtes redirigé vers `https://zig-zag.fun/#` au lieu de `https://zig-zag.fun/oauth-callback`.

## 🔍 Cause

Supabase **ignore le `redirectTo`** et utilise le "Site URL" par défaut (`zig-zag.fun`) car :
1. `https://zig-zag.fun/oauth-callback` n'est **PAS** dans les Redirect URLs de Supabase
2. Ou Supabase ne reconnaît pas cette URL comme valide

## ✅ Solution

### ÉTAPE 1 : Vérifier la configuration Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com/)
2. Projet : `tihrltssmpxpreadpzqm`
3. **Authentication** → **URL Configuration**

**Vérifiez que :**

**Site URL :**
```
https://zig-zag.fun
```

**Redirect URLs (une URL par ligne) :**
```
https://zig-zag.fun/oauth-callback
https://zig-zag.fun/jouer
https://game.zig-zag.fun/auth/callback
https://game.zig-zag.fun/jeu
```

**⚠️ CRITIQUE :** `https://zig-zag.fun/oauth-callback` **DOIT** être dans cette liste, **EXACTEMENT** comme écrit ci-dessus (avec `https://` et sans slash final).

4. Cliquez sur **"Save"**

---

### ÉTAPE 2 : Vérifier que oauth-callback.html est uploadé

1. Testez directement : `https://zig-zag.fun/oauth-callback`
2. **Résultat attendu :** La page se charge avec "Connexion en cours..."
3. **Si 404 :** Le fichier n'est pas uploadé, uploadez `oauth-callback.html` sur `zig-zag.fun`

---

### ÉTAPE 3 : Vérifier le .htaccess

Le fichier `.htaccess` sur `zig-zag.fun` doit contenir :

```apache
# Gérer /oauth-callback (sans extension)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} ^/oauth-callback/?$
RewriteRule ^oauth-callback/?$ oauth-callback.html [L]
```

**Vérifiez que cette règle existe dans votre `.htaccess`.**

---

### ÉTAPE 4 : Vérifier le code dans jouer.html

Dans `jouer.html`, le `redirectTo` doit être :

```javascript
redirectTo = 'https://zig-zag.fun/oauth-callback';
```

**Pas :**
```javascript
redirectTo = 'https://game.zig-zag.fun/auth/callback';  // ❌ MAUVAIS
```

---

### ÉTAPE 5 : Vider le cache

1. **Videz le cache du navigateur** (Ctrl+Shift+R ou Cmd+Shift+R)
2. **Testez en navigation privée** pour éviter les problèmes de cache
3. **Attendez 1-2 minutes** après avoir modifié les Redirect URLs dans Supabase (propagation)

---

## 🧪 Test Complet

1. Allez sur `https://zig-zag.fun/jouer`
2. Cliquez sur "Continuer avec Google"
3. Connectez-vous avec Google
4. **Observez l'URL dans la barre d'adresse :**

**✅ BON :**
- `zig-zag.fun/oauth-callback#access_token=...` → Puis redirige vers `game.zig-zag.fun/auth/callback`

**❌ MAUVAIS :**
- `zig-zag.fun/#` → Supabase ignore le redirectTo
- `zig-zag.fun/` → Supabase ignore le redirectTo

---

## 🐛 Si ça ne marche toujours pas

### Problème : Toujours redirigé vers zig-zag.fun/#

**Vérifiez dans Supabase Dashboard :**

1. **Authentication** → **URL Configuration**
2. Regardez la liste des **"Redirect URLs"**
3. **Copiez-collez exactement** `https://zig-zag.fun/oauth-callback` dans cette liste
4. Cliquez sur **"Save"**
5. Attendez 1-2 minutes
6. Testez en navigation privée

**Si ça ne marche toujours pas :**

1. Ouvrez la console du navigateur (F12)
2. Allez sur `zig-zag.fun/jouer`
3. Cliquez sur "Continuer avec Google"
4. **Regardez les messages dans la console** après la redirection
5. **Envoyez-moi :**
   - Les messages de la console
   - L'URL exacte après la redirection Google
   - Une capture d'écran de la liste des Redirect URLs dans Supabase

---

## 📋 Checklist

- [ ] **Supabase** : `https://zig-zag.fun/oauth-callback` est dans les Redirect URLs (EXACTEMENT, copié-collé)
- [ ] **Supabase** : Site URL = `https://zig-zag.fun`
- [ ] **Fichier** : `oauth-callback.html` est uploadé sur `zig-zag.fun`
- [ ] **Test** : `https://zig-zag.fun/oauth-callback` se charge
- [ ] **.htaccess** : Contient la règle pour `/oauth-callback`
- [ ] **Code** : `jouer.html` utilise `redirectTo = 'https://zig-zag.fun/oauth-callback'`
- [ ] **Cache** : Navigateur vidé, test en navigation privée
- [ ] **Attente** : 1-2 minutes après modification des Redirect URLs

---

## 🎯 Résumé

**Le problème :** Supabase redirige vers `zig-zag.fun/#` car `https://zig-zag.fun/oauth-callback` n'est pas dans les Redirect URLs.

**La solution :** Ajoutez `https://zig-zag.fun/oauth-callback` dans les Redirect URLs de Supabase, **exactement** comme écrit (avec `https://` et sans slash final).
