-- ============================================
-- FIX PERMISSIONS POUR LA TABLE GAMES
-- ============================================
-- Active l'accès en lecture publique pour le dashboard
-- ============================================

-- Supprimer les anciennes policies restrictives
DROP POLICY IF EXISTS "Enable read access for all users" ON public.games;
DROP POLICY IF EXISTS "Public read games" ON public.games;
DROP POLICY IF EXISTS "Allow public read games" ON public.games;

-- Créer une policy pour permettre la lecture publique
CREATE POLICY "Dashboard read access"
  ON public.games
  FOR SELECT
  TO public
  USING (true);

-- Vérifier que la policy est créée
SELECT 
  '✅ POLICIES SUR GAMES' as info,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'games';

-- Compter les données
SELECT 
  '📊 DONNÉES DANS GAMES' as info,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'active') as actives,
  COUNT(*) FILTER (WHERE status = 'completed') as completees
FROM public.games;

-- ============================================
-- ✅ MAINTENANT EXÉCUTEZ LES AUTRES TABLES
-- ============================================
