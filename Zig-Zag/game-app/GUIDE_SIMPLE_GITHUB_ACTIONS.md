# 🎯 Guide Ultra Simple - GitHub Actions pour Nettoyage Audio

**Pour ceux qui ne comprennent rien aux techniques !**  
Tout expliqué simplement, étape par étape.

---

## 🎬 Qu'est-ce qu'on fait ?

On va dire à GitHub : "Tous les jours à 2h du matin, appelle cette fonction pour nettoyer les fichiers audio".

C'est tout ! C'est comme programmer une machine à café automatique.

---

## ✅ Ce qu'il vous faut

1. ✅ Votre code est sur GitHub (ou vous savez comment le mettre)
2. ✅ L'Edge Function est déployée (on a déjà fait ça)

---

## 📝 Les 3 Étapes Simples

### ÉTAPE 1 : Créer le fichier (✅ Vous l'avez déjà fait !)

Vous avez déjà créé le fichier `.github/workflows/cleanup-audio.yml`.

**Vérifier qu'il est bien là** :
1. Ouvrir le fichier dans votre éditeur
2. Il doit contenir ce code (remplacer `<votre-project-ref>` par votre project-ref) :

```yaml
name: Cleanup Audio Recordings

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            https://tihrltssmpxpreadpzqm.supabase.co/functions/v1/cleanup-audio-recordings
```

✅ Si le fichier existe avec ce contenu, passez à l'ÉTAPE 2.

---

### ÉTAPE 2 : Récupérer la Clé Secrète (2 minutes)

**Qu'est-ce que c'est ?**  
C'est comme un mot de passe pour que GitHub puisse appeler votre fonction Supabase.

#### Comment faire :

1. **Ouvrir votre navigateur**
2. **Aller sur** : https://supabase.com/dashboard
3. **Cliquer sur** votre projet "ZigZag" (dans la liste à gauche)
4. **Dans le menu de gauche**, chercher **"Settings"** (⚙️ icône d'engrenage)
5. **Cliquer sur** "Settings"
6. **Dans le sous-menu**, cliquer sur **"API"**
7. **Descendre** jusqu'à la section **"Project API keys"**
8. **Vous verrez 2 clés** :
   - `anon` `public` (celle-là, on n'en veut PAS)
   - `service_role` `secret` ← **C'EST CELLE-LÀ QU'IL FAUT !**
9. **À côté de "service_role"**, il y a un bouton pour **copier** (icône 📋)
10. **Cliquer sur ce bouton pour copier**

✅ Vous avez copié la clé ? Parfait ! Gardez-la quelque part (vous allez la coller dans GitHub).

⚠️ **ATTENTION** : Cette clé est SECRÈTE ! Ne la partagez JAMAIS publiquement !

---

### ÉTAPE 3 : Mettre la Clé dans GitHub (3 minutes)

**Qu'est-ce qu'on fait ?**  
On dit à GitHub : "Voici le mot de passe pour appeler la fonction".

#### Comment faire (très détaillé) :

1. **Ouvrir un nouvel onglet** dans votre navigateur
2. **Aller sur** : https://github.com
3. **Se connecter** avec votre compte GitHub
4. **En haut à droite**, cliquer sur votre **avatar** (photo de profil)
5. **Dans le menu**, cliquer sur **"Your repositories"**
6. **Chercher** votre repository "Zig-Zag" dans la liste
7. **Cliquer dessus** pour l'ouvrir
8. **En haut de la page**, vous verrez une barre horizontale avec des onglets :
   ```
   [Code] [Issues] [Pull requests] [Actions] [Settings] ...
   ```
9. **Cliquer sur** "Settings" (icône d'engrenage ⚙️, généralement à droite)
10. **Dans le menu de GAUCHE** (liste verticale), chercher **"Secrets and variables"**
    - Si vous ne le voyez pas, chercher directement **"Actions"** dans le menu de gauche
11. **Cliquer sur** "Secrets and variables" → puis **"Actions"**
    - OU directement sur **"Actions"** si c'est ce que vous voyez
12. **Vous verrez** "Repository secrets" avec un bouton **"New repository secret"**
13. **Cliquer sur** "New repository secret"
14. **Dans le champ "Name"**, taper EXACTEMENT : `SUPABASE_SERVICE_ROLE_KEY`
    - ⚠️ Attention aux majuscules et underscores ! Copier-coller ce nom exactement
15. **Dans le champ "Secret"**, coller la clé que vous avez copiée à l'ÉTAPE 2
16. **Cliquer sur** "Add secret" (bouton vert en bas)

✅ Vous devriez voir `SUPABASE_SERVICE_ROLE_KEY` apparaître dans la liste des secrets !

💡 **Vous ne trouvez toujours pas ?** Voir le guide détaillé : `TROUVER_SECRETS_GITHUB.md`

---

### ÉTAPE 4 : Mettre le Code sur GitHub (5 minutes)

**Qu'est-ce qu'on fait ?**  
On envoie le fichier qu'on a créé sur GitHub pour que GitHub puisse l'utiliser.

#### Option A : Si vous utilisez Git déjà (terminal)

```bash
# Aller dans le dossier du projet
cd /Users/jean-lisek/Desktop/Ancienne\ save/22:12/Zig-Zag/Zig-Zag

# Ajouter le fichier
git add .github/workflows/cleanup-audio.yml

# Enregistrer (commit)
git commit -m "Add GitHub Actions for audio cleanup"

# Envoyer sur GitHub (push)
git push
```

#### Option B : Si vous ne savez pas utiliser Git (interface GitHub)

1. **Aller sur** votre repository GitHub (même page qu'avant)
2. **Cliquer sur** l'onglet "Code" (en haut)
3. **Cliquer sur** "Add file" (bouton vert) → "Create new file"
4. **Dans le nom du fichier**, taper : `.github/workflows/cleanup-audio.yml`
   - ⚠️ Commencez par `.github/workflows/` puis le nom du fichier
5. **Dans le contenu du fichier**, copier-coller tout le code de l'ÉTAPE 1
6. **Descendre en bas de la page**
7. **Cliquer sur** "Commit new file" (bouton vert)
8. **C'est fait !**

---

## ✅ Vérifier que Ça Marche

### Test 1 : Voir le Workflow

1. **Aller sur** votre repository GitHub
2. **Cliquer sur** l'onglet **"Actions"** (en haut)
3. **Vous devriez voir** "Cleanup Audio Recordings" dans la liste
4. ✅ Si vous le voyez, c'est bon !

### Test 2 : Lancer Manuellement (pour tester)

1. **Toujours dans** l'onglet "Actions"
2. **Cliquer sur** "Cleanup Audio Recordings" dans la liste
3. **À droite**, vous verrez un bouton **"Run workflow"**
4. **Cliquer dessus** → "Run workflow" (dans le menu)
5. **Attendre** 10-20 secondes
6. **Une nouvelle ligne devrait apparaître** avec votre exécution
7. **Cliquer dessus**
8. **Cliquer sur** "Call cleanup function" (dans la liste des étapes)
9. **Vous devriez voir** des logs avec "Nettoyage terminé" ou un message similaire
10. ✅ Si vous voyez ça, **ça fonctionne !**

---

## ❓ Questions Fréquentes

### "Je ne trouve pas Settings dans GitHub"

→ C'est dans l'onglet en haut de votre repository, à côté de "Code", "Issues", etc.

### "Je ne vois pas Secrets and variables"

→ C'est dans le menu de gauche de la page Settings

### "Le workflow ne s'exécute pas automatiquement"

→ C'est normal ! Il s'exécutera demain à 2h UTC. Pour tester maintenant, utilisez "Run workflow" manuellement.

### "J'ai une erreur dans les logs"

→ Vérifiez que :
- Le nom du secret est EXACTEMENT `SUPABASE_SERVICE_ROLE_KEY`
- Vous avez copié la clé `service_role` (pas `anon`)
- Le project-ref dans l'URL est correct

---

## 🎉 C'est Terminé !

Une fois que tout est fait :
- ✅ Le fichier est créé
- ✅ Le secret est ajouté dans GitHub
- ✅ Le code est sur GitHub
- ✅ Vous avez testé manuellement

**Le nettoyage s'exécutera automatiquement tous les jours à 2h UTC !**

Vous n'avez plus rien à faire ! 🚀

---

## 📞 Besoin d'Aide ?

Si vous êtes bloqué à une étape précise, dites-moi :
1. À quelle étape vous êtes (1, 2, 3 ou 4)
2. Ce qui ne fonctionne pas exactement
3. Le message d'erreur si vous en avez un

Je vous aiderai étape par étape ! 😊

