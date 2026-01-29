-- ============================================
-- AJOUT DU CHAMP is_admin À LA TABLE users
-- ============================================
-- Ce script ajoute un champ is_admin pour distinguer les administrateurs des joueurs
-- ============================================

-- Ajouter la colonne is_admin si elle n'existe pas déjà
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Créer un index pour améliorer les performances des requêtes admin
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN public.users.is_admin IS 'Indique si l''utilisateur est un administrateur avec accès au dashboard';

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Par défaut, tous les utilisateurs existants auront is_admin = FALSE
-- 2. Pour donner les droits admin à un utilisateur, exécutez :
--    UPDATE public.users SET is_admin = TRUE WHERE email = 'admin@zig-zag.fun';
-- 3. La vérification se fait dans le code du dashboard (Login.tsx)
-- 4. Les policies RLS existantes ne sont pas modifiées

