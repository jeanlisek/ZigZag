-- ============================================
-- DIAGNOSTIC DES TABLES SUPABASE
-- ============================================
-- Exécutez ce script pour voir EXACTEMENT ce que vous avez
-- ============================================

-- 1. LISTER TOUTES VOS TABLES
SELECT 
  '📋 VOS TABLES' as info,
  table_name as nom_table,
  table_type as type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. STRUCTURE DE LA TABLE USERS (si elle existe)
SELECT 
  '👥 STRUCTURE: users' as info,
  column_name as colonne,
  data_type as type,
  is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. STRUCTURE DE LA TABLE ZIGS (si elle existe)
SELECT 
  '🎮 STRUCTURE: zigs' as info,
  column_name as colonne,
  data_type as type,
  is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'zigs'
ORDER BY ordinal_position;

-- 4. STRUCTURE DE LA TABLE NEWSLETTER_SIGNUPS (si elle existe)
SELECT 
  '📧 STRUCTURE: newsletter_signups' as info,
  column_name as colonne,
  data_type as type,
  is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'newsletter_signups'
ORDER BY ordinal_position;

-- 5. STRUCTURE DE LA TABLE CONTACT_MESSAGES (si elle existe)
SELECT 
  '💬 STRUCTURE: contact_messages' as info,
  column_name as colonne,
  data_type as type,
  is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'contact_messages'
ORDER BY ordinal_position;

-- 6. NOMBRE D'ENREGISTREMENTS DANS CHAQUE TABLE
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Users
  BEGIN
    SELECT COUNT(*) INTO v_count FROM public.users;
    RAISE NOTICE '👥 USERS: % enregistrements', v_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '👥 USERS: table n''existe pas';
  END;
  
  -- Zigs
  BEGIN
    SELECT COUNT(*) INTO v_count FROM public.zigs;
    RAISE NOTICE '🎮 ZIGS: % enregistrements', v_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '🎮 ZIGS: table n''existe pas';
  END;
  
  -- Newsletter
  BEGIN
    SELECT COUNT(*) INTO v_count FROM public.newsletter_signups;
    RAISE NOTICE '📧 NEWSLETTER: % enregistrements', v_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '📧 NEWSLETTER: table n''existe pas';
  END;
  
  -- Contact
  BEGIN
    SELECT COUNT(*) INTO v_count FROM public.contact_messages;
    RAISE NOTICE '💬 CONTACT: % enregistrements', v_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '💬 CONTACT: table n''existe pas';
  END;
END $$;

-- 7. POLICIES ACTUELLES (règles de sécurité)
SELECT 
  '🔐 POLICIES ACTUELLES' as info,
  tablename as table,
  policyname as nom_policy,
  cmd as operation,
  roles as roles,
  qual as condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. ÉTAT DU RLS (Row Level Security)
SELECT 
  '🛡️ RLS ACTIVÉ?' as info,
  tablename as table,
  CASE 
    WHEN rowsecurity THEN '✅ OUI'
    ELSE '❌ NON'
  END as rls_actif
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'zigs', 'newsletter_signups', 'contact_messages', 'game_sessions')
ORDER BY tablename;

-- ============================================
-- RÉSULTATS À COPIER
-- ============================================
-- Une fois exécuté :
-- 1. Regardez les résultats dans l'onglet "Results"
-- 2. Copiez la structure de vos tables
-- 3. Partagez-moi si besoin d'aide
-- ============================================

