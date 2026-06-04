'use client';

import { useEffect, useState } from 'react';
import DoodleCanvas from './DoodleCanvas';
import QuickReactions from './QuickReactions';
import './WaitingScreen.css';

interface Player {
  player_id: string;
  nickname: string;
  is_active: boolean;
}

interface WaitingScreenProps {
  gameMode: 'random' | 'private';
  currentStep: number;
  maxSteps: number;
  currentPlayerNickname?: string;
  players?: Player[];
  submittedContent?: string;
  submittedType?: 'drawing' | 'text' | 'audio';
  onReturnToMenu?: () => void;
  gameId?: string;
  playerId?: string;
  playerNickname?: string;
}

export default function WaitingScreen({
  gameMode,
  currentStep,
  maxSteps,
  currentPlayerNickname,
  players = [],
  submittedContent,
  submittedType,
  onReturnToMenu,
  gameId,
  playerId,
  playerNickname
}: WaitingScreenProps) {
  const [dots, setDots] = useState('');
  const [timeWaiting, setTimeWaiting] = useState(0);

  // Animation des points
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Compteur de temps d'attente
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeWaiting(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const progressPercentage = Math.round((currentStep / maxSteps) * 100);

  return (
    <div className="waiting-screen">
      <div className="waiting-container">
        {/* Header avec animation */}
        <div className="waiting-header">
          <div className="waiting-icon-wrapper">
            <div className="waiting-icon">⏳</div>
            <div className="waiting-pulse"></div>
          </div>
          <h2 className="waiting-title">Votre contribution est enregistrée !</h2>
          <p className="waiting-subtitle">
            {gameMode === 'private' && currentPlayerNickname
              ? `En attente de ${currentPlayerNickname}${dots}`
              : `En attente du prochain joueur${dots}`}
          </p>
        </div>

        {/* Progression de la partie */}
        <div className="waiting-progress-section">
          <div className="progress-header">
            <span className="progress-label">Progression de la partie</span>
            <span className="progress-percentage">{progressPercentage}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="progress-bar-shine"></div>
            </div>
          </div>
          <div className="progress-info">
            <span>Étape {currentStep} / {maxSteps}</span>
            <span>{maxSteps - currentStep} étapes restantes</span>
          </div>
        </div>

        {/* Preview de la contribution (si disponible) */}
        {submittedContent && (
          <div className="waiting-preview-section">
            <h3 className="preview-title">📋 Votre contribution</h3>
            <div className="preview-content">
              {submittedType === 'drawing' && (
                <div className="preview-drawing">
                  <img src={submittedContent} alt="Votre dessin" />
                </div>
              )}
              {submittedType === 'text' && (
                <div className="preview-text">
                  <p>"{submittedContent}"</p>
                </div>
              )}
              {submittedType === 'audio' && (
                <div className="preview-audio">
                  <audio controls src={submittedContent} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Liste des joueurs (parties privées) */}
        {gameMode === 'private' && players.length > 0 && (
          <div className="waiting-players-section">
            <h3 className="players-title">👥 Joueurs ({players.filter(p => p.is_active).length} actifs)</h3>
            <div className="players-list">
              {players.map((player) => (
                <div 
                  key={player.player_id} 
                  className={`player-item ${!player.is_active ? 'inactive' : ''} ${player.nickname === currentPlayerNickname ? 'current-turn' : ''}`}
                >
                  <div className="player-avatar">
                    {player.nickname.charAt(0).toUpperCase()}
                    {player.nickname === currentPlayerNickname && (
                      <div className="player-turn-indicator">▶</div>
                    )}
                  </div>
                  <div className="player-info">
                    <span className="player-name">{player.nickname}</span>
                    {player.nickname === currentPlayerNickname && (
                      <span className="player-status">🎮 En train de jouer...</span>
                    )}
                    {!player.is_active && (
                      <span className="player-status offline">Hors ligne</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info temps d'attente */}
        <div className="waiting-time-info">
          <div className="time-badge">
            <span className="time-icon">⏱️</span>
            <span>Temps d'attente : {formatTime(timeWaiting)}</span>
          </div>
        </div>

        {/* Canvas de gribouillage libre */}
        <DoodleCanvas />

        {/* Réactions rapides */}
        {gameId && playerId && playerNickname && (
          <QuickReactions 
            gameId={gameId}
            playerId={playerId}
            playerNickname={playerNickname}
          />
        )}

        {/* Conseils ou fun facts */}
        <div className="waiting-tips">
          <div className="tip-card">
            💡 <strong>Le saviez-vous ?</strong> Plus il y a de joueurs, plus les interprétations deviennent créatives et hilarantes !
          </div>
        </div>

        {/* Action */}
        {onReturnToMenu && (
          <div className="waiting-actions">
            <button onClick={onReturnToMenu} className="btn-secondary-outline">
              ← Retour au menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
