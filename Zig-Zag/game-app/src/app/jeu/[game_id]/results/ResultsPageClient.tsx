'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGameWithSteps } from '@/lib/supabase/games';
import { GameWithSteps, Step } from '@/types/game';
import StepViewer from '@/components/game/StepViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { MESSAGES } from '@/constants';

interface ResultsPageClientProps {
  gameId: string;
}

export default function ResultsPageClient({ gameId }: ResultsPageClientProps) {
  const router = useRouter();

  const [game, setGame] = useState<GameWithSteps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const gameData = await getGameWithSteps(gameId);

        if (!gameData) {
          setError('Partie non trouvée');
          return;
        }

        setGame(gameData);
      } catch (err) {
        logger.error('Erreur lors du chargement des résultats:', err);
        const errorMsg = MESSAGES.ERROR_GENERIC;
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, [gameId]);

  const getStepTypeLabel = (stepType: string) => {
    switch (stepType) {
      case 'drawing':
        return '🎨 Dessin';
      case 'text':
        return '📝 Texte';
      case 'audio':
        return '🎤 Audio';
      default:
        return stepType;
    }
  };

  if (isLoading) {
    return (
      <div className="results-container">
        <LoadingSpinner size="large" message="Chargement des résultats..." fullScreen />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="results-container">
        <div className="error-screen">
          <h1>Erreur</h1>
          <p>{error || 'Partie non trouvée'}</p>
          <button onClick={() => router.push('/jeu')} className="btn-primary">
            Retour au menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <header className="results-header">
        <div className="zigzag-header-decoration"></div>
        <div className="results-header-content">
          <h1 className="results-title">
            <span className="zigzag-text">Zig</span>
            <span className="zigzag-text">Zag</span>
          </h1>
          <p className="results-subtitle">🎉 Partie Terminée !</p>
          <p className="results-description">Découvrez l'évolution complète du message</p>
        </div>
      </header>

      <div className="results-container">
        <div className="zigzag-timeline">
          {game.steps.map((step: Step, index: number) => (
            <div key={step.id} className="zigzag-step-wrapper">
              {/* Ligne de connexion zigzag */}
              {index < game.steps.length - 1 && (
                <div className={`zigzag-connector zigzag-connector-${index % 2 === 0 ? 'right' : 'left'}`}>
                  <svg viewBox="0 0 100 100" className="zigzag-line">
                    {index % 2 === 0 ? (
                      <path d="M 0 50 Q 50 0, 100 50" stroke="currentColor" strokeWidth="3" fill="none" />
                    ) : (
                      <path d="M 0 50 Q 50 100, 100 50" stroke="currentColor" strokeWidth="3" fill="none" />
                    )}
                  </svg>
                </div>
              )}
              
              <div className="zigzag-step-card">
                <div className="zigzag-step-number">
                  <span>{step.step_number}</span>
                </div>
                <div className="zigzag-step-header">
                  <span className="zigzag-step-type">{getStepTypeLabel(step.step_type)}</span>
                </div>
                <div className="zigzag-step-content">
                  <StepViewer step={step} />
                </div>
              </div>
            </div>
          ))}

          {game.steps.length === 0 && (
            <div className="zigzag-no-steps">
              <p>Aucune étape n'a été soumise pour cette partie.</p>
            </div>
          )}
        </div>

        <div className="results-footer">
          <button
            onClick={() => router.push('/jeu/matchmaking')}
            className="btn-primary btn-zigzag"
          >
            🔄 Rejouer
          </button>
          <a href="/jeu" className="btn-secondary btn-zigzag">
            🏠 Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
