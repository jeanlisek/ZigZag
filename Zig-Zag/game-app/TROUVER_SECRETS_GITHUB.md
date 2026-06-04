# 🔍 Comment Trouver "Secrets and variables" dans GitHub

**Problème** : Vous ne trouvez pas "Secrets and variables" → "Actions" dans GitHub.

---

## 📍 Où Se Trouve Cette Option ?

### Étape par Étape avec Images Mentales

1. **Aller sur GitHub.com** et se connecter
2. **Cliquer sur votre avatar** (en haut à droite) → "Your repositories"
3. **Chercher** votre repository "Zig-Zag" (ou le nom de votre repo)
4. **Cliquer dessus** pour l'ouvrir
5. **En haut de la page**, vous verrez une barre avec plusieurs onglets :
   ```
   [Code] [Issues] [Pull requests] [Actions] [Projects] [Wiki] [Security] [Settings] [Insights]
   ```
6. **Cliquer sur "Settings"** (c'est l'avant-dernier onglet, avec une icône d'engrenage ⚙️)
7. **Dans le menu de GAUCHE**, vous verrez une liste verticale avec :
   - General
   - Access
   - Secrets and variables ← **C'EST ICI !**
   - Actions
   - etc.

---

## 🎯 Instructions Détaillées

### Si Vous Ne Voyez Pas "Settings"

**Problème possible** : Vous n'êtes peut-être pas le propriétaire du repository.

**Solution** :
- Vérifiez que vous êtes bien connecté avec le bon compte
- Vérifiez que vous avez les droits d'administrateur sur le repository

### Si Vous Voyez "Settings" Mais Pas "Secrets and variables"

**Option 1 : C'est dans le sous-menu**

1. **Cliquer sur "Settings"**
2. **Dans le menu de gauche**, chercher **"Secrets and variables"**
3. **Cliquer dessus** (c'est un élément cliquable)
4. **Un sous-menu devrait s'ouvrir** avec :
   - Actions ← **Cliquer ici !**
   - Dependabot
   - Codespaces

**Option 2 : C'est directement "Actions"**

Parfois, selon la version de GitHub, c'est directement :
1. **Settings** → **Actions** (dans le menu de gauche)
2. Puis chercher **"Secrets"** ou **"Repository secrets"**

---

## 🔄 Alternative : Chercher "Secrets" Directement

Si vous ne trouvez toujours pas, essayez cette méthode :

1. **Aller dans Settings**
2. **Utiliser la barre de recherche** en haut de la page Settings
3. **Taper** : `secrets`
4. **GitHub devrait vous montrer** "Secrets and variables" dans les résultats

---

## 📸 Chemin Complet (Comme un GPS)

```
GitHub.com
  ↓
Votre Repository "Zig-Zag"
  ↓
Onglet "Settings" (en haut)
  ↓
Menu de gauche → "Secrets and variables"
  ↓
Sous-menu → "Actions"
  ↓
Bouton "New repository secret"
```

---

## 🆘 Si Vous Ne Trouvez Toujours Pas

### Vérification 1 : Êtes-vous au Bon Endroit ?

- ✅ Vous êtes sur **votre repository** (pas sur GitHub.com en général)
- ✅ Vous voyez l'onglet **"Settings"** en haut
- ✅ Vous avez cliqué sur **"Settings"**

### Vérification 2 : Avez-vous les Droits ?

- ✅ Vous êtes le **propriétaire** du repository OU
- ✅ Vous avez les **droits d'administrateur**

### Vérification 3 : Version de GitHub

Parfois l'interface change. Essayez :

1. **Settings** → **Actions** (directement, sans passer par "Secrets and variables")
2. **Chercher** "Secrets" ou "Repository secrets" dans la page

---

## 💡 Solution Alternative : Via l'URL Directe

Si vous avez toujours du mal, essayez d'aller directement à cette URL :

```
https://github.com/VOTRE_USERNAME/VOTRE_REPO/settings/secrets/actions
```

**Remplacez** :
- `VOTRE_USERNAME` par votre nom d'utilisateur GitHub
- `VOTRE_REPO` par le nom de votre repository (ex: "Zig-Zag")

**Exemple** :
```
https://github.com/jean-lisek/Zig-Zag/settings/secrets/actions
```

---

## 🎬 Instructions Visuelles Pas à Pas

### Étape 1 : Aller sur GitHub

1. Ouvrir votre navigateur
2. Aller sur **github.com**
3. Se connecter si nécessaire

### Étape 2 : Trouver Votre Repository

1. **En haut à droite**, cliquer sur votre **avatar** (photo de profil)
2. Dans le menu, cliquer sur **"Your repositories"**
3. **Chercher** "Zig-Zag" dans la liste
4. **Cliquer dessus**

### Étape 3 : Aller dans Settings

1. **En haut de la page**, vous verrez une barre horizontale avec des onglets
2. **Chercher** l'onglet **"Settings"** (généralement à droite, avec une icône ⚙️)
3. **Cliquer dessus**

### Étape 4 : Trouver Secrets

1. **Sur la page Settings**, regardez le **menu de gauche** (liste verticale)
2. **Chercher** "Secrets and variables" dans cette liste
3. **Cliquer dessus**
4. **Un sous-menu s'ouvre** → Cliquer sur **"Actions"**

### Étape 5 : Créer le Secret

1. Vous devriez voir **"Repository secrets"** avec un bouton **"New repository secret"**
2. **Cliquer sur** "New repository secret"
3. **Remplir** :
   - Name : `SUPABASE_SERVICE_ROLE_KEY`
   - Secret : Coller votre clé
4. **Cliquer sur** "Add secret"

---

## 📞 Si Vous Êtes Toujours Bloqué

**Dites-moi** :
1. Que voyez-vous exactement dans le menu de gauche de Settings ?
2. Y a-t-il un onglet "Actions" directement dans Settings ?
3. Voyez-vous "Security" dans le menu de gauche ?

Je pourrai vous guider plus précisément selon ce que vous voyez ! 😊

