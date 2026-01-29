# 📸 Configuration Storage Avatars - ZigZag

**Date** : Décembre 2024  
**Statut** : ✅ Code implémenté - Configuration requise

---

## 🎯 Objectif

Permettre aux utilisateurs d'uploader une photo de profil lors de l'inscription et de l'afficher dans l'interface du jeu.

---

## 📋 Configuration Requise

### Étape 1 : Créer le Bucket dans Supabase Dashboard

1. **Aller sur** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionner** votre projet ZigZag
3. **Cliquer sur** "Storage" dans le menu de gauche
4. **Cliquer sur** "New bucket"
5. **Configurer le bucket** :
   - **Name** : `avatars`
   - **Public bucket** : ✅ **Cocher** (pour permettre la lecture publique des avatars)
   - **File size limit** : `2097152` (2 MB - taille raisonnable pour une photo de profil)
   - **Allowed MIME types** : 
     ```
     image/jpeg, image/png, image/webp, image/gif
     ```
6. **Cliquer sur** "Create bucket"

✅ **Vérification** : Vous devriez voir le bucket `avatars` dans la liste des buckets.

---

### Étape 2 : Configurer les Politiques RLS

1. **Aller dans** le SQL Editor de Supabase
2. **Ouvrir** le fichier `sql/12_avatars_storage_setup.sql`
3. **Copier** tout le contenu (sauf les commentaires d'instructions)
4. **Coller** dans l'éditeur SQL
5. **Exécuter** le script (Run ou Ctrl+Enter)

✅ **Vérification** : Les politiques RLS devraient être créées. Vous pouvez vérifier dans "Storage" > "Policies".

---

## 🔧 Fonctionnement

### Structure des fichiers

Les avatars sont organisés par utilisateur :
```
avatars/
  ├── {user_id}/
  │   └── avatar.{extension}
  └── ...
```

Exemple : `avatars/550e8400-e29b-41d4-a716-446655440000/avatar.jpg`

### Processus d'upload

1. L'utilisateur sélectionne une photo lors de l'inscription
2. Le compte est créé dans Supabase Auth
3. La photo est uploadée vers `avatars/{user_id}/avatar.{ext}`
4. L'URL publique est récupérée
5. L'URL est sauvegardée dans `user_metadata.avatar_url`
6. L'avatar est affiché dans le `UserMenu` et autres composants

### Sécurité

- ✅ Chaque utilisateur ne peut uploader/modifier/supprimer que son propre avatar
- ✅ La lecture est publique pour permettre l'affichage dans l'interface
- ✅ Validation du format et de la taille côté client et serveur

---

## 📝 Fichiers Modifiés

### 1. `sql/12_avatars_storage_setup.sql` ✨ NOUVEAU
- Configuration du bucket `avatars`
- Politiques RLS pour l'upload, la mise à jour, la suppression et la lecture

### 2. `jouer.html` 🔧 MODIFIÉ
- Upload de la photo vers Supabase Storage après l'inscription
- Sauvegarde de l'URL dans `user_metadata.avatar_url`
- Gestion des erreurs d'upload (non bloquant)

### 3. `game-app/src/components/ui/UserMenu.tsx` ✅ DÉJÀ PRÉSENT
- Affiche l'avatar depuis `user_metadata.avatar_url`
- Fallback sur les initiales si pas d'avatar

---

## ✅ Vérifications

### Vérifier que le bucket existe
```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

### Vérifier les politiques RLS
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%avatar%';
```

### Tester l'upload
1. Créer un compte avec une photo de profil
2. Vérifier que le fichier apparaît dans Storage > avatars > {user_id}
3. Vérifier que l'avatar s'affiche dans le UserMenu après connexion

---

## 🐛 Dépannage

### L'upload échoue
- Vérifier que le bucket `avatars` existe
- Vérifier que les politiques RLS sont créées
- Vérifier la taille du fichier (max 2 MB)
- Vérifier le format (jpg, png, webp, gif uniquement)

### L'avatar ne s'affiche pas
- Vérifier que `user_metadata.avatar_url` contient l'URL
- Vérifier que l'URL est accessible publiquement
- Vérifier la console du navigateur pour les erreurs CORS

---

## 📚 Références

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [Politiques RLS Storage](https://supabase.com/docs/guides/storage/security/access-control)

