-- ============================================
-- SYNCHRONISATION : Policies RLS et Index manquants
-- ============================================
-- Ce script met à jour les policies RLS et ajoute les index manquants
-- pour synchroniser Supabase avec les fichiers SQL du dossier
-- ============================================

-- ============================================
-- 1. CONTACT_MESSAGES - Mise à jour des policies
-- ============================================
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Service role can read contact messages" ON public.contact_messages;

-- Créer les nouvelles policies (cohérentes avec le fichier SQL)
CREATE POLICY "Allow inserts for contact_messages"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow selects for contact_messages"
  ON public.contact_messages
  FOR SELECT
  TO public
  USING (true);

-- Ajouter les index manquants
CREATE INDEX IF NOT EXISTS idx_contact_email ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact_messages(created_at);

-- ============================================
-- 2. NEWSLETTER_SIGNUPS - Mise à jour des policies
-- ============================================
-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Allow inserts for newsletter" ON public.newsletter_signups;

-- Créer la nouvelle policy (cohérente avec le fichier SQL)
CREATE POLICY "Allow inserts for newsletter_signups"
  ON public.newsletter_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow selects for newsletter_signups"
  ON public.newsletter_signups
  FOR SELECT
  TO public
  USING (true);

-- Ajouter les index manquants
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_signups(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON public.newsletter_signups(created_at);

-- ============================================
-- 3. USERS - Mise à jour des policies
-- ============================================
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Créer les nouvelles policies (cohérentes avec le fichier SQL)
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role can read all users"
  ON public.users
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================
-- 4. ZIGS - Mise à jour des policies
-- ============================================
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Anyone can view public zigs" ON public.zigs;
DROP POLICY IF EXISTS "Creators can update own zigs" ON public.zigs;
DROP POLICY IF EXISTS "Users can create zigs" ON public.zigs;

-- Créer les nouvelles policies (cohérentes avec le fichier SQL)
CREATE POLICY "Users can read own zigs"
  ON public.zigs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can insert own zigs"
  ON public.zigs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Ajouter les index manquants (renommer si nécessaire)
DROP INDEX IF EXISTS idx_zigs_creator;
CREATE INDEX IF NOT EXISTS idx_zigs_creator_id ON public.zigs(creator_id);
DROP INDEX IF EXISTS idx_zigs_mode;
CREATE INDEX IF NOT EXISTS idx_zigs_mode ON public.zigs(mode);
DROP INDEX IF EXISTS idx_zigs_status;
CREATE INDEX IF NOT EXISTS idx_zigs_status ON public.zigs(status);
CREATE INDEX IF NOT EXISTS idx_zigs_created_at ON public.zigs(created_at);

-- ============================================
-- 5. PARTICIPANTS - Mise à jour des policies
-- ============================================
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Anyone can view participants of accessible zigs" ON public.participants;
DROP POLICY IF EXISTS "Users can join zigs" ON public.participants;
DROP POLICY IF EXISTS "Users can update own participation" ON public.participants;

-- Créer la nouvelle policy (cohérente avec le fichier SQL)
CREATE POLICY "Users can read participants of their zigs"
  ON public.participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.zigs 
      WHERE zigs.id = participants.zig_id 
      AND zigs.creator_id = auth.uid()
    )
  );

-- Ajouter les index manquants (renommer si nécessaire)
DROP INDEX IF EXISTS idx_participants_user;
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);
DROP INDEX IF EXISTS idx_participants_zig;
CREATE INDEX IF NOT EXISTS idx_participants_zig_id ON public.participants(zig_id);

-- ============================================
-- 6. GAMES - Ajouter les index manquants
-- ============================================
CREATE INDEX IF NOT EXISTS idx_games_room_code ON public.games(room_code);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at);

-- ============================================
-- 7. STEPS - Ajouter les index manquants
-- ============================================
CREATE INDEX IF NOT EXISTS idx_steps_step_number ON public.steps(game_id, step_number);

-- ============================================
-- 8. ROOMS - Ajouter les index manquants
-- ============================================
CREATE INDEX IF NOT EXISTS idx_rooms_game_id ON public.rooms(game_id);

-- ============================================
-- 9. PLAYERS - Ajouter les index manquants
-- ============================================
CREATE INDEX IF NOT EXISTS idx_players_player_id ON public.players(player_id);

-- ============================================
-- NOTES
-- ============================================
-- Ce script synchronise les policies RLS et les index
-- pour qu'ils correspondent exactement aux fichiers SQL du dossier
-- Les policies existantes dans Supabase sont remplacées par celles du fichier 01_complete_schema.sql
