-- ============================================
-- Migration 07 : Ajouter user_id aux tables du jeu
-- Date : 2025-01-XX
-- Description : Lie les parties, joueurs, étapes et rooms aux utilisateurs authentifiés
-- ============================================

-- Ajouter user_id à games (nullable pour compatibilité avec joueurs anonymes)
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Ajouter user_id à players (nullable)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Ajouter user_id à steps (nullable)
ALTER TABLE steps 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Ajouter user_id à rooms (nullable)
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_steps_user_id ON steps(user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);

-- Note : Les colonnes sont nullable pour permettre aux joueurs anonymes (non authentifiés)
-- de continuer à jouer. Quand un utilisateur est authentifié, son user_id sera automatiquement
-- lié aux parties qu'il crée ou rejoint.





