-- ============================================
-- NETTOYAGE AUTOMATIQUE DES FICHIERS AUDIO
-- ============================================
-- Supprime les fichiers audio des parties créées il y a plus de 24h
-- Date: 22 Décembre 2024
-- Durée de conservation: 24h à partir du début de la partie (created_at)
-- ============================================

-- ============================================
-- FONCTION: Identifier les parties à nettoyer
-- ============================================

-- Fonction pour obtenir la liste des game_id dont les fichiers audio doivent être supprimés
-- (parties créées il y a plus de 24h)
CREATE OR REPLACE FUNCTION get_games_to_cleanup_audio()
RETURNS TABLE(game_id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT g.id
  FROM public.games g
  WHERE g.created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- ============================================
-- FONCTION: Nettoyer les fichiers audio d'une partie
-- ============================================

-- Fonction pour supprimer tous les fichiers audio d'un game_id donné
-- Cette fonction doit être appelée avec les droits du service role
CREATE OR REPLACE FUNCTION cleanup_audio_for_game(target_game_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  files_deleted INTEGER := 0;
  file_path TEXT;
  files_list RECORD;
BEGIN
  -- Lister tous les fichiers dans le dossier audio-recordings/{game_id}/
  -- Note: Cette fonction utilise l'API Storage via une extension ou une fonction Edge Function
  -- Pour l'instant, on retourne simplement le nombre de fichiers qui devraient être supprimés
  
  -- Cette fonction sera complétée par l'Edge Function qui a accès à l'API Storage
  -- Le SQL seul ne peut pas supprimer les fichiers Storage directement
  
  RETURN files_deleted;
END;
$$;

-- ============================================
-- VUE: Voir les parties dont les fichiers audio doivent être nettoyés
-- ============================================

CREATE OR REPLACE VIEW games_audio_to_cleanup AS
SELECT 
  g.id AS game_id,
  g.status,
  g.created_at,
  g.mode,
  NOW() - g.created_at AS age,
  CASE 
    WHEN g.created_at < NOW() - INTERVAL '24 hours' THEN true
    ELSE false
  END AS should_cleanup,
  -- Compter les étapes audio pour cette partie
  (SELECT COUNT(*) 
   FROM public.steps s 
   WHERE s.game_id = g.id 
   AND s.step_type = 'audio') AS audio_steps_count
FROM public.games g
WHERE g.created_at < NOW() - INTERVAL '24 hours'
ORDER BY g.created_at ASC;

-- ============================================
-- FONCTION HELPER: Obtenir la liste complète pour le nettoyage
-- ============================================

-- Fonction qui retourne tous les détails nécessaires pour le nettoyage
CREATE OR REPLACE FUNCTION get_audio_cleanup_list()
RETURNS TABLE(
  game_id UUID,
  created_at TIMESTAMPTZ,
  status TEXT,
  audio_steps_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.created_at,
    g.status,
    (SELECT COUNT(*) 
     FROM public.steps s 
     WHERE s.game_id = g.id 
     AND s.step_type = 'audio') AS audio_steps_count
  FROM public.games g
  WHERE g.created_at < NOW() - INTERVAL '24 hours'
  AND EXISTS (
    SELECT 1 
    FROM public.steps s 
    WHERE s.game_id = g.id 
    AND s.step_type = 'audio'
    AND s.content LIKE 'https://%'
  )
  ORDER BY g.created_at ASC;
END;
$$;

-- ============================================
-- PERMISSIONS
-- ============================================

-- Permettre au service role d'exécuter ces fonctions
GRANT EXECUTE ON FUNCTION get_games_to_cleanup_audio() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_audio_for_game(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_audio_cleanup_list() TO service_role;
GRANT SELECT ON games_audio_to_cleanup TO service_role;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- IMPORTANT: Cette fonction SQL seule ne peut PAS supprimer les fichiers Storage
-- Elle identifie seulement les parties à nettoyer.
-- 
-- La suppression réelle des fichiers doit être faite via:
-- 1. Edge Function Supabase (recommandé) - voir le guide d'installation
-- 2. Script externe avec l'API Supabase Storage
-- 3. pg_cron (si disponible) pour automatiser l'Edge Function
--
-- Structure des fichiers à supprimer:
-- audio-recordings/{game_id}/* (tous les fichiers dans le dossier game_id)
--
-- Exemple:
-- audio-recordings/abc-123-def/1-player-xyz.webm
-- audio-recordings/abc-123-def/2-player-xyz.ogg
-- → Supprimer tout le dossier abc-123-def/

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier les parties à nettoyer:
-- SELECT * FROM games_audio_to_cleanup;

-- Compter les parties à nettoyer:
-- SELECT COUNT(*) FROM games_audio_to_cleanup;

-- Voir la liste complète pour nettoyage:
-- SELECT * FROM get_audio_cleanup_list();

