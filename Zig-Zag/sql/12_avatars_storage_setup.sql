-- ============================================
-- CONFIGURATION STORAGE AVATARS - ZIGZAG
-- ============================================
-- Ce fichier documente la configuration nécessaire pour le bucket avatars
-- Note: Les buckets Supabase Storage doivent être créés via l'interface web ou l'API
-- ============================================

-- IMPORTANT: Ce fichier SQL ne crée PAS le bucket automatiquement
-- Vous devez créer le bucket manuellement via:
-- 1. Supabase Dashboard > Storage > New bucket
--    - Nom: avatars
--    - Public: Oui (pour permettre la lecture publique des avatars)
--    - File size limit: 2097152 (2 MB - taille raisonnable pour une photo de profil)
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- OU

-- 2. Via SQL (si l'extension storage est disponible):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'avatars',
--   'avatars',
--   true,
--   2097152, -- 2 MB en bytes
--   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
-- );

-- ============================================
-- POLITIQUES RLS POUR LE BUCKET
-- ============================================

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;

-- Politique pour permettre l'upload aux utilisateurs authentifiés
-- Les utilisateurs peuvent uploader leur propre avatar uniquement
-- Vérifie que le nom du fichier commence par {user_id}/
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (name LIKE (auth.uid()::text || '/%'))
);

-- Politique pour permettre la mise à jour de son propre avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (name LIKE (auth.uid()::text || '/%'))
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (name LIKE (auth.uid()::text || '/%'))
);

-- Politique pour permettre la suppression de son propre avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (name LIKE (auth.uid()::text || '/%'))
);

-- Politique pour permettre la lecture publique des avatars
-- Tous les utilisateurs (même non authentifiés) peuvent lire les avatars
CREATE POLICY "Public can read avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- Structure des fichiers dans le bucket:
-- avatars/
--   ├── {user_id}/
--   │   └── avatar.{extension}
--   └── ...
--
-- Exemple: avatars/550e8400-e29b-41d4-a716-446655440000/avatar.jpg

-- Format des noms de fichiers:
-- {user_id}/avatar.{extension}
-- - user_id: UUID de l'utilisateur (récupéré via auth.uid())
-- - extension: jpg, png, webp, gif (selon le format de l'image)

-- Sécurité:
-- - Chaque utilisateur ne peut uploader/modifier/supprimer que son propre avatar
-- - La lecture est publique pour permettre l'affichage dans l'interface
-- - Les fichiers sont organisés par user_id pour faciliter la gestion

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier que le bucket existe (à exécuter après création manuelle):
-- SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Vérifier les politiques RLS:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';

-- ============================================
-- NETTOYAGE (optionnel, pour plus tard)
-- ============================================

-- Fonction pour supprimer automatiquement les avatars des comptes supprimés
-- (à créer si nécessaire, pas encore implémentée)
-- Cette fonction pourrait être appelée périodiquement pour nettoyer les fichiers
-- associés à des comptes utilisateurs supprimés

