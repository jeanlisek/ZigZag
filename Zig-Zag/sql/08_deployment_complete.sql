-- =====================================================
-- Script de Déploiement Complet - ZigZag
-- À exécuter sur Supabase avant le déploiement
-- =====================================================

-- 1. Vérifier que toutes les tables principales existent
-- (Normalement déjà créées par 01_complete_schema.sql)

-- 2. Créer la table game_reactions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.game_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('emoji', 'message')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_game_reactions_game_id ON public.game_reactions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_reactions_created_at ON public.game_reactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_reactions_player_id ON public.game_reactions(player_id);

-- 3. RLS (Row Level Security)
ALTER TABLE public.game_reactions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Les réactions sont visibles par tous" ON public.game_reactions;
DROP POLICY IF EXISTS "Les joueurs peuvent envoyer des réactions" ON public.game_reactions;

-- Créer les nouvelles policies
CREATE POLICY "Les réactions sont visibles par tous"
  ON public.game_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Les joueurs peuvent envoyer des réactions"
  ON public.game_reactions
  FOR INSERT
  WITH CHECK (true);

-- 4. Fonction de nettoyage automatique
CREATE OR REPLACE FUNCTION cleanup_old_reactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.game_reactions
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 5. Vérifications finales
DO $$
BEGIN
  -- Vérifier que la table existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'game_reactions') THEN
    RAISE NOTICE '✅ Table game_reactions créée avec succès';
  ELSE
    RAISE EXCEPTION '❌ Échec de la création de la table game_reactions';
  END IF;
  
  -- Compter les policies
  IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'game_reactions') >= 2 THEN
    RAISE NOTICE '✅ Policies RLS configurées';
  ELSE
    RAISE WARNING '⚠️ Policies RLS manquantes ou incomplètes';
  END IF;
END $$;

-- Commentaires
COMMENT ON TABLE public.game_reactions IS 'Réactions et messages rapides des joueurs pendant l''attente';
COMMENT ON COLUMN public.game_reactions.type IS 'Type de réaction: emoji ou message';
COMMENT ON COLUMN public.game_reactions.content IS 'Contenu de la réaction (emoji ou texte)';

-- Afficher un résumé
SELECT 
  'game_reactions' as table_name,
  COUNT(*) as nombre_reactions,
  MAX(created_at) as derniere_reaction
FROM public.game_reactions;
