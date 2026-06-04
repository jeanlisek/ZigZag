# 🔍 Diagnostic Détaillé de l'Erreur

L'erreur "Internal Server Error" persiste. Il faut vérifier les logs Supabase pour voir l'erreur exacte.

---

## 🔍 Étape 1 : Voir les Logs Supabase Détaillés

1. **Aller sur** Supabase Dashboard → Edge Functions → cleanup-audio-recordings
2. **Cliquer sur** l'onglet **"Logs"**
3. **Regarder les dernières lignes** (les plus récentes)
4. **Chercher** les lignes avec **"ERROR"** en rouge

**Quelle est l'erreur exacte que vous voyez ?**

---

## 🐛 Causes Possibles

### Cause 1 : Fonction SQL Non Créée

**Symptôme** : Erreur "function get_audio_cleanup_list does not exist"

**Vérification** :
1. Aller dans **SQL Editor** de Supabase
2. Exécuter cette requête :
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_audio_cleanup_list';
```
3. Si aucun résultat → La fonction n'existe pas !

**Solution** :
1. Ouvrir `sql/10_cleanup_audio_storage.sql`
2. Copier tout le contenu
3. Coller dans SQL Editor
4. Exécuter (Run)

---

### Cause 2 : Bucket Non Créé

**Symptôme** : Erreur "Bucket 'audio-recordings' not found"

**Vérification** :
1. Aller dans **Storage** de Supabase
2. Vérifier si le bucket `audio-recordings` existe

**Solution** :
1. Créer le bucket `audio-recordings` (voir `GUIDE_STORAGE_AUDIO.md`)
2. Le configurer comme public

---

### Cause 3 : Permissions RLS

**Symptôme** : Erreur "Permission denied" ou erreur de politique RLS

**Vérification** :
1. Aller dans **Storage** → **Policies**
2. Vérifier que les politiques pour `audio-recordings` existent

**Solution** :
1. Exécuter `sql/09_audio_storage_setup.sql` pour créer les politiques

---

## 📝 Action Immédiate

**La chose la plus importante** : Regardez les logs Supabase et dites-moi **exactement** quelle erreur vous voyez.

1. **Aller dans** Supabase Dashboard → Edge Functions → cleanup-audio-recordings → Logs
2. **Chercher** la dernière ligne avec **"ERROR"** en rouge
3. **Copier** le message d'erreur exact
4. **Me le donner** et je vous dirai exactement comment le corriger !

---

## 🔍 Vérification Rapide

**Exécutez cette requête SQL pour vérifier que tout est en place** :

```sql
-- Vérifier la fonction SQL
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_audio_cleanup_list';

-- Devrait retourner 1 ligne avec get_audio_cleanup_list
```

Si cette requête ne retourne rien, la fonction SQL n'a pas été créée !

---

**Dites-moi ce que vous voyez dans les logs Supabase, et je vous aiderai à corriger précisément !** 😊

