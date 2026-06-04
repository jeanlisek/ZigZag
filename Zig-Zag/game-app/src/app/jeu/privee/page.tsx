'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createRoom, joinRoom, getPlayerNickname, getPlayerNicknameSync, setPlayerNickname } from '@/lib/supabase/rooms';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { validateInput, nicknameSchema, roomCodeSchema } from '@/utils/validation';
import { UserMenu } from '@/components/ui/UserMenu';
import { MESSAGES } from '@/constants';

export default function PrivateGamePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth(false);
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le pseudo : utiliser celui de l'utilisateur connecté si disponible, sinon localStorage
  useEffect(() => {
    const initializeNickname = async () => {
      if (!authLoading) {
        try {
          // Utiliser la fonction getPlayerNickname qui récupère depuis Supabase
          const nickname = await getPlayerNickname();
          setNickname(nickname);
          logger.debug('Pseudo initialisé:', nickname);
        } catch (err) {
          logger.error('Erreur initialisation pseudo:', err);
          // Fallback sur localStorage en cas d'erreur
          const storedNickname = getPlayerNicknameSync();
          setNickname(storedNickname);
        }
      }
    };

    initializeNickname();
  }, [user, isAuthenticated, authLoading]);

  // Créer une nouvelle room
  const handleCreateRoom = async () => {
    const nicknameValidation = validateInput(nicknameSchema, { nickname: nickname.trim() });
    if (!nicknameValidation.success) {
      setError(nicknameValidation.error);
      toast.error(nicknameValidation.error);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await createRoom(nickname.trim());

      if (result) {
        router.push(`/jeu/room/${result.room.code}`);
      } else {
        setError('Erreur lors de la création de la room');
      }
    } catch (err) {
      logger.error('Erreur création room:', err);
      const errorMsg = MESSAGES.ERROR_GENERIC;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  // Rejoindre une room existante
  const handleJoinRoom = async () => {
    const nicknameValidation = validateInput(nicknameSchema, { nickname: nickname.trim() });
    if (!nicknameValidation.success) {
      setError(nicknameValidation.error);
      toast.error(nicknameValidation.error);
      return;
    }

    const codeValidation = validateInput(roomCodeSchema, { code: roomCode.trim() });
    if (!codeValidation.success) {
      setError(codeValidation.error);
      toast.error(codeValidation.error);
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const result = await joinRoom(roomCode.trim(), nickname.trim());

      if (result.success) {
        if (result.error) {
          // Partie en cours, afficher le message mais quand même rediriger
          setError(result.error);
          setTimeout(() => {
            router.push(`/jeu/room/${roomCode.toUpperCase()}`);
          }, 2000);
        } else {
          router.push(`/jeu/room/${roomCode.toUpperCase()}`);
        }
      } else {
        setError(result.error || 'Erreur lors de la connexion');
      }
    } catch (err) {
      logger.error('Erreur connexion room:', err);
      const errorMsg = MESSAGES.ERROR_GENERIC;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsJoining(false);
    }
  };

  // Gérer le changement de pseudo
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setPlayerNickname(value);
  };

  const headerStyle = {
    background: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))',
    backgroundImage: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))'
  };

  return (
    <div className="private-game-container">
      <header className="private-header" style={headerStyle}>
        <div className="header-content">
          <Link href="/jeu" className="logo-link">
            <img src="/assets/logo.png" alt="ZigZag" className="header-logo" />
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="private-content">
        <div className="container">
          <div className="private-card fade-in">
            <div className="private-card-header">
              <div className="card-icon-private-page">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              
              <h1 className="page-title">Partie Privée</h1>
              <p className="subtitle">Joue avec tes amis en créant ou rejoignant une room</p>
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="private-card-body">
              {error && (
                <div className="error-message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              {/* Pseudo */}
              <div className="form-group">
                <label htmlFor="nickname">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Ton pseudo
                </label>
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  placeholder="Entre ton pseudo..."
                  maxLength={20}
                  className="input-field"
                />
              </div>

              {/* Créer une room */}
              <div className="create-section">
                <div className="section-header">
                  <h2>Créer une Room</h2>
                  <p>Crée une nouvelle partie et invite tes amis avec le code</p>
                </div>
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating || !nickname.trim()}
                  className="btn-primary btn-create"
                >
                  {isCreating ? (
                    <>
                      <span className="spinner-small"></span>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Créer une Room
                    </>
                  )}
                </button>
              </div>

              <div className="divider">
                <span>ou</span>
              </div>

              {/* Rejoindre une room */}
              <div className="join-section">
                <div className="section-header">
                  <h2>Rejoindre une Room</h2>
                  <p>Entre le code partagé par ton ami</p>
                </div>
                <div className="code-input-group">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    maxLength={6}
                    className="input-code"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={isJoining || !nickname.trim() || !roomCode.trim()}
                    className="btn-secondary btn-join"
                  >
                    {isJoining ? (
                      <span className="spinner-small"></span>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                        Rejoindre
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="back-link">
                <Link href="/jeu">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Retour au choix de mode
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

