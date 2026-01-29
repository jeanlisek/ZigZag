-- ============================================
-- FIX COMPLET - TOUTES LES PERMISSIONS DASHBOARD
-- ============================================
-- Ce script corrige les permissions pour TOUTES les tables
-- utilisées par le dashboard
-- ============================================

-- ============================================
-- 1. TABLE: games (la principale !)
-- ============================================

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.games;
DROP POLICY IF EXISTS "Public read games" ON public.games;
DROP POLICY IF EXISTS "Dashboard read access" ON public.games;

-- Créer policy de lecture publique
CREATE POLICY "Dashboard read games"
  ON public.games
  FOR SELECT
  TO public
  USING (true);

RAISE NOTICE '✅ Policy créée pour games';

-- ============================================
-- 2. TABLE: users
-- ============================================

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can read all users" ON public.users;
DROP POLICY IF EXISTS "Public read users" ON public.users;

-- Créer policy de lecture publique
CREATE POLICY "Dashboard read users"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

RAISE NOTICE '✅ Policy créée pour users';

-- ============================================
-- 3. TABLE: newsletter_signups
-- ============================================

-- Activer RLS si pas déjà fait
ALTER TABLE IF EXISTS public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Public read newsletter" ON public.newsletter_signups;
DROP POLICY IF EXISTS "Dashboard read newsletter" ON public.newsletter_signups;

-- Créer policy de lecture publique
CREATE POLICY "Dashboard read newsletter"
  ON public.newsletter_signups
  FOR SELECT
  TO public
  USING (true);

-- Policy pour insertion (formulaire)
DROP POLICY IF EXISTS "Public insert newsletter" ON public.newsletter_signups;
CREATE POLICY "Public insert newsletter"
  ON public.newsletter_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

RAISE NOTICE '✅ Policy créée pour newsletter_signups';

-- ============================================
-- 4. TABLE: contact_messages
-- ============================================

-- Activer RLS
ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Public read contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Dashboard read contact" ON public.contact_messages;

-- Créer policy de lecture publique
CREATE POLICY "Dashboard read contact"
  ON public.contact_messages
  FOR SELECT
  TO public
  USING (true);

-- Policy pour insertion
DROP POLICY IF EXISTS "Public insert contact" ON public.contact_messages;
CREATE POLICY "Public insert contact"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

RAISE NOTICE '✅ Policy créée pour contact_messages';

-- ============================================
-- 5. VÉRIFICATION COMPLÈTE
-- ============================================

-- Afficher toutes les policies
SELECT 
  '🔐 POLICIES CRÉÉES' as section,
  tablename as table,
  policyname as policy,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('games', 'users', 'newsletter_signups', 'contact_messages')
ORDER BY tablename, policyname;

-- Afficher les données dans chaque table
SELECT 'games' as table_name, COUNT(*) as total FROM public.games
UNION ALL
SELECT 'users', COUNT(*) FROM public.users
UNION ALL
SELECT 'newsletter_signups', COUNT(*) FROM public.newsletter_signups
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM public.contact_messages;

-- Détail des games par statut
SELECT 
  '📊 GAMES PAR STATUT' as section,
  status,
  COUNT(*) as nombre
FROM public.games
GROUP BY status
ORDER BY status;

-- ============================================
-- ✅ TERMINÉ !
-- ============================================
-- Les 4 tables principales sont maintenant accessibles
-- Rafraîchissez le dashboard (F5) pour voir les données !
-- ============================================

