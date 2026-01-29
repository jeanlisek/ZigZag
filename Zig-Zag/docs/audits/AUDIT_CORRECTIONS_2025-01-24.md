# Corrections suite à l'audit - 24 Janvier 2025

## ✅ Corrections appliquées

### 1. Bug logique critique - `checkAndCompleteExpiredGames()` ✅
**Fichier**: `game-app/src/lib/supabase/games.ts`

**Problème**: La fonction terminait **toutes** les rooms `in_progress` car le filtre `created_at <= now` est toujours vrai.

**Solution**: Ne terminer que les rooms dont la partie associée est expirée, en utilisant la liste des `game_id` des parties expirées.

```typescript
// AVANT (BUG)
await supabase
  .from('rooms')
  .update({ status: 'completed' })
  .eq('status', 'in_progress')
  .lte('created_at', now); // ❌ Toujours vrai !

// APRÈS (CORRIGÉ)
const { data: expiredGames } = await supabase
  .from('games')
  .update({ status: 'completed' })
  .eq('status', 'active')
  .lte('expires_at', now)
  .select('id');

if (expiredGames && expiredGames.length > 0) {
  const expiredGameIds = expiredGames.map(g => g.id);
  await supabase
    .from('rooms')
    .update({ status: 'completed' })
    .eq('status', 'in_progress')
    .in('game_id', expiredGameIds); // ✅ Seulement les rooms des parties expirées
}
```

---

### 2. RLS Policies sécurisées ✅
**Fichier**: `sql/13_fix_rls_game_tables.sql` (nouveau fichier de migration)

**Problème**: Les policies RLS étaient trop permissives (`USING (true)`) → n'importe qui pouvait modifier/terminer des parties.

**Solution**: Création d'un fichier SQL de migration avec des policies restrictives :
- **SELECT**: Reste public (nécessaire pour voir les parties actives)
- **INSERT**: Limité aux utilisateurs authentifiés ou parties anonymes valides
- **UPDATE**: Seulement pour le créateur/joueurs de la partie

**Action requise**: Exécuter ce fichier SQL dans Supabase Dashboard > SQL Editor :
```sql
-- Exécuter: sql/13_fix_rls_game_tables.sql
```

---

### 3. Edge Function `upload-avatar` sécurisée ✅
**Fichier**: `supabase/functions/upload-avatar/index.ts`

**Problème**: Le `userId` venait du client sans vérification → risque d'écraser l'avatar d'un autre utilisateur.

**Solution**: Vérifier l'authentification via le header `Authorization` et s'assurer que le `userId` correspond à l'utilisateur authentifié.

```typescript
// Vérifier l'authentification
const authHeader = req.headers.get("authorization");
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return new Response(JSON.stringify({ error: "Authentification requise" }), { status: 401 });
}

// Vérifier le token et récupérer l'utilisateur
const token = authHeader.replace("Bearer ", "");
const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

// SÉCURITÉ CRITIQUE: Vérifier que le userId correspond
if (userIdFromForm !== user.id) {
  return new Response(JSON.stringify({ error: "Vous ne pouvez uploader un avatar que pour votre propre compte" }), { status: 403 });
}
```

---

### 4. Logs sensibles retirés ✅
**Fichiers**: 
- `game-app/src/app/auth/callback/page.tsx`
- `game-app/src/app/jeu/[game_id]/GamePageClient.tsx`

**Problème**: 
- `console.log()` exposait des tokens OAuth dans `window.location.hash`
- `console.log()` dans le rendu React (performance)
- Logs verbeux en production

**Solution**: 
- Remplacé tous les `console.log()` par `logger.debug()` (peut être désactivé en production)
- Retiré les logs qui exposent des informations sensibles (userId, tokens)
- Retiré le `console.log()` dans le rendu React

---

### 5. Optimisation des requêtes SQL ✅
**Fichiers**: 
- `game-app/src/lib/supabase/games.ts`
- `game-app/src/lib/supabase/rooms.ts`

**Problème**: Utilisation de `.select('*')` partout → surcoût réseau et risque d'exposer des colonnes futures.

**Solution**: Remplacé par des colonnes spécifiques dans les requêtes critiques :
- `joinGame()`: `select('id, is_active, nickname')`
- `findOrCreateGame()`: `select('id, status, mode, max_steps, current_step_number, expires_at')`
- `getGame()`: Colonnes spécifiques au lieu de `*`
- `getGameWithSteps()`: Colonnes spécifiques pour steps et players
- `getRoomWithPlayers()`: Colonnes spécifiques pour rooms, players et games

**Note**: Les `select('*')` utilisés uniquement pour le comptage (`count: 'exact', head: true`) ont été conservés car ils ne retournent pas de données.

---

## 📋 Actions requises

### 1. Appliquer la migration SQL RLS
```bash
# Dans Supabase Dashboard > SQL Editor
# Exécuter le fichier: sql/13_fix_rls_game_tables.sql
```

### 2. Redéployer l'Edge Function `upload-avatar`
```bash
cd Zig-Zag
npx supabase functions deploy upload-avatar
```

### 3. Vérifier les variables d'environnement
S'assurer que `SUPABASE_ANON_KEY` est bien configurée dans l'Edge Function (via Supabase Dashboard > Edge Functions > upload-avatar > Settings).

---

## ⚠️ Problèmes restants (non bloquants)

### 1. Upload avatar côté client
Le code dans `useAuth.ts` et `auth/callback/page.tsx` appelle `supabase.storage.listBuckets()` qui peut échouer sans droits admin. **Solution recommandée**: Utiliser l'Edge Function `upload-avatar` au lieu de l'upload direct.

### 2. Bucket audio-recordings public
Le bucket `audio-recordings` est configuré en public (lecture publique). **À valider**: Est-ce intentionnel pour le RGPD ?

### 3. MediaRecorder type MIME
Le code crée des blobs typés `audio/wav` alors que MediaRecorder génère généralement `audio/webm`. **Impact**: Risque de fichiers illisibles selon le navigateur.

---

## 📊 Résumé

- ✅ **5 corrections critiques appliquées**
- ✅ **1 fichier SQL de migration créé**
- ✅ **1 Edge Function sécurisée**
- ✅ **Logs sensibles retirés**
- ✅ **Requêtes SQL optimisées**

**Prochaine étape**: Appliquer la migration SQL et redéployer l'Edge Function.
