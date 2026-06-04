# ✅ Étape Finale : Mettre le Fichier sur GitHub

Vous avez ajouté le secret ! Il reste une dernière étape : mettre le fichier workflow sur GitHub.

---

## 🎯 Vous Avez 2 Options

### Option A : Si vous utilisez Git (Terminal) ⭐

Si vous savez déjà utiliser Git et le terminal, c'est la méthode rapide.

```bash
# 1. Ouvrir le Terminal
# 2. Aller dans le dossier du projet
cd /Users/jean-lisek/Desktop/Ancienne\ save/22:12/Zig-Zag/Zig-Zag

# 3. Vérifier que le fichier existe
ls -la .github/workflows/cleanup-audio.yml

# 4. Ajouter le fichier
git add .github/workflows/cleanup-audio.yml

# 5. Enregistrer (commit)
git commit -m "Add GitHub Actions for audio cleanup"

# 6. Envoyer sur GitHub (push)
git push
```

✅ C'est terminé ! Le fichier est sur GitHub.

---

### Option B : Via l'Interface GitHub (Sans Terminal) ⭐⭐

Si vous ne savez pas utiliser Git, utilisez l'interface GitHub directement.

#### Étape 1 : Ouvrir le Fichier sur Votre Ordinateur

1. **Ouvrir** le fichier `.github/workflows/cleanup-audio.yml` dans votre éditeur
2. **Sélectionner TOUT** le contenu (Cmd+A ou Ctrl+A)
3. **Copier** (Cmd+C ou Ctrl+C)

#### Étape 2 : Créer le Fichier sur GitHub

1. **Aller sur** votre repository GitHub (même page qu'avant)
2. **Cliquer sur** l'onglet **"Code"** (en haut)
3. **Cliquer sur** le bouton vert **"Add file"** (à droite)
4. **Dans le menu**, cliquer sur **"Create new file"**

#### Étape 3 : Créer le Chemin et Coller le Contenu

1. **Dans le champ "Name your file"** (nom du fichier), taper EXACTEMENT :
   ```
   .github/workflows/cleanup-audio.yml
   ```
   ⚠️ **Important** : Commencez par `.github/workflows/` puis le nom du fichier
   ⚠️ GitHub créera automatiquement les dossiers s'ils n'existent pas

2. **Dans la grande zone de texte** (contenu du fichier), **coller** le code que vous avez copié

3. **Descendre en bas de la page**

4. **Dans le champ "Commit new file"** (optionnel), vous pouvez laisser le message par défaut ou taper :
   ```
   Add GitHub Actions for audio cleanup
   ```

5. **Cliquer sur** le bouton vert **"Commit new file"** (en bas à droite)

✅ **C'est terminé !** Le fichier est maintenant sur GitHub !

---

## ✅ Vérifier que Ça Fonctionne

### Test 1 : Voir le Workflow

1. **Aller sur** votre repository GitHub
2. **Cliquer sur** l'onglet **"Actions"** (en haut)
3. **Vous devriez voir** "Cleanup Audio Recordings" dans la liste des workflows
4. ✅ Si vous le voyez, c'est bon !

### Test 2 : Lancer le Workflow Manuellement (Test)

1. **Dans l'onglet "Actions"**, cliquer sur **"Cleanup Audio Recordings"**
2. **À droite**, vous verrez un bouton **"Run workflow"** (avec une flèche vers le bas ▼)
3. **Cliquer dessus** → **"Run workflow"** (dans le menu déroulant)
4. **Attendre** 10-20 secondes
5. **Une nouvelle ligne devrait apparaître** avec votre exécution (statut "Running" ou "Completed")
6. **Cliquer dessus**
7. **Cliquer sur** "Call cleanup function" (dans la liste des étapes à gauche)
8. **Vous devriez voir** des logs avec :
   - "Nettoyage terminé: X partie(s) nettoyée(s), Y fichier(s) supprimé(s)"
   - OU un message d'erreur si quelque chose ne va pas
9. ✅ Si vous voyez "Nettoyage terminé", **ça fonctionne parfaitement !**

---

## 🎉 C'est Terminé !

Une fois que vous avez fait ça :
- ✅ Le fichier workflow est sur GitHub
- ✅ Le secret est configuré
- ✅ Le workflow est visible dans Actions

**Le nettoyage s'exécutera automatiquement tous les jours à 2h UTC !**

Vous n'avez plus rien à faire ! 🚀

---

## 📊 Ce Qui Va Se Passer

- **Tous les jours à 2h UTC**, GitHub Actions exécutera automatiquement votre workflow
- Le workflow appellera votre Edge Function Supabase
- L'Edge Function nettoiera les fichiers audio de plus de 24h
- **Vous n'avez rien à faire !** C'est complètement automatique.

---

## 🆘 Si Vous Avez des Erreurs lors du Test

### Erreur : "Secret SUPABASE_SERVICE_ROLE_KEY not found"

✅ **Solution** : Vérifier que le secret est bien nommé `SUPABASE_SERVICE_ROLE_KEY` (exactement)

### Erreur : "Permission denied"

✅ **Solution** : Vérifier que vous avez bien copié la clé `service_role` (pas `anon`)

### Erreur : "Function not found" ou 404

✅ **Solution** : Vérifier que l'Edge Function est bien déployée sur Supabase

---

**Dites-moi quelle option vous choisissez (A ou B) et si vous avez des questions !** 😊

