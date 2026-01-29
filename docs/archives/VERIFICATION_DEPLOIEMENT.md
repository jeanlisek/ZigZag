# 🔍 Vérification du Déploiement - Landing Page

## 🎯 Problème Identifié

La landing page sur le serveur (`zig-zag.fun`) n'affiche pas la même version que celle en local.

**Version locale (correcte)** : Landing page complète avec :
- Section HERO : "Le jeu qui déforme vos messages à travers le monde"
- Sections : Comment ça marche, Expérience unique, Galerie
- CTA : "Prêt(e) à perdre le contrôle ?"
- Footer avec newsletter

**Version serveur (problématique)** : Version simplifiée avec fond gris foncé et liste d'attente uniquement.

## ✅ Checklist de Vérification

### 1. Vérifier les fichiers à uploader

Les fichiers suivants DOIVENT être présents sur le serveur :

```
public_html/
├── index.html          ← CRITIQUE (17 KB, dernière version)
├── style.css           ← CRITIQUE (21 KB, dernière version)
├── script.js
├── attached_assets/    ← CRITIQUE (dossier complet)
│   ├── image_1763569221576.png
│   ├── white_bear_waving_hand_transparent.png
│   ├── white_bear_jumping_excited_transparent.png
│   └── generated_images/
└── (autres fichiers HTML...)
```

### 2. Vérifier la date de modification

Sur Hostinger, vérifiez que :
- `index.html` a été modifié le **10 décembre 2025** (ou plus récent)
- `style.css` a été modifié le **10 décembre 2025** (ou plus récent)

### 3. Vérifier le contenu de `index.html` sur le serveur

Le fichier `index.html` sur le serveur DOIT contenir (ligne 47) :
```html
<h1>Le jeu qui déforme vos messages à travers le monde.</h1>
```

Si vous voyez plutôt :
```html
<h1>Prêt(e) à perdre le contrôle ?</h1>
```
→ C'est une **ancienne version** ! Il faut re-uploader `index.html`.

## 🔧 Solutions

### Solution 1 : Re-uploader les fichiers (Recommandé)

1. **Via File Manager Hostinger** :
   - Connectez-vous à votre panneau Hostinger
   - Ouvrez File Manager
   - Allez dans `public_html/`
   - **Supprimez** l'ancien `index.html` et `style.css`
   - **Uploadez** les nouveaux fichiers depuis votre ordinateur :
     - `/Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/index.html`
     - `/Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/style.css`
   - **Vérifiez** que le dossier `attached_assets/` est bien présent avec toutes les images

2. **Via FTP/SFTP** :
   ```bash
   # Connectez-vous avec FileZilla ou Cyberduck
   # Remplacez les fichiers suivants :
   - public_html/index.html → remplacer
   - public_html/style.css → remplacer
   - public_html/attached_assets/ → vérifier que tout est présent
   ```

### Solution 2 : Vider le cache

#### Cache Navigateur :
1. **Chrome/Edge** : `Ctrl+Shift+Delete` (ou `Cmd+Shift+Delete` sur Mac)
   - Cochez "Images et fichiers en cache"
   - Période : "Toutes les périodes"
   - Cliquez sur "Effacer les données"

2. **Hard Refresh** : `Ctrl+F5` (ou `Cmd+Shift+R` sur Mac)

#### Cache Serveur (Hostinger) :
- Si vous utilisez un CDN ou un cache serveur, purgez-le depuis le panneau Hostinger
- Attendez 5-10 minutes après l'upload des nouveaux fichiers

### Solution 3 : Vérifier le CSS

Vérifiez que `style.css` est bien chargé :
1. Ouvrez la console du navigateur (`F12`)
2. Allez dans l'onglet **Network** (Réseau)
3. Rechargez la page
4. Cherchez `style.css` dans la liste
5. Vérifiez que le statut est **200 OK** et que la taille est d'environ **21 KB**

Si `style.css` retourne une **404** ou une **erreur** :
→ Le fichier n'est pas uploadé ou a un mauvais chemin

### Solution 4 : Vérifier les chemins relatifs

Dans `index.html`, vérifiez que les chemins sont corrects :
```html
<!-- Ligne 12 -->
<link rel="stylesheet" href="style.css">

<!-- Ligne 22 -->
<img src="attached_assets/image_1763569221576.png" ...>

<!-- Ligne 53 -->
<img src="attached_assets/white_bear_waving_hand_transparent.png" ...>
```

Si les fichiers sont dans un sous-dossier, ajustez les chemins.

## 🔍 Vérification Rapide

### Test 1 : Vérifier le HTML
```bash
# Sur votre serveur, vérifiez que cette ligne existe :
grep "Le jeu qui déforme vos messages" public_html/index.html
```

### Test 2 : Vérifier la taille des fichiers
```bash
# Sur le serveur, vérifiez les tailles :
ls -lh public_html/index.html   # Devrait être ~17 KB
ls -lh public_html/style.css    # Devrait être ~21 KB
```

### Test 3 : Tester l'accès direct
- Ouvrez dans le navigateur : `zig-zag.fun/style.css`
- Si le fichier s'affiche (code CSS visible), il est bien uploadé
- Si vous obtenez une erreur 404, le fichier n'est pas au bon endroit

## 📋 Checklist Complète

- [ ] `index.html` uploadé (17 KB)
- [ ] `style.css` uploadé (21 KB)
- [ ] `attached_assets/` uploadé avec toutes les images
- [ ] Cache navigateur vidé
- [ ] Cache serveur vidé (si applicable)
- [ ] Permissions correctes (644 pour fichiers, 755 pour dossiers)
- [ ] Chemins relatifs corrects dans HTML
- [ ] Test de la page après upload

## ⚠️ Problèmes Courants

### Le CSS ne s'applique pas
**Cause** : `style.css` non uploadé ou mauvais chemin
**Solution** : Vérifiez que `style.css` est dans `public_html/` et que le lien dans `index.html` est correct

### Les images ne s'affichent pas
**Cause** : Dossier `attached_assets/` incomplet ou mal uploadé
**Solution** : Re-uploader tout le dossier `attached_assets/` avec son contenu

### La page reste en cache
**Cause** : Cache navigateur ou CDN
**Solution** : Hard refresh (`Ctrl+F5`) ou vider le cache complètement

## 🎯 Fichiers à Uploader (Ordre de Priorité)

1. **URGENT** : `index.html` (si différent du serveur)
2. **URGENT** : `style.css` (si différent du serveur)
3. **IMPORTANT** : `attached_assets/` (vérifier toutes les images)
4. **NORMAL** : `script.js` (si modifié)
5. **NORMAL** : Autres fichiers HTML (si modifiés)

## 📞 Après Vérification

Si après avoir suivi ces étapes le problème persiste :
1. Faites une capture d'écran de la page serveur
2. Ouvrez la console du navigateur (F12) et capturez les erreurs
3. Vérifiez la taille et date des fichiers sur le serveur
4. Comparez avec les fichiers locaux

---

**Dernière mise à jour** : 10 décembre 2025






