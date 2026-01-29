-- ============================================
-- SCHEMA SUPABASE POUR LE DASHBOARD ADMIN
-- ============================================
-- Exécuter ce script dans le SQL Editor de Supabase
-- Contient uniquement les tables et fonctions pour le dashboard admin
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
-- 3. FONCTIONS UTILES POUR LE DASHBOARD
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
DROP TRIGGER IF EXISTS update_daily_costs_updated_at ON public.daily_costs;
CREATE TRIGGER update_daily_costs_updated_at
  BEFORE UPDATE ON public.daily_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_checklist_updated_at ON public.weekly_checklist;
CREATE TRIGGER update_weekly_checklist_updated_at
  BEFORE UPDATE ON public.weekly_checklist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Remplacez les credentials admin dans admin.js par vos propres identifiants
-- 2. En production, utilisez des variables d'environnement pour les credentials
-- 3. Les policies RLS permettent l'accès via la clé anon, ce qui est acceptable pour un dashboard admin
--    (l'authentification est gérée côté client via localStorage)
-- 4. Pour une sécurité renforcée, vous pouvez créer un rôle admin dans Supabase
--    et utiliser des policies plus restrictives
