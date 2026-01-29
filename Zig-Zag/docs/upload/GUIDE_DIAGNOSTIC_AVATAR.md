# 🔍 Guide de Diagnostic - Avatar Photo de Profil

**Date** : Décembre 2024  
**Problème** : La photo de profil n'est pas uploadée vers Supabase Storage

---

## 📋 Checklist de Diagnostic

### Étape 1 : Vérifier que le bucket existe

1. **Aller sur** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionner** votre projet ZigZag
3. **Cliquer sur** "Storage" dans le menu de gauche
4. **Vérifier** si le bucket `avatars` existe dans la liste

❌ **Si le bucket n'existe pas** :
- Cliquer sur "New bucket"
- Configurer :
  - **Name** : `avatars`
  - **Public bucket** : ✅ **Cocher**
  - **File size limit** : `2097152` (2 MB)
  - **Allowed MIME types** : `image/jpeg, image/png, image/webp, image/gif`
- Cliquer sur "Create bucket"

✅ **Si le bucket existe** : Passer à l'étape 2

---

### Étape 2 : Vérifier les politiques RLS

1. **Aller dans** le SQL Editor de Supabase
2. **Exécuter** cette requête pour vérifier les politiques :
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%avatar%';
```

❌ **Si aucune politique n'existe** :
- Ouvrir le fichier `sql/12_avatars_storage_setup.sql`
- Copier tout le contenu (sauf les commentaires d'instructions)
- Coller dans l'éditeur SQL
- Exécuter le script (Run ou Ctrl+Enter)

✅ **Si les politiques existent** : Passer à l'étape 3

---

### Étape 3 : Tester l'upload depuis la console du navigateur

1. **Ouvrir** la console du navigateur (F12)
2. **Aller sur** la page d'inscription (`/jouer`)
3. **Sélectionner** une photo de profil
4. **Créer un compte**
5. **Observer** les messages dans la console :
   - `📸 Début upload avatar pour utilisateur: ...`
   - `🔍 Vérification du bucket avatars...`
   - `✅ Bucket "avatars" trouvé` ou `❌ Bucket "avatars" non trouvé`
   - `⬆️ Upload vers Supabase Storage...`
   - `✅ Upload réussi` ou `❌ Erreur upload avatar: ...`

---

## 🐛 Erreurs Courantes et Solutions

### Erreur 1 : "Bucket not found" ou "does not exist"

**Cause** : Le bucket `avatars` n'existe pas dans Supabase Storage

**Solution** :
1. Créer le bucket manuellement dans Supabase Dashboard > Storage
2. Voir les instructions dans `sql/README_AVATARS.md`

---

### Erreur 2 : "new row violates row-level security policy" ou "RLS"

**Cause** : Les politiques RLS ne sont pas configurées pour le bucket

**Solution** :
1. Exécuter le fichier `sql/12_avatars_storage_setup.sql` dans le SQL Editor
2. Vérifier que les politiques sont créées :
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%avatar%';
```

---

### Erreur 3 : "File size limit exceeded"

**Cause** : Le fichier est trop volumineux (dépassement de la limite de 2 MB)

**Solution** :
- Réduire la taille de l'image avant l'upload
- Utiliser un outil de compression d'image

---

### Erreur 4 : "Invalid MIME type"

**Cause** : Le format de l'image n'est pas autorisé

**Solution** :
- Utiliser uniquement : JPG, PNG, WEBP ou GIF
- Vérifier que le bucket accepte ces types MIME

---

### Erreur 5 : L'avatar n'apparaît pas après upload

**Cause possible** : L'URL n'est pas correctement sauvegardée ou récupérée

**Vérifications** :
1. Vérifier dans la console que l'URL est bien générée :
   - Chercher `🔗 URL publique de l'avatar: ...`
2. Vérifier dans Supabase Dashboard :
   - Storage > avatars > {user_id} > avatar.{ext}
   - Le fichier doit être visible
3. Vérifier dans la table `users` :
   - La colonne `avatar_url` doit contenir l'URL
4. Vérifier dans `user_metadata` :
   - `auth.users` > user_metadata > avatar_url

---

## 🔧 Test Manuel Rapide

### Test 1 : Vérifier le bucket via SQL

```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

**Résultat attendu** : Une ligne avec `id = 'avatars'` et `public = true`

---

### Test 2 : Vérifier les politiques RLS

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%avatar%';
```

**Résultat attendu** : 4 politiques (upload, update, delete, read)

---

### Test 3 : Tester l'upload depuis la console

1. Ouvrir la console du navigateur
2. Se connecter à Supabase
3. Exécuter :
```javascript
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('test-user-id/avatar.jpg', file);
console.log('Upload:', data, error);
```

**Résultat attendu** : `data` contient le fichier uploadé, `error` est null

---

## 📝 Logs à Vérifier

Lors de l'inscription avec une photo, vous devriez voir dans la console :

```
📸 Début upload avatar pour utilisateur: {user_id}
📁 Nom de fichier: {user_id}/avatar.{ext}
📏 Taille du fichier: {size} bytes
🔍 Vérification du bucket avatars...
✅ Bucket "avatars" trouvé: {bucket_info}
⬆️ Upload vers Supabase Storage...
✅ Upload réussi: {upload_data}
🔗 URL publique de l'avatar: {url}
🔄 Mise à jour user_metadata...
✅ Avatar mis à jour dans user_metadata
🔄 Mise à jour table users...
✅ Avatar sauvegardé avec succès dans user_metadata et table users
```

Si vous voyez des ❌, notez le message d'erreur et suivez les solutions ci-dessus.

---

## 🚀 Actions Immédiates

1. ✅ Créer le bucket `avatars` dans Supabase Dashboard
2. ✅ Exécuter `sql/12_avatars_storage_setup.sql` pour les politiques RLS
3. ✅ Tester l'inscription avec une photo
4. ✅ Vérifier les logs dans la console du navigateur
5. ✅ Vérifier que le fichier apparaît dans Storage > avatars

---

## 📚 Références

- Guide complet : `sql/README_AVATARS.md`
- Fichier SQL : `sql/12_avatars_storage_setup.sql`
- Documentation Supabase Storage : [https://supabase.com/docs/guides/storage](https://supabase.com/docs/guides/storage)

