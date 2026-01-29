import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import ZigzagDashboard from './components/ZigzagDashboard';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // Commencer à false pour afficher immédiatement

  useEffect(() => {
    // Vérifier la session en arrière-plan avec timeout
    checkSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est admin avec timeout
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout vérification admin')), 10000);
        });

        const checkAdminPromise = supabase
          .from('users')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        const { data: userData, error: userError } = await Promise.race([
          checkAdminPromise,
          timeoutPromise
        ]);

        if (userError || !userData || !userData.is_admin) {
          // L'utilisateur n'est pas admin, déconnecter
          await supabase.auth.signOut();
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erreur vérification admin:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      
      // Timeout de 10 secondes pour la vérification de session
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout session')), 10000);
      });

      const sessionPromise = supabase.auth.getSession();
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est admin avec timeout
      const adminCheckPromise = supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      const adminTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout admin check')), 10000);
      });

      const { data: userData, error: userError } = await Promise.race([
        adminCheckPromise,
        adminTimeoutPromise
      ]);

      if (userError || !userData || !userData.is_admin) {
        // L'utilisateur n'est pas admin, déconnecter
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // L'utilisateur est admin
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error);
      setIsAuthenticated(false);
      // Afficher le login même en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  // Afficher le login immédiatement si pas authentifié (même pendant le chargement)
  // Cela évite de rester bloqué sur "Chargement..."
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Si authentifié, afficher le dashboard (même si loading, le dashboard gère son propre loading)
  return <ZigzagDashboard onLogout={handleLogout} />;
}

export default App

