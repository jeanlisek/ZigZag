-- ============================================
-- SCHEMA COMPLET SUPABASE - ZIGZAG
-- ============================================
-- Ce fichier contient le schéma complet de toutes les tables
-- Exécuter ce script dans le SQL Editor de Supabase pour créer toutes les tables
-- ============================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLE: users (Utilisateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  signup_source TEXT DEFAULT 'organic',
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  first_zig_created_at TIMESTAMPTZ,
  first_game_played_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour users
CREATE INDEX IF NOT EXISTS idx_users_signup_source ON public.users(signup_source);
CREATE INDEX IF NOT EXISTS idx_users_first_zig ON public.users(first_zig_created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;

-- RLS pour users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

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
-- 2. TABLE: newsletter_signups (Inscriptions newsletter)
-- ============================================
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour newsletter_signups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_signups(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON public.newsletter_signups(created_at);

-- RLS pour newsletter_signups
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- 3. TABLE: contact_messages (Messages de contact)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_email ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact_messages(created_at);

-- RLS pour contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- 4. TABLE: zigs (Parties Zigzag - ancien système)
-- ============================================
CREATE TABLE IF NOT EXISTS public.zigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('public', 'private')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  max_steps INTEGER NOT NULL DEFAULT 8,
  current_step INTEGER NOT NULL DEFAULT 0,
  seed_type TEXT NOT NULL DEFAULT 'text' CHECK (seed_type IN ('text', 'drawing')),
  seed_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index pour zigs
CREATE INDEX IF NOT EXISTS idx_zigs_creator_id ON public.zigs(creator_id);
CREATE INDEX IF NOT EXISTS idx_zigs_status ON public.zigs(status);
CREATE INDEX IF NOT EXISTS idx_zigs_created_at ON public.zigs(created_at);

-- RLS pour zigs
ALTER TABLE public.zigs ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- 5. TABLE: participants (Participants aux zigs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zig_id UUID NOT NULL REFERENCES public.zigs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  turn_order INTEGER NOT NULL,
  has_played BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour participants
CREATE INDEX IF NOT EXISTS idx_participants_zig_id ON public.participants(zig_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);

-- RLS pour participants
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- 6. TABLE: games (Parties - nouveau système)
-- ============================================
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  current_step_number INTEGER NOT NULL DEFAULT 0,
  next_step_type TEXT NOT NULL DEFAULT 'drawing',
  mode TEXT NOT NULL DEFAULT 'random',
  room_code TEXT,
  max_steps INTEGER DEFAULT 10,
  creator_id TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Index pour games
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_mode ON public.games(mode);
CREATE INDEX IF NOT EXISTS idx_games_room_code ON public.games(room_code);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at);
CREATE INDEX IF NOT EXISTS idx_games_user_id ON public.games(user_id);

-- RLS pour games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "games_select" ON public.games FOR SELECT USING (true);
CREATE POLICY "games_insert" ON public.games FOR INSERT WITH CHECK (true);

-- UPDATE: Permettre la mise à jour si :
-- 1. La partie est active ET il y a au moins un joueur actif (sécurité)
-- 2. OU l'utilisateur authentifié est le créateur/user_id de la partie
CREATE POLICY "games_update" 
  ON public.games 
  FOR UPDATE 
  USING (
    (
      status = 'active' 
      AND EXISTS (
        SELECT 1 FROM public.players 
        WHERE game_id = games.id 
        AND is_active = true
      )
    )
    OR (user_id IS NOT NULL AND user_id = auth.uid())
  )
  WITH CHECK (
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

-- ============================================
-- 7. TABLE: steps (Étapes des parties)
-- ============================================
CREATE TABLE IF NOT EXISTS public.steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  player_id TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE(game_id, step_number)
);

-- Index pour steps
CREATE INDEX IF NOT EXISTS idx_steps_game_id ON public.steps(game_id);
CREATE INDEX IF NOT EXISTS idx_steps_step_number ON public.steps(game_id, step_number);
CREATE INDEX IF NOT EXISTS idx_steps_user_id ON public.steps(user_id);

-- RLS pour steps
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "steps_select" ON public.steps FOR SELECT USING (true);
CREATE POLICY "steps_insert" ON public.steps FOR INSERT WITH CHECK (true);

-- ============================================
-- 8. TABLE: rooms (Rooms privées)
-- ============================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creator_id TEXT NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 0,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Index pour rooms
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_game_id ON public.rooms(game_id);
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON public.rooms(user_id);

-- RLS pour rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_update" ON public.rooms FOR UPDATE USING (true);

-- ============================================
-- 9. TABLE: players (Joueurs des parties)
-- ============================================
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_creator BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE(game_id, player_id)
);

-- Index pour players
CREATE INDEX IF NOT EXISTS idx_players_game_id ON public.players(game_id);
CREATE INDEX IF NOT EXISTS idx_players_player_id ON public.players(player_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players(user_id);

-- RLS pour players
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select" ON public.players FOR SELECT USING (true);
CREATE POLICY "players_insert" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_update" ON public.players FOR UPDATE USING (true);

-- ============================================
-- 10. TABLE: daily_costs (Coûts publicitaires quotidiens)
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  cost_total DECIMAL(10,2) DEFAULT 0,
  cost_instagram DECIMAL(10,2) DEFAULT 0,
  cost_tiktok DECIMAL(10,2) DEFAULT 0,
  cost_linkedin DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour daily_costs
CREATE INDEX IF NOT EXISTS idx_daily_costs_date ON public.daily_costs(date);

-- RLS pour daily_costs
ALTER TABLE public.daily_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserts for daily_costs"
  ON public.daily_costs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow updates for daily_costs"
  ON public.daily_costs
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow selects for daily_costs"
  ON public.daily_costs
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- 11. TABLE: weekly_checklist (Checklist hebdomadaire)
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')),
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start, day, task)
);

-- Index pour weekly_checklist
CREATE INDEX IF NOT EXISTS idx_checklist_week ON public.weekly_checklist(week_start, day);

-- RLS pour weekly_checklist
ALTER TABLE public.weekly_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for weekly_checklist"
  ON public.weekly_checklist
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TRIGGERS ET FONCTIONS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour users
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON public.users;
CREATE TRIGGER update_users_updated_at_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour daily_costs
DROP TRIGGER IF EXISTS update_daily_costs_updated_at ON public.daily_costs;
CREATE TRIGGER update_daily_costs_updated_at
  BEFORE UPDATE ON public.daily_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour weekly_checklist
DROP TRIGGER IF EXISTS update_weekly_checklist_updated_at ON public.weekly_checklist;
CREATE TRIGGER update_weekly_checklist_updated_at
  BEFORE UPDATE ON public.weekly_checklist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer automatiquement un profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, signup_source)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'signup_source', 'organic')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier la disponibilité d'un username
-- Accessible publiquement (anon) mais ne retourne que l'existence, pas les données sensibles
CREATE OR REPLACE FUNCTION public.check_username_available(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier si le username existe (insensible à la casse)
    RETURN NOT EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE LOWER(username) = LOWER(username_to_check)
    );
END;
$$;

-- Permissions pour la fonction check_username_available
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO authenticated;

-- Commentaire pour documentation
COMMENT ON FUNCTION public.check_username_available IS 'Vérifie si un username est disponible. Retourne TRUE si disponible, FALSE si déjà pris. Accessible publiquement. Sécurisé : ne retourne que l''existence, pas les données sensibles.';

-- Trigger pour créer automatiquement un profil utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TEMPS RÉEL (Realtime)
-- ============================================
-- Activer le temps réel pour les tables de jeu
DO $$ BEGIN 
  ALTER PUBLICATION supabase_realtime ADD TABLE games; 
EXCEPTION WHEN OTHERS THEN NULL; 
END $$;

DO $$ BEGIN 
  ALTER PUBLICATION supabase_realtime ADD TABLE steps; 
EXCEPTION WHEN OTHERS THEN NULL; 
END $$;

DO $$ BEGIN 
  ALTER PUBLICATION supabase_realtime ADD TABLE rooms; 
EXCEPTION WHEN OTHERS THEN NULL; 
END $$;

DO $$ BEGIN 
  ALTER PUBLICATION supabase_realtime ADD TABLE players; 
EXCEPTION WHEN OTHERS THEN NULL; 
END $$;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Toutes les tables ont RLS activé
-- 2. Les policies permettent l'accès via la clé anon pour les tables publiques
-- 3. Les tables users, zigs, participants ont des policies plus restrictives
-- 4. Le trigger handle_new_user crée automatiquement un profil dans public.users
-- 5. Les triggers update_updated_at_column mettent à jour automatiquement updated_at
-- 6. Le temps réel est activé pour games, steps, rooms, players
