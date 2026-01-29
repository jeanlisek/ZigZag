-- ============================================
-- FIX: Ajouter les colonnes manquantes à la table users
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase
-- pour corriger les erreurs 42703 (colonne non définie)
-- ============================================

-- Vérifier et ajouter les colonnes manquantes à la table users
-- Ces colonnes sont nécessaires pour le dashboard admin

-- 1. Colonne signup_source (source d'inscription)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'organic';

-- 2. Colonne first_zig_created_at (date de création du premier Zig)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_zig_created_at TIMESTAMPTZ;

-- 3. Colonne first_game_played_at (date du premier tour joué)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_game_played_at TIMESTAMPTZ;

-- 4. Colonne last_seen_at (dernière connexion/activité)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- 5. Colonne updated_at (si elle n'existe pas déjà)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_users_signup_source ON public.users(signup_source);
CREATE INDEX IF NOT EXISTS idx_users_first_zig ON public.users(first_zig_created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON public.users;

-- Créer le trigger
CREATE TRIGGER update_users_updated_at_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_users_updated_at();

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Pour vérifier que les colonnes ont été ajoutées, exécutez :
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'users'
-- ORDER BY ordinal_position;

