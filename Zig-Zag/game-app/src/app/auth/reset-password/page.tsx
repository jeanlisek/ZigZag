'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';
import { validateInput, resetPasswordSchema } from '@/utils/validation';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Page de réinitialisation du mot de passe
 * 
 * Cette page :
 * 1. Vérifie que l'utilisateur a un token de réinitialisation valide
 * 2. Affiche un formulaire pour saisir le nouveau mot de passe
 * 3. Met à jour le mot de passe via Supabase
 * 4. Redirige vers la page de connexion après succès
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);

  // Vérifier que le token de réinitialisation est valide
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Attendre que Supabase traite le hash de l'URL
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logger.error('Erreur lors de la vérification de la session:', sessionError);
          setError('Le lien de réinitialisation est invalide ou a expiré.');
          setIsValidToken(false);
          setLoading(false);
          return;
        }

        // Vérifier si on a un type recovery dans l'URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        
        if (type === 'recovery' && session) {
          logger.debug('Token de réinitialisation valide détecté');
          setIsValidToken(true);
        } else if (!session) {
          setError('Le lien de réinitialisation est invalide ou a expiré.');
          setIsValidToken(false);
        } else {
          // Session valide mais pas de type recovery - peut-être déjà utilisé
          setIsValidToken(true);
        }
        
        setLoading(false);
      } catch (err) {
        logger.error('Erreur lors de la vérification du token:', err);
        setError('Une erreur est survenue. Veuillez réessayer.');
        setIsValidToken(false);
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Valider les données
    const validation = validateInput(resetPasswordSchema, {
      password,
      confirmPassword,
    });

    if (!validation.success) {
      setError(validation.error);
      toast.error(validation.error);
      return;
    }

    setSubmitting(true);

    try {
      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        logger.error('Erreur lors de la mise à jour du mot de passe:', updateError);
        setError(updateError.message || 'Erreur lors de la mise à jour du mot de passe.');
        toast.error(updateError.message || 'Erreur lors de la mise à jour du mot de passe.');
        setSubmitting(false);
        return;
      }

      // Succès
      logger.debug('Mot de passe mis à jour avec succès');
      toast.success('Votre mot de passe a été mis à jour avec succès !');
      
      // Nettoyer l'URL
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        router.push('https://zig-zag.fun/jouer?reset=success');
      }, 1500);
    } catch (err) {
      logger.error('Erreur inattendue lors de la réinitialisation:', err);
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      toast.error('Une erreur inattendue est survenue.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #40C4D4 0%, #F54291 50%, #FF912D 100%)'
      }}>
        <LoadingSpinner size="large" message="Vérification du lien..." />
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div style={{
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
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2" style={{ margin: '0 auto 20px' }}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2c2a35',
              marginBottom: '10px'
            }}>
              Lien invalide
            </h1>
            <p style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              {error || 'Le lien de réinitialisation est invalide ou a expiré.'}
            </p>
          </div>
          <button
            onClick={() => router.push('https://zig-zag.fun/jouer')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(90deg, #40C4D4, #F54291, #FF912D)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
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
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: 'linear-gradient(90deg, #40C4D4, #F54291, #FF912D)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2c2a35',
            marginBottom: '10px'
          }}>
            Réinitialiser votre mot de passe
          </h1>
          <p style={{
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Entrez votre nouveau mot de passe ci-dessous
          </p>
        </div>

        {error && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #ffcdd2',
            color: '#c62828',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c2a35',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Nouveau mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                required
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px 45px 14px 14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#40C4D4'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#666'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '5px',
              marginLeft: '5px'
            }}>
              Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c2a35',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Confirmer le mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                required
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px 45px 14px 14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#40C4D4'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#666'
                }}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px',
              background: submitting 
                ? '#ccc' 
                : 'linear-gradient(90deg, #40C4D4, #F54291, #FF912D)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
              opacity: submitting ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!submitting) e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {submitting ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}

