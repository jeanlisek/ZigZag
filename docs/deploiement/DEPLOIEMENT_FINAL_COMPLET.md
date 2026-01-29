# 🚀 Déploiement Final Complet - ZigZag

**Date** : 17 Décembre 2024  
**Statut** : ✅ Build réussi - Prêt pour déploiement  
**Toutes les corrections incluses** : ColorPicker avancé, WaitingScreen, Corrections bugs

---

## 📦 Contenu du Build

**Dossier à uploader** : `/Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/game-app/out/`

**Contient** :
- ✅ ColorPicker avancé (gradient 2D, RGB, HEX, pipette)
- ✅ WaitingScreen interactif (canvas gribouillage + réactions)
- ✅ Toutes les corrections de bugs (UUID, tours, erreurs)
- ✅ `.htaccess` configuré pour les MIME types

---

## 🎯 Déploiement en 5 Étapes

### ⚠️ AVANT DE COMMENCER

**1. Créer la table SQL sur Supabase** (OBLIGATOIRE)

https://supabase.com/dashboard → Votre projet → SQL Editor

Copier et exécuter `sql/08_deployment_complete.sql` :

```sql
-- Vérifier que la table game_reactions existe
SELECT * FROM game_reactions LIMIT 1;
```

---

### 🔄 Étape 1 : Préparer les Fichiers

```bash
cd /Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/game-app

# Vérifier que out/ existe
ls -la out/

# Vérifier que .htaccess est là
ls -la out/.htaccess

# Compter les fichiers (doit être ~150+)
find out -type f | wc -l
```

**Si `out/` n'existe pas** :
```bash
npm run build
```

---

### 📤 Étape 2 : Upload sur le Serveur

#### Option A : Via FTP/FileZilla (Recommandé pour vous)

1. **Ouvrir FileZilla**
2. **Connexion** à `game.zig-zag.fun`
   - Hôte : `game.zig-zag.fun` (ou IP)
   - Utilisateur : [votre user]
   - Mot de passe : [votre password]
   - Port : 21 (FTP) ou 22 (SFTP)

3. **Aller dans le dossier racine** (sur le serveur à droite)
   - Généralement : `/var/www/game.zig-zag.fun/` 
   - OU : `public_html/`
   - OU : `www/`

4. **SUPPRIMER** tous les fichiers SAUF :
   - `.htaccess` (si vous avez des règles personnalisées)
   - Dossiers système (`.well-known`, etc.)

5. **Sélectionner TOUT** dans `out/` (sur votre PC à gauche)
   - Ctrl+A (Windows) ou Cmd+A (Mac)
   - **IMPORTANT** : Afficher les fichiers cachés pour voir `.htaccess`
     - FileZilla : Serveur → Forcer l'affichage des fichiers cachés

6. **Glisser-déposer** TOUT vers le serveur (à droite)

7. **Attendre la fin** de l'upload
   - Peut prendre 5-15 minutes selon votre connexion

8. **VÉRIFIER** sur le serveur que vous avez :
   ```
   /_next/
   /jeu/
   /index.html
   /.htaccess  ← CRUCIAL !
   /404.html
   /favicon.ico
   ```

---

#### Option B : Via SSH/rsync (Plus rapide)

```bash
# Adapter SERVER_USER et SERVER_HOST
SERVER_USER="votre_user"
SERVER_HOST="game.zig-zag.fun"
SERVER_PATH="/var/www/game.zig-zag.fun"

# Upload
rsync -avz --delete \
  --exclude='.DS_Store' \
  out/ \
  $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

# Vérifier les permissions
ssh $SERVER_USER@$SERVER_HOST "cd $SERVER_PATH && chmod 644 .htaccess && chmod -R 755 _next"
```

---

### ✅ Étape 3 : Vérifications Post-Upload

#### Sur le Serveur (Via SSH ou File Manager)

```bash
# Connexion SSH
ssh user@game.zig-zag.fun

# Aller dans le dossier
cd /var/www/game.zig-zag.fun  # ou public_html

# Vérifier la structure
ls -la

# Vous DEVEZ voir :
# _next/
# jeu/
# index.html
# .htaccess

# Vérifier les permissions
ls -l .htaccess
# Doit être : -rw-r--r-- (644)

# Vérifier le contenu du .htaccess
head -20 .htaccess
# Doit contenir : AddType application/javascript .js
```

---

### 🧪 Étape 4 : Tests

#### Test 1 : MIME Types

```bash
# Tester un fichier JS
curl -I https://game.zig-zag.fun/_next/static/chunks/app/jeu/page-XXX.js | grep Content-Type

# Vous DEVEZ voir :
# Content-Type: application/javascript
# OU
# Content-Type: text/javascript

# PAS "text/plain" !!
```

#### Test 2 : Navigation

1. **Vider le cache navigateur** : `Ctrl + Shift + Delete`
2. **Hard refresh** : `Ctrl + Shift + R`
3. Aller sur : https://game.zig-zag.fun
4. ✅ Page d'accueil charge
5. Cliquer sur "Jouer"
6. ✅ Redirection vers matchmaking

#### Test 3 : Console (CRITIQUE)

1. Ouvrir **Console** (F12)
2. Aller sur : https://game.zig-zag.fun/jeu/matchmaking
3. ✅ **AUCUNE erreur rouge**
4. ✅ **PAS** de "Failed to load chunk"
5. ✅ **PAS** de "MIME type"
6. ✅ **PAS** de "invalid input syntax for type uuid"

#### Test 4 : ColorPicker

1. Lancer une partie
2. À l'étape dessin, **cliquer sur le bouton couleur**
3. ✅ **Modal s'ouvre** avec gradient 2D
4. ✅ Inputs RGB + HEX visibles
5. ✅ Pipette disponible

#### Test 5 : WaitingScreen

1. Dans une partie, **dessiner et soumettre**
2. ✅ **Canvas de gribouillage** s'affiche
3. ✅ **Réactions rapides** (emojis + messages) disponibles
4. ✅ Progression de la partie visible

---

### 🔧 Étape 5 : Résolution de Problèmes

#### Problème A : Erreur "Failed to load chunk"

**Symptôme** : Console montre `Failed to load chunk /_next/static/chunks/XXX.js`

**Diagnostic** :
```bash
# Sur le serveur
ls -la _next/static/chunks/ | wc -l
# Doit être > 15 fichiers
```

**Solution** :
- Re-upload TOUT le dossier `out/`
- Vérifier que `_next/` est bien uploadé

---

#### Problème B : Erreur MIME type

**Symptôme** : Console montre `MIME type ('text/plain') is not executable`

**Diagnostic** :
```bash
curl -I https://game.zig-zag.fun/_next/static/chunks/app/page.js | grep Content-Type
# Si retourne "text/plain" → PROBLÈME
```

**Solution** :
```bash
# 1. Vérifier que .htaccess est sur le serveur
ls -la .htaccess

# 2. Vérifier le contenu
cat .htaccess | grep "AddType application/javascript"

# 3. Si manquant, re-uploader .htaccess depuis out/.htaccess

# 4. Vérifier AllowOverride (nécessite accès root)
sudo nano /etc/apache2/sites-available/game.zig-zag.fun.conf
# Chercher : AllowOverride All

# 5. Recharger Apache
sudo systemctl reload apache2
```

---

#### Problème C : Erreur "invalid input syntax for type uuid"

**Symptôme** : Console montre `Error: invalid input syntax for type uuid: "undefined"`

**Cause** : Ancien build déployé sans les corrections

**Solution** :
```bash
# 1. RE-BUILD complet
cd /Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/game-app
rm -rf .next out
npm run build

# 2. RE-UPLOAD complet
# (Voir Étape 2)
```

---

#### Problème D : Erreur 406 sur game_reactions

**Symptôme** : Console montre `406 (Not Acceptable)` sur `/rest/v1/game_reactions`

**Cause** : Table `game_reactions` non créée sur Supabase

**Solution** :
1. https://supabase.com/dashboard
2. SQL Editor
3. Exécuter `sql/08_deployment_complete.sql`
4. Vérifier : `SELECT * FROM game_reactions LIMIT 1;`

---

## 📊 Checklist Finale

### Avant Upload
- [x] Build réussi (`npm run build`)
- [x] `out/` contient tous les fichiers
- [x] `out/.htaccess` existe
- [ ] Table SQL créée sur Supabase

### Après Upload
- [ ] Tous les fichiers uploadés (150+)
- [ ] `.htaccess` présent sur le serveur
- [ ] `/_next/` existe sur le serveur
- [ ] Console : aucune erreur
- [ ] Page charge correctement
- [ ] ColorPicker fonctionne
- [ ] WaitingScreen s'affiche
- [ ] Réactions fonctionnent

---

## 🎉 Résultat Attendu

Après un déploiement réussi, vous devez avoir :

✅ **Page d'accueil** : https://game.zig-zag.fun  
✅ **Matchmaking** : https://game.zig-zag.fun/jeu/matchmaking  
✅ **ColorPicker avancé** : Modal avec gradient 2D  
✅ **WaitingScreen** : Canvas + Réactions  
✅ **Pas d'erreur** : Console propre  
✅ **Mobile** : Responsive parfait  

---

## 📞 Support

Si après toutes ces étapes, ça ne fonctionne toujours pas :

**Contactez votre hébergeur** et demandez :
1. Activer `AllowOverride All` pour `game.zig-zag.fun`
2. Vérifier que `mod_mime` et `mod_headers` sont activés
3. Logs Apache : `/var/log/apache2/error.log`

---

## 🔄 Pour les Prochains Déploiements

**Workflow simplifié** :

```bash
# 1. Modifications du code
cd game-app
# ... éditer les fichiers ...

# 2. Build
npm run build

# 3. Upload
# Via FileZilla : Glisser-déposer out/ → serveur
# OU
# Via SSH : ./deploy.sh

# 4. Test
# https://game.zig-zag.fun
# F12 → Vérifier console
```

---

**Bon déploiement ! 🚀**

---

**Fichiers de référence** :
- `GUIDE_DEPLOIEMENT_COMPLET.md` : Guide détaillé
- `DEPLOIEMENT_FIX_URGENT.md` : Correction erreurs MIME
- `deploy.sh` : Script automatique
- `sql/08_deployment_complete.sql` : SQL Supabase
