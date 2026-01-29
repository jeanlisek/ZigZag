# 📁 Dossier SQL - Zigzag

Ce dossier contient tous les scripts SQL pour la base de données Supabase du projet Zigzag.

## 📋 Organisation des fichiers

### `01_complete_schema.sql` ⭐ **RECOMMANDÉ**
**Schéma complet de toutes les tables**
- Contient toutes les définitions de tables, index, RLS, triggers
- À utiliser pour créer toutes les tables d'un coup
- **Utilisez ce fichier si vous partez de zéro**

### `02_fix_users_table.sql` (ancien : `fix_users_table.sql`)
**Corrections pour la table users**
- Ajoute les colonnes manquantes à la table users
- Crée les index nécessaires
- Ajoute le trigger pour updated_at
- **Utilisez ce fichier si la table users existe déjà mais manque des colonnes**

### `03_update_checklist_days.sql` (ancien : `update_checklist_days.sql`)
**Mise à jour de la checklist hebdomadaire**
- Permet tous les jours de la semaine dans weekly_checklist
- **Utilisez ce fichier si vous avez besoin de modifier la contrainte CHECK**

### `04_admin_schema.sql` (ancien : `admin_supabase_schema.sql`)
**Schéma pour le dashboard admin**
- Tables : `daily_costs`, `weekly_checklist`
- Fonctions et triggers pour le dashboard
- **Utilisez ce fichier pour les fonctionnalités admin uniquement**

### `05_sync_policies_and_indexes.sql` ⚠️ **IMPORTANT**
**Synchronisation des policies RLS et index**
- Met à jour les policies RLS pour qu'elles correspondent au fichier `01_complete_schema.sql`
- Ajoute les index manquants
- **Utilisez ce fichier si Supabase a des policies/index différents des fichiers SQL**

### `09_audio_storage_setup.sql` 🎤
**Configuration Storage pour les enregistrements audio**
- Crée les politiques RLS pour le bucket `audio-recordings`
- Permet l'upload par les utilisateurs authentifiés et la lecture publique
- **IMPORTANT**: Le bucket doit être créé manuellement via le dashboard Supabase avant d'exécuter ce fichier
- Voir le fichier pour les instructions détaillées

### `10_cleanup_audio_storage.sql` 🗑️
**Nettoyage automatique des fichiers audio (24h)**
- Fonctions SQL pour identifier les parties à nettoyer
- Supprime les fichiers audio des parties créées il y a plus de 24h
- **IMPORTANT**: Nécessite une Edge Function pour la suppression réelle des fichiers
- Voir `GUIDE_NETTOYAGE_AUDIO.md` pour l'installation complète

### `12_avatars_storage_setup.sql` 📸 **NOUVEAU**
**Configuration Storage pour les avatars utilisateurs**
- Crée les politiques RLS pour le bucket `avatars`
- Permet l'upload par les utilisateurs authentifiés et la lecture publique
- **IMPORTANT**: Le bucket doit être créé manuellement via le dashboard Supabase avant d'exécuter ce fichier
- Voir `README_AVATARS.md` pour les instructions détaillées

## 🗄️ Tables de la base de données

### Tables principales
- **`users`** : Utilisateurs de l'application
- **`newsletter_signups`** : Inscriptions à la newsletter
- **`contact_messages`** : Messages du formulaire de contact

### Tables de jeu (ancien système)
- **`zigs`** : Parties Zigzag (ancien système)
- **`participants`** : Participants aux zigs

### Tables de jeu (nouveau système)
- **`games`** : Parties de jeu
- **`steps`** : Étapes des parties
- **`rooms`** : Rooms privées
- **`players`** : Joueurs des parties

### Tables admin
- **`daily_costs`** : Coûts publicitaires quotidiens
- **`weekly_checklist`** : Checklist hebdomadaire

## 🚀 Utilisation

### Première installation
```sql
-- Exécutez dans l'ordre :
1. 01_complete_schema.sql (crée toutes les tables)
```

### Mise à jour d'une table existante
```sql
-- Si vous avez déjà des tables, utilisez les fichiers spécifiques :
1. 02_fix_users_table.sql (pour users)
2. 03_update_checklist_days.sql (pour weekly_checklist)
3. 05_sync_policies_and_indexes.sql (pour synchroniser policies et index)
```

### Vérification
```sql
-- Vérifier que toutes les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## ⚠️ Notes importantes

1. **RLS activé** : Toutes les tables ont Row Level Security activé
2. **Policies** : Les policies permettent l'accès via la clé anon pour les tables publiques
3. **Triggers** : 
   - `handle_new_user()` : Crée automatiquement un profil dans `public.users` lors de l'inscription
   - `update_updated_at_column()` : Met à jour automatiquement `updated_at`
4. **Temps réel** : Activé pour `games`, `steps`, `rooms`, `players`
5. **Extensions** : `pgcrypto` et `uuid-ossp` sont nécessaires

## 🔄 Migration depuis les anciens fichiers

Les anciens fichiers ont été renommés et réorganisés :
- `admin_supabase_schema.sql` → `04_admin_schema.sql`
- `fix_users_table.sql` → `02_fix_users_table.sql`
- `update_checklist_days.sql` → `03_update_checklist_days.sql`

Le nouveau fichier `01_complete_schema.sql` contient tout le schéma complet.

## 📝 Maintenance

- **Ne pas supprimer** les fichiers de migration (02, 03, 04) car ils peuvent être utiles pour des mises à jour ciblées
- **Utiliser** `01_complete_schema.sql` pour créer toutes les tables d'un coup
- **Vérifier** les policies RLS après chaque modification







