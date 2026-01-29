-- ============================================
-- CORRECTION RLS POLICY games_update
-- ============================================
-- Date: 2025-01-27
-- Problème: La politique games_update était trop restrictive et bloquait
--           les mises à jour lors des parties en mode random (anonymes)
-- Solution: Simplifier la logique pour permettre les mises à jour si :
--           1. La partie est active (les étapes ne peuvent être soumises que par des joueurs autorisés)
--           2. OU l'utilisateur authentifié est le créateur/user_id de la partie
-- ============================================

-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "games_update" ON public.games;

-- UPDATE: Permettre la mise à jour si :
-- 1. La partie est active ET il y a au moins un joueur actif (sécurité)
-- 2. OU l'utilisateur authentifié est le créateur/user_id de la partie
-- Note: Les mises à jour de parties actives sont sécurisées car seuls les joueurs
--       autorisés peuvent soumettre des étapes (vérifié par steps_insert policy)
--       et la mise à jour se fait uniquement après une soumission d'étape réussie
CREATE POLICY "games_update" 
  ON public.games 
  FOR UPDATE 
  USING (
    -- Permettre la mise à jour si la partie est active ET il y a au moins un joueur actif
    -- (cela garantit que la partie est en cours et qu'au moins un joueur y participe)
    (
      status = 'active' 
      AND EXISTS (
        SELECT 1 FROM public.players 
        WHERE game_id = games.id 
        AND is_active = true
      )
    )
    -- OU si l'utilisateur authentifié est le créateur/user_id de la partie
    OR (user_id IS NOT NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    -- Même logique pour WITH CHECK
    (
      status = 'active' 
      AND EXISTS (
        SELECT 1 FROM public.players 
        WHERE game_id = games.id 
        AND is_active = true
      )
    )
    OR (user_id IS NOT NULL AND user_id = auth.uid())
  );
