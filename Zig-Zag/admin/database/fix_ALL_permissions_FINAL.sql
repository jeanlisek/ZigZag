-- ============================================
-- FIX COMPLET - TOUTES LES PERMISSIONS DASHBOARD
-- ============================================
-- Version CORRIGÉE sans erreurs de syntaxe
-- ============================================

-- ============================================
-- 1. TABLE: games (la principale !)
-- ============================================

DROP POLICY IF EXISTS "Enable read access for all users" ON public.games;
DROP POLICY IF EXISTS "Public read games" ON public.games;
DROP POLICY IF EXISTS "Dashboard read access" ON public.games;
DROP POLICY IF EXISTS "Dashboard read games" ON public.games;

CREATE POLICY "Dashboard read games"
  ON public.games
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- 2. TABLE: users
-- ============================================

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can read all users" ON public.users;
DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Dashboard read users" ON public.users;

CREATE POLICY "Dashboard read users"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- 3. TABLE: newsletter_signups
-- ============================================

ALTER TABLE IF EXISTS public.newsletter_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read newsletter" ON public.newsletter_signups;
DROP POLICY IF EXISTS "Dashboard read newsletter" ON public.newsletter_signups;

CREATE POLICY "Dashboard read newsletter"
  ON public.newsletter_signups
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public insert newsletter" ON public.newsletter_signups;
CREATE POLICY "Public insert newsletter"
  ON public.newsletter_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================
-- 4. TABLE: contact_messages
-- ============================================

ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Dashboard read contact" ON public.contact_messages;

CREATE POLICY "Dashboard read contact"
  ON public.contact_messages
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public insert contact" ON public.contact_messages;
CREATE POLICY "Public insert contact"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================
-- 5. VÉRIFICATION - AFFICHER LES POLICIES
-- ============================================

SELECT 
  '🔐 POLICIES' as section,
  tablename as table,
  policyname as policy,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('games', 'users', 'newsletter_signups', 'contact_messages')
ORDER BY tablename, policyname;

-- ============================================
-- 6. VÉRIFICATION - COMPTER LES DONNÉES
-- ============================================

SELECT 'games' as table_name, COUNT(*) as total FROM public.games
UNION ALL
SELECT 'users', COUNT(*) FROM public.users
UNION ALL
SELECT 'newsletter_signups', COUNT(*) FROM public.newsletter_signups
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM public.contact_messages;

-- ============================================
-- 7. DÉTAIL DES GAMES PAR STATUT
-- ============================================

SELECT 
  '📊 GAMES' as section,
  status,
  COUNT(*) as nombre
FROM public.games
GROUP BY status
ORDER BY status;

-- ============================================
-- ✅ TERMINÉ !
-- ============================================
-- Si vous voyez les résultats ci-dessus, c'est gagné !
-- Rafraîchissez maintenant le dashboard (F5)
-- ============================================

