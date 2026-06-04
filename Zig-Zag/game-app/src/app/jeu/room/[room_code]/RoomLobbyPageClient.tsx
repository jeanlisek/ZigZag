'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getRoomWithPlayers,
  subscribeToRoom,
  startPrivateGame,
  leaveRoom,
  isCurrentPlayerCreator,
  getOrCreatePlayerIdSync,
} from '@/lib/supabase/rooms';
import { RoomWithPlayers, Player, Room, MIN_PLAYERS_PRIVATE, calculateMaxSteps } from '@/types/game';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { MESSAGES } from '@/constants';

interface RoomLobbyPageClientProps {
  roomCode: string;
}

export default function RoomLobbyPageClient({ roomCode: roomCodeProp }: RoomLobbyPageClientProps) {
  const router = useRouter();
  const roomCode = roomCodeProp.toUpperCase();

  const [room, setRoom] = useState<RoomWithPlayers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const playerId = getOrCreatePlayerIdSync();
  const isCreator = room ? isCurrentPlayerCreator(room) : false;
  const canStart = room ? room.players.filter(p => p.is_active).length >= MIN_PLAYERS_PRIVATE : false;

  const loadRoom = useCallback(async () => {
    try {
      const roomData = await getRoomWithPlayers(roomCode);
      if (!roomData) {
        setError('Room non trouvée');
        return;
      }
      setRoom(roomData);
      // ✅ Vérifier que le game_id est valide avant redirection
      if (roomData.status === 'in_progress' && roomData.game_id && roomData.game_id !== 'undefined') {
        logger.debug('🎮 Redirection vers partie en cours:', roomData.game_id);
        router.push(`/jeu/${roomData.game_id}`);
        return;
      }
      if (roomData.status === 'completed' && roomData.game_id && roomData.game_id !== 'undefined') {
        logger.debug('🎮 Redirection vers résultats:', roomData.game_id);
        router.push(`/jeu/${roomData.game_id}/results`);
        return;
      }
      setIsLoading(false);
    } catch (err) {
      logger.error('Erreur chargement room:', err);
      const errorMsg = MESSAGES.ERROR_GENERIC;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }, [roomCode, router]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    if (!roomCode) return;
    const unsubscribe = subscribeToRoom(
      roomCode,
      (players: Player[]) => {
        setRoom((prev) => (prev ? { ...prev, players } : null));
      },
      (updatedRoom: Room) => {
        if (updatedRoom.status === 'in_progress') {
          getRoomWithPlayers(roomCode).then((fullRoom) => {
            if (fullRoom?.game_id) {
              router.push(`/jeu/${fullRoom.game_id}`);
            }
          });
        }
        setRoom((prev) => (prev ? { ...prev, ...updatedRoom } : null));
      }
    );
    return () => unsubscribe();
  }, [roomCode, router]);

  useEffect(() => {
    const handleBeforeUnload = () => leaveRoom(roomCode);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomCode]);

  const handleStartGame = async () => {
    if (!canStart) return;
    setIsStarting(true);
    setError(null);
    try {
      const result = await startPrivateGame(roomCode);
      // ✅ Vérifier que le gameId est valide
      if (result.success && result.gameId && result.gameId !== 'undefined') {
        logger.debug('🎮 Lancement de la partie:', result.gameId);
        router.push(`/jeu/${result.gameId}`);
      } else {
        logger.error('❌ Game ID invalide:', result.gameId);
        setError(result.error || 'Erreur lors du lancement');
      }
    } catch (err) {
      logger.error('Erreur démarrage partie:', err);
      const errorMsg = MESSAGES.ERROR_GENERIC;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = async () => {
    await leaveRoom(roomCode);
    router.push('/jeu/privee');
  };

  if (isLoading) {
    return (
      <div className="lobby-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Chargement du lobby...</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="lobby-container">
        <div className="error-screen">
          <h1>Erreur</h1>
          <p>{error}</p>
          <button onClick={() => router.push('/jeu/privee')} className="btn-primary">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const activePlayers = room?.players.filter((p) => p.is_active) || [];
  const estimatedSteps = calculateMaxSteps(activePlayers.length);

  const headerStyle = {
    background: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))',
    backgroundImage: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))'
  };

  return (
    <div className="lobby-container">
      <header className="lobby-header" style={headerStyle}>
        <div className="header-content">
          <a href="/jeu" className="logo-link">
            <img src="/assets/logo.png" alt="ZigZag" className="header-logo" />
          </a>
          <h1>Lobby - Partie Privée</h1>
        </div>
      </header>
      <main className="lobby-content">
        <div className="lobby-card">
          <div className="room-code-section">
            <h2>Code de la Room</h2>
            <div className="room-code-display">
              <span className="room-code">{roomCode}</span>
              <button onClick={handleCopyCode} className="btn-copy" title="Copier le code">
                {copied ? '✓ Copié !' : '📋 Copier'}
              </button>
            </div>
            <p className="room-code-hint">Partage ce code avec tes amis pour qu'ils rejoignent la partie</p>
          </div>
          <div className="players-section">
            <h2>Joueurs ({activePlayers.length}/{MIN_PLAYERS_PRIVATE} minimum)</h2>
            <div className="players-list">
              {activePlayers.map((player, index) => (
                <div key={player.id} className={`player-item ${player.is_creator ? 'creator' : ''} ${player.player_id === playerId ? 'current' : ''}`}>
                  <span className="player-avatar">{player.is_creator ? '👑' : `${index + 1}`}</span>
                  <span className="player-name">{player.nickname}{player.player_id === playerId && ' (Toi)'}</span>
                  {player.is_creator && <span className="player-badge">Créateur</span>}
                </div>
              ))}
              {activePlayers.length < MIN_PLAYERS_PRIVATE && Array.from({ length: MIN_PLAYERS_PRIVATE - activePlayers.length }).map((_, i) => (
                <div key={`empty-${i}`} className="player-item empty">
                  <span className="player-avatar">?</span>
                  <span className="player-name">En attente...</span>
                </div>
              ))}
            </div>
          </div>
          <div className="game-info-section">
            <div className="info-item">
              <span className="info-label">Nombre d'étapes :</span>
              <span className="info-value">
                {activePlayers.length >= MIN_PLAYERS_PRIVATE ? estimatedSteps : `${calculateMaxSteps(MIN_PLAYERS_PRIVATE)} (avec ${MIN_PLAYERS_PRIVATE} joueurs)`}
              </span>
            </div>
            <p className="info-hint">+2 étapes par joueur supplémentaire</p>
          </div>
          {error && <div className="error-message"><p>{error}</p></div>}
          <div className="lobby-actions">
            {isCreator ? (
              <button onClick={handleStartGame} disabled={!canStart || isStarting} className={`btn-primary btn-start ${canStart ? '' : 'disabled'}`}>
                {isStarting ? <><span className="spinner-small"></span>Lancement...</> : canStart ? '🚀 Lancer la Partie' : `⏳ En attente (${activePlayers.length}/${MIN_PLAYERS_PRIVATE} joueurs)`}
              </button>
            ) : (
              <div className="waiting-message">
                <div className="spinner-small"></div>
                <p>En attente que le créateur lance la partie...</p>
              </div>
            )}
            <button onClick={handleLeaveRoom} className="btn-secondary btn-leave">Quitter la Room</button>
          </div>
        </div>
      </main>
    </div>
  );
}
