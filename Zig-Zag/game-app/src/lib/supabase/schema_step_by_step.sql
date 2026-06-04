-- ============================================
-- SCRIPT ÉTAPE PAR ÉTAPE - Exécutez chaque section séparément
-- ============================================

-- ============================================
-- ÉTAPE 1 : NETTOYER
-- ============================================
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS steps CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP FUNCTION IF EXISTS complete_expired_games() CASCADE;

-- ============================================
-- ÉTAPE 2 : CRÉER GAMES
-- ============================================
CREATE TABLE games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    current_step_number INTEGER NOT NULL DEFAULT 0,
    next_step_type TEXT NOT NULL DEFAULT 'drawing',
    mode TEXT NOT NULL DEFAULT 'random',
    room_code TEXT,
    max_steps INTEGER DEFAULT 10,
    creator_id TEXT
);

-- ============================================
-- ÉTAPE 3 : CRÉER STEPS
-- ============================================
CREATE TABLE steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    step_type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    player_id TEXT,
    UNIQUE(game_id, step_number)
);

ALTER TABLE steps 
ADD CONSTRAINT fk_steps_game 
FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;

-- ============================================
-- ÉTAPE 4 : CRÉER ROOMS
-- ============================================
CREATE TABLE rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    game_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creator_id TEXT NOT NULL,
    player_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE rooms 
ADD CONSTRAINT fk_rooms_game 
FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;

-- ============================================
-- ÉTAPE 5 : CRÉER PLAYERS
-- ============================================
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL,
    player_id TEXT NOT NULL,
    nickname TEXT NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_creator BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(game_id, player_id)
);

ALTER TABLE players 
ADD CONSTRAINT fk_players_game 
FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;

-- ============================================
-- ÉTAPE 6 : CRÉER LES INDEX
-- ============================================
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_mode ON games(mode);
CREATE INDEX idx_steps_game_id ON steps(game_id);
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_game_id ON players(game_id);

-- ============================================
-- ÉTAPE 7 : TEMPS RÉEL
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE steps;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- ============================================
-- ÉTAPE 8 : RLS
-- ============================================
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "games_select" ON games FOR SELECT USING (true);
CREATE POLICY "steps_select" ON steps FOR SELECT USING (true);
CREATE POLICY "rooms_select" ON rooms FOR SELECT USING (true);
CREATE POLICY "players_select" ON players FOR SELECT USING (true);

CREATE POLICY "games_insert" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "steps_insert" ON steps FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_insert" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "players_insert" ON players FOR INSERT WITH CHECK (true);

CREATE POLICY "games_update" ON games FOR UPDATE USING (true);
CREATE POLICY "rooms_update" ON rooms FOR UPDATE USING (true);
CREATE POLICY "players_update" ON players FOR UPDATE USING (true);

-- ============================================
-- ÉTAPE 9 : FONCTION
-- ============================================
CREATE FUNCTION complete_expired_games()
RETURNS void AS $$
BEGIN
    UPDATE games SET status = 'completed'
    WHERE status = 'active' AND expires_at <= NOW();
    
    UPDATE rooms SET status = 'completed'
    WHERE game_id IN (SELECT id FROM games WHERE status = 'completed')
    AND status != 'completed';
END;
$$ LANGUAGE plpgsql;

