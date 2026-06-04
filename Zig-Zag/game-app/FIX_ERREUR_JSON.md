# 🔧 Fix : Erreur "Unexpected end of JSON input"

**Erreur vue dans les logs** : `SyntaxError: Unexpected end of JSON input`

**Cause** : La fonction SQL `get_audio_cleanup_list()` n'existe pas encore dans Supabase.

---

## ✅ Solution : Créer la Fonction SQL

L'Edge Function essaie d'appeler une fonction SQL qui n'existe pas. Il faut la créer !

### Étape 1 : Aller dans SQL Editor

1. **Aller sur** https://supabase.com/dashboard
2. **Sélectionner** votre projet ZigZag
3. **Cliquer sur** "SQL Editor" dans le menu de gauche

### Étape 2 : Exécuter le Fichier SQL

1. **Ouvrir** le fichier `sql/10_cleanup_audio_storage.sql` sur votre ordinateur
2. **Sélectionner TOUT** le contenu (Cmd+A ou Ctrl+A)
3. **Copier** (Cmd+C ou Ctrl+C)
4. **Dans Supabase SQL Editor**, coller le code
5. **Cliquer sur** "Run" (ou appuyer sur Ctrl+Enter)

### Étape 3 : Vérifier que Ça Fonctionne

**Dans SQL Editor**, exécutez cette requête pour vérifier :

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%audio%';
```

**Vous devriez voir** :
- `get_games_to_cleanup_audio`
- `cleanup_audio_for_game`
- `get_audio_cleanup_list` ← **Cette fonction est importante !**

✅ Si vous voyez ces 3 fonctions, c'est bon !

---

## 🧪 Retester le Workflow

Une fois la fonction SQL créée :

1. **Aller sur** GitHub → Actions
2. **Cliquer sur** "Cleanup Audio Recordings"
3. **Cliquer sur** "Run workflow" pour relancer le test
4. **Vérifier** que l'erreur a disparu

---

## 📝 Explication de l'Erreur

L'erreur `SyntaxError: Unexpected end of JSON input` signifie que :
- L'Edge Function appelle `supabaseAdmin.rpc("get_audio_cleanup_list")`
- Supabase répond avec une erreur (la fonction n'existe pas)
- L'Edge Function essaie de parser cette erreur comme du JSON
- Ça échoue car ce n'est pas du JSON valide

**En créant la fonction SQL, Supabase pourra répondre correctement !**

---

**Une fois que vous avez exécuté le fichier SQL, retestez et dites-moi si ça fonctionne !** 😊

