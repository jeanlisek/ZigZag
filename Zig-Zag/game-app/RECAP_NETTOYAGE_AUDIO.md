# ✅ Récapitulatif - Nettoyage Automatique Audio (24h)

**Date** : 22 Décembre 2024  
**Statut** : ✅ Implémentation terminée - Configuration requise  
**Durée de conservation** : 24 heures à partir du début de la partie

---

## 🎯 Objectif

Supprimer automatiquement les fichiers audio des parties créées il y a plus de 24 heures pour :
- ✅ Maîtriser les coûts de stockage Supabase
- ✅ Libérer l'espace automatiquement
- ✅ Maintenir un stockage propre et optimisé

---

## 📝 Fichiers Créés

### 1. Fonction SQL : `sql/10_cleanup_audio_storage.sql` ✨

**Contenu** :
- `get_games_to_cleanup_audio()` - Identifie les parties à nettoyer
- `get_audio_cleanup_list()` - Liste complète avec détails
- `games_audio_to_cleanup` - Vue pour visualiser les parties concernées

**Usage** :
```sql
-- Voir les parties à nettoyer
SELECT * FROM get_audio_cleanup_list();

-- Voir via la vue
SELECT * FROM games_audio_to_cleanup;
```

---

### 2. Edge Function : `supabase/functions/cleanup-audio-recordings/` ✨

**Fichiers** :
- `index.ts` - Code TypeScript de la fonction
- `README.md` - Documentation technique

**Fonctionnalités** :
- Récupère la liste des parties à nettoyer via la fonction SQL
- Liste tous les fichiers audio dans chaque dossier `audio-recordings/{game_id}/`
- Supprime les fichiers via l'API Storage Supabase
- Retourne un rapport avec statistiques

---

### 3. Documentation : `GUIDE_NETTOYAGE_AUDIO.md` ✨

**Contenu** :
- Guide complet d'installation en 3 étapes
- Options de configuration du cron job
- Tests et vérifications
- Dépannage

---

## 🔄 Flux de Fonctionnement

### 1. Identification

La fonction SQL identifie les parties créées il y a plus de 24h :
```sql
WHERE g.created_at < NOW() - INTERVAL '24 hours'
```

### 2. Nettoyage

L'Edge Function :
1. Appelle `get_audio_cleanup_list()` pour obtenir les parties
2. Pour chaque partie, liste les fichiers dans `audio-recordings/{game_id}/`
3. Supprime tous les fichiers via l'API Storage
4. Retourne un rapport avec le nombre de fichiers supprimés

### 3. Exécution Périodique

Le cron job exécute l'Edge Function quotidiennement (recommandé : 2h du matin).

---

## ⚠️ Actions Requises

### 1. Exécuter le SQL

1. Aller dans Supabase Dashboard > SQL Editor
2. Exécuter `sql/10_cleanup_audio_storage.sql`
3. Vérifier que les fonctions sont créées

### 2. Déployer l'Edge Function

```bash
# Via CLI (recommandé)
supabase functions deploy cleanup-audio-recordings

# OU via Dashboard
# Edge Functions > Create > Copier le code de index.ts
```

### 3. Configurer le Cron Job

**Option recommandée** : GitHub Actions (gratuit)

Créer `.github/workflows/cleanup-audio.yml` :
```yaml
name: Cleanup Audio Recordings
on:
  schedule:
    - cron: '0 2 * * *'  # 2h UTC quotidiennement
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            https://<project-ref>.supabase.co/functions/v1/cleanup-audio-recordings
```

Voir `GUIDE_NETTOYAGE_AUDIO.md` pour les autres options.

---

## ✅ Checklist de Vérification

- [ ] Fonction SQL exécutée dans Supabase
- [ ] Edge Function déployée
- [ ] Cron job configuré (GitHub Actions ou autre)
- [ ] SERVICE_ROLE_KEY configuré dans les secrets
- [ ] Test manuel réussi (curl)
- [ ] Vérification que des fichiers sont bien supprimés après 24h

---

## 📊 Impact Estimé

### Avant Nettoyage
- Fichiers conservés indéfiniment
- Coûts qui augmentent continuellement
- ~60 MB/jour (10 parties/jour) = ~1.8 GB/mois

### Après Nettoyage (24h)
- Fichiers conservés max 24h
- Coûts maîtrisés (~60 MB maximum en stockage)
- Espace libéré automatiquement chaque jour

---

## 🔍 Test Manuel

```bash
curl -X POST \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  https://<project-ref>.supabase.co/functions/v1/cleanup-audio-recordings
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Nettoyage terminé: X partie(s) nettoyée(s), Y fichier(s) supprimé(s)",
  "stats": {
    "gamesCleaned": X,
    "filesDeleted": Y,
    "gamesProcessed": X
  }
}
```

---

## 📝 Modification de la Durée

Pour changer la durée de conservation, modifier dans `sql/10_cleanup_audio_storage.sql` :

```sql
-- Pour 48 heures:
WHERE g.created_at < NOW() - INTERVAL '48 hours'

-- Pour 7 jours:
WHERE g.created_at < NOW() - INTERVAL '7 days'
```

Puis réexécuter le fichier SQL.

---

## 📁 Structure des Fichiers

```
Zig-Zag/
├── sql/
│   └── 10_cleanup_audio_storage.sql          ← Fonctions SQL
├── supabase/
│   └── functions/
│       └── cleanup-audio-recordings/
│           ├── index.ts                      ← Edge Function
│           └── README.md                     ← Documentation technique
└── game-app/
    ├── GUIDE_NETTOYAGE_AUDIO.md              ← Guide d'installation
    ├── GESTION_RETENTION_AUDIO.md            ← Document de gestion
    └── RECAP_NETTOYAGE_AUDIO.md              ← Ce fichier
```

---

## 🔗 Liens Utiles

- **Guide d'installation** : `GUIDE_NETTOYAGE_AUDIO.md`
- **Documentation technique** : `supabase/functions/cleanup-audio-recordings/README.md`
- **Gestion de la rétention** : `GESTION_RETENTION_AUDIO.md`

---

**Status** : ✅ Code implémenté - Configuration requise avant utilisation

**Prochaine étape** : Suivre les instructions dans `GUIDE_NETTOYAGE_AUDIO.md` pour configurer le système.

