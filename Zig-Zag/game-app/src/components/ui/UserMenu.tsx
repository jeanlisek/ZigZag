'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

export function UserMenu() {
  const { user, isAuthenticated, loading } = useAuth(false);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Déconnexion réussie');
      router.push('/jeu');
      setIsOpen(false);
    } catch (error) {
      logger.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Si pas authentifié, ne rien afficher
  if (!isAuthenticated || loading) {
    return null;
  }

  // Initiales pour l'avatar
  const getInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // Nom d'affichage
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Joueur';

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button
        className="user-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu utilisateur"
        aria-expanded={isOpen}
      >
        <div className="user-avatar">
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt={displayName}
              className="user-avatar-img"
            />
          ) : (
            <span className="user-avatar-initials">{getInitials()}</span>
          )}
        </div>
        <span className="user-menu-name">{displayName}</span>
        <svg 
          className={`user-menu-arrow ${isOpen ? 'open' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <div className="user-menu-header-avatar">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={displayName}
                  className="user-menu-header-avatar-img"
                />
              ) : (
                <span className="user-menu-header-avatar-initials">{getInitials()}</span>
              )}
            </div>
            <div className="user-menu-header-info">
              <div className="user-menu-header-name">{displayName}</div>
              <div className="user-menu-header-email">{user?.email}</div>
            </div>
          </div>

          <div className="user-menu-divider"></div>

          <Link 
            href="/jeu/compte" 
            className="user-menu-item"
            onClick={() => setIsOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Mon compte</span>
          </Link>

          <Link 
            href="/jeu" 
            className="user-menu-item"
            onClick={() => setIsOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Accueil</span>
          </Link>

          <div className="user-menu-divider"></div>

          <button 
            className="user-menu-item user-menu-item-danger"
            onClick={handleSignOut}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Se déconnecter</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .user-menu-container {
          position: relative;
        }

        .user-menu-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Roboto', sans-serif;
          color: #f2f2f2;
          font-weight: 500;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        }

        .user-menu-button:hover {
          background: rgba(255, 255, 255, 0.35);
          border-color: rgba(255, 255, 255, 0.6);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          color: var(--orange);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--rose), var(--orange));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .user-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-avatar-initials {
          color: white;
          font-weight: 700;
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
        }

        .user-menu-name {
          font-weight: 600;
          font-size: 14px;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #f2f2f2;
        }

        .user-menu-arrow {
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .user-menu-arrow.open {
          transform: rotate(180deg);
        }

        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          min-width: 240px;
          z-index: 1000;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-menu-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .user-menu-header-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--rose), var(--orange));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .user-menu-header-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-menu-header-avatar-initials {
          color: white;
          font-weight: 700;
          font-size: 20px;
          font-family: 'Poppins', sans-serif;
        }

        .user-menu-header-info {
          flex: 1;
          min-width: 0;
        }

        .user-menu-header-name {
          font-weight: 700;
          font-size: 16px;
          color: var(--charcoal);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-menu-header-email {
          font-size: 12px;
          color: rgba(44, 42, 53, 0.6);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-menu-divider {
          height: 1px;
          background: rgba(44, 42, 53, 0.1);
          margin: 8px 0;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--charcoal);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'Roboto', sans-serif;
        }

        .user-menu-item:hover {
          background: rgba(245, 66, 145, 0.1);
          color: var(--rose);
        }

        .user-menu-item svg {
          flex-shrink: 0;
          color: currentColor;
        }

        .user-menu-item-danger {
          color: #ff4757;
        }

        .user-menu-item-danger:hover {
          background: rgba(255, 71, 87, 0.1);
          color: #ff4757;
        }

        @media (max-width: 768px) {
          .user-menu-name {
            display: none;
          }

          .user-menu-dropdown {
            right: 0;
            left: auto;
          }
        }
      `}</style>
    </div>
  );
}
