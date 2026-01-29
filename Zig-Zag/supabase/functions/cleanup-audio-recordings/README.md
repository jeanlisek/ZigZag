# 🗑️ Edge Function: cleanup-audio-recordings

**Objectif** : Supprime automatiquement les fichiers audio des parties créées il y a plus de 24h.

---

## 📋 Prérequis

1. ✅ Bucket `audio-recordings` créé dans Supabase Storage
2. ✅ Fonction SQL `get_audio_cleanup_list()` créée (voir `sql/10_cleanup_audio_storage.sql`)
3. ✅ Supabase CLI installé

---

## 🚀 Installation

### 1. Installer Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Ou via npm
npm install -g supabase
```

### 2. Se connecter à Supabase

```bash
supabase login
```

### 3. Lier le projet

```bash
supabase link --project-ref <votre-project-ref>
```

Le `project-ref` se trouve dans l'URL de votre projet Supabase : `https://supabase.com/dashboard/project/<project-ref>`

### 4. Déployer la fonction

```bash
supabase functions deploy cleanup-audio-recordings
```

---

## ⏰ Configuration du Cron Job

### Option 1 : Via Supabase Dashboard (pg_cron)

1. Aller dans **Database** > **Extensions**
2. Activer l'extension `pg_cron` si ce n'est pas déjà fait
3. Aller dans **SQL Editor**
4. Exécuter :

```sql
-- Planifier l'exécution quotidienne à 2h du matin
SELECT cron.schedule(
  'cleanup-audio-recordings-daily',
  '0 2 * * *', -- Tous les jours à 2h
  $$
  SELECT
    net.http_post(
      url := 'https://<votre-project-ref>.supabase.co/functions/v1/cleanup-audio-recordings',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

**Note** : Vous devez remplacer `<votre-project-ref>` par votre project reference et configurer `app.settings.service_role_key`.

### Option 2 : Via External Cron (Recommandé)

Utiliser un service externe comme :
- **GitHub Actions** (gratuit pour repos publics)
- **Vercel Cron Jobs** (si vous utilisez Vercel)
- **Cron-job.org** (gratuit)
- **EasyCron** (gratuit jusqu'à 1 job/jour)

**Exemple avec GitHub Actions** (`.github/workflows/cleanup-audio.yml`) :

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

---

## 🧪 Test Manuel

### Test via curl

```bash
curl -X POST \
  -H "Authorization: Bearer <VOTRE_SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  https://<votre-project-ref>.supabase.co/functions/v1/cleanup-audio-recordings
```

### Test via Supabase Dashboard

1. Aller dans **Edge Functions**
2. Cliquer sur `cleanup-audio-recordings`
3. Cliquer sur **Invoke**
4. Voir les logs pour le résultat

---

## 📊 Logs et Monitoring

Les logs sont disponibles dans :
- **Supabase Dashboard** > **Edge Functions** > **cleanup-audio-recordings** > **Logs**

Ou via CLI :

```bash
supabase functions logs cleanup-audio-recordings
```

---

## 🔍 Vérification

### Vérifier les parties à nettoyer (avant nettoyage)

```sql
SELECT * FROM get_audio_cleanup_list();
```

### Vérifier que les fichiers ont été supprimés

```sql
-- Compter les parties avec audio > 24h
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

## ⚠️ Notes Importantes

1. **Durée de conservation** : 24h à partir du `created_at` de la partie
2. **Fichiers supprimés** : Tous les fichiers dans `audio-recordings/{game_id}/`
3. **Irréversible** : La suppression est définitive
4. **Service Role Key** : Nécessaire pour avoir les droits de suppression
5. **Performance** : La fonction traite jusqu'à 1000 fichiers par partie

---

## 🐛 Dépannage

### Erreur : "Function not found"

✅ Vérifier que la fonction SQL `get_audio_cleanup_list()` est bien créée dans Supabase

### Erreur : "Permission denied"

✅ Vérifier que le SERVICE_ROLE_KEY est correctement configuré

### Aucun fichier supprimé

✅ Vérifier que des parties existent avec `created_at < NOW() - INTERVAL '24 hours'`

---

## 📝 Structure des Fichiers

```
supabase/functions/cleanup-audio-recordings/
  ├── index.ts        # Code de la fonction
  └── README.md       # Ce fichier
```

---

**Dernière mise à jour** : 22 Décembre 2024

