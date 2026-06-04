# 🚀 Guide Détaillé - Déploiement Edge Function

**Pourquoi ce guide ?** Comparaison détaillée des deux méthodes pour choisir la meilleure option.

---

## 📊 Comparaison des Options

| Critère | Dashboard | CLI |
|---------|-----------|-----|
| **Simplicité** | ⭐⭐⭐⭐⭐ Très simple | ⭐⭐⭐ Moyen |
| **Installation** | ✅ Aucune | ⚠️ Nécessite CLI |
| **Temps de setup** | ~5 minutes | ~15-20 minutes |
| **Versioning** | ⚠️ Manuel | ✅ Git intégré |
| **CI/CD** | ❌ Non | ✅ Oui |
| **Édition** | ✅ Interface visuelle | ⚠️ Éditeur local |
| **Logs** | ✅ Dashboard intégré | ✅ CLI ou Dashboard |
| **Recommandé pour** | Première fois, tests | Production, équipe |

---

## ⭐ Recommandation : Dashboard pour Commencer

**Si c'est votre première fois avec Edge Functions → Utilisez le Dashboard**

**Pourquoi ?**
- ✅ Plus rapide à mettre en place (5 min vs 20 min)
- ✅ Pas besoin d'installer des outils
- ✅ Interface visuelle intuitive
- ✅ Parfait pour tester et comprendre

**Vous pourrez toujours migrer vers CLI plus tard si nécessaire !**

---

## 🎯 Option 1 : Dashboard (Détaillé)

### Étape 1 : Accéder aux Edge Functions

1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet **ZigZag**
3. Dans le menu de gauche, cliquer sur **"Edge Functions"**
4. Vous devriez voir la liste des fonctions (vide si première fois)

### Étape 2 : Créer la Fonction

1. **Cliquer sur** "Create a new function" ou le bouton **"+ New Function"**
2. **Dans le champ "Function name"**, taper : `cleanup-audio-recordings`
   - ⚠️ **Important** : Utilisez exactement ce nom (minuscules, tirets)
   - ❌ Ne pas utiliser : `cleanup_audio_recordings`, `CleanupAudioRecordings`, etc.

### Étape 3 : Copier le Code

1. **Ouvrir** le fichier suivant dans votre éditeur :
   ```
   Zig-Zag/supabase/functions/cleanup-audio-recordings/index.ts
   ```

2. **Sélectionner TOUT le contenu** (Cmd+A ou Ctrl+A)

3. **Copier** (Cmd+C ou Ctrl+C)

4. **Dans le Dashboard**, coller le code dans l'éditeur (il devrait être vide)

### Étape 4 : Déployer

1. **Cliquer sur** le bouton **"Deploy"** (en bas à droite)
2. Attendre quelques secondes pour le déploiement
3. ✅ Vous devriez voir un message de succès

### Étape 5 : Vérifier

1. La fonction devrait apparaître dans la liste avec le statut **"Active"**
2. Vous pouvez cliquer dessus pour voir les détails
3. L'URL de la fonction devrait être visible :
   ```
   https://<votre-project-ref>.supabase.co/functions/v1/cleanup-audio-recordings
   ```

---

## 💻 Option 2 : CLI (Détaillé)

### Installation du CLI

#### Sur macOS (via Homebrew) - Recommandé

```bash
# Installer Homebrew si pas déjà installé
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Supabase CLI
brew install supabase/tap/supabase

# Vérifier l'installation
supabase --version
```

#### Via npm (Tous systèmes)

```bash
# Installer via npm (nécessite Node.js)
npm install -g supabase

# Vérifier l'installation
supabase --version
```

### Connexion et Déploiement

```bash
# 1. Se connecter (ouvrira le navigateur)
supabase login

# 2. Naviguer vers le dossier du projet
cd /Users/jean-lisek/Desktop/Ancienne\ save/22:12/Zig-Zag/Zig-Zag

# 3. Trouver votre project-ref
# Dans l'URL de votre projet Supabase :
# https://supabase.com/dashboard/project/tihrltssmpxpreadpzqm
# Le project-ref est : tihrltssmpxpreadpzqm

# 4. Lier le projet (remplacer par votre project-ref)
supabase link --project-ref tihrltssmpxpreadpzqm

# 5. Vérifier la structure (devrait voir "functions/cleanup-audio-recordings")
ls -la supabase/functions/

# 6. Déployer
supabase functions deploy cleanup-audio-recordings
```

**Si vous obtenez une erreur "Not linked to a project"** :
- Vérifier que vous êtes dans le bon dossier
- Relancer `supabase link --project-ref <votre-project-ref>`

**Si vous obtenez une erreur "Function not found"** :
- Vérifier que le dossier `supabase/functions/cleanup-audio-recordings/` existe
- Vérifier que le fichier `index.ts` existe dans ce dossier

---

## 🧪 Tester la Fonction

Une fois déployée (Dashboard ou CLI), testez la fonction :

### Via le Dashboard

1. Aller dans **Edge Functions** > `cleanup-audio-recordings`
2. Cliquer sur **"Invoke"** ou **"Test"**
3. Voir les logs pour le résultat

### Via curl (Terminal)

```bash
# Remplacer <project-ref> et <SERVICE_ROLE_KEY>
curl -X POST \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  https://<project-ref>.supabase.co/functions/v1/cleanup-audio-recordings
```

**Où trouver le SERVICE_ROLE_KEY ?**
- Supabase Dashboard > Settings > API
- Section "Project API keys"
- Clé **"service_role"** (⚠️ Ne pas partager publiquement !)

---

## 🔄 Mise à Jour de la Fonction

### Avec Dashboard

1. Aller dans **Edge Functions** > `cleanup-audio-recordings`
2. Cliquer sur **"Edit"** ou l'icône d'édition
3. Modifier le code
4. Cliquer sur **"Deploy"** pour sauvegarder

### Avec CLI

```bash
# Modifier le fichier index.ts localement
# Puis redéployer :
supabase functions deploy cleanup-audio-recordings
```

---

## 📝 Résumé : Quelle Option Choisir ?

### ✅ Utilisez le Dashboard si :
- C'est votre première Edge Function
- Vous voulez tester rapidement
- Vous préférez une interface visuelle
- Vous n'avez pas besoin de CI/CD

### ✅ Utilisez le CLI si :
- Vous avez déjà l'expérience avec les CLI
- Vous voulez intégrer dans Git/CI/CD
- Vous travaillez en équipe
- Vous voulez gérer plusieurs environnements

---

## 🆘 Dépannage

### Erreur : "Function name already exists"

✅ **Solution** : La fonction existe déjà. Utilisez l'option "Edit" au lieu de "Create"

### Erreur : "Permission denied" lors du test

✅ **Solution** : Utiliser le SERVICE_ROLE_KEY (pas l'anon key)

### Erreur CLI : "Not linked to a project"

✅ **Solution** : Exécuter `supabase link --project-ref <votre-project-ref>`

### La fonction ne s'exécute pas

✅ **Vérifications** :
1. La fonction est-elle déployée (statut "Active") ?
2. Utilisez-vous le SERVICE_ROLE_KEY pour l'appel ?
3. Les fonctions SQL sont-elles créées dans Supabase ?

---

**Recommandation finale** : Commencez avec le **Dashboard** pour une première utilisation, c'est plus simple ! 🚀

