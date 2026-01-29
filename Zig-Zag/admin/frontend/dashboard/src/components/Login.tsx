import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Connexion avec Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est admin dans la table users
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          // Si l'utilisateur n'existe pas dans la table users, créer le profil
          // (normalement créé automatiquement par le trigger, mais au cas où)
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              username: data.user.email?.split('@')[0] || 'user',
              is_admin: false,
            });

          if (insertError) {
            console.error('Erreur création profil:', insertError);
          }

          await supabase.auth.signOut();
          setError('Votre compte n\'a pas les droits administrateur.');
          setLoading(false);
          return;
        }

        // Vérifier si l'utilisateur est admin
        if (!userData.is_admin) {
          await supabase.auth.signOut();
          setError('Accès refusé. Vous n\'avez pas les droits administrateur.');
          setLoading(false);
          return;
        }
      }

      // Connexion réussie et utilisateur est admin
      onLoginSuccess();
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <Card className="w-full max-w-md border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-cyan-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Dashboard Admin ZigZag
          </CardTitle>
          <p className="text-gray-400 mt-2">Connectez-vous pour accéder au dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@zig-zag.fun"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 via-pink-500 to-orange-500 hover:from-cyan-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Accès réservé aux administrateurs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

