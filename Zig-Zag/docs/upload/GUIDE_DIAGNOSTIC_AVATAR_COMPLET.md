# Guide de diagnostic complet - Avatar

## 🔍 Vérifications étape par étape

### 1. Vérifier que le bucket "avatars" existe

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet ZigZag
3. Cliquer sur **"Storage"** dans le menu de gauche
4. Vérifier qu'il y a un bucket nommé **"avatars"**
5. Si le bucket n'existe pas :
   - Cliquer sur **"New bucket"**
   - Nom : `avatars`
   - **Public bucket** : ✅ Activé (important !)
   - Cliquer sur **"Create bucket"**

### 2. Vérifier que les politiques RLS sont appliquées

1. Dans Supabase Dashboard, cliquer sur **"SQL Editor"**
2. Exécuter cette requête pour vérifier les politiques :

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';
```

**Vous devriez voir 4 politiques :**
- `Users can upload their own avatar` (INSERT)
- `Users can update their own avatar` (UPDATE)
- `Users can delete their own avatar` (DELETE)
- `Public can read avatars` (SELECT)

**Si les politiques n'existent pas :**
1. Ouvrir le fichier `sql/12_avatars_storage_setup.sql`
2. Copier tout le contenu (sauf les commentaires d'instructions en haut)
3. Coller dans l'éditeur SQL de Supabase
4. Exécuter le script (Run ou Ctrl+Enter)

### 3. Vérifier dans la console du navigateur

#### Lors de l'inscription (avec photo) :

1. Ouvrir la console (F12)
2. Aller sur `/jouer`
3. Créer un compte avec une photo
4. **Vérifier dans la console :**
   - `📸 Photo sélectionnée pour utilisateur: [ID]`
   - `💾 Photo sauvegardée temporairement, sera uploadée à la prochaine connexion`

#### Lors de la première connexion :

1. Confirmer l'email
2. Se connecter
3. **Vérifier dans la console :**
   - `📸 Avatar en attente détecté, upload en cours...`
   - `📸 Début upload avatar en attente pour utilisateur: [ID]`
   - `✅ Bucket "avatars" trouvé`
   - `✅ Upload réussi`
   - `✅ Avatar mis à jour dans user_metadata`
   - `✅ Avatar mis à jour dans table users`

#### Si vous voyez des erreurs :

- **`❌ Bucket "avatars" non trouvé`** → Le bucket n'existe pas (voir étape 1)
- **`new row violates row-level security policy`** → Les politiques RLS ne sont pas configurées (voir étape 2)
- **`403 Forbidden`** → Les politiques RLS sont incorrectes (ré-exécuter le script SQL)

### 4. Vérifier dans localStorage

1. Ouvrir la console (F12)
2. Aller dans l'onglet **"Application"** (Chrome) ou **"Stockage"** (Firefox)
3. Cliquer sur **"Local Storage"** → votre domaine
4. Chercher la clé **`zigzag_pending_avatar`**
5. Si elle existe :
   - L'avatar est en attente d'upload
   - Il devrait être uploadé lors de la prochaine connexion
   - Si ce n'est pas le cas, aller sur la page "Mon compte" pour forcer l'upload

### 5. Vérifier dans Supabase

#### Dans la table `users` :

1. Dans Supabase Dashboard, aller sur **"Table Editor"**
2. Sélectionner la table **`users`**
3. Trouver votre utilisateur
4. Vérifier la colonne **`avatar_url`**
5. Si elle est vide ou NULL :
   - L'avatar n'a pas été uploadé
   - Vérifier les erreurs dans la console

#### Dans Storage :

1. Dans Supabase Dashboard, aller sur **"Storage"**
2. Cliquer sur le bucket **"avatars"**
3. Vous devriez voir un dossier avec votre ID utilisateur
4. À l'intérieur, il devrait y avoir un fichier `avatar.[extension]`
5. Si le dossier/fichier n'existe pas :
   - L'upload a échoué
   - Vérifier les erreurs dans la console

### 6. Forcer l'upload depuis la page "Mon compte"

Si l'upload automatique a échoué :

1. Aller sur `/jeu/compte`
2. Cliquer sur votre avatar (ou l'icône par défaut)
3. Sélectionner une nouvelle photo
4. L'upload devrait se faire immédiatement
5. Vérifier dans la console les messages de succès/erreur

### 7. Vérifier user_metadata

1. Dans Supabase Dashboard, aller sur **"Authentication"** → **"Users"**
2. Trouver votre utilisateur
3. Cliquer dessus pour voir les détails
4. Dans **"User Metadata"**, chercher **`avatar_url`**
5. Si elle est absente ou vide :
   - L'avatar n'a pas été sauvegardé dans user_metadata
   - Vérifier les erreurs dans la console

## 🐛 Problèmes courants et solutions

### Problème 1 : "Bucket not found"
**Solution :** Créer le bucket "avatars" dans Supabase Dashboard > Storage

### Problème 2 : "new row violates row-level security policy"
**Solution :** Exécuter le script `sql/12_avatars_storage_setup.sql` dans Supabase SQL Editor

### Problème 3 : L'avatar n'apparaît pas dans le jeu
**Vérifications :**
- L'avatar est-il dans `user_metadata.avatar_url` ?
- L'avatar est-il dans la table `users.avatar_url` ?
- L'URL de l'avatar est-elle accessible publiquement ?
- Le composant `UserMenu` lit-il bien `user.user_metadata?.avatar_url` ?

### Problème 4 : L'avatar est uploadé mais pas affiché
**Solution :** 
1. Vérifier que l'URL de l'avatar est correcte
2. Vérifier que le bucket est public
3. Rafraîchir la page (Ctrl+F5 pour vider le cache)

## 📝 Checklist complète

- [ ] Le bucket "avatars" existe dans Supabase Storage
- [ ] Le bucket "avatars" est public
- [ ] Les 4 politiques RLS sont créées et actives
- [ ] L'avatar est sauvegardé dans localStorage lors de l'inscription
- [ ] L'upload se déclenche lors de la première connexion
- [ ] L'avatar est présent dans `user_metadata.avatar_url`
- [ ] L'avatar est présent dans `users.avatar_url`
- [ ] L'avatar est présent dans Storage
- [ ] L'avatar s'affiche dans le jeu

## 🔧 Commandes SQL utiles

### Vérifier les politiques RLS :
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';
```

### Vérifier les avatars dans Storage (via SQL) :
```sql
SELECT name, bucket_id, created_at, updated_at
FROM storage.objects
WHERE bucket_id = 'avatars'
ORDER BY created_at DESC
LIMIT 10;
```

### Vérifier les avatars dans la table users :
```sql
SELECT id, email, avatar_url, created_at
FROM users
WHERE avatar_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

## 💡 Astuce

Si rien ne fonctionne, essayez de :
1. Supprimer le bucket "avatars" (s'il existe)
2. Recréer le bucket "avatars" (public)
3. Ré-exécuter le script `sql/12_avatars_storage_setup.sql`
4. Créer un nouveau compte de test avec une photo
5. Vérifier étape par étape dans la console

