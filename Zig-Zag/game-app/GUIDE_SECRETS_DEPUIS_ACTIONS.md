# 🔐 Ajouter un Secret depuis la Page Actions

Vous êtes dans **Settings > Actions > General**. Voici comment ajouter un secret depuis là.

---

## 🎯 Option 1 : Chercher "Secrets" dans le Menu de Gauche

**Dans le menu de gauche** (où vous voyez "Actions", "General", "Runners") :

1. **Regardez** s'il y a d'autres éléments dans le menu de gauche
2. **Cherchez** :
   - "Secrets and variables" (au même niveau que "Actions")
   - OU "Secrets" quelque part dans la liste
3. **Si vous le voyez**, cliquez dessus

---

## 🎯 Option 2 : Via l'URL Directe (LE PLUS SIMPLE !)

Au lieu de chercher dans les menus, utilisez directement cette URL :

1. **Regardez l'URL** de votre page actuelle dans la barre d'adresse
2. **Elle ressemble à** : `https://github.com/VOTRE_USERNAME/VOTRE_REPO/settings/actions`
3. **Remplacez** `/settings/actions` par `/settings/secrets/actions`
4. **Appuyez sur Entrée**

**Exemple** :
- URL actuelle : `https://github.com/jean-lisek/Zig-Zag/settings/actions`
- Nouvelle URL : `https://github.com/jean-lisek/Zig-Zag/settings/secrets/actions`

✅ Cette URL vous amène directement à la page des secrets !

---

## 🎯 Option 3 : Chercher dans le Menu "Actions"

**Dans le menu de gauche**, sous "Actions" (le triangle doit être ouvert) :

1. **Cliquez sur** "Actions" pour voir tous les sous-menus
2. **Cherchez** :
   - "Secrets" 
   - OU "Secrets and variables"
   - OU "Repository secrets"
3. **Cliquez dessus**

---

## 🎯 Option 4 : Via la Barre de Recherche

1. **En haut de la page Settings**, il y a peut-être une **barre de recherche**
2. **Tapez** : `secrets`
3. **GitHub devrait vous montrer** "Secrets and variables" dans les résultats
4. **Cliquez dessus**

---

## ✅ Une Fois sur la Page des Secrets

Une fois que vous êtes sur la page des secrets, vous verrez :

1. **"Repository secrets"** comme titre
2. Un bouton **"New repository secret"** (bouton vert)
3. **Cliquez sur** "New repository secret"
4. **Remplissez** :
   - **Name** : `SUPABASE_SERVICE_ROLE_KEY` (exactement comme ça)
   - **Secret** : Collez la clé que vous avez copiée depuis Supabase
5. **Cliquez sur** "Add secret"

---

## 💡 Astuce : L'URL Directe est le Plus Simple

**Utilisez cette méthode** :
1. Regardez votre URL actuelle
2. Remplacez `/settings/actions` par `/settings/secrets/actions`
3. Appuyez sur Entrée
4. C'est fait ! Vous êtes sur la bonne page !

**Exemple concret** :
- Si votre URL est : `https://github.com/jean-lisek/Zig-Zag/settings/actions`
- Allez à : `https://github.com/jean-lisek/Zig-Zag/settings/secrets/actions`

---

**Essayez l'Option 2 (URL directe) en premier, c'est le plus rapide !** 🚀

