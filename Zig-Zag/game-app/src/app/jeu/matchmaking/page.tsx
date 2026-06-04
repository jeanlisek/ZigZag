'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { findOrCreateGame } from '@/lib/supabase/games';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UserMenu } from '@/components/ui/UserMenu';
import { MESSAGES } from '@/constants';

export default function MatchmakingPage() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let playerInterval: NodeJS.Timeout;

    async function startMatchmaking() {
      try {
        // Trouver ou créer une partie
        const game = await findOrCreateGame();

        // ✅ Vérifier que la partie ET son ID sont valides
        if (!isMounted || !game || !game.id) {
          if (isMounted) {
            logger.error('Partie invalide reçue:', game);
            setError('Impossible de créer ou trouver une partie. Veuillez réessayer.');
          }
          return;
        }

        // Simuler l'augmentation du nombre de joueurs (animation)
        playerInterval = setInterval(() => {
          setPlayerCount((prev) => (prev < 7 ? prev + 1 : prev));
        }, 300);

        // Rediriger vers la partie immédiatement (pas besoin d'attendre)
        // On garde juste un petit délai pour l'animation visuelle
        setTimeout(() => {
          if (isMounted && game.id) {
            clearInterval(playerInterval);
            logger.debug('🎮 Redirection vers la partie:', game.id);
            router.push(`/jeu/${game.id}`);
          }
        }, 800);
      } catch (err) {
        if (isMounted) {
          const errorMsg = MESSAGES.ERROR_GENERIC;
          setError(errorMsg);
          logger.error('Erreur matchmaking:', err);
          toast.error(errorMsg);
        }
      }
    }

    startMatchmaking();

    return () => {
      isMounted = false;
      if (playerInterval) clearInterval(playerInterval);
    };
  }, [router]);

  const handleCancel = () => {
    router.push('/jeu');
  };

  const headerStyle = {
    background: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))',
    backgroundImage: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))'
  };

  return (
    <div className="matchmaking-container">
      <header className="matchmaking-header" style={headerStyle}>
        <div className="header-content">
          <a href="/jeu" className="logo-link">
            <img
              src="/assets/logo.png"
              alt="ZigZag"
              className="header-logo"
            />
          </a>
          <UserMenu />
        </div>
      </header>

      <main className="matchmaking-content">
        <div className="container">
          <div className="matchmaking-card fade-in">
            <div className="loading-animation">
              <div className="spinner"></div>
            </div>
            
            {error ? (
              <>
                <h1 className="page-title text-red-500">{error}</h1>
                <button onClick={() => window.location.reload()} className="btn-primary mt-4">
                  Réessayer
                </button>
              </>
            ) : (
              <>
                <h1 className="page-title">Recherche de joueurs...</h1>
                <p className="subtitle">
                  Nous cherchons des joueurs du monde entier pour vous
                </p>

                <div className="searching-info">
                  <div className="info-item">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>Recherche mondiale</span>
                  </div>
                  <div className="info-item">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span id="playerCount">{playerCount}</span> joueurs trouvés
                  </div>
                </div>

                <div className="cancel-section">
                  <button onClick={handleCancel} className="btn-cancel">
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

