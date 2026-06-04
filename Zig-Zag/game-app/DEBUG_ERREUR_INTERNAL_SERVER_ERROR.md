# 🔍 Debug : Erreur "Internal Server Error"

**Problème** : Le workflow GitHub Actions fonctionne, mais l'Edge Function retourne "Internal Server Error".

---

## ✅ Ce Qui Fonctionne

- ✅ Le workflow GitHub Actions s'exécute correctement
- ✅ La connexion vers Supabase fonctionne
- ✅ Le secret est bien configuré

---

## ❌ Le Problème

L'Edge Function a une erreur interne. Il faut vérifier les logs dans Supabase.

---

## 🔍 Diagnostic : Vérifier les Logs de l'Edge Function

### Étape 1 : Aller dans Supabase Dashboard

1. **Aller sur** https://supabase.com/dashboard
2. **Sélectionner** votre projet ZigZag
3. **Cliquer sur** "Edge Functions" dans le menu de gauche
4. **Cliquer sur** "cleanup-audio-recordings"
5. **Cliquer sur** l'onglet "Logs"

### Étape 2 : Voir les Erreurs

Dans les logs, vous devriez voir l'erreur exacte. Les causes possibles :

---

## 🐛 Causes Possibles et Solutions

### Cause 1 : Fonction SQL Non Créée

**Symptôme** : Erreur "function get_audio_cleanup_list does not exist"

**Solution** :
1. Aller dans **SQL Editor** de Supabase
2. Exécuter le fichier `sql/10_cleanup_audio_storage.sql`
3. Vérifier que les fonctions sont créées :
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%audio%';
```

---

### Cause 2 : Bucket Non Créé

**Symptôme** : Erreur "Bucket 'audio-recordings' not found"

**Solution** :
1. Aller dans **Storage** de Supabase
2. Vérifier que le bucket `audio-recordings` existe
3. Si non, le créer (voir `GUIDE_STORAGE_AUDIO.md`)

---

### Cause 3 : Problème de Permissions

**Symptôme** : Erreur "Permission denied" ou "Unauthorized"

**Solution** :
1. Vérifier que vous utilisez bien le SERVICE_ROLE_KEY (pas l'anon key)
2. Vérifier que les politiques RLS sont créées (voir `sql/09_audio_storage_setup.sql`)

---

### Cause 4 : Erreur dans le Code de l'Edge Function

**Symptôme** : Erreur JavaScript/TypeScript dans les logs

**Solution** :
1. Vérifier les logs détaillés dans Supabase
2. Corriger l'erreur dans le code
3. Redéployer l'Edge Function

---

## 📝 Action Immédiate

**La première chose à faire** :

1. **Aller dans Supabase Dashboard** → Edge Functions → cleanup-audio-recordings → Logs
2. **Regarder les dernières lignes** des logs
3. **Copier l'erreur exacte** que vous voyez
4. **Me la donner** et je vous aiderai à la résoudre !

---

## 🔍 Vérification Rapide

Avant de regarder les logs, vérifiez ces points :

### ✅ Checklist de Vérification

- [ ] Fonction SQL `get_audio_cleanup_list()` créée dans Supabase ?
- [ ] Bucket `audio-recordings` créé dans Storage ?
- [ ] Edge Function `cleanup-audio-recordings` déployée ?
- [ ] Service role key utilisé (pas anon key) ?

---

**Dites-moi ce que vous voyez dans les logs Supabase, et je vous aiderai à corriger !** 😊

