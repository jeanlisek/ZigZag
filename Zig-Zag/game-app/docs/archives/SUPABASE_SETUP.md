# 🗄️ Configuration Supabase - Zigzag

## ⚠️ IMPORTANT : Créer les tables dans Supabase

L'erreur "Could not find the table 'public.games'" signifie que les tables n'ont pas encore été créées dans votre base de données Supabase.

## 📋 Étapes pour créer les tables

### 1. Accéder au Dashboard Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet : `tihrltssmpxpreadpzqm`

### 2. Ouvrir l'éditeur SQL

1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"** pour créer une nouvelle requête

### 3. Copier et exécuter le schéma

1. Ouvrez le fichier : `game-app/src/lib/supabase/schema.sql`
2. **Copiez TOUT le contenu** du fichier
3. **Collez-le** dans l'éditeur SQL de Supabase
4. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

**⚠️ IMPORTANT :** Si vous avez une erreur, essayez d'abord le script de nettoyage manuel :

```sql
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS steps CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS games CASCADE;
```

Puis réexécutez le `schema.sql` complet.

### 4. Vérifier que les tables sont créées

1. Dans le menu de gauche, cliquez sur **"Table Editor"**
2. Vous devriez voir 4 tables :
   - ✅ `games` (parties)
   - ✅ `steps` (étapes)
   - ✅ `rooms` (rooms privées)
   - ✅ `players` (joueurs)

## 🔍 Vérification rapide

Exécutez cette requête dans l'éditeur SQL :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('games', 'steps', 'rooms', 'players')
ORDER BY table_name;
```

Vous devriez voir les 4 tables listées.

## ✅ Après avoir créé les tables

1. **Redémarrez le serveur Next.js** :
   ```bash
   cd Zig-Zag/game-app
   npm run dev
   ```

2. **Testez le matchmaking** :
   - Allez sur `http://localhost:3000/jeu/matchmaking`
   - La partie devrait se créer automatiquement

## 🐛 Si vous avez encore des erreurs

### Erreur "column game_id does not exist"

Cela signifie que certaines tables existent partiellement. Solution :

1. Exécutez d'abord le script de nettoyage :
```sql
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS steps CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP FUNCTION IF EXISTS complete_expired_games() CASCADE;
```

2. Puis exécutez le `schema.sql` complet

### Autres erreurs

- Vérifiez que vous êtes connecté au bon projet Supabase
- Vérifiez que les variables d'environnement dans `.env.local` sont correctes
- Vérifiez que les politiques RLS ont été créées correctement

## 📝 Structure du schéma

Le fichier `schema.sql` crée :
- ✅ 4 tables (games, steps, rooms, players) dans le bon ordre
- ✅ Index pour améliorer les performances
- ✅ Activation du temps réel (Realtime)
- ✅ Politiques RLS pour la sécurité
- ✅ Fonction pour terminer les parties expirées

**Le schéma est maintenant ultra simplifié et devrait fonctionner !**
