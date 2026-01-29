-- ============================================
-- SCHEMA SUPABASE POUR LE DASHBOARD ADMIN
-- ============================================
-- Exécuter ce script dans le SQL Editor de Supabase
-- ============================================

-- Activer l'extension pgcrypto pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. TABLE: daily_costs (Coûts publicitaires quotidiens)
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

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_daily_costs_date ON public.daily_costs(date);

-- RLS (Row Level Security)
ALTER TABLE public.daily_costs ENABLE ROW LEVEL SECURITY;

-- Policy: Permettre l'insertion et la mise à jour pour tous (admin via anon key)
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
-- 2. TABLE: weekly_checklist (Checklist hebdomadaire)
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')),
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start, day, task)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_checklist_week ON public.weekly_checklist(week_start, day);

-- RLS
ALTER TABLE public.weekly_checklist ENABLE ROW LEVEL SECURITY;

-- Policy: Permettre toutes les opérations pour tous
CREATE POLICY "Allow all for weekly_checklist"
  ON public.weekly_checklist
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. VÉRIFICATION DES TABLES EXISTANTES
-- ============================================
-- Assurez-vous que ces tables existent déjà dans votre projet Supabase
-- Si elles n'existent pas, créez-les avec les colonnes suivantes :

-- TABLE: public.users (doit exister depuis jouer.html)
-- Colonnes attendues:
--   - id UUID PRIMARY KEY REFERENCES auth.users(id)
--   - email TEXT
--   - username TEXT
--   - avatar_url TEXT
--   - created_at TIMESTAMPTZ
--   - signup_source TEXT (Instagram, TikTok, LinkedIn, organic, etc.)
--   - first_zig_created_at TIMESTAMPTZ
--   - first_game_played_at TIMESTAMPTZ
--   - last_seen_at TIMESTAMPTZ

-- Si la table users n'existe pas encore, créez-la avec :
/*
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  signup_source TEXT DEFAULT 'organic',
  first_zig_created_at TIMESTAMPTZ,
  first_game_played_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour créer automatiquement un profil utilisateur lors de l'inscription
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
*/

-- ============================================
-- 4. TABLES OPTIONNELLES POUR FONCTIONNALITÉS FUTURES
-- ============================================

-- TABLE: zigs (si elle n'existe pas)
/*
CREATE TABLE IF NOT EXISTS public.zigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('text', 'image', 'audio')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zigs_user_id ON public.zigs(user_id);
CREATE INDEX IF NOT EXISTS idx_zigs_created_at ON public.zigs(created_at);

ALTER TABLE public.zigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own zigs"
  ON public.zigs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
*/

-- TABLE: game_sessions (si elle n'existe pas)
/*
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  zig_id UUID REFERENCES public.zigs(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON public.game_sessions(started_at);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON public.game_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
*/

-- ============================================
-- 5. FONCTIONS UTILES POUR LE DASHBOARD
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_daily_costs_updated_at
  BEFORE UPDATE ON public.daily_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_checklist_updated_at
  BEFORE UPDATE ON public.weekly_checklist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. VUES UTILES POUR LE DASHBOARD (OPTIONNEL)
-- ============================================

-- Vue pour les statistiques d'acquisition quotidiennes
/*
CREATE OR REPLACE VIEW public.daily_acquisition_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as signups,
  COUNT(DISTINCT signup_source) as unique_sources
FROM public.users
GROUP BY DATE(created_at)
ORDER BY date DESC;
*/

-- Vue pour les coûts et acquisitions combinés
/*
CREATE OR REPLACE VIEW public.acquisition_with_costs AS
SELECT
  COALESCE(dc.date, DATE(u.created_at)) as date,
  COUNT(DISTINCT u.id) as signups,
  COALESCE(dc.cost_total, 0) as total_cost,
  COALESCE(dc.cost_instagram, 0) as instagram_cost,
  COALESCE(dc.cost_tiktok, 0) as tiktok_cost,
  COALESCE(dc.cost_linkedin, 0) as linkedin_cost,
  CASE
    WHEN COUNT(DISTINCT u.id) > 0 THEN COALESCE(dc.cost_total, 0) / COUNT(DISTINCT u.id)
    ELSE 0
  END as cpa
FROM public.users u
FULL OUTER JOIN public.daily_costs dc ON DATE(u.created_at) = dc.date
GROUP BY COALESCE(dc.date, DATE(u.created_at)), dc.cost_total, dc.cost_instagram, dc.cost_tiktok, dc.cost_linkedin
ORDER BY date DESC;
*/

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Remplacez les credentials admin dans admin.js par vos propres identifiants
-- 2. En production, utilisez des variables d'environnement pour les credentials
-- 3. Les policies RLS permettent l'accès via la clé anon, ce qui est acceptable pour un dashboard admin
--    (l'authentification est gérée côté client via localStorage)
-- 4. Pour une sécurité renforcée, vous pouvez créer un rôle admin dans Supabase
--    et utiliser des policies plus restrictives
-- 5. Assurez-vous que la table users existe et contient les colonnes nécessaires
--    (signup_source, first_zig_created_at, first_game_played_at, last_seen_at)

