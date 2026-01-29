# 🔗 Guide : URLs sans extension .html

## ✅ Fichier `.htaccess` créé

Un fichier `.htaccess` a été créé dans la racine de votre projet. Ce fichier permet de :
- ✅ Supprimer les extensions `.html` des URLs
- ✅ Rediriger automatiquement les anciennes URLs (avec .html) vers les nouvelles
- ✅ Améliorer le SEO et l'expérience utilisateur

## 📋 Exemples d'URLs

**Avant :**
- `zig-zag.fun/index.html`
- `zig-zag.fun/jouer.html`
- `zig-zag.fun/contact.html`
- `zig-zag.fun/admin.html`

**Après :**
- `zig-zag.fun/` ou `zig-zag.fun`
- `zig-zag.fun/jouer`
- `zig-zag.fun/contact`
- `zig-zag.fun/admin`

## 🚀 Installation sur Hostinger

1. **Connectez-vous à votre espace Hostinger**
2. **Ouvrez le Gestionnaire de fichiers** (File Manager)
3. **Allez dans le dossier public_html** (ou `htdocs` selon votre configuration)
4. **Uploadez le fichier `.htaccess`** à la racine de votre site
5. **Vérifiez que le fichier est bien nommé `.htaccess`** (avec le point au début)

## ⚙️ Configuration requise

### Vérifier que mod_rewrite est activé

Sur Hostinger, `mod_rewrite` est généralement activé par défaut. Si ça ne fonctionne pas :

1. Contactez le support Hostinger
2. Ou vérifiez dans votre panneau de contrôle (cPanel/Plesk) que `mod_rewrite` est activé

## 🔄 Mise à jour des liens internes

### Option 1 : Garder les liens avec .html (recommandé)
Vous pouvez **garder vos liens avec `.html`** dans le code HTML. Le `.htaccess` redirigera automatiquement vers les URLs propres.

**Exemple :**
```html
<!-- Dans votre HTML, vous pouvez garder -->
<a href="jouer.html">Jouer</a>

<!-- L'URL affichée sera automatiquement -->
<!-- zig-zag.fun/jouer -->
```

### Option 2 : Mettre à jour tous les liens (optionnel)
Si vous voulez mettre à jour tous les liens pour enlever `.html` :

**Fichiers à modifier :**
- `index.html` : liens vers `jouer.html`, `contact.html`, etc.
- `jouer.html` : liens de retour vers `index.html`
- `contact.html` : liens vers `index.html`
- Tous les autres fichiers HTML

**Exemple :**
```html
<!-- Avant -->
<a href="jouer.html">Jouer</a>

<!-- Après -->
<a href="/jouer">Jouer</a>
<!-- ou -->
<a href="jouer">Jouer</a>
```

## 🧪 Test

1. **Uploadez le fichier `.htaccess`** sur votre serveur
2. **Testez les URLs :**
   - `zig-zag.fun/jouer` → doit afficher la page jouer
   - `zig-zag.fun/contact` → doit afficher la page contact
   - `zig-zag.fun/admin` → doit afficher la page admin
3. **Vérifiez les redirections :**
   - `zig-zag.fun/jouer.html` → doit rediriger vers `zig-zag.fun/jouer`

## ⚠️ Dépannage

### Les URLs ne fonctionnent pas

1. **Vérifiez que le fichier `.htaccess` est bien à la racine** (même niveau que `index.html`)
2. **Vérifiez que `mod_rewrite` est activé** sur votre serveur
3. **Vérifiez les permissions** du fichier (644 ou 755)
4. **Videz le cache de votre navigateur** (Ctrl+Shift+R ou Cmd+Shift+R)

### Erreur 500 (Internal Server Error)

1. **Vérifiez la syntaxe** du fichier `.htaccess`
2. **Contactez le support Hostinger** si le problème persiste
3. **Renommez temporairement** le fichier en `.htaccess.bak` pour voir si c'est la cause

### Les anciennes URLs (avec .html) ne redirigent pas

C'est normal si vous gardez les liens avec `.html` dans votre HTML. Les redirections fonctionnent pour les URLs tapées directement dans le navigateur.

## 📝 Notes importantes

- ✅ Le fichier `.htaccess` fonctionne avec **Apache** (Hostinger utilise Apache)
- ✅ Les fichiers continuent de s'appeler `jouer.html`, `contact.html`, etc. sur le serveur
- ✅ Seules les URLs affichées changent (sans .html)
- ✅ Les redirections sont permanentes (301) pour le SEO

## 🔒 Sécurité

Le fichier `.htaccess` inclut aussi :
- Protection contre l'accès direct aux fichiers sensibles
- Compression GZIP pour améliorer les performances
- Cache des fichiers statiques

---

**Besoin d'aide ?** Contactez le support Hostinger ou vérifiez la documentation Apache.

