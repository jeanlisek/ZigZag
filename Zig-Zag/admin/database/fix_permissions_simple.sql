-- ============================================
-- FIX PERMISSIONS DASHBOARD - VERSION SIMPLE
-- ============================================
-- Ce script corrige UNIQUEMENT les permissions
-- Sans toucher à la structure des tables
-- ============================================

-- ============================================
-- 1. VÉRIFIER QUELLES TABLES EXISTENT
-- ============================================
-- Exécutez d'abord cette requête pour voir vos tables
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'zigs', 'newsletter_signups', 'contact_messages', 'game_sessions')
ORDER BY table_name;

-- ============================================
-- 2. VOIR LA STRUCTURE DE LA TABLE ZIGS
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'zigs'
ORDER BY ordinal_position;

-- ============================================
-- 3. CORRIGER LES PERMISSIONS (VERSION SIMPLE)
-- ============================================

-- Pour la table USERS (si elle existe)
DO $$ 
BEGIN
  -- Supprimer toutes les anciennes policies
  DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
  DROP POLICY IF EXISTS "Service role can read all users" ON public.users;
  DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
  DROP POLICY IF EXISTS "Allow public read users" ON public.users;
  
  -- Créer la nouvelle policy simple
  CREATE POLICY "Public read users"
    ON public.users
    FOR SELECT
    TO public
    USING (true);
    
  RAISE NOTICE 'Policy créée pour users';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Table users n''existe pas';
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur users: %', SQLERRM;
END $$;

-- Pour la table ZIGS (si elle existe)
DO $$ 
BEGIN
  -- Supprimer toutes les anciennes policies
  DROP POLICY IF EXISTS "Users can read own zigs" ON public.zigs;
  DROP POLICY IF EXISTS "Allow public read access to zigs" ON public.zigs;
  DROP POLICY IF EXISTS "Allow public read zigs" ON public.zigs;
  DROP POLICY IF EXISTS "Public read zigs" ON public.zigs;
  DROP POLICY IF EXISTS "Authenticated users can insert zigs" ON public.zigs;
  
  -- Créer la nouvelle policy simple
  CREATE POLICY "Public read zigs"
    ON public.zigs
    FOR SELECT
    TO public
    USING (true);
    
  RAISE NOTICE 'Policy créée pour zigs';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Table zigs n''existe pas';
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur zigs: %', SQLERRM;
END $$;

-- Pour la table NEWSLETTER_SIGNUPS (si elle existe)
DO $$ 
BEGIN
  -- Activer RLS si pas déjà fait
  ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;
  
  -- Supprimer anciennes policies
  DROP POLICY IF EXISTS "Allow public read newsletter_signups" ON public.newsletter_signups;
  DROP POLICY IF EXISTS "Allow public read newsletter" ON public.newsletter_signups;
  DROP POLICY IF EXISTS "Public read newsletter" ON public.newsletter_signups;
  
  -- Créer nouvelle policy
  CREATE POLICY "Public read newsletter"
    ON public.newsletter_signups
    FOR SELECT
    TO public
    USING (true);
    
  -- Policy pour insertion (formulaire)
  DROP POLICY IF EXISTS "Allow public insert newsletter_signups" ON public.newsletter_signups;
  DROP POLICY IF EXISTS "Public insert newsletter" ON public.newsletter_signups;
  
  CREATE POLICY "Public insert newsletter"
    ON public.newsletter_signups
    FOR INSERT
    TO public
    WITH CHECK (true);
    
  RAISE NOTICE 'Policy créée pour newsletter_signups';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Table newsletter_signups n''existe pas';
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur newsletter_signups: %', SQLERRM;
END $$;

-- Pour la table CONTACT_MESSAGES (si elle existe)
DO $$ 
BEGIN
  -- Activer RLS
  ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
  
  -- Supprimer anciennes policies
  DROP POLICY IF EXISTS "Allow public read contact_messages" ON public.contact_messages;
  DROP POLICY IF EXISTS "Allow public read contact" ON public.contact_messages;
  DROP POLICY IF EXISTS "Public read contact" ON public.contact_messages;
  
  -- Créer nouvelle policy
  CREATE POLICY "Public read contact"
    ON public.contact_messages
    FOR SELECT
    TO public
    USING (true);
    
  -- Policy pour insertion
  DROP POLICY IF EXISTS "Allow public insert contact_messages" ON public.contact_messages;
  DROP POLICY IF EXISTS "Public insert contact" ON public.contact_messages;
  
  CREATE POLICY "Public insert contact"
    ON public.contact_messages
    FOR INSERT
    TO public
    WITH CHECK (true);
    
  RAISE NOTICE 'Policy créée pour contact_messages';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Table contact_messages n''existe pas';
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur contact_messages: %', SQLERRM;
END $$;

-- Pour la table GAME_SESSIONS (si elle existe)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own sessions" ON public.game_sessions;
  DROP POLICY IF EXISTS "Allow public read game_sessions" ON public.game_sessions;
  DROP POLICY IF EXISTS "Public read sessions" ON public.game_sessions;
  
  CREATE POLICY "Public read sessions"
    ON public.game_sessions
    FOR SELECT
    TO public
    USING (true);
    
  RAISE NOTICE 'Policy créée pour game_sessions';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Table game_sessions n''existe pas';
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur game_sessions: %', SQLERRM;
END $$;

-- ============================================
-- 4. VÉRIFICATION FINALE
-- ============================================

-- Afficher toutes les policies créées
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Compter les données dans chaque table
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'zigs', COUNT(*) FROM public.zigs
UNION ALL
SELECT 'newsletter_signups', COUNT(*) FROM public.newsletter_signups
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM public.contact_messages;

-- ============================================
-- ✅ TERMINÉ !
-- ============================================

