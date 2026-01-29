-- ============================================
-- CONFIGURATION STORAGE AUDIO - ZIGZAG
-- ============================================
-- Ce fichier documente la configuration nécessaire pour le bucket audio-recordings
-- Note: Les buckets Supabase Storage doivent être créés via l'interface web ou l'API
-- ============================================

-- IMPORTANT: Ce fichier SQL ne crée PAS le bucket automatiquement
-- Vous devez créer le bucket manuellement via:
-- 1. Supabase Dashboard > Storage > New bucket
--    - Nom: audio-recordings
--    - Public: Oui (pour permettre la lecture publique des enregistrements)
--    - File size limit: 5 MB (30 secondes d'audio ≈ 1-3 MB)
--    - Allowed MIME types: audio/webm, audio/ogg, audio/mp4, audio/aac, audio/wav

-- OU

-- 2. Via SQL (si l'extension storage est disponible):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'audio-recordings',
--   'audio-recordings',
--   true,
--   5242880, -- 5 MB en bytes
--   ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/wav']
-- );

-- ============================================
-- POLITIQUES RLS POUR LE BUCKET
-- ============================================

-- Politique pour permettre l'upload aux utilisateurs authentifiés
-- Tous les utilisateurs authentifiés peuvent uploader dans le bucket
CREATE POLICY "Users can upload audio recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-recordings');

-- Politique pour permettre la lecture publique des enregistrements
-- Tous les utilisateurs (même non authentifiés) peuvent lire les fichiers
CREATE POLICY "Public can read audio recordings"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'audio-recordings');

-- Note: Les politiques UPDATE et DELETE ne sont pas nécessaires ici
-- Les fichiers audio ne sont pas modifiés après upload
-- Le nettoyage peut être fait via le service role si nécessaire

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- Structure des fichiers dans le bucket:
-- audio-recordings/
--   ├── {game_id}/
--   │   ├── {step_number}-{player_id}.webm
--   │   ├── {step_number}-{player_id}.ogg
--   │   └── ...
--
-- Exemple: audio-recordings/abc-123-def/1-xyz-789-player.webm

-- Format des noms de fichiers:
-- {step_number}-{player_id}.{extension}
-- - step_number: numéro de l'étape (1, 2, 3, ...)
-- - player_id: ID du joueur (UUID ou identifiant unique)
-- - extension: webm, ogg, mp4, aac, wav (selon le navigateur)

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier que le bucket existe (à exécuter après création manuelle):
-- SELECT * FROM storage.buckets WHERE id = 'audio-recordings';

-- Vérifier les politiques RLS:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%audio%';

-- ============================================
-- NETTOYAGE (optionnel, pour plus tard)
-- ============================================

-- Fonction pour supprimer automatiquement les anciens fichiers audio
-- (à créer si nécessaire, pas encore implémentée)
-- Cette fonction pourrait être appelée périodiquement pour nettoyer les fichiers
-- associés à des parties terminées depuis plus de X jours

