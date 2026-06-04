# 🗑️ Guide de Configuration - Nettoyage Automatique Audio

**Date** : 22 Décembre 2024  
**Durée de conservation** : 24h à partir du début de la partie (`created_at`)

---

## 📋 Vue d'ensemble

Le système de nettoyage automatique supprime les fichiers audio des parties créées il y a plus de 24 heures pour :
- ✅ Économiser l'espace de stockage
- ✅ Maîtriser les coûts Supabase
- ✅ Maintenir un stockage propre

---

## 🚀 Installation en 3 Étapes

### Étape 1 : Créer les Fonctions SQL

1. **Aller sur** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Sélectionner** votre projet ZigZag
3. **Cliquer sur** SQL Editor
4. **Ouvrir** le fichier `sql/10_cleanup_audio_storage.sql`
5. **Copier** tout le contenu
6. **Coller** dans l'éditeur SQL
7. **Exécuter** (Run ou Ctrl+Enter)

✅ **Vérification** :
```sql
-- Vérifier que les fonctions existent
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%audio%';

-- Devrait retourner:
-- - get_games_to_cleanup_audio
-- - cleanup_audio_for_game
-- - get_audio_cleanup_list
```

---

### Étape 2 : Déployer l'Edge Function

#### ⭐ Option A : Via Supabase Dashboard (RECOMMANDÉ pour débuter)

**Pourquoi cette option ?** Plus simple, pas d'installation, interface visuelle, idéale pour une première fois.

**Instructions étape par étape** :

1. **Aller sur** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Sélectionner** votre projet ZigZag
3. **Cliquer sur** "Edge Functions" dans le menu de gauche
4. **Cliquer sur** "Create a new function" (ou le bouton "+ New Function")
5. **Nommer la fonction** : `cleanup-audio-recordings`
   - ⚠️ Le nom doit être **exactement** `cleanup-audio-recordings` (avec tirets, pas d'espaces)
6. **Ouvrir** le fichier `supabase/functions/cleanup-audio-recordings/index.ts`
7. **Copier TOUT le contenu** du fichier
8. **Coller** dans l'éditeur du Dashboard
9. **Cliquer sur** "Deploy" (ou "Save")

✅ **Vérification** : Vous devriez voir la fonction dans la liste avec le statut "Active".

**Avantages** :
- ✅ Pas d'installation nécessaire
- ✅ Interface visuelle simple
- ✅ Voir et éditer directement dans le navigateur
- ✅ Logs accessibles directement

**Inconvénients** :
- ⚠️ Copier-coller manuel du code
- ⚠️ Pas de versioning automatique

---

#### Option B : Via Supabase CLI (Pour utilisateurs avancés)

**Pourquoi cette option ?** Meilleure pour le développement itératif, versioning Git, CI/CD.

**Prérequis** : Supabase CLI installé

**Instructions** :

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
# Sur macOS :
brew install supabase/tap/supabase

# OU via npm (universel) :
npm install -g supabase

# 2. Se connecter à Supabase (ouvrira le navigateur)
supabase login

# 3. Aller dans le dossier du projet
cd /Users/jean-lisek/Desktop/Ancienne\ save/22:12/Zig-Zag/Zig-Zag

# 4. Lier le projet (remplacer <project-ref>)
# Le project-ref se trouve dans l'URL : https://supabase.com/dashboard/project/<project-ref>
supabase link --project-ref <votre-project-ref>

# 5. Déployer la fonction
supabase functions deploy cleanup-audio-recordings
```

**Où trouver le project-ref ?**
- Dans l'URL de votre projet Supabase : `https://supabase.com/dashboard/project/tihrltssmpxpreadpzqm`
- Le `project-ref` est la partie après `/project/` (ex: `tihrltssmpxpreadpzqm`)

**Avantages** :
- ✅ Déploiement automatisé
- ✅ Intégration Git/CI/CD
- ✅ Gestion de plusieurs environnements
- ✅ Meilleur pour le développement

**Inconvénients** :
- ⚠️ Nécessite l'installation du CLI
- ⚠️ Configuration initiale plus complexe

---

💡 **Besoin d'aide ?** Voir le guide détaillé : `GUIDE_DEPLOIEMENT_EDGE_FUNCTION.md`

---

### Étape 3 : Configurer le Cron Job ⏰

⚠️ **IMPORTANT** : Sans cron job, le nettoyage ne se fera **pas automatiquement** !
Le cron job est **essentiel** pour que la fonction s'exécute tous les jours.

💡 **Besoin d'explications ?** Voir `POURQUOI_CRON_JOB.md` pour comprendre pourquoi c'est important.

#### Option 1 : GitHub Actions (Gratuit, Recommandé) ⭐

💡 **Guide détaillé** : Voir `GUIDE_INSTALLATION_GITHUB_ACTIONS.md` pour les instructions complètes étape par étape.

**Résumé rapide** :

1. **Créer** le fichier `.github/workflows/cleanup-audio.yml` :

```yaml
name: Cleanup Audio Recordings

on:
  schedule:
    - cron: '0 2 * * *'  # Tous les jours à 2h UTC
  workflow_dispatch:  # Permet de déclencher manuellement

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            https://<votre-project-ref>.supabase.co/functions/v1/cleanup-audio-recordings
```

2. **Récupérer** le SERVICE_ROLE_KEY depuis Supabase :
   - Dashboard > Settings > API > "service_role" key (⚠️ PAS l'anon key !)

3. **Ajouter** le secret dans GitHub :
   - Repo GitHub > Settings > Secrets and variables > Actions > New repository secret
   - Nom : `SUPABASE_SERVICE_ROLE_KEY` (exactement comme ça)
   - Valeur : Coller le service_role key

4. **Commit et push** sur GitHub

✅ **Voir le guide détaillé** : `GUIDE_INSTALLATION_GITHUB_ACTIONS.md` pour toutes les étapes avec captures d'écran.

#### Option 2 : Cron-job.org (Gratuit)

1. Aller sur [cron-job.org](https://cron-job.org)
2. Créer un compte gratuit
3. Créer un nouveau cron job :
   - **URL** : `https://<votre-project-ref>.supabase.co/functions/v1/cleanup-audio-recordings`
   - **Méthode** : POST
   - **Headers** : 
     - `Authorization: Bearer <VOTRE_SERVICE_ROLE_KEY>`
     - `Content-Type: application/json`
   - **Schedule** : Tous les jours à 2h (0 2 * * *)

#### Option 3 : pg_cron (Avancé)

Voir la documentation dans `supabase/functions/cleanup-audio-recordings/README.md`

---

## ✅ Vérification

### Test Manuel

```bash
curl -X POST \
  -H "Authorization: Bearer <VOTRE_SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  https://<votre-project-ref>.supabase.co/functions/v1/cleanup-audio-recordings
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Nettoyage terminé: 5 partie(s) nettoyée(s), 15 fichier(s) supprimé(s)",
  "stats": {
    "gamesCleaned": 5,
    "filesDeleted": 15,
    "gamesProcessed": 5
  }
}
```

### Vérifier les Parties à Nettoyer

```sql
-- Voir toutes les parties qui seront nettoyées au prochain run
SELECT * FROM get_audio_cleanup_list();

-- Compter les parties à nettoyer
SELECT COUNT(*) 
FROM games g
WHERE g.created_at < NOW() - INTERVAL '24 hours'
AND EXISTS (
  SELECT 1 
  FROM steps s 
  WHERE s.game_id = g.id 
  AND s.step_type = 'audio'
);
```

---

## 📊 Monitoring

### Logs Supabase

1. Aller dans **Edge Functions** > **cleanup-audio-recordings**
2. Cliquer sur **Logs**
3. Voir les exécutions quotidiennes

### Logs CLI

```bash
supabase functions logs cleanup-audio-recordings --follow
```

---

## ⚙️ Configuration

### Changer la Durée de Conservation

Par défaut : **24 heures**

Pour changer, modifier dans `sql/10_cleanup_audio_storage.sql` :

```sql
-- Pour 48 heures:
WHERE g.created_at < NOW() - INTERVAL '48 hours'

-- Pour 7 jours:
WHERE g.created_at < NOW() - INTERVAL '7 days'
```

Puis réexécuter le fichier SQL.

---

## 🐛 Dépannage

### ❌ Erreur : "Function get_audio_cleanup_list not found"

✅ **Solution** : Vérifier que le fichier SQL `10_cleanup_audio_storage.sql` a bien été exécuté

### ❌ Erreur : "Permission denied"

✅ **Solution** : Vérifier que vous utilisez le **SERVICE_ROLE_KEY** (pas l'anon key)

### ❌ Erreur : "Bucket not found"

✅ **Solution** : Vérifier que le bucket `audio-recordings` existe dans Supabase Storage

### ❌ Aucun fichier supprimé

✅ **Vérifications** :
1. Y a-t-il des parties créées il y a plus de 24h ?
2. Ces parties ont-elles des étapes audio ?
3. Les fichiers existent-ils dans Storage ?

---

## 📝 Fichiers Concernés

- ✅ `sql/10_cleanup_audio_storage.sql` - Fonctions SQL
- ✅ `supabase/functions/cleanup-audio-recordings/index.ts` - Edge Function
- ✅ `supabase/functions/cleanup-audio-recordings/README.md` - Documentation technique
- ✅ `GUIDE_NETTOYAGE_AUDIO.md` - Ce fichier

---

## 🔒 Sécurité

⚠️ **Important** :
- Utilisez **uniquement** le SERVICE_ROLE_KEY pour cette fonction
- Ne partagez jamais le SERVICE_ROLE_KEY publiquement
- Limitez l'accès au cron job (GitHub Actions avec secrets, etc.)

---

## 📈 Impact

### Avant Nettoyage
- Fichiers audio conservés indéfiniment
- Coûts de stockage qui augmentent continuellement

### Après Nettoyage (24h)
- Fichiers audio conservés 24h maximum
- Coûts maîtrisés (max ~60 MB/jour si 10 parties/jour)
- Espace libéré automatiquement

---

**Dernière mise à jour** : 22 Décembre 2024

