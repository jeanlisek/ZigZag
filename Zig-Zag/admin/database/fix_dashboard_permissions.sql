-- ============================================
-- FIX PERMISSIONS POUR LE DASHBOARD
-- ============================================
-- Ce script ajoute les permissions nécessaires pour que le dashboard
-- puisse lire les données avec la clé anon (publique)
-- ============================================

-- 1. AUTORISER LA LECTURE DE LA TABLE USERS
-- ============================================

-- Supprimer les anciennes policies restrictives si elles existent
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can read all users" ON public.users;

-- Créer une policy pour permettre la lecture par tous (y compris anon)
CREATE POLICY "Allow public read access to users"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

-- Optionnel : Permettre aux utilisateurs authentifiés de modifier leur profil
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. AUTORISER LA LECTURE DE LA TABLE ZIGS
-- ============================================

-- Supprimer les anciennes policies restrictives
DROP POLICY IF EXISTS "Users can read own zigs" ON public.zigs;

-- Créer une policy pour permettre la lecture par tous
CREATE POLICY "Allow public read access to zigs"
  ON public.zigs
  FOR SELECT
  TO public
  USING (true);

-- Optionnel : Permettre aux utilisateurs authentifiés de créer des zigs
CREATE POLICY "Authenticated users can insert zigs"
  ON public.zigs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. AUTORISER LA LECTURE DE NEWSLETTER_SIGNUPS
-- ============================================

-- Vérifier si la table existe et activer RLS
ALTER TABLE IF EXISTS public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Allow public read newsletter_signups" ON public.newsletter_signups;

-- Créer policy pour lecture publique
CREATE POLICY "Allow public read newsletter_signups"
  ON public.newsletter_signups
  FOR SELECT
  TO public
  USING (true);

-- Permettre l'insertion publique (pour le formulaire)
CREATE POLICY "Allow public insert newsletter_signups"
  ON public.newsletter_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 4. AUTORISER LA LECTURE DE CONTACT_MESSAGES
-- ============================================

-- Vérifier si la table existe et activer RLS
ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Allow public read contact_messages" ON public.contact_messages;

-- Créer policy pour lecture publique
CREATE POLICY "Allow public read contact_messages"
  ON public.contact_messages
  FOR SELECT
  TO public
  USING (true);

-- Permettre l'insertion publique (pour le formulaire de contact)
CREATE POLICY "Allow public insert contact_messages"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 5. AUTORISER LA LECTURE DE GAME_SESSIONS (si elle existe)
-- ============================================

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Users can read own sessions" ON public.game_sessions;

-- Créer policy pour lecture publique
CREATE POLICY "Allow public read game_sessions"
  ON public.game_sessions
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Afficher toutes les policies créées
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'zigs', 'newsletter_signups', 'contact_messages', 'game_sessions')
ORDER BY tablename, policyname;

-- ============================================
-- NOTES DE SÉCURITÉ
-- ============================================
-- ⚠️ Ces policies permettent la LECTURE PUBLIQUE des données
-- C'est acceptable pour un dashboard admin interne
-- 
-- Pour un environnement de production exposé publiquement :
-- 1. Créez un rôle admin spécifique dans Supabase
-- 2. Utilisez une authentification côté serveur
-- 3. Limitez l'accès par IP ou par token
-- 4. Utilisez la service_role_key côté backend uniquement
-- ============================================

