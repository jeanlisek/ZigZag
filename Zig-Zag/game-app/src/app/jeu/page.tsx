'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UserMenu } from '@/components/ui/UserMenu';
import { logger } from '@/utils/logger';
import { MESSAGES } from '@/constants';

export default function JeuPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier la configuration
    const checkConfig = async () => {
      try {
        // La validation des variables d'environnement se fait maintenant dans env.ts
        // Si on arrive ici, c'est que tout est OK
        logger.debug('Configuration Supabase validée');
        setIsLoading(false);
      } catch (err) {
        logger.error('Erreur vérification config:', err);
        setError(MESSAGES.ERROR_GENERIC);
        setIsLoading(false);
      }
    };

    // Petit délai pour éviter les problèmes de hydration
    const timer = setTimeout(() => {
      checkConfig();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || authLoading) {
    return (
      <div className="mode-selection-container" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #40C4D4 0%, #F54291 50%, #FF912D 100%)'
      }}>
        <LoadingSpinner size="large" message={MESSAGES.LOADING} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mode-selection-container" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #40C4D4 0%, #F54291 50%, #FF912D 100%)',
        padding: '20px'
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '40px', 
          borderRadius: '20px',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#F54291', marginBottom: '20px' }}>⚠️ Erreur de configuration</h2>
          <p style={{ color: '#2C2A35', marginBottom: '20px' }}>{error}</p>
          <p style={{ color: '#2C2A35', fontSize: '14px', opacity: 0.7 }}>
            Vérifiez que votre fichier <code>.env.local</code> contient bien les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
          </p>
        </div>
      </div>
    );
  }

  const headerStyle = {
    background: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))',
    backgroundImage: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))'
  };

  return (
    <div className="mode-selection-container">
      <header className="mode-selection-header" style={headerStyle}>
        <div className="header-content">
          <Link href="/jeu" className="logo-link">
            <img
              src="/assets/logo.png"
              alt="ZigZag"
              className="header-logo"
            />
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="mode-selection-content">
        <div className="container">
          <div className="mode-selection-intro fade-in">
            <h1 className="page-title">Choisis ton mode de jeu</h1>
            <p className="page-subtitle">Rejoins une partie rapide ou crée ta propre room privée</p>
          </div>
          
          <div className="mode-cards">
            <Link href="/jeu/matchmaking" className="mode-card fade-in-up" prefetch={false}>
              <div className="card-icon card-icon-multi">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h2 className="card-title">Multi</h2>
              <p className="card-description">Rejoins une partie aléatoire avec des joueurs du monde entier. Matchmaking instantané !</p>
              <div className="card-features">
                <span className="feature-badge">🌍 Mondial</span>
                <span className="feature-badge">⚡ Rapide</span>
              </div>
            </Link>

            <Link href="/jeu/privee" className="mode-card fade-in-up">
              <div className="card-icon card-icon-private">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 className="card-title">Partie Privée</h2>
              <p className="card-description">Crée une room avec un code unique et invite tes amis. Contrôle total sur ta partie !</p>
              <div className="card-features">
                <span className="feature-badge">🔒 Privé</span>
                <span className="feature-badge">👥 Amis</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

