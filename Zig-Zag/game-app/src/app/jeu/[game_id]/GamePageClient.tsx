'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getGameWithSteps,
  submitStep,
  subscribeToGame,
  joinGame,
  getCurrentPlayerForStep,
} from '@/lib/supabase/games';
import { getOrCreatePlayerId } from '@/lib/supabase/rooms';
import { GameWithSteps, Step, StepType } from '@/types/game';
import DrawingCanvas from '@/components/game/DrawingCanvas';
import TextInput from '@/components/game/TextInput';
import AudioRecorder from '@/components/game/AudioRecorder';
import StepViewer from '@/components/game/StepViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import WaitingScreen from '@/components/game/WaitingScreen';
import { UserMenu } from '@/components/ui/UserMenu';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { validateInput, textStepSchema, drawingStepSchema, audioStepSchema } from '@/utils/validation';
import { MESSAGES } from '@/constants';

interface GamePageClientProps {
  gameId: string;
}

export default function GamePageClient({ gameId }: GamePageClientProps) {
  const router = useRouter();

  const [game, setGame] = useState<GameWithSteps | null>(null);
  const [lastStep, setLastStep] = useState<Step | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [myPlayerNickname, setMyPlayerNickname] = useState<string>('');
  const [isMyTurn, setIsMyTurn] = useState(true); // Par défaut, on laisse jouer (sera ajusté après chargement)
  const [currentPlayerNickname, setCurrentPlayerNickname] = useState<string>('');
  const [submittedContent, setSubmittedContent] = useState<string>('');
  const [submittedType, setSubmittedType] = useState<'drawing' | 'text' | 'audio' | null>(null);
  
  // Ref pour accéder au contenu actuel dans les callbacks
  const contentRef = useRef<string>('');
  
  // Mettre à jour la ref quand le contenu change
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Charger la partie
  const loadGame = useCallback(async () => {
    try {
      // ✅ Vérifier que le gameId est valide avant de charger
      if (!gameId || gameId === 'undefined' || gameId === '__fallback__' || gameId === 'null') {
        logger.error('❌ Game ID invalide:', gameId);
        setError('Identifiant de partie invalide. Veuillez retourner au menu et relancer une partie.');
        setIsLoading(false);
        // Rediriger vers le menu après 3 secondes
        setTimeout(() => {
          router.push('/jeu');
        }, 3000);
        return;
      }

      // Vérifier que c'est un UUID valide (format basique)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(gameId)) {
        logger.error('❌ Format UUID invalide:', gameId);
        setError('Format d\'identifiant invalide. Redirection vers le menu...');
        setIsLoading(false);
        setTimeout(() => {
          router.push('/jeu');
        }, 2000);
        return;
      }

      logger.debug('🎮 Chargement de la partie:', gameId);
      const gameData = await getGameWithSteps(gameId);

      if (!gameData) {
        setError('Partie non trouvée');
        setIsLoading(false);
        return;
      }

      // Note : Le joueur a déjà été ajouté lors du matchmaking
      // Pas besoin de le rajouter ici (évite les doublons)

      setGame(gameData);

      // Vérifier si la partie est terminée
      if (gameData.status === 'completed') {
        router.push(`/jeu/${gameId}/results`);
        return;
      }

      // Obtenir la dernière étape
      if (gameData.steps.length > 0) {
        setLastStep(gameData.steps[gameData.steps.length - 1]);
      }

      // Vérifier si c'est le tour du joueur actuel
      const myPlayerId = await getOrCreatePlayerId();
      setCurrentPlayerId(myPlayerId);
      
      // Récupérer le nickname du joueur actuel
      const myPlayer = gameData.players?.find(p => p.player_id === myPlayerId);
      if (myPlayer) {
        setMyPlayerNickname(myPlayer.nickname);
      }
      
      // Déterminer si c'est le tour du joueur selon le mode
      if (gameData.mode === 'private' && gameData.players && gameData.players.length > 0) {
        // ===== MODE PRIVÉ : un seul joueur à la fois =====
        const currentPlayer = await getCurrentPlayerForStep(gameId, gameData.current_step_number, gameData.players);
        if (currentPlayer) {
          const myTurn = currentPlayer.player_id === myPlayerId;
          setIsMyTurn(myTurn);
          setCurrentPlayerNickname(currentPlayer.nickname);
          
          // Si c'est mon tour ET que j'étais en attente, je peux rejouer
          if (myTurn) {
            setWaitingForPlayer(false);
            logger.debug('🎮 C\'est mon tour (privé) !');
          }
          
          logger.debug('🎮 Tour actuel (privé):', {
            currentPlayer: currentPlayer.nickname,
            isMyTurn: myTurn,
            step: gameData.current_step_number
          });
        } else {
          // Si pas de joueur trouvé, laisser tout le monde jouer (fallback)
          setIsMyTurn(true);
          setWaitingForPlayer(false);
        }
      } else {
        // ===== MODE RANDOM : tout le monde peut jouer simultanément =====
        setIsMyTurn(true);
        
        // Vérifier si j'ai déjà soumis pour le step actuel
        const myLastStep = gameData.steps.find(
          step => step.player_id === myPlayerId && step.step_number === gameData.current_step_number
        );
        
        if (myLastStep) {
          // J'ai déjà joué pour ce step, je dois attendre
          setWaitingForPlayer(true);
          logger.debug('🎮 Mode random - Déjà joué pour ce step, en attente...');
        } else {
          // Je n'ai pas encore joué pour ce step, je peux jouer !
          setWaitingForPlayer(false);
          logger.debug('🎮 Mode random - Pas encore joué, à vous de jouer !');
        }
        
        logger.debug('🎮 État mode random:', {
          isMyTurn: true,
          waitingForPlayer: myLastStep ? true : false,
          currentStep: gameData.current_step_number,
          hasPlayedThisStep: !!myLastStep
        });
      }

      setIsLoading(false);
    } catch (err) {
      logger.error('Erreur lors du chargement:', err);
      setError(MESSAGES.ERROR_GENERIC);
      toast.error(MESSAGES.ERROR_GENERIC);
    }
  }, [gameId, router]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // S'abonner aux changements en temps réel
  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(
      gameId,
      (newStep) => {
        // Nouvelle étape ajoutée
        setLastStep(newStep);
        setWaitingForPlayer(false);
        setContent('');
        contentRef.current = '';
        loadGame(); // Recharger pour mettre à jour l'état
      },
      (updatedGame) => {
        // Partie mise à jour - recharger pour avoir les steps
        if (updatedGame.status === 'completed') {
          router.push(`/jeu/${gameId}/results`);
        } else {
          loadGame();
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [gameId, loadGame, router]);

  // Soumettre une étape (utilisé pour le bouton manuel)
  const handleSubmit = async () => {
    if (!game || !contentRef.current.trim()) {
      toast.error('Veuillez compléter votre contribution !');
      return;
    }

    // Valider le contenu selon le type d'étape
    let validation;
    switch (game.next_step_type) {
      case 'text':
        validation = validateInput(textStepSchema, { content: contentRef.current });
        break;
      case 'drawing':
        validation = validateInput(drawingStepSchema, { content: contentRef.current });
        break;
      case 'audio':
        validation = validateInput(audioStepSchema, { content: contentRef.current });
        break;
      default:
        validation = { success: false, error: 'Type d\'étape invalide' };
    }

    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    await performSubmit(contentRef.current);
  };

  // Soumission automatique (appelée par le timer)
  const handleAutoSubmit = useCallback(async () => {
    if (!game || isSubmitting || waitingForPlayer) return;
    
    // Utiliser le contenu actuel, même s'il est vide
    const currentContent = contentRef.current || getDefaultContent(game.next_step_type);
    
    logger.debug('🚀 Soumission automatique avec contenu:', currentContent ? 'présent' : 'par défaut');
    await performSubmit(currentContent);
  }, [game, isSubmitting, waitingForPlayer]);

  // Fonction de soumission commune
  const performSubmit = async (submitContent: string) => {
    if (!game || isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const result = await submitStep(gameId, game.next_step_type, submitContent);

      if (!result.success) {
        const errorMsg = result.error || MESSAGES.ERROR_GENERIC;
        setError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Vérifier si la partie est terminée
      if (result.game?.status === 'completed') {
        toast.success(MESSAGES.SUCCESS_SUBMIT);
        router.push(`/jeu/${gameId}/results`);
        return;
      }

      // Afficher un message d'attente
      toast.success(MESSAGES.SUCCESS_SUBMIT);
      
      // Sauvegarder le contenu soumis pour la preview
      setSubmittedContent(submitContent);
      setSubmittedType(game.next_step_type);
      
      setWaitingForPlayer(true);
      setContent('');
      contentRef.current = '';
      setLastStep(result.step!);
      // Le jeu sera rechargé automatiquement via l'abonnement temps réel
    } catch (err) {
      logger.error('Erreur lors de la soumission:', err);
      const errorMsg = MESSAGES.ERROR_GENERIC;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtenir un contenu par défaut si le joueur n'a rien soumis
  const getDefaultContent = (stepType: StepType): string => {
    switch (stepType) {
      case 'text':
        return '[Temps écoulé - pas de description]';
      case 'drawing':
        // Canvas blanc en base64
        return createEmptyCanvas();
      case 'audio':
        return '[Temps écoulé - pas d\'audio]';
      default:
        return '';
    }
  };

  // Créer un canvas vide en base64
  const createEmptyCanvas = (): string => {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⏰ Temps écoulé', canvas.width / 2, canvas.height / 2);
    }
    return canvas.toDataURL();
  };

  // Rendu de l'input selon le type d'étape
  const renderInput = () => {
    if (!game || waitingForPlayer) return null;
    
    // Si ce n'est pas le tour du joueur, retourner null (WaitingScreen sera affiché)
    if (!isMyTurn) {
      return null;
    }

    switch (game.next_step_type) {
      case 'drawing':
        return (
          <DrawingCanvas
            onDrawingChange={(dataUrl) => {
              setContent(dataUrl);
              contentRef.current = dataUrl;
            }}
            onAutoSubmit={handleAutoSubmit}
          />
        );
      case 'text':
        return (
          <TextInput
            value={content}
            onChange={(value) => {
              setContent(value);
              contentRef.current = value;
            }}
            onAutoSubmit={handleAutoSubmit}
          />
        );
      case 'audio':
        return (
          <AudioRecorder
            onRecordingComplete={(audioUrl) => {
              setContent(audioUrl);
              contentRef.current = audioUrl;
            }}
            onAutoSubmit={handleAutoSubmit}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="game-container">
        <LoadingSpinner size="large" message="Chargement de la partie..." fullScreen />
      </div>
    );
  }

  // Ne pas afficher une page d'erreur complète pour "Ce n'est pas votre tour"
  // Le WaitingScreen gérera ce cas
  if (error && !error.includes('Ce n\'est pas votre tour')) {
    return (
      <div className="game-container">
        <div className="error-screen">
          <h1>Erreur</h1>
          <p>{error}</p>
          <button onClick={() => router.push('/jeu')} className="btn-primary">
            Retour au menu
          </button>
        </div>
      </div>
    );
  }

  const headerStyle = {
    background: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))',
    backgroundImage: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))'
  };

  return (
    <div className="game-container">
      <header className="game-header" style={headerStyle}>
        <div className="header-content">
          <a href="/jeu" className="logo-link">
            <img src="/assets/logo.png" alt="ZigZag" className="header-logo" />
          </a>
          <div className="header-title-section">
            <h1>ZigZag - Le Jeu</h1>
            <p className="header-subtitle">
              Étape {game?.current_step_number || 0}/{game?.max_steps || 10}
            </p>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="game-content">
        <div className="game-grid">
          {/* Visualisation de l'étape précédente */}
          <section className="step-viewer-card">
            <div className="card-header">
              <h2>Interprétez ceci :</h2>
            </div>
            <div className="card-body">
              {lastStep ? (
                <StepViewer step={lastStep} />
              ) : (
                <div className="welcome-message">
                  <p>
                    🎨 Bienvenue ! Vous êtes le premier joueur.
                    <br />
                    Commencez par dessiner quelque chose !
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Input pour l'étape suivante */}
          <section className="step-input-card">
            <div className="card-header">
              <h2>
                {!isMyTurn && game?.mode === 'private' ? (
                  <>Tour de {currentPlayerNickname}</>
                ) : waitingForPlayer ? (
                  <>En attente...</>
                ) : (
                  <>À votre tour !</>
                )}
              </h2>
              <p>
                {waitingForPlayer
                  ? '⏳ En attente du prochain joueur...'
                  : !isMyTurn && game?.mode === 'private'
                  ? `⏳ C'est au tour de ${currentPlayerNickname} de jouer`
                  : game?.next_step_type === 'drawing'
                  ? '🎨 Dessinez votre interprétation'
                  : game?.next_step_type === 'text'
                  ? '📝 Écrivez votre interprétation'
                  : '🎤 Enregistrez votre interprétation'}
              </p>
            </div>
            <div className="card-body">
              {(() => {
                // Le WaitingScreen s'affiche quand :
                // 1. Le joueur a soumis et attend le suivant (waitingForPlayer)
                // 2. Ce n'est pas le tour du joueur (!isMyTurn)
                const shouldShowWaiting = waitingForPlayer || !isMyTurn;
                
                // Debug : afficher l'état actuel
                console.log('🔍 État actuel:', {
                  waitingForPlayer,
                  isMyTurn,
                  gameMode: game?.mode,
                  currentPlayerNickname,
                  myPlayerNickname,
                  shouldShowWaiting
                });
                
                return shouldShowWaiting ? (
                  <WaitingScreen
                    gameMode={game?.mode || 'random'}
                    currentStep={game?.current_step_number || 0}
                    maxSteps={game?.max_steps || 10}
                    currentPlayerNickname={currentPlayerNickname}
                    players={game?.players}
                    submittedContent={submittedContent}
                    submittedType={submittedType || undefined}
                    onReturnToMenu={() => router.push('/jeu')}
                    gameId={gameId}
                    playerId={currentPlayerId || undefined}
                    playerNickname={myPlayerNickname}
                  />
                ) : (
                  renderInput()
                );
              })()}
            </div>
          </section>
        </div>

        {/* Bouton de soumission */}
        {!waitingForPlayer && isMyTurn && (
          <div className="submit-section">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="btn-submit"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon interprétation'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
