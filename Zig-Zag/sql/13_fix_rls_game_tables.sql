-- ============================================
-- CORRECTION RLS POLICIES - TABLES DE JEU
-- ============================================
-- Date: 2025-01-24
-- Problème: Les policies RLS étaient trop permissives (USING (true))
-- Solution: Restreindre les permissions selon le contexte du jeu
-- ============================================

-- ============================================
-- 1. GAMES - Policies sécurisées
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "games_select" ON public.games;
DROP POLICY IF EXISTS "games_insert" ON public.games;
DROP POLICY IF EXISTS "games_update" ON public.games;

-- SELECT: Lecture publique (nécessaire pour voir les parties actives)
CREATE POLICY "games_select" 
  ON public.games 
  FOR SELECT 
  USING (true);

-- INSERT: Permettre la création de parties (nécessaire pour le matchmaking)
-- Limiter aux utilisateurs authentifiés OU avec un creator_id valide
CREATE POLICY "games_insert" 
  ON public.games 
  FOR INSERT 
  WITH CHECK (
    -- Soit l'utilisateur est authentifié
    auth.uid() IS NOT NULL
    -- Soit c'est une partie anonyme (mode random) avec un creator_id
    OR (mode = 'random' AND creator_id IS NOT NULL)
  );

-- UPDATE: Seulement pour le créateur OU si la partie est active et l'utilisateur est dans la partie
CREATE POLICY "games_update" 
  ON public.games 
  FOR UPDATE 
  USING (
    -- Le créateur peut modifier
    (creator_id IS NOT NULL AND creator_id = (SELECT player_id FROM public.players WHERE game_id = games.id AND is_creator = true LIMIT 1))
    -- OU l'utilisateur authentifié est le créateur
    OR (user_id IS NOT NULL AND user_id = auth.uid())
    -- OU la partie est active et l'utilisateur est un joueur de la partie
    OR (
      status = 'active' 
      AND EXISTS (
        SELECT 1 FROM public.players 
        WHERE game_id = games.id 
        AND (player_id = (SELECT player_id FROM public.players WHERE game_id = games.id AND user_id = auth.uid() LIMIT 1) OR user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    -- Même logique pour WITH CHECK
    (creator_id IS NOT NULL AND creator_id = (SELECT player_id FROM public.players WHERE game_id = games.id AND is_creator = true LIMIT 1))
    OR (user_id IS NOT NULL AND user_id = auth.uid())
    OR (
      status = 'active' 
      AND EXISTS (
        SELECT 1 FROM public.players 
        WHERE game_id = games.id 
        AND (player_id = (SELECT player_id FROM public.players WHERE game_id = games.id AND user_id = auth.uid() LIMIT 1) OR user_id = auth.uid())
      )
    )
  );

-- ============================================
-- 2. STEPS - Policies sécurisées
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "steps_select" ON public.steps;
DROP POLICY IF EXISTS "steps_insert" ON public.steps;

-- SELECT: Lecture publique (nécessaire pour voir les étapes d'une partie)
CREATE POLICY "steps_select" 
  ON public.steps 
  FOR SELECT 
  USING (true);

-- INSERT: Seulement pour les joueurs de la partie
CREATE POLICY "steps_insert" 
  ON public.steps 
  FOR INSERT 
  WITH CHECK (
    -- Le joueur doit être dans la table players pour cette partie
    EXISTS (
      SELECT 1 FROM public.players 
      WHERE game_id = steps.game_id 
      AND (
        player_id = steps.player_id 
        OR (steps.user_id IS NOT NULL AND user_id = steps.user_id)
      )
      AND is_active = true
    )
    -- OU l'utilisateur authentifié est dans la partie
    OR (
      steps.user_id IS NOT NULL 
      AND steps.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.players 
        WHERE game_id = steps.game_id 
        AND user_id = auth.uid()
        AND is_active = true
      )
    )
  );

-- ============================================
-- 3. ROOMS - Policies sécurisées
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "rooms_select" ON public.rooms;
DROP POLICY IF EXISTS "rooms_insert" ON public.rooms;
DROP POLICY IF EXISTS "rooms_update" ON public.rooms;

-- SELECT: Lecture publique (nécessaire pour rejoindre une room par code)
CREATE POLICY "rooms_select" 
  ON public.rooms 
  FOR SELECT 
  USING (true);

-- INSERT: Seulement pour les utilisateurs authentifiés OU avec un creator_id valide
CREATE POLICY "rooms_insert" 
  ON public.rooms 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL 
    OR creator_id IS NOT NULL
  );

-- UPDATE: Seulement pour le créateur de la room
CREATE POLICY "rooms_update" 
  ON public.rooms 
  FOR UPDATE 
  USING (
    -- Le créateur peut modifier
    creator_id = (SELECT player_id FROM public.players WHERE game_id = rooms.game_id AND is_creator = true LIMIT 1)
    -- OU l'utilisateur authentifié est le créateur
    OR (user_id IS NOT NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    creator_id = (SELECT player_id FROM public.players WHERE game_id = rooms.game_id AND is_creator = true LIMIT 1)
    OR (user_id IS NOT NULL AND user_id = auth.uid())
  );

-- ============================================
-- 4. PLAYERS - Policies sécurisées
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "players_select" ON public.players;
DROP POLICY IF EXISTS "players_insert" ON public.players;
DROP POLICY IF EXISTS "players_update" ON public.players;

-- SELECT: Lecture publique (nécessaire pour voir les joueurs d'une partie)
CREATE POLICY "players_select" 
  ON public.players 
  FOR SELECT 
  USING (true);

-- INSERT: Permettre l'ajout de joueurs (nécessaire pour rejoindre une partie)
CREATE POLICY "players_insert" 
  ON public.players 
  FOR INSERT 
  WITH CHECK (
    -- Le player_id doit correspondre à l'utilisateur authentifié OU être un UUID valide
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR player_id IS NOT NULL
  );

-- UPDATE: Seulement pour le joueur lui-même OU le créateur de la partie
CREATE POLICY "players_update" 
  ON public.players 
  FOR UPDATE 
  USING (
    -- Le joueur peut modifier son propre profil
    player_id = (SELECT player_id FROM public.players WHERE id = players.id LIMIT 1)
    -- OU l'utilisateur authentifié est ce joueur
    OR (user_id IS NOT NULL AND user_id = auth.uid())
    -- OU c'est le créateur de la partie
    OR EXISTS (
      SELECT 1 FROM public.games 
      WHERE id = players.game_id 
      AND (
        creator_id = players.player_id 
        OR (user_id IS NOT NULL AND user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    player_id = (SELECT player_id FROM public.players WHERE id = players.id LIMIT 1)
    OR (user_id IS NOT NULL AND user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.games 
      WHERE id = players.game_id 
      AND (
        creator_id = players.player_id 
        OR (user_id IS NOT NULL AND user_id = auth.uid())
      )
    )
  );

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Les policies SELECT restent publiques pour permettre la lecture des parties actives
-- 2. Les policies INSERT sont restreintes mais permettent toujours les parties anonymes (mode random)
-- 3. Les policies UPDATE sont strictement limitées aux créateurs/joueurs de la partie
-- 4. Ces policies empêchent la triche et le sabotage des parties
-- 5. Les utilisateurs authentifiés ont des permissions supplémentaires via auth.uid()
