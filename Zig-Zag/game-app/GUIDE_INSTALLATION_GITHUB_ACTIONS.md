# ⚙️ Guide d'Installation - GitHub Actions pour Nettoyage Audio

**Objectif** : Configurer GitHub Actions pour exécuter automatiquement le nettoyage audio quotidiennement.

---

## 📋 Prérequis

1. ✅ Votre code est sur GitHub (ou vous pouvez le mettre)
2. ✅ Edge Function `cleanup-audio-recordings` déployée sur Supabase
3. ✅ Avoir accès à votre repository GitHub

---

## 🚀 Installation en 5 Étapes

### Étape 1 : Créer le Dossier .github/workflows

**Sur votre ordinateur** :

```bash
# Aller dans le dossier du projet
cd /Users/jean-lisek/Desktop/Ancienne\ save/22:12/Zig-Zag/Zig-Zag

# Créer le dossier .github/workflows (s'il n'existe pas)
mkdir -p .github/workflows

# Vérifier que le dossier est créé
ls -la .github/workflows/
```

✅ Si le dossier existe déjà, passez à l'étape 2.

---

### Étape 2 : Créer le Fichier de Workflow

**Créer le fichier** `.github/workflows/cleanup-audio.yml` :

```bash
# Toujours dans le dossier du projet
touch .github/workflows/cleanup-audio.yml
```

**Ouvrir le fichier** et copier-coller ce contenu :

```yaml
name: Cleanup Audio Recordings

on:
  schedule:
    - cron: '0 2 * * *'  # Tous les jours à 2h UTC
  workflow_dispatch:  # Permet de déclencher manuellement depuis GitHub

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

⚠️ **IMPORTANT** : Remplacez `tihrltssmpxpreadpzqm` par votre project-ref Supabase si différent !

**Où trouver votre project-ref ?**
- Dans l'URL de votre projet Supabase : `https://supabase.com/dashboard/project/<project-ref>`
- C'est la partie après `/project/`

---

### Étape 3 : Récupérer le SERVICE_ROLE_KEY

1. **Aller sur** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Sélectionner** votre projet ZigZag
3. **Cliquer sur** "Settings" (⚙️ dans le menu de gauche)
4. **Cliquer sur** "API" dans le sous-menu
5. **Trouver** la section "Project API keys"
6. **Copier** la clé **"service_role"** (⚠️ PAS l'anon key !)
   - C'est une longue chaîne qui commence souvent par `eyJ...`
   - ⚠️ **Ne partagez JAMAIS cette clé publiquement !**

✅ Gardez cette clé sous la main pour l'étape suivante.

---

### Étape 4 : Ajouter le Secret dans GitHub

#### 4.1 Aller sur GitHub

1. **Aller sur** [GitHub.com](https://github.com)
2. **Aller dans** votre repository Zig-Zag
3. **Cliquer sur** "Settings" (en haut du repo)

#### 4.2 Accéder aux Secrets

1. Dans le menu de gauche, **cliquer sur** "Secrets and variables"
2. **Cliquer sur** "Actions"
3. Vous devriez voir la section "Repository secrets"

#### 4.3 Créer le Secret

1. **Cliquer sur** "New repository secret"
2. **Dans "Name"**, taper exactement : `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ Le nom doit être **exactement** comme ça (majuscules, underscores)
3. **Dans "Secret"**, coller la clé service_role que vous avez copiée à l'étape 3
4. **Cliquer sur** "Add secret"

✅ Vous devriez voir `SUPABASE_SERVICE_ROLE_KEY` dans la liste des secrets.

---

### Étape 5 : Commit et Push sur GitHub

**Si votre code n'est pas encore sur GitHub** :

```bash
# Initialiser git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Add cleanup audio GitHub Actions workflow"

# Créer le repo sur GitHub puis :
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git push -u origin main
```

**Si votre code est déjà sur GitHub** :

```bash
# Ajouter le nouveau fichier
git add .github/workflows/cleanup-audio.yml

# Commit
git commit -m "Add cleanup audio GitHub Actions workflow"

# Push
git push
```

✅ Une fois pushé, GitHub Actions est configuré !

---

## ✅ Vérification

### Vérifier que le Workflow est Créé

1. **Aller sur** votre repository GitHub
2. **Cliquer sur** l'onglet "Actions" (en haut)
3. **Vous devriez voir** "Cleanup Audio Recordings" dans la liste des workflows

### Tester le Workflow Manuellement

1. **Aller dans** l'onglet "Actions"
2. **Cliquer sur** "Cleanup Audio Recordings" dans la liste
3. **Cliquer sur** "Run workflow" (bouton à droite)
4. **Cliquer sur** "Run workflow" (dans le menu déroulant)
5. **Attendre** quelques secondes
6. **Cliquer sur** la nouvelle exécution qui apparaît
7. **Cliquer sur** "Call cleanup function" pour voir les logs

✅ Si vous voyez les logs avec "Nettoyage terminé", c'est que ça fonctionne !

### Vérifier l'Exécution Automatique

Le workflow s'exécutera **automatiquement tous les jours à 2h UTC**.

Pour vérifier qu'il s'est exécuté :
1. **Aller dans** l'onglet "Actions"
2. **Chercher** les exécutions avec l'horloge ⏰ (exécutions programmées)
3. **Vérifier** qu'il y a une exécution quotidienne

---

## 🔍 Dépannage

### ❌ Erreur : "Secret SUPABASE_SERVICE_ROLE_KEY not found"

✅ **Solution** : Vérifier que le secret est bien créé avec le nom exact `SUPABASE_SERVICE_ROLE_KEY`

### ❌ Erreur : "Permission denied" dans les logs

✅ **Solution** : 
- Vérifier que vous avez bien copié le **service_role key** (pas l'anon key)
- Vérifier que le secret est bien ajouté dans GitHub

### ❌ Erreur : "Function not found" ou 404

✅ **Solution** :
- Vérifier que l'Edge Function est bien déployée sur Supabase
- Vérifier que le project-ref dans l'URL est correct
- Tester manuellement l'URL : `https://<project-ref>.supabase.co/functions/v1/cleanup-audio-recordings`

### ❌ Le workflow ne s'exécute pas automatiquement

✅ **Vérifications** :
1. Le fichier est bien dans `.github/workflows/cleanup-audio.yml` ?
2. Le fichier est bien commité et pushé sur GitHub ?
3. La syntaxe YAML est correcte (vérifier les espaces/indentation) ?

---

## 📝 Modifier l'Horaire

Par défaut, le nettoyage s'exécute à **2h UTC**.

Pour changer l'horaire, modifier la ligne dans `.github/workflows/cleanup-audio.yml` :

```yaml
- cron: '0 2 * * *'  # Format: minute heure jour mois jour-semaine
```

**Exemples** :
- `'0 2 * * *'` = 2h UTC tous les jours (actuel)
- `'0 3 * * *'` = 3h UTC tous les jours
- `'0 2 * * 1'` = 2h UTC tous les lundis
- `'30 1 * * *'` = 1h30 UTC tous les jours

⚠️ **Note** : GitHub Actions utilise UTC. Pour 2h du matin en France, c'est 0h UTC (en été) ou 1h UTC (en hiver).

---

## 📊 Monitoring

### Voir les Exécutions

1. **Aller dans** l'onglet "Actions" de votre repo GitHub
2. **Cliquer sur** "Cleanup Audio Recordings"
3. **Voir** toutes les exécutions (manuelles et automatiques)

### Voir les Logs

1. **Cliquer sur** une exécution
2. **Cliquer sur** "Call cleanup function"
3. **Voir** les logs détaillés avec les résultats du nettoyage

### Recevoir des Notifications

Par défaut, GitHub vous enverra un email si une exécution échoue.

Pour configurer les notifications :
1. **Aller dans** Settings > Notifications
2. **Activer** les notifications pour les workflows

---

## ✅ Checklist Finale

- [ ] Dossier `.github/workflows/` créé
- [ ] Fichier `cleanup-audio.yml` créé avec le bon contenu
- [ ] SERVICE_ROLE_KEY récupéré depuis Supabase
- [ ] Secret `SUPABASE_SERVICE_ROLE_KEY` ajouté dans GitHub
- [ ] Fichiers commités et pushés sur GitHub
- [ ] Workflow visible dans l'onglet "Actions"
- [ ] Test manuel réussi
- [ ] Workflow fonctionne correctement

---

## 🎉 C'est Terminé !

Une fois configuré, le nettoyage audio s'exécutera **automatiquement tous les jours à 2h UTC** sans aucune intervention de votre part !

**Temps nécessaire** : ~10-15 minutes  
**Résultat** : Nettoyage automatique pour toujours ! 🚀

---

**Besoin d'aide ?** Vérifiez la section Dépannage ou consultez les logs dans GitHub Actions.

