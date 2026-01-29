# 🔧 Correction des Erreurs 404 - Pages HTML

## 🎯 Problème

Les pages `contact.html`, `mentions-legales.html` et `presse.html` redirigent vers une page d'erreur 404 de l'hébergeur.

## ✅ Solutions (par ordre de probabilité)

### Solution 1 : Fichiers non uploadés sur le serveur (LE PLUS PROBABLE)

**Cause** : Les fichiers n'ont pas été uploadés ou ont été supprimés du serveur.

**Vérification** :
1. Connectez-vous à votre panneau Hostinger
2. Ouvrez le **File Manager**
3. Allez dans `public_html/` (ou `htdocs/`)
4. Vérifiez que ces fichiers existent :
   - ✅ `contact.html` (devrait faire ~10 KB)
   - ✅ `mentions-legales.html` (devrait faire ~7.9 KB)
   - ✅ `presse.html` (devrait faire ~6.5 KB)

**Action** :
Si les fichiers sont absents ou ont une taille différente :
1. **Uploadez** les fichiers depuis votre ordinateur :
   - `/Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/contact.html`
   - `/Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/mentions-legales.html`
   - `/Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/presse.html`
2. Vérifiez que les **permissions** sont correctes : **644** (rw-r--r--)

---

### Solution 2 : Fichier `.htaccess` mal configuré

**Cause** : Un fichier `.htaccess` à la racine intercepte les requêtes et cause des erreurs 404.

**Vérification** :
1. Dans le File Manager Hostinger, allez dans `public_html/`
2. Vérifiez s'il existe un fichier `.htaccess` (il peut être caché, activez l'affichage des fichiers cachés)
3. Si le fichier existe, ouvrez-le et vérifiez son contenu

**Solution A : Fichier `.htaccess` avec règles de réécriture trop agressives**

Si votre `.htaccess` contient des règles comme :
```apache
RewriteRule ^(.*)$ index.html [L]
```

Cela redirige TOUTES les requêtes vers `index.html`, ce qui cause les 404.

**Correction** : Modifiez le `.htaccess` pour exclure les fichiers HTML existants :

```apache
RewriteEngine On

# Ne pas réécrire les fichiers existants
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Ne pas réécrire les dossiers existants
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Supprimer .html des URLs (optionnel)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]
```

**Solution B : Désactiver temporairement le `.htaccess`**

Pour tester si le `.htaccess` est la cause :
1. Renommez `.htaccess` en `.htaccess.bak` temporairement
2. Testez les pages (contact.html, presse.html, mentions-legales.html)
3. Si ça fonctionne, le problème vient du `.htaccess`
4. Si ça ne fonctionne pas, remettez le fichier et passez à la solution suivante

---

### Solution 3 : Problème de casse ou de nom de fichier

**Cause** : Les noms de fichiers sur le serveur ont une casse différente (ex: `Contact.html` au lieu de `contact.html`).

**Vérification** :
Sur le serveur, vérifiez l'**exacte casse** des fichiers :
- Doit être : `contact.html` (tout en minuscules)
- Doit être : `mentions-legales.html` (avec un tiret, pas un underscore)
- Doit être : `presse.html` (tout en minuscules)

**Action** :
Si les noms sont différents, renommez-les pour correspondre exactement aux liens dans votre HTML.

---

### Solution 4 : Chemins relatifs incorrects dans les liens

**Cause** : Les liens dans `index.html` ou d'autres pages pointent vers des chemins incorrects.

**Vérification** :
Dans `index.html`, ligne 247-249, vérifiez que les liens sont :
```html
<a href="contact.html">Contact</a>
<a href="presse.html">Presse</a>
<a href="mentions-legales.html">Mentions Légales</a>
```

Si les liens sont différents (ex: `/contact.html` ou `./contact.html`), testez avec les chemins relatifs simples ci-dessus.

---

### Solution 5 : Cache du navigateur

**Cause** : Le navigateur cache une ancienne version avec des liens incorrects.

**Action** :
1. **Videz le cache** complètement :
   - Chrome/Edge : `Ctrl+Shift+Delete` → Cochez "Images et fichiers en cache"
   - Firefox : `Ctrl+Shift+Delete` → Cochez "Cache"
2. Ou faites un **hard refresh** : `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)
3. Testez en **navigation privée** (`Ctrl+Shift+N`)

---

## 🧪 Tests de Vérification

### Test 1 : Accès direct aux fichiers

Essayez d'accéder directement aux fichiers dans le navigateur :
- `zig-zag.fun/contact.html`
- `zig-zag.fun/presse.html`
- `zig-zag.fun/mentions-legales.html`

**Résultats possibles** :
- ✅ Page s'affiche → Les fichiers sont bien uploadés, le problème vient des liens
- ❌ Erreur 404 → Les fichiers ne sont pas sur le serveur ou ont un mauvais nom

### Test 2 : Vérifier via FTP/SSH

Si vous avez accès FTP ou SSH, listez les fichiers :
```bash
# Via SSH
ls -lah public_html/*.html

# Doit afficher :
# contact.html
# index.html
# jouer.html
# mentions-legales.html
# presse.html
```

### Test 3 : Vérifier les permissions

Les fichiers HTML doivent avoir les permissions **644** :
```bash
chmod 644 contact.html mentions-legales.html presse.html
```

---

## 📋 Checklist de Diagnostic

- [ ] Les fichiers existent sur le serveur (File Manager)
- [ ] Les tailles des fichiers correspondent (contact: ~10KB, mentions: ~7.9KB, presse: ~6.5KB)
- [ ] Les noms de fichiers sont exactement : `contact.html`, `mentions-legales.html`, `presse.html`
- [ ] Les permissions sont correctes (644)
- [ ] Pas de `.htaccess` qui intercepte les requêtes
- [ ] Les liens dans `index.html` sont corrects (`contact.html`, pas `/contact.html`)
- [ ] Cache du navigateur vidé
- [ ] Test en navigation privée effectué

---

## 🚀 Solution Rapide (Recommandée)

**Si vous voulez une solution rapide** :

1. **Connectez-vous à Hostinger File Manager**
2. **Allez dans `public_html/`**
3. **Uploadez ces 3 fichiers** (remplacez s'ils existent déjà) :
   - `contact.html`
   - `mentions-legales.html`
   - `presse.html`
4. **Vérifiez les permissions** : doivent être **644**
5. **Testez les URLs** :
   - `zig-zag.fun/contact.html`
   - `zig-zag.fun/presse.html`
   - `zig-zag.fun/mentions-legales.html`
6. **Videz le cache** du navigateur et testez depuis `index.html`

---

## ⚠️ Note Importante

Si vous avez un fichier `.htaccess` à la racine qui gère les URLs propres (sans `.html`), assurez-vous qu'il **n'intercepte pas** les fichiers HTML existants. Les règles doivent d'abord vérifier si le fichier existe avant de faire une réécriture.

---

**Si le problème persiste après avoir suivi toutes ces étapes**, contactez le support Hostinger avec :
- Les URLs qui ne fonctionnent pas
- Les captures d'écran de la structure des fichiers dans File Manager
- Le contenu de votre fichier `.htaccess` (si présent)






