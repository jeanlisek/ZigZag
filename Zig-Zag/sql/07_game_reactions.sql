-- =====================================================
-- Table game_reactions
-- Réactions et messages rapides pendant l'attente
-- =====================================================

-- Création de la table
CREATE TABLE IF NOT EXISTS public.game_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('emoji', 'message')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index pour les requêtes fréquentes
  CONSTRAINT game_reactions_game_id_idx UNIQUE (id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_game_reactions_game_id ON public.game_reactions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_reactions_created_at ON public.game_reactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_reactions_player_id ON public.game_reactions(player_id);

-- RLS (Row Level Security)
ALTER TABLE public.game_reactions ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut lire les réactions d'une partie
CREATE POLICY "Les réactions sont visibles par tous"
  ON public.game_reactions
  FOR SELECT
  USING (true);

-- Policy : Les joueurs peuvent créer des réactions
CREATE POLICY "Les joueurs peuvent envoyer des réactions"
  ON public.game_reactions
  FOR INSERT
  WITH CHECK (true);

-- Nettoyage automatique : Supprimer les réactions de plus de 24h
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

-- Commentaires
COMMENT ON TABLE public.game_reactions IS 'Réactions et messages rapides des joueurs pendant l''attente';
COMMENT ON COLUMN public.game_reactions.type IS 'Type de réaction: emoji ou message';
COMMENT ON COLUMN public.game_reactions.content IS 'Contenu de la réaction (emoji ou texte)';
