# 🧪 Tester la Fonction SQL

Avant de corriger l'Edge Function, testons d'abord la fonction SQL directement.

---

## ✅ Étape 1 : Tester la Fonction SQL

1. **Aller dans** Supabase Dashboard → SQL Editor
2. **Exécuter** cette requête pour tester la fonction :

```sql
SELECT * FROM get_audio_cleanup_list();
```

**Que voyez-vous ?**

- ✅ Si vous voyez un tableau (même vide) → La fonction fonctionne !
- ❌ Si vous voyez une erreur → Il y a un problème avec la fonction SQL

---

## 🔍 Vérifier les Permissions

Si la fonction ne fonctionne pas, vérifiez les permissions :

```sql
-- Vérifier que la fonction existe
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_audio_cleanup_list';
```

---

**Dites-moi ce que vous voyez quand vous exécutez `SELECT * FROM get_audio_cleanup_list();` !**

