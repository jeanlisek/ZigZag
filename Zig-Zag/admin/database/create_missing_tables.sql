-- ============================================
-- CRÉER LES TABLES MANQUANTES POUR LE DASHBOARD
-- ============================================
-- Exécutez ce script si certaines tables n'existent pas
-- ============================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  pseudo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ,
  signup_source TEXT DEFAULT 'organic'
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================
-- 2. TABLE: zigs (parties de jeu)
-- ============================================
CREATE TABLE IF NOT EXISTS public.zigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_zigs_created_at ON public.zigs(created_at);
CREATE INDEX IF NOT EXISTS idx_zigs_status ON public.zigs(status);
CREATE INDEX IF NOT EXISTS idx_zigs_user_id ON public.zigs(user_id);

-- ============================================
-- 3. TABLE: newsletter_signups
-- ============================================
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_signups(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON public.newsletter_signups(created_at);

-- ============================================
-- 4. TABLE: contact_messages
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived'))
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_messages(status);

-- ============================================
-- 5. ACTIVER RLS (ROW LEVEL SECURITY)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CRÉER LES POLICIES (PERMISSIONS)
-- ============================================

-- USERS : Lecture publique
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
CREATE POLICY "Allow public read users"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

-- USERS : Insertion publique (pour le jeu)
DROP POLICY IF EXISTS "Allow public insert users" ON public.users;
CREATE POLICY "Allow public insert users"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ZIGS : Lecture publique
DROP POLICY IF EXISTS "Allow public read zigs" ON public.zigs;
CREATE POLICY "Allow public read zigs"
  ON public.zigs
  FOR SELECT
  TO public
  USING (true);

-- ZIGS : Insertion publique
DROP POLICY IF EXISTS "Allow public insert zigs" ON public.zigs;
CREATE POLICY "Allow public insert zigs"
  ON public.zigs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ZIGS : Mise à jour publique
DROP POLICY IF EXISTS "Allow public update zigs" ON public.zigs;
CREATE POLICY "Allow public update zigs"
  ON public.zigs
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- NEWSLETTER : Lecture publique
DROP POLICY IF EXISTS "Allow public read newsletter" ON public.newsletter_signups;
CREATE POLICY "Allow public read newsletter"
  ON public.newsletter_signups
  FOR SELECT
  TO public
  USING (true);

-- NEWSLETTER : Insertion publique
DROP POLICY IF EXISTS "Allow public insert newsletter" ON public.newsletter_signups;
CREATE POLICY "Allow public insert newsletter"
  ON public.newsletter_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- CONTACT : Lecture publique
DROP POLICY IF EXISTS "Allow public read contact" ON public.contact_messages;
CREATE POLICY "Allow public read contact"
  ON public.contact_messages
  FOR SELECT
  TO public
  USING (true);

-- CONTACT : Insertion publique
DROP POLICY IF EXISTS "Allow public insert contact" ON public.contact_messages;
CREATE POLICY "Allow public insert contact"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================
-- 7. INSÉRER DES DONNÉES DE TEST (OPTIONNEL)
-- ============================================
-- Décommentez cette section pour ajouter des données de test

/*
-- Insérer quelques utilisateurs de test
INSERT INTO public.users (email, pseudo) VALUES
  ('user1@test.com', 'Player1'),
  ('user2@test.com', 'Player2'),
  ('user3@test.com', 'Player3')
ON CONFLICT DO NOTHING;

-- Insérer quelques parties de test
INSERT INTO public.zigs (status) VALUES
  ('active'),
  ('active'),
  ('completed'),
  ('completed'),
  ('completed')
ON CONFLICT DO NOTHING;

-- Insérer des inscrits newsletter
INSERT INTO public.newsletter_signups (email) VALUES
  ('newsletter1@test.com'),
  ('newsletter2@test.com'),
  ('newsletter3@test.com')
ON CONFLICT (email) DO NOTHING;

-- Insérer des messages de contact
INSERT INTO public.contact_messages (email, message, name) VALUES
  ('contact1@test.com', 'Ceci est un message de test', 'Test User 1'),
  ('contact2@test.com', 'Question sur le jeu', 'Test User 2')
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- 8. VÉRIFICATION
-- ============================================

-- Afficher le nombre d'enregistrements dans chaque table
SELECT 
  'users' as table_name,
  COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
  'zigs' as table_name,
  COUNT(*) as count
FROM public.zigs
UNION ALL
SELECT 
  'newsletter_signups' as table_name,
  COUNT(*) as count
FROM public.newsletter_signups
UNION ALL
SELECT 
  'contact_messages' as table_name,
  COUNT(*) as count
FROM public.contact_messages;

-- Afficher les policies créées
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'zigs', 'newsletter_signups', 'contact_messages')
ORDER BY tablename, policyname;

-- ============================================
-- ✅ TERMINÉ !
-- ============================================
-- Vos tables sont maintenant créées et configurées
-- Le dashboard devrait pouvoir lire les données
-- Rafraîchissez le dashboard pour voir les changements
-- ============================================

