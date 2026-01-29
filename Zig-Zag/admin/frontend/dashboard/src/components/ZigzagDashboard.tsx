import React, { useEffect, useState, Suspense } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, LineChart, Line 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Home, Gamepad2, BarChart3, MessageSquare, Users, Search, Bell, 
  Trophy, TrendingUp, Mail, Zap, Clock, Play, Share2, Instagram, Twitter, Music,
  Map, Plus, Send, Calendar, X, LogOut, RefreshCw, AlertCircle, Check
} from 'lucide-react';
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { supabase, User, Zig, NewsletterSignup, ContactMessage } from '@/lib/supabase';
import { cachedQuery, createCacheKey, clearCache } from '@/lib/api';

// Composant de chargement pour les graphiques
const ChartLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-2"></div>
      <p className="text-gray-400 text-sm">Chargement du graphique...</p>
    </div>
  </div>
);

// --- TYPES ---
interface DashboardStats {
  totalUsers: number
  totalZigs: number
  activeZigs: number
  completedZigs: number
  newsletterSignups: number
  contactMessages: number
  todayUsers: number
  weekGrowth: number
}

interface ActivityData {
  day: string
  users: number
  zigs: number
}

// --- COMPOSANT PRINCIPAL ---

interface ZigzagDashboardProps {
  onLogout?: () => void;
}

const ZigzagDashboard: React.FC<ZigzagDashboardProps> = ({ onLogout }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalZigs: 0,
    activeZigs: 0,
    completedZigs: 0,
    newsletterSignups: 0,
    contactMessages: 0,
    todayUsers: 0,
    weekGrowth: 0
  });

  // Initialiser avec des données par défaut pour les 7 jours
  const getDefaultActivityData = (): ActivityData[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][date.getDay()],
        users: 0,
        zigs: 0
      };
    });
    return last7Days;
  };

  const [activityData, setActivityData] = useState<ActivityData[]>(getDefaultActivityData());
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentZigs, setRecentZigs] = useState<Zig[]>([]);
  const [showGamesModal, setShowGamesModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Aurélie');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Vérifier les métriques dashboard', assignee: 'Alexis & Briac', done: false, priority: 'high' },
    { id: 2, title: 'Analyser les nouvelles inscriptions', assignee: 'Alexis & Briac', done: false, priority: 'high' },
    { id: 3, title: 'Campagne Instagram Stories', assignee: 'Jean-Li', done: false, priority: 'medium' },
    { id: 4, title: 'Campagne TikTok du jour', assignee: 'Jean-Li', done: false, priority: 'medium' },
    { id: 5, title: 'Répondre aux messages contact', assignee: 'Aurélie', done: false, priority: 'medium' },
    { id: 6, title: 'Check serveur & performance', assignee: 'Équipe Tech', done: false, priority: 'high' },
    { id: 7, title: 'Newsletter hebdomadaire', assignee: 'Jean-Li', done: false, priority: 'low' },
    { id: 8, title: 'Rapport KPI hebdomadaire', assignee: 'Alexis & Briac', done: false, priority: 'low' },
  ]);
  // Afficher le dashboard immédiatement avec des valeurs par défaut
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: (User & { gamesCount?: number; activeGamesCount?: number; completedGamesCount?: number })[];
    games: (Zig & { stepsCount?: number; playersCount?: number; steps?: any[] })[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(User & { gamesCount?: number; activeGamesCount?: number; completedGamesCount?: number }) | null>(null);
  const [selectedGame, setSelectedGame] = useState<(Zig & { stepsCount?: number; playersCount?: number; steps?: any[]; players?: any[] }) | null>(null);
  
  // États pour les modals de détails des cartes
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showGamesModalDetails, setShowGamesModalDetails] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allGames, setAllGames] = useState<Zig[]>([]);
  const [newsletterSignups, setNewsletterSignups] = useState<NewsletterSignup[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  // Fonction pour marquer un message comme traité
  const handleMarkAsProcessed = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_processed: true })
        .eq('id', messageId);
      
      if (error) {
        console.error('Erreur marquage message:', error);
        alert('❌ Erreur lors du marquage du message');
        return;
      }
      
      // Retirer le message de la liste
      setContactMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Mettre à jour les stats
      const newStats = { ...stats };
      newStats.contactMessages = Math.max(0, newStats.contactMessages - 1);
      setStats(newStats);
      
      // Si c'était le message sélectionné, le fermer
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Erreur marquage message:', error);
      alert('❌ Erreur lors du marquage du message');
    }
  };

  useEffect(() => {
    // Charger les données en arrière-plan sans bloquer l'affichage
    // Utiliser setTimeout pour laisser le temps au dashboard de s'afficher d'abord
    const loadDataTimer = setTimeout(() => {
    fetchDashboardData();
    }, 100); // 100ms de délai pour laisser le dashboard s'afficher
    
    // Rafraîchir automatiquement toutes les 2 minutes
    const interval = setInterval(() => {
      clearCache('dashboard');
      fetchDashboardData(false);
    }, 120000);

    // Fermer les résultats de recherche en cliquant en dehors
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container') && !target.closest('.search-results')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      clearTimeout(loadDataTimer);
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  useEffect(() => {
    if (showAnalyticsModal && !analyticsData) {
      fetchAnalyticsData();
    }
  }, [showAnalyticsModal]);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults(null);
        setShowSearchResults(false);
        setIsSearching(false);
      }
    }, 500); // Attendre 500ms après la dernière frappe

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fonction pour détecter si le terme de recherche ressemble à un ID de partie
  const isGameIdSearch = (term: string): boolean => {
    // Enlever le # si présent
    const cleanTerm = term.replace(/^#/, '').toLowerCase();
    
    // Un ID de partie est un UUID (36 caractères) ou un préfixe d'UUID
    // Format UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    // On accepte les préfixes de 4 caractères minimum (8 caractères hex recommandés)
    // Vérifier si c'est uniquement des caractères hexadécimaux (0-9, a-f)
    const hexPattern = /^[0-9a-f-]+$/;
    
    // Si le terme fait au moins 4 caractères et contient uniquement des caractères hex
    // OU si c'est un UUID complet (36 caractères avec tirets)
    return cleanTerm.length >= 4 && hexPattern.test(cleanTerm);
  };

  // Fonction de recherche
  const performSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const rawSearchTerm = query.trim();
      const searchTerm = rawSearchTerm.toLowerCase();
      
      // Détecter si c'est une recherche d'ID de partie
      const isGameId = isGameIdSearch(rawSearchTerm);
      const gameIdPrefix = rawSearchTerm.replace(/^#/, '').toLowerCase();

      // Rechercher les utilisateurs (par email, pseudo ou ID) - seulement si ce n'est pas clairement un ID de partie
      let usersData: User[] = [];
      if (!isGameId || searchTerm.length < 8) {
        const [usersByEmail, usersByPseudo, usersById] = await Promise.allSettled([
          supabase
            .from('users')
            .select('*')
            .ilike('email', `%${searchTerm}%`)
            .limit(10),
        supabase
          .from('users')
          .select('*')
          .ilike('username', `%${searchTerm}%`)
          .limit(10),
          supabase
            .from('users')
            .select('*')
            .ilike('id', `%${searchTerm}%`)
            .limit(10)
        ]);

      // Combiner les résultats et supprimer les doublons
      const allUsers: User[] = [];
      const userIds = new Set<string>();
      
      [usersByEmail, usersByPseudo, usersById].forEach(result => {
        if (result.status === 'fulfilled' && result.value.data) {
          result.value.data.forEach((user: any) => {
            if (!userIds.has(user.id)) {
              userIds.add(user.id);
              // Mapper username vers pseudo pour compatibilité
              allUsers.push({
                ...user,
                pseudo: user.username
              });
            }
          });
        }
      });

        // Limiter à 10 résultats
        usersData = allUsers.slice(0, 10);
      }

      // Rechercher les parties (par ID)
      // Recherche améliorée : par préfixe si c'est un ID tronqué, ou recherche exacte si UUID complet
      let gamesData: Zig[] = [];
      if (isGameId) {
        // Si c'est un UUID complet (36 caractères avec tirets), recherche exacte
        if (gameIdPrefix.length === 36 && gameIdPrefix.includes('-')) {
          const gamesResult = await Promise.allSettled([
            supabase
              .from('games')
              .select('*')
              .eq('id', gameIdPrefix)
              .limit(10)
          ]);
          
          if (gamesResult[0].status === 'fulfilled' && gamesResult[0].value.data) {
            gamesData = gamesResult[0].value.data;
          }
        } else {
          // Sinon, recherche par préfixe (pour les IDs tronqués comme "6cac6faa")
          // Rechercher les IDs qui commencent par le préfixe
          const gamesResult = await Promise.allSettled([
            supabase
              .from('games')
              .select('*')
              .ilike('id', `${gameIdPrefix}%`)
              .limit(10)
          ]);
          
          if (gamesResult[0].status === 'fulfilled' && gamesResult[0].value.data) {
            gamesData = gamesResult[0].value.data;
          }
        }
      } else if (searchTerm.length >= 4) {
        // Si ce n'est pas clairement un ID mais qu'on a au moins 4 caractères, chercher quand même
        // (au cas où l'utilisateur cherche un ID sans le savoir)
        const gamesResult = await Promise.allSettled([
          supabase
            .from('games')
            .select('*')
            .ilike('id', `%${searchTerm}%`)
            .limit(10)
        ]);
        
        if (gamesResult[0].status === 'fulfilled' && gamesResult[0].value.data) {
          gamesData = gamesResult[0].value.data;
        }
      }

      // Pour chaque utilisateur, compter ses parties (via players.user_id)
      const usersWithStats = await Promise.all(
        usersData.map(async (user) => {
          try {
            // Récupérer toutes les parties de l'utilisateur avec leur statut
            const { data: playerGames } = await supabase
              .from('players')
              .select('game_id, games!inner(status)')
              .eq('user_id', user.id)
              .eq('is_active', true);

            const totalCount = playerGames?.length || 0;
            const activeCount = playerGames?.filter((p: any) => p.games?.status === 'active').length || 0;
            const completedCount = playerGames?.filter((p: any) => p.games?.status === 'completed').length || 0;

            return { 
              ...user, 
              gamesCount: totalCount,
              activeGamesCount: activeCount,
              completedGamesCount: completedCount
            };
          } catch (error) {
            console.error(`Erreur comptage parties pour user ${user.id}:`, error);
            // Fallback : compter simplement toutes les parties
            try {
              const { count } = await supabase
                .from('players')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_active', true);
              return { 
                ...user, 
                gamesCount: count || 0,
                activeGamesCount: 0,
                completedGamesCount: 0
              };
            } catch (fallbackError) {
              return { 
                ...user, 
                gamesCount: 0,
                activeGamesCount: 0,
                completedGamesCount: 0
              };
            }
          }
        })
      );

      // Pour chaque partie, compter les steps et players
      const gamesWithStats = await Promise.all(
        gamesData.map(async (game) => {
          const [stepsCount, playersCount] = await Promise.all([
            supabase
              .from('steps')
              .select('*', { count: 'exact', head: true })
              .eq('game_id', game.id),
            supabase
              .from('players')
              .select('*', { count: 'exact', head: true })
              .eq('game_id', game.id)
          ]);
          return {
            ...game,
            stepsCount: stepsCount.count || 0,
            playersCount: playersCount.count || 0
          };
        })
      );

      setSearchResults({
        users: usersWithStats,
        games: gamesWithStats
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults({ users: [], games: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults(null);
        setShowSearchResults(false);
      }
    }, 500); // Attendre 500ms après la dernière frappe

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDashboardData = async (showLoading = false) => {
    try {
      if (showLoading) {
      setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // Timeout global pour toute la fonction (20 secondes max)
      const globalTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout global: les requêtes prennent trop de temps')), 20000);
      });

      const fetchData = async () => {
        // Récupérer les statistiques globales (optimisé avec head: true)
        // Utiliser allSettled pour ne pas bloquer si une requête échoue
        const [usersRes, zigsRes, newsletterRes, contactsRes] = await Promise.allSettled([
        cachedQuery(
          createCacheKey('stats', 'users', 'total'),
          async () => {
            const result = await supabase.from('users').select('*', { count: 'exact', head: true });
            // Supabase retourne { data: null, count: number, error: null } avec head: true
            return { data: { count: result.count || 0 }, error: result.error };
          },
          { maxRetries: 1, timeout: 5000 }
        ),
        cachedQuery(
          createCacheKey('stats', 'games', 'total'),
          async () => {
            const result = await supabase.from('games').select('*', { count: 'exact', head: true });
            return { data: { count: result.count || 0 }, error: result.error };
          },
          { maxRetries: 1, timeout: 5000 }
        ),
        cachedQuery(
          createCacheKey('stats', 'newsletter', 'total'),
          async () => {
            const result = await supabase.from('newsletter_signups').select('*', { count: 'exact', head: true });
            return { data: { count: result.count || 0 }, error: result.error };
          },
          { maxRetries: 1, timeout: 5000 }
        ),
        cachedQuery(
          createCacheKey('stats', 'contacts', 'total'),
          async () => {
            // Compter uniquement les messages non traités
            const result = await supabase
              .from('contact_messages')
              .select('*', { count: 'exact', head: true })
              .eq('is_processed', false);
            return { data: { count: result.count || 0 }, error: result.error };
          },
          { maxRetries: 1, timeout: 5000 }
        )
      ]);

        // Extraire les données ou utiliser des valeurs par défaut
        // Note: cachedQuery retourne { data, error }, et data contient { count, ... } de Supabase
        const usersCount = usersRes.status === 'fulfilled' && usersRes.value.data?.count !== undefined ? usersRes.value.data.count : 0;
        const zigsCount = zigsRes.status === 'fulfilled' && zigsRes.value.data?.count !== undefined ? zigsRes.value.data.count : 0;
        const newsletterCount = newsletterRes.status === 'fulfilled' && newsletterRes.value.data?.count !== undefined ? newsletterRes.value.data.count : 0;
        const contactsCount = contactsRes.status === 'fulfilled' && contactsRes.value.data?.count !== undefined ? contactsRes.value.data.count : 0;

        // Debug: afficher les résultats dans la console
        console.log('📊 Résultats des requêtes:', {
          users: { status: usersRes.status, count: usersCount, data: usersRes.status === 'fulfilled' ? usersRes.value : null },
          zigs: { status: zigsRes.status, count: zigsCount, data: zigsRes.status === 'fulfilled' ? zigsRes.value : null },
          newsletter: { status: newsletterRes.status, count: newsletterCount },
          contacts: { status: contactsRes.status, count: contactsCount }
        });

      // Utilisateurs actifs aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
        const todayKey = createCacheKey('stats', 'users', 'today', today.toISOString().split('T')[0]);
        const todayResult = await cachedQuery(
          todayKey,
          async () => {
            const result = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
            return { data: { count: result.count || 0 }, error: result.error };
          },
          { maxRetries: 1, timeout: 5000 }
        ).catch(() => ({ data: { count: 0 }, error: null }));
        const todayCount = todayResult.data?.count !== undefined ? todayResult.data.count : 0;

      // Zigs actifs et complétés
        const [activeCountRes, completedCountRes] = await Promise.allSettled([
          cachedQuery(
            createCacheKey('stats', 'games', 'active'),
            async () => {
              const result = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
              return { data: { count: result.count || 0 }, error: result.error };
            },
            { maxRetries: 1, timeout: 5000 }
          ),
          cachedQuery(
            createCacheKey('stats', 'games', 'completed'),
            async () => {
              const result = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
              return { data: { count: result.count || 0 }, error: result.error };
            },
            { maxRetries: 1, timeout: 5000 }
          )
        ]);
        const activeCount = activeCountRes.status === 'fulfilled' && activeCountRes.value.data?.count !== undefined ? activeCountRes.value.data.count : 0;
        const completedCount = completedCountRes.status === 'fulfilled' && completedCountRes.value.data?.count !== undefined ? completedCountRes.value.data.count : 0;

        // Récupérer utilisateurs récents (limité à 5) - optionnel, ne bloque pas
        let recentUsersData: User[] = [];
        try {
          const recentUsersKey = createCacheKey('recent', 'users');
          const recentUsersResult = await cachedQuery(
            recentUsersKey,
            async () => {
              // Essayer d'abord avec select simple
              const result = await supabase
                .from('users')
                .select('id, email, username, created_at')
                .order('created_at', { ascending: false })
                .limit(5);
              
              if (result.error) {
                console.error('❌ Erreur requête utilisateurs récents:', result.error);
                // Essayer avec select * si la requête spécifique échoue
                const fallbackResult = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
                if (fallbackResult.error) {
                  console.error('❌ Erreur requête fallback utilisateurs:', fallbackResult.error);
                  return { data: [], error: fallbackResult.error };
                }
                // Mapper username vers pseudo pour compatibilité
                const mappedData = (fallbackResult.data || []).map((user: any) => ({
                  ...user,
                  pseudo: user.username
                }));
                return { data: mappedData, error: null };
              }
              
              // Mapper username vers pseudo pour compatibilité
              const mappedData = (result.data || []).map((user: any) => ({
                ...user,
                pseudo: user.username
              }));
              
              console.log('📊 Utilisateurs récents chargés:', mappedData.length);
              return { data: mappedData, error: null };
            },
            { maxRetries: 1, timeout: 5000 }
          );
          recentUsersData = recentUsersResult.data || [];
          console.log('📊 Utilisateurs récents finaux:', recentUsersData.length);
        } catch (error) {
          console.error('❌ Erreur chargement utilisateurs récents:', error);
          recentUsersData = [];
        }

        // Récupérer zigs récents (limité à 10) - optionnel, ne bloque pas
        const recentZigsKey = createCacheKey('recent', 'games');
        const recentZigsResult = await cachedQuery(
          recentZigsKey,
          async () => {
            const result = await supabase
        .from('games')
              .select('id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
            return { data: result.data || [], error: result.error };
          },
          { maxRetries: 1, timeout: 5000 }
        ).catch(() => ({ data: [], error: null }));
        const recentZigsData = recentZigsResult.data || [];

      // Calculer l'activité des 7 derniers jours (optimisé avec une seule requête par table)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

        // Récupérer toutes les données des 7 derniers jours en une seule requête - optionnel
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const activityKey = createCacheKey('activity', '7days', weekAgo.toISOString().split('T')[0]);
        const activityResult = await cachedQuery(
          activityKey,
          async () => {
            const [usersData, gamesData] = await Promise.allSettled([
          supabase
            .from('users')
                .select('created_at')
                .gte('created_at', weekAgo.toISOString()),
          supabase
            .from('games')
                .select('created_at')
                .gte('created_at', weekAgo.toISOString())
            ]);

            // Grouper par jour (utiliser un objet au lieu de Map pour éviter les problèmes de transpilation)
            const activityMap: Record<string, { users: number; zigs: number }> = {};
            
            last7Days.forEach(date => {
              const dayKey = date.toISOString().split('T')[0];
              activityMap[dayKey] = { users: 0, zigs: 0 };
            });

            // Compter les utilisateurs par jour
            if (usersData.status === 'fulfilled' && usersData.value.data) {
              usersData.value.data.forEach((user: any) => {
                const dayKey = new Date(user.created_at).toISOString().split('T')[0];
                if (activityMap[dayKey]) {
                  activityMap[dayKey].users++;
                }
              });
            }

            // Compter les games par jour
            if (gamesData.status === 'fulfilled' && gamesData.value.data) {
              gamesData.value.data.forEach((game: any) => {
                const dayKey = new Date(game.created_at).toISOString().split('T')[0];
                if (activityMap[dayKey]) {
                  activityMap[dayKey].zigs++;
                }
              });
            }

            // Convertir en tableau
            return {
              data: last7Days.map(date => {
                const dayKey = date.toISOString().split('T')[0];
        return {
          day: ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][date.getDay()],
                  users: activityMap[dayKey]?.users || 0,
                  zigs: activityMap[dayKey]?.zigs || 0
                };
              }),
              error: null
            };
          },
          { maxRetries: 1, timeout: 8000 }
        ).catch(() => ({
          data: last7Days.map(date => ({
            day: ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][date.getDay()],
            users: 0,
            zigs: 0
          })),
          error: null
        }));

        const activityData = activityResult.data || [];

        return {
          stats: {
            totalUsers: usersCount,
            totalZigs: zigsCount,
            activeZigs: activeCount,
            completedZigs: completedCount,
            newsletterSignups: newsletterCount,
            contactMessages: contactsCount,
            todayUsers: todayCount,
            weekGrowth: 12.5
          },
          activityData,
          recentUsers: recentUsersData,
          recentZigs: recentZigsData
        };
      };

      // Exécuter avec timeout global
      const result = await Promise.race([fetchData(), globalTimeout]);

      setStats(result.stats);
      setActivityData(result.activityData);
      console.log('✅ Données chargées - Utilisateurs récents:', result.recentUsers?.length || 0);
      setRecentUsers(result.recentUsers || []);
      setRecentZigs(result.recentZigs || []);
      setLastRefresh(new Date());
      
      // Charger les utilisateurs récents séparément si pas déjà chargés (au cas où le timeout aurait interrompu)
      if ((result.recentUsers || []).length === 0) {
        console.log('🔄 Rechargement séparé des utilisateurs récents...');
        try {
          // Essayer d'abord avec select simple
          let { data, error } = await supabase
            .from('users')
            .select('id, email, username, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
          
          // Si erreur, essayer avec select *
          if (error) {
            console.warn('⚠️ Erreur avec select spécifique, essai avec select *:', error);
            const fallback = await supabase
              .from('users')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(5);
            data = fallback.data;
            error = fallback.error;
          }
          
          if (error) {
            console.error('❌ Erreur chargement utilisateurs récents (séparé):', error);
          } else {
            // Mapper username vers pseudo pour compatibilité
            const mappedData = (data || []).map((user: any) => ({
              ...user,
              pseudo: user.username
            }));
            console.log('✅ Utilisateurs récents chargés séparément:', mappedData.length);
            setRecentUsers(mappedData);
          }
        } catch (error) {
          console.error('❌ Erreur chargement utilisateurs récents (séparé):', error);
        }
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      
      // Afficher le dashboard avec des valeurs par défaut même en cas d'erreur
      setStats({
        totalUsers: 0,
        totalZigs: 0,
        activeZigs: 0,
        completedZigs: 0,
        newsletterSignups: 0,
        contactMessages: 0,
        todayUsers: 0,
        weekGrowth: 0
      });
      setActivityData([]);
      setRecentUsers([]);
      setRecentZigs([]);
      
      setError(error instanceof Error && error.message.includes('Timeout') 
        ? 'Les requêtes prennent trop de temps. Vérifiez votre connexion à Supabase.'
        : 'Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Ne plus bloquer l'affichage - le dashboard s'affiche toujours
  // if (loading && !lastRefresh) {
  //   return (
  //     <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-foreground min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
  //         <p className="mt-4 text-white">Chargement du dashboard...</p>
  //         <p className="mt-2 text-gray-400 text-sm">Si cela prend trop de temps, vérifiez votre connexion</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Afficher l'erreur si présente
  if (error && !lastRefresh) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-foreground min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-800/50 border-red-500/30">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Erreur de connexion</h3>
            <p className="text-gray-300 mb-4">{error}</p>
              <Button
                onClick={() => {
                  clearCache();
                  fetchDashboardData(false);
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, done: !task.done } : task
    ));
  };

  const addNewTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: Math.max(...tasks.map(t => t.id)) + 1,
      title: newTaskTitle,
      assignee: newTaskAssignee,
      done: false,
      priority: newTaskPriority
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskAssignee('Aurélie');
    setNewTaskPriority('medium');
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const fetchAnalyticsData = async () => {
    try {
      // Récupérer les données des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const analyticsKey = createCacheKey('analytics', '30days', thirtyDaysAgo.toISOString().split('T')[0]);

      const { data: analyticsResult } = await cachedQuery(
        analyticsKey,
        async () => {
          // Récupérer toutes les données en parallèle
          const [usersRes, gamesRes, newsletterRes, contactRes] = await Promise.all([
            supabase
        .from('users')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
              .order('created_at', { ascending: true }),
            supabase
        .from('games')
        .select('created_at, status')
        .gte('created_at', thirtyDaysAgo.toISOString())
              .order('created_at', { ascending: true }),
            supabase
        .from('newsletter_signups')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
              .order('created_at', { ascending: true }),
            supabase
        .from('contact_messages')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
              .order('created_at', { ascending: true })
          ]);

      // Grouper par jour
      const groupByDay = (data: any[]) => {
        const grouped: any = {};
        data?.forEach(item => {
          const day = new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          grouped[day] = (grouped[day] || 0) + 1;
        });
        return Object.entries(grouped).map(([day, count]) => ({ day, count }));
      };

          return {
            data: {
              usersTimeline: groupByDay(usersRes.data || []),
              gamesTimeline: groupByDay(gamesRes.data || []),
              newsletterTimeline: groupByDay(newsletterRes.data || []),
              contactTimeline: groupByDay(contactRes.data || []),
        gamesByStatus: [
                { name: 'Actives', value: gamesRes.data?.filter(g => g.status === 'active').length || 0, fill: '#06b6d4' },
                { name: 'Complétées', value: gamesRes.data?.filter(g => g.status === 'completed').length || 0, fill: '#ec4899' },
              ],
            },
            error: null
          };
        },
        { maxRetries: 2, timeout: 15000 }
      );

      if (analyticsResult) {
        setAnalyticsData(analyticsResult);
      }
    } catch (error) {
      console.error('Erreur analytics:', error);
      setAnalyticsData(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white min-h-screen flex p-4 gap-6 font-sans">
      {/* Afficher un avertissement si erreur mais dashboard chargé */}
      {error && lastRefresh && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Card className="bg-yellow-500/20 border-yellow-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-300 font-semibold">Données incomplètes</p>
                <p className="text-xs text-yellow-400 mt-1">{error}</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  clearCache();
                  fetchDashboardData(false);
                }}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      <Sidebar 
        showTeamModal={showTeamModal}
        setShowTeamModal={setShowTeamModal}
        showTasksModal={showTasksModal}
        setShowTasksModal={setShowTasksModal}
        showAnalyticsModal={showAnalyticsModal}
        setShowAnalyticsModal={setShowAnalyticsModal}
        showSocialModal={showSocialModal}
        setShowSocialModal={setShowSocialModal}
        showRoadmapModal={showRoadmapModal}
        setShowRoadmapModal={setShowRoadmapModal}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        <MainContent 
          stats={stats} 
          activityData={activityData} 
          recentZigs={recentZigs}
          showGamesModal={showGamesModal}
          setShowGamesModal={setShowGamesModal}
          isRefreshing={isRefreshing}
          onRefresh={() => {
            clearCache();
            fetchDashboardData(false);
          }}
          lastRefresh={lastRefresh}
          searchQuery={searchQuery}
          onSearchChange={(query) => {
            setSearchQuery(query);
            // La recherche sera déclenchée par le useEffect avec debounce
          }}
          showSearchResults={showSearchResults}
          setShowSearchResults={setShowSearchResults}
          searchResults={searchResults}
          isSearching={isSearching}
          onUserClick={(user) => setSelectedUser(user)}
          onGameClick={async (game) => {
            try {
              const [stepsRes, playersRes] = await Promise.all([
                supabase
                  .from('steps')
                  .select('*')
                  .eq('game_id', game.id)
                  .order('step_number', { ascending: true }),
                supabase
                  .from('players')
                  .select('*')
                  .eq('game_id', game.id)
                  .order('joined_at', { ascending: true })
              ]);
              setSelectedGame({
                ...game,
                steps: stepsRes.data || [],
                players: playersRes.data || []
              });
            } catch (error) {
              console.error('Erreur chargement détails partie:', error);
              setSelectedGame(game);
            }
          }}
          onCloseSearch={() => {
            setShowSearchResults(false);
            setSearchQuery('');
            setSearchResults(null);
          }}
          onShowUsersModal={async () => {
            setShowUsersModal(true);
            if (allUsers.length === 0) {
              try {
                const { data } = await supabase
                  .from('users')
                  .select('*')
                  .order('created_at', { ascending: false })
                  .limit(100);
                // Mapper username vers pseudo pour compatibilité
                const mappedData = (data || []).map((user: any) => ({
                  ...user,
                  pseudo: user.username
                }));
                setAllUsers(mappedData);
              } catch (error) {
                console.error('Erreur chargement utilisateurs:', error);
              }
            }
          }}
          onShowGamesModalDetails={async () => {
            setShowGamesModalDetails(true);
            if (allGames.length === 0) {
              try {
                const { data } = await supabase
                  .from('games')
                  .select('*')
                  .order('created_at', { ascending: false })
                  .limit(100);
                setAllGames(data || []);
              } catch (error) {
                console.error('Erreur chargement parties:', error);
              }
            }
          }}
          onShowNewsletterModal={async () => {
            setShowNewsletterModal(true);
            if (newsletterSignups.length === 0) {
              try {
                const { data } = await supabase
                  .from('newsletter_signups')
                  .select('*')
                  .order('created_at', { ascending: false })
                  .limit(100);
                setNewsletterSignups(data || []);
              } catch (error) {
                console.error('Erreur chargement newsletter:', error);
              }
            }
          }}
          onShowMessagesModal={async () => {
            setShowMessagesModal(true);
            if (contactMessages.length === 0) {
              try {
                // Charger uniquement les messages non traités
                const { data } = await supabase
                  .from('contact_messages')
                  .select('*')
                  .eq('is_processed', false)
                  .order('created_at', { ascending: false })
                  .limit(100);
                setContactMessages(data || []);
              } catch (error) {
                console.error('Erreur chargement messages:', error);
              }
            }
          }}
        />
        <ProfileSidebar 
          stats={stats} 
          recentUsers={
            searchQuery 
              ? recentUsers.filter(u => 
                  u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.pseudo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.id.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : recentUsers
          } 
        />
      </div>
      
      {/* Modal Réseaux Sociaux */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSocialModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-pink-500/20 via-blue-500/20 to-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Share2 className="h-8 w-8 text-pink-400" />
                    Réseaux Sociaux
                  </h2>
                  <p className="text-gray-300 mt-1">Statistiques de toutes nos plateformes</p>
                </div>
                <button 
                  onClick={() => setShowSocialModal(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Instagram */}
                <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 hover:scale-[1.02] transition-transform">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                        <Instagram className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl">Instagram</h3>
                        <a href="https://www.instagram.com/zigzag.fun/" target="_blank" rel="noopener" className="text-sm text-pink-300 hover:underline">
                          @zigzag.fun
                        </a>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-pink-400 text-3xl font-bold">4</p>
                        <p className="text-gray-300 text-sm mt-1">Abonnés</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-purple-400 text-3xl font-bold">0</p>
                        <p className="text-gray-300 text-sm mt-1">Abonnements</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-pink-400 text-3xl font-bold">0</p>
                        <p className="text-gray-300 text-sm mt-1">Publications</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-pink-500/10 rounded-lg border border-pink-500/30">
                      <p className="text-sm text-pink-300">
                        🚀 <strong>Nouveau compte !</strong> Commencez à publier pour développer votre communauté.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* TikTok */}
                <Card className="bg-gradient-to-br from-cyan-500/20 to-pink-500/20 border-cyan-500/30 hover:scale-[1.02] transition-transform">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl">TikTok</h3>
                        <a href="https://www.tiktok.com/@zigzag.fun" target="_blank" rel="noopener" className="text-sm text-cyan-300 hover:underline">
                          @zigzag.fun
                        </a>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-cyan-400 text-3xl font-bold">0</p>
                        <p className="text-gray-300 text-sm mt-1">Abonnés</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-pink-400 text-3xl font-bold">0</p>
                        <p className="text-gray-300 text-sm mt-1">Abonnements</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-cyan-400 text-3xl font-bold">0</p>
                        <p className="text-gray-300 text-sm mt-1">Vidéos</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-pink-400 text-3xl font-bold">0</p>
                        <p className="text-gray-300 text-sm mt-1">Likes</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <p className="text-sm text-cyan-300">
                        ✨ <strong>Compte créé !</strong> Commencez à publier des vidéos pour gagner des abonnés.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Twitter/X */}
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:scale-[1.02] transition-transform">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <Twitter className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl">Twitter / X</h3>
                        <a href="https://x.com/PlayZigZagTeam" target="_blank" rel="noopener" className="text-sm text-blue-300 hover:underline">
                          @PlayZigZagTeam
                        </a>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-blue-400 text-3xl font-bold">0</p>
                        <p className="text-gray-300 text-sm mt-1">Abonnés</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-blue-300 text-3xl font-bold">0</p>
                        <p className="text-gray-300 text-sm mt-1">Abonnements</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-blue-400 text-3xl font-bold">0</p>
                        <p className="text-gray-300 text-sm mt-1">Posts</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <p className="text-sm text-blue-300">
                        🎮 <strong>Compte lancé !</strong> Tweetez régulièrement pour engager votre audience.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Résumé Global */}
                <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      Performance Globale
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                        <p className="text-yellow-400 text-4xl font-bold">4</p>
                        <p className="text-gray-300 mt-1">Abonnés totaux (tous réseaux)</p>
                      </div>
                      <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                        <p className="text-orange-400 text-4xl font-bold">0</p>
                        <p className="text-gray-300 mt-1">Publications totales</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                      <p className="text-purple-200 text-lg font-semibold mb-3">
                        🚀 <strong>Nouveau projet lancé !</strong>
                      </p>
                      <p className="text-sm text-gray-300">
                        Vos comptes sont créés et prêts à exploser ! Commencez à publier du contenu engageant pour développer votre communauté ZigZag.
                      </p>
                      <div className="mt-4 flex gap-2 justify-center flex-wrap">
                        <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">Instagram prêt</Badge>
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">TikTok actif</Badge>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Twitter/X lancé</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Roadmap - Planning Posts Réseaux Sociaux */}
      {showRoadmapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRoadmapModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-orange-400" />
                    Roadmap Contenu
                  </h2>
                  <p className="text-gray-300 mt-1">Planning des posts et contenus à créer</p>
                </div>
                <button 
                  onClick={() => setShowRoadmapModal(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Vue d'ensemble */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="bg-pink-500/10 border-pink-500/30">
                  <CardContent className="p-4 text-center">
                    <Instagram className="h-6 w-6 text-pink-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-pink-400">5</p>
                    <p className="text-sm text-gray-300">Posts Instagram prévus</p>
                  </CardContent>
                </Card>
                <Card className="bg-cyan-500/10 border-cyan-500/30">
                  <CardContent className="p-4 text-center">
                    <Music className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-cyan-400">8</p>
                    <p className="text-sm text-gray-300">Vidéos TikTok à faire</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <Twitter className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-400">12</p>
                    <p className="text-sm text-gray-300">Tweets programmés</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Semaine actuelle */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-400" />
                    Cette semaine (17-23 Déc)
                  </h3>
                  <div className="space-y-3">
                    {/* Post Instagram 1 */}
                    <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30 hover:scale-[1.01] transition-transform">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Instagram className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-white">Story interactive - Sondage ZigZag</h4>
                                <p className="text-sm text-gray-300 mt-1">Créer une story avec sondage : "Quel type de joueur es-tu ?"</p>
                                <div className="flex gap-2 mt-3">
                                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                                    📅 Mercredi 18 Déc - 18h
                                  </Badge>
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    👤 Jean-Li
                                  </Badge>
                                </div>
                              </div>
                              <Button size="sm" className="bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30">
                                <Send className="h-4 w-4 mr-1" />
                                Publier
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* TikTok 1 */}
                    <Card className="bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border-cyan-500/30 hover:scale-[1.01] transition-transform">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Music className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-white">Vidéo teaser - Gameplay drôle</h4>
                                <p className="text-sm text-gray-300 mt-1">Montrer une partie où les dessins deviennent complètement fous</p>
                                <div className="flex gap-2 mt-3">
                                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                                    📅 Jeudi 19 Déc - 12h
                                  </Badge>
                                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                                    👤 Jean-Li
                                  </Badge>
                                </div>
                              </div>
                              <Button size="sm" className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30">
                                ✏️ Brouillon
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Twitter 1 */}
                    <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/30 hover:scale-[1.01] transition-transform">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Twitter className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-white">Thread - Comment jouer à ZigZag</h4>
                                <p className="text-sm text-gray-300 mt-1">Expliquer les règles en 5 tweets avec des GIFs</p>
                                <div className="flex gap-2 mt-3">
                                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                    📅 Vendredi 20 Déc - 10h
                                  </Badge>
                                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                                    👤 Jean-Li
                                  </Badge>
                                </div>
                              </div>
                              <Button size="sm" className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30">
                                ✏️ Brouillon
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Semaine prochaine */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-400" />
                    Semaine prochaine (24-30 Déc)
                  </h3>
                  <div className="space-y-3">
                    {/* Instagram Noël */}
                    <Card className="bg-gradient-to-r from-red-500/10 to-green-500/10 border-red-500/30 hover:scale-[1.01] transition-transform">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-green-500 flex items-center justify-center flex-shrink-0">
                            <Instagram className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-white">🎄 Post spécial Noël</h4>
                                <p className="text-sm text-gray-300 mt-1">Carrousel de dessins de Noël créés par la communauté</p>
                                <div className="flex gap-2 mt-3">
                                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                    📅 Mercredi 25 Déc - 11h
                                  </Badge>
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                    👤 Aurélie
                                  </Badge>
                                </div>
                              </div>
                              <Button size="sm" className="bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30">
                                📋 Planifié
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* TikTok Challenge */}
                    <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:scale-[1.01] transition-transform">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Music className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-white">🎨 Challenge #ZigzagFail</h4>
                                <p className="text-sm text-gray-300 mt-1">Lancer un challenge communautaire des pires dessins</p>
                                <div className="flex gap-2 mt-3">
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    📅 Samedi 28 Déc - 15h
                                  </Badge>
                                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                                    👤 Jean-Li & Aurélie
                                  </Badge>
                                </div>
                              </div>
                              <Button size="sm" className="bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30">
                                📋 Planifié
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Twitter Stats */}
                    <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:scale-[1.01] transition-transform">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Twitter className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-white">📊 Bilan 2024 en chiffres</h4>
                                <p className="text-sm text-gray-300 mt-1">Thread avec les stats les plus drôles de l'année</p>
                                <div className="flex gap-2 mt-3">
                                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                    📅 Lundi 30 Déc - 14h
                                  </Badge>
                                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                                    👤 Alexis & Briac
                                  </Badge>
                                </div>
                              </div>
                              <Button size="sm" className="bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30">
                                📋 Planifié
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Idées futures */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Idées pour janvier 2025
                  </h3>
                  <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                    <CardContent className="p-5">
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">💡</span>
                          <span><strong className="text-white">Série TikTok</strong> : "Les dessins les plus WTF de ZigZag" (1 vidéo/jour pendant 7 jours)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-400 mt-1">💡</span>
                          <span><strong className="text-white">Collab Instagram</strong> : Partenariat avec des influenceurs gaming pour tester ZigZag</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-400 mt-1">💡</span>
                          <span><strong className="text-white">Thread Twitter</strong> : Partager l'histoire de la création de ZigZag</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">💡</span>
                          <span><strong className="text-white">Tous réseaux</strong> : Lancement d'un concours avec des cadeaux pour célébrer 100 joueurs</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* CTA */}
                <div className="text-center p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                  <p className="text-white text-lg font-semibold mb-3">
                    🚀 Prêt à conquérir les réseaux sociaux !
                  </p>
                  <p className="text-gray-300 text-sm">
                    N'oubliez pas : la régularité est la clé du succès. Publiez, engagez, et analysez ! 📈
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Analytics */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAnalyticsModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-cyan-400" />
                    Analytics Avancées
                  </h2>
                  <p className="text-gray-300 mt-1">Analyses détaillées des 30 derniers jours</p>
                </div>
                <button 
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {!analyticsData ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
                  <p className="text-gray-300">Chargement des analytics...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Graphiques Timeline */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Utilisateurs dans le temps */}
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Users className="h-5 w-5 text-cyan-400" />
                          Inscriptions Utilisateurs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Suspense fallback={<ChartLoader />}>
                        <ChartContainer config={{}} className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.usersTimeline}>
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#06b6d4" 
                                strokeWidth={3}
                                dot={{ fill: '#06b6d4', r: 5 }}
                              />
                              <XAxis 
                                dataKey="day" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#9ca3af' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#9ca3af' }}
                                allowDecimals={false}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px'
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        </Suspense>
                      </CardContent>
                    </Card>

                    {/* Parties créées */}
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Play className="h-5 w-5 text-pink-400" />
                          Parties Créées
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Suspense fallback={<ChartLoader />}>
                        <ChartContainer config={{}} className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.gamesTimeline}>
                              <Bar dataKey="count" fill="#ec4899" radius={4} />
                              <XAxis 
                                dataKey="day" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#9ca3af' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#9ca3af' }}
                                allowDecimals={false}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px'
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        </Suspense>
                      </CardContent>
                    </Card>

                    {/* Newsletter */}
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Mail className="h-5 w-5 text-orange-400" />
                          Inscriptions Newsletter
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Suspense fallback={<ChartLoader />}>
                        <ChartContainer config={{}} className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.newsletterTimeline}>
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#f97316" 
                                strokeWidth={3}
                                dot={{ fill: '#f97316', r: 5 }}
                              />
                              <XAxis 
                                dataKey="day" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#9ca3af' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#9ca3af' }}
                                allowDecimals={false}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px'
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        </Suspense>
                      </CardContent>
                    </Card>

                    {/* Messages Contact */}
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-purple-400" />
                          Messages Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Suspense fallback={<ChartLoader />}>
                        <ChartContainer config={{}} className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.contactTimeline}>
                              <Bar dataKey="count" fill="#a855f7" radius={4} />
                              <XAxis 
                                dataKey="day" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#9ca3af' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#9ca3af' }}
                                allowDecimals={false}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px'
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        </Suspense>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Partie par statut - Grand */}
                  <Card className="bg-gray-700/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        Répartition des Parties (30 jours)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center gap-12">
                        <div className="w-80 h-80">
                          <Suspense fallback={<ChartLoader />}>
                          <ChartContainer config={{}} className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie 
                                  data={analyticsData.gamesByStatus} 
                                  dataKey="value" 
                                  nameKey="name" 
                                  cx="50%" 
                                  cy="50%" 
                                  outerRadius={120}
                                  label={(entry) => `${entry.name}: ${entry.value}`}
                                  labelLine={true}
                                >
                                  {analyticsData.gamesByStatus.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                          </Suspense>
                        </div>
                        <div className="space-y-4">
                          {analyticsData.gamesByStatus.map((item: any) => (
                            <div key={item.name} className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded" style={{ backgroundColor: item.fill }}></div>
                              <div>
                                <p className="text-white font-semibold">{item.name}</p>
                                <p className="text-3xl font-bold" style={{ color: item.fill }}>{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Tâches Quotidiennes */}
      {showTasksModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTasksModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-purple-400" />
                    Tâches Quotidiennes
                  </h2>
                  <p className="text-gray-300 mt-1">
                    {tasks.filter(t => t.done).length}/{tasks.length} tâches complétées aujourd'hui
                  </p>
                </div>
                <button 
                  onClick={() => setShowTasksModal(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                  <p className="text-red-400 font-bold text-2xl">
                    {tasks.filter(t => t.priority === 'high' && !t.done).length}
                  </p>
                  <p className="text-red-300 text-sm">Haute priorité</p>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <p className="text-yellow-400 font-bold text-2xl">
                    {tasks.filter(t => t.priority === 'medium' && !t.done).length}
                  </p>
                  <p className="text-yellow-300 text-sm">Moyenne priorité</p>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <p className="text-green-400 font-bold text-2xl">
                    {tasks.filter(t => t.done).length}
                  </p>
                  <p className="text-green-300 text-sm">Complétées</p>
                </div>
              </div>

              {/* Liste des tâches */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-cyan-400" />
                  Aujourd'hui
                </h3>
                
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${
                      task.done
                        ? 'bg-gray-700/30 border-gray-600 opacity-60'
                        : task.priority === 'high'
                        ? 'bg-red-500/10 border-red-500/30'
                        : task.priority === 'medium'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        task.done 
                          ? 'bg-green-500 border-green-500' 
                          : task.priority === 'high'
                          ? 'border-red-400'
                          : task.priority === 'medium'
                          ? 'border-yellow-400'
                          : 'border-blue-400'
                      }`}>
                        {task.done && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${task.done ? 'line-through text-gray-400' : 'text-white'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className={
                            task.priority === 'high'
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : task.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }>
                            {task.priority === 'high' ? '🔥 Urgent' : 
                             task.priority === 'medium' ? '⚡ Important' : '📌 Normal'}
                          </Badge>
                          <span className="text-gray-400 text-sm flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {task.assignee}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulaire d'ajout de tâche */}
              <div className="mt-6 p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-cyan-400" />
                  Ajouter une nouvelle tâche
                </h3>
                <div className="space-y-3">
                  <div>
                    <Input 
                      placeholder="Titre de la tâche..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <select 
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white"
                      >
                        <option value="Aurélie">Aurélie (CEO)</option>
                        <option value="Jean-Li">Jean-Li (CEO Market)</option>
                        <option value="Alexis">Alexis (CEO KPI's)</option>
                        <option value="Briac">Briac (CEO KPI's)</option>
                      </select>
                    </div>
                    <div>
                      <select 
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
                        className="w-full p-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white"
                      >
                        <option value="low">📌 Normale</option>
                        <option value="medium">⚡ Importante</option>
                        <option value="high">🔥 Urgente</option>
                      </select>
                    </div>
                  </div>
                  <Button 
                    onClick={addNewTask}
                    disabled={!newTaskTitle.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter la tâche
                  </Button>
                </div>
              </div>

              {/* Message motivant */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30 text-center">
                <p className="text-gray-300">
                  {tasks.filter(t => t.done).length === tasks.length 
                    ? "🎉 Bravo ! Toutes les tâches sont terminées !" 
                    : `💪 Plus que ${tasks.filter(t => !t.done).length} tâche(s) à terminer !`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Équipe */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTeamModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-5xl w-full max-h-[85vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Users className="h-8 w-8 text-cyan-400" />
                    Notre Équipe
                  </h2>
                  <p className="text-gray-300 mt-1">Les cerveaux derrière ZigZag</p>
                </div>
                <button 
                  onClick={() => setShowTeamModal(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CEO */}
                <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:scale-105 transition-transform">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        AP
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Aurélie - CEO</h3>
                        <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 mb-3">
                          🎯 Direction Générale
                        </Badge>
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <Mail className="h-4 w-4 text-pink-400" />
                          aperichon@eugeniaschool.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CEO Market */}
                <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:scale-105 transition-transform">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        JL
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Jean-Li - CEO Market</h3>
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 mb-3">
                          📈 Marketing & Growth
                        </Badge>
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <Mail className="h-4 w-4 text-cyan-400" />
                          jsek@eugeniaschool.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CEO Expert KPI's - Alexis */}
                <Card className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-500/30 hover:scale-105 transition-transform">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        AS
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Alexis - CEO Expert KPI's</h3>
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 mb-3">
                          📊 Analytics & Data
                        </Badge>
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <Mail className="h-4 w-4 text-orange-400" />
                          asapone@eugeniaschool.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CEO Expert KPI's - Briac */}
                <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 hover:scale-105 transition-transform">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        BT
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Briac - CEO Expert KPI's</h3>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-3">
                          📊 Analytics & Data
                        </Badge>
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <Mail className="h-4 w-4 text-green-400" />
                          bturquety@eugeniaschool.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section inspirante */}
              <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 via-pink-500/10 to-orange-500/10 rounded-lg border border-gray-700">
                <p className="text-center text-gray-300 text-lg italic">
                  "Une équipe passionnée pour créer l'expérience de jeu la plus folle ! 🎮✨"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Users className="h-8 w-8 text-cyan-400" />
                    Détails Utilisateur
                  </h2>
                  <p className="text-gray-300 mt-1">{selectedUser.pseudo || selectedUser.email || 'Utilisateur'}</p>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Informations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">{selectedUser.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Pseudo</p>
                      <p className="text-white">{selectedUser.pseudo || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">ID</p>
                      <p className="text-white font-mono text-xs">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Inscrit le</p>
                      <p className="text-white">
                        {new Date(selectedUser.created_at).toLocaleString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {selectedUser.last_seen && (
                      <div>
                        <p className="text-gray-400 text-sm">Dernière connexion</p>
                        <p className="text-white">
                          {new Date(selectedUser.last_seen).toLocaleString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-700/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Statistiques de Jeu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                        <p className="text-cyan-400 text-3xl font-bold">{selectedUser.gamesCount || 0}</p>
                        <p className="text-gray-300 text-sm mt-1">Total parties</p>
                      </div>
                      <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                        <p className="text-green-400 text-3xl font-bold">{selectedUser.activeGamesCount || 0}</p>
                        <p className="text-gray-300 text-sm mt-1">En cours</p>
                      </div>
                      <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <p className="text-blue-400 text-3xl font-bold">{selectedUser.completedGamesCount || 0}</p>
                        <p className="text-gray-300 text-sm mt-1">Terminées</p>
                      </div>
                    </div>
                    {selectedUser.gamesCount && selectedUser.gamesCount > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-400 text-sm mb-2">Taux de complétion</p>
                        <Progress 
                          value={selectedUser.completedGamesCount && selectedUser.gamesCount 
                            ? (selectedUser.completedGamesCount / selectedUser.gamesCount) * 100 
                            : 0} 
                          className="w-full h-2 bg-gray-700" 
                          indicatorClassName="bg-gradient-to-r from-cyan-500 to-pink-500"
                        />
                        <p className="text-white text-sm mt-1 text-right">
                          {selectedUser.completedGamesCount && selectedUser.gamesCount 
                            ? Math.round((selectedUser.completedGamesCount / selectedUser.gamesCount) * 100) 
                            : 0}%
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Partie */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedGame(null)}>
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-pink-500/20 via-orange-500/20 to-cyan-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Play className="h-8 w-8 text-pink-400" />
                    Détails de la Partie
                  </h2>
                  <p className="text-gray-300 mt-1 font-mono">#{selectedGame.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedGame(null)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-400">Statut</p>
                    <Badge className={
                      selectedGame.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30 mt-2'
                        : selectedGame.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 mt-2'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30 mt-2'
                    }>
                      {selectedGame.status === 'active' ? 'En cours' : selectedGame.status === 'completed' ? 'Terminée' : selectedGame.status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-400">Étapes</p>
                    <p className="text-pink-400 text-2xl font-bold mt-1">{selectedGame.stepsCount || selectedGame.steps?.length || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-400">Joueurs</p>
                    <p className="text-cyan-400 text-2xl font-bold mt-1">{selectedGame.playersCount || selectedGame.players?.length || 0}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Liste des joueurs */}
                {selectedGame.players && selectedGame.players.length > 0 && (
                  <Card className="bg-gray-700/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white">Joueurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedGame.players.map((player: any, index: number) => (
                          <div key={player.id} className="flex items-center gap-3 p-2 bg-gray-600/30 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold">{player.nickname}</p>
                              <p className="text-gray-400 text-xs">
                                Rejoint le {new Date(player.joined_at).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            {player.is_creator && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                Créateur
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Liste des étapes */}
                {selectedGame.steps && selectedGame.steps.length > 0 && (
                  <Card className="bg-gray-700/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white">Étapes ({selectedGame.steps.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {selectedGame.steps.map((step: any, index: number) => (
                          <div key={step.id} className="p-3 bg-gray-600/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                                Étape {step.step_number}
                              </Badge>
                              <span className="text-gray-400 text-xs">
                                {step.step_type || 'Type inconnu'}
                              </span>
                            </div>
                            {step.content && (
                              <p className="text-white text-sm mt-2 line-clamp-2">
                                {step.content.length > 100 ? step.content.substring(0, 100) + '...' : step.content}
                              </p>
                            )}
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(step.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Informations générales */}
              <Card className="bg-gray-700/50 border-gray-600 mt-6">
                <CardHeader>
                  <CardTitle className="text-white">Informations</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Créée le</p>
                    <p className="text-white">
                      {new Date(selectedGame.created_at).toLocaleString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {selectedGame.completed_at && (
                    <div>
                      <p className="text-gray-400 text-sm">Terminée le</p>
                      <p className="text-white">
                        {new Date(selectedGame.completed_at).toLocaleString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Modal Utilisateurs */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUsersModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Users className="h-8 w-8 text-cyan-400" />
                    Liste des Utilisateurs ({allUsers.length})
                  </h2>
                  <p className="text-gray-300 mt-1">Total: {stats.totalUsers} utilisateurs</p>
                </div>
                <button 
                  onClick={() => setShowUsersModal(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allUsers.map((user) => (
                  <Card 
                    key={user.id} 
                    className="bg-gray-700/50 border-gray-600 hover:border-cyan-500/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUsersModal(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {user.pseudo?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{user.pseudo || 'Sans pseudo'}</p>
                          <p className="text-gray-400 text-xs">{user.email || 'Pas d\'email'}</p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs">
                        Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Parties */}
      {showGamesModalDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGamesModalDetails(false)}>
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-pink-500/20 via-orange-500/20 to-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Play className="h-8 w-8 text-pink-400" />
                    Liste des Parties ({allGames.length})
                  </h2>
                  <p className="text-gray-300 mt-1">Total: {stats.totalZigs} parties | Actives: {stats.activeZigs} | Complétées: {stats.completedZigs}</p>
                </div>
                <button 
                  onClick={() => setShowGamesModalDetails(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-3">
                {allGames.map((game) => (
                  <Card 
                    key={game.id} 
                    className="bg-gray-700/50 border-gray-600 hover:border-pink-500/50 transition-colors cursor-pointer"
                    onClick={async () => {
                      try {
                        const [stepsRes, playersRes] = await Promise.all([
                          supabase
                            .from('steps')
                            .select('*')
                            .eq('game_id', game.id)
                            .order('step_number', { ascending: true }),
                          supabase
                            .from('players')
                            .select('*')
                            .eq('game_id', game.id)
                            .order('joined_at', { ascending: true })
                        ]);
                        setSelectedGame({
                          ...game,
                          steps: stepsRes.data || [],
                          players: playersRes.data || []
                        });
                        setShowGamesModalDetails(false);
                      } catch (error) {
                        console.error('Erreur chargement détails partie:', error);
                        setSelectedGame(game);
                        setShowGamesModalDetails(false);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            <Play className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-white font-mono text-sm">#{game.id}</p>
                            <p className="text-gray-400 text-xs">
                              {new Date(game.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          game.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }>
                          {game.status === 'active' ? 'En cours' : 'Terminée'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Newsletter */}
      {showNewsletterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewsletterModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Mail className="h-8 w-8 text-orange-400" />
                    Inscriptions Newsletter ({newsletterSignups.length})
                  </h2>
                  <p className="text-gray-300 mt-1">Total: {stats.newsletterSignups} inscrits</p>
                </div>
                <button 
                  onClick={() => setShowNewsletterModal(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-2">
                {newsletterSignups.map((signup) => (
                  <Card key={signup.id} className="bg-gray-700/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-orange-400" />
                          <div>
                            <p className="text-white font-semibold">{signup.email}</p>
                            <p className="text-gray-400 text-xs">
                              Inscrit le {new Date(signup.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Messages avec réponse */}
      {showMessagesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMessagesModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-purple-400" />
                    Messages Contact ({contactMessages.length})
                  </h2>
                  <p className="text-gray-300 mt-1">Total: {stats.contactMessages} messages</p>
                </div>
                <button 
                  onClick={() => setShowMessagesModal(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {contactMessages.map((message) => (
                  <Card key={message.id} className="bg-gray-700/50 border-gray-600 hover:border-purple-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Mail className="h-5 w-5 text-purple-400" />
                            <p className="text-white font-semibold">{message.email}</p>
                            <p className="text-gray-400 text-xs">
                              {new Date(message.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <p className="text-gray-300 text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedMessage(message);
                            setReplyText('');
                          }}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30"
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Répondre
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Marquer ce message comme traité ?')) {
                              handleMarkAsProcessed(message.id);
                            }
                          }}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                          size="sm"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Marquer comme traité
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Réponse Message */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMessage(null)}>
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Send className="h-6 w-6 text-purple-400" />
                    Répondre à {selectedMessage.email}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Message original */}
              <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <p className="text-gray-400 text-xs mb-2">Message original :</p>
                <p className="text-white text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Formulaire de réponse */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Votre réponse
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tapez votre réponse ici..."
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 min-h-[200px]"
                    rows={8}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      if (!replyText.trim()) return;
                      
                      setIsReplying(true);
                      try {
                        // Récupérer le token de session
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) {
                          alert('Vous devez être connecté pour envoyer un email');
                          setIsReplying(false);
                          return;
                        }

                        // Appeler l'Edge Function pour envoyer l'email
                        const SUPABASE_URL = "https://tihrltssmpxpreadpzqm.supabase.co";
                        const response = await fetch(
                          `${SUPABASE_URL}/functions/v1/send-email`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${session.access_token}`,
                            },
                            body: JSON.stringify({
                              to: selectedMessage.email,
                              subject: 'Re: Message depuis ZigZag',
                              message: replyText,
                              originalMessage: selectedMessage.message,
                            }),
                          }
                        );

                        const result = await response.json();

                        if (!response.ok) {
                          throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email');
                        }

                        // Succès !
                        alert('✅ Email envoyé avec succès !');
                        
                        // Marquer automatiquement le message comme traité
                        if (selectedMessage) {
                          await handleMarkAsProcessed(selectedMessage.id);
                        }
                        
                        setSelectedMessage(null);
                        setReplyText('');
                      } catch (error: any) {
                        console.error('Erreur envoi réponse:', error);
                        alert(`❌ Erreur: ${error.message || 'Impossible d\'envoyer l\'email. Vérifiez la configuration de l\'Edge Function.'}`);
                      } finally {
                        setIsReplying(false);
                      }
                    }}
                    disabled={isReplying || !replyText.trim()}
                    className="bg-purple-500 hover:bg-purple-600 text-white flex-1"
                  >
                    {isReplying ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer l'email
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedMessage(null);
                      setReplyText('');
                    }}
                    variant="secondary"
                    className="bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Annuler
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  💡 L'email sera envoyé directement depuis le dashboard. Assurez-vous que l'Edge Function `send-email` est configurée avec Resend.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SOUS-COMPOSANTS LOCAUX ---

interface SidebarProps {
  showTeamModal: boolean
  setShowTeamModal: (show: boolean) => void
  showTasksModal: boolean
  setShowTasksModal: (show: boolean) => void
  showAnalyticsModal: boolean
  setShowAnalyticsModal: (show: boolean) => void
  showSocialModal: boolean
  setShowSocialModal: (show: boolean) => void
  showRoadmapModal: boolean
  setShowRoadmapModal: (show: boolean) => void
  onLogout?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ setShowTeamModal, setShowTasksModal, setShowAnalyticsModal, setShowSocialModal, setShowRoadmapModal, onLogout }) => (
  <aside className="w-20 flex flex-col items-center bg-gray-800/50 backdrop-blur-sm p-4 space-y-8 rounded-lg border border-gray-700">
    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 via-pink-500 to-orange-500 flex items-center justify-center">
      <Zap className="h-6 w-6 text-white" />
    </div>
    <nav className="flex flex-col items-center space-y-6 flex-1">
      <a href="#" className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30">
        <Home className="h-5 w-5" />
      </a>
      <button 
        onClick={() => setShowSocialModal(true)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <Share2 className="h-5 w-5" />
      </button>
      <button 
        onClick={() => setShowAnalyticsModal(true)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <BarChart3 className="h-5 w-5" />
      </button>
      <button 
        onClick={() => setShowTasksModal(true)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
      <button 
        onClick={() => setShowTeamModal(true)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <Users className="h-5 w-5" />
      </button>
      <button 
        onClick={() => setShowRoadmapModal(true)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <Calendar className="h-5 w-5" />
      </button>
    </nav>
    {onLogout && (
      <button 
        onClick={onLogout}
        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-auto"
        title="Déconnexion"
      >
        <LogOut className="h-5 w-5" />
      </button>
    )}
  </aside>
);

interface MainContentProps {
  stats: DashboardStats
  activityData: ActivityData[]
  recentZigs: Zig[]
  showGamesModal: boolean
  setShowGamesModal: (show: boolean) => void
  isRefreshing: boolean
  onRefresh: () => void
  lastRefresh: Date | null
  searchQuery: string
  onSearchChange: (query: string) => void
  showSearchResults: boolean
  setShowSearchResults: (show: boolean) => void
  searchResults: {
    users: (User & { gamesCount?: number; activeGamesCount?: number; completedGamesCount?: number })[];
    games: (Zig & { stepsCount?: number; playersCount?: number; steps?: any[] })[];
  } | null
  isSearching: boolean
  onUserClick: (user: User & { gamesCount?: number; activeGamesCount?: number; completedGamesCount?: number }) => void
  onGameClick: (game: Zig & { stepsCount?: number; playersCount?: number }) => Promise<void>
  onCloseSearch: () => void
  onShowUsersModal: () => Promise<void>
  onShowGamesModalDetails: () => Promise<void>
  onShowNewsletterModal: () => Promise<void>
  onShowMessagesModal: () => Promise<void>
}

const MainContent: React.FC<MainContentProps> = ({ 
  stats, 
  activityData, 
  recentZigs, 
  showGamesModal, 
  setShowGamesModal, 
  isRefreshing, 
  onRefresh, 
  lastRefresh, 
  searchQuery,
  onSearchChange,
  showSearchResults,
  setShowSearchResults,
  searchResults,
  isSearching,
  onUserClick,
  onGameClick,
  onCloseSearch,
  onShowUsersModal,
  onShowGamesModalDetails,
  onShowNewsletterModal,
  onShowMessagesModal
}) => {
  const playtimeData = [
    { name: 'Actifs', value: stats.activeZigs, fill: '#06b6d4' },
    { name: 'Complétés', value: stats.completedZigs, fill: '#ec4899' },
    { name: 'Abandonnés', value: Math.max(0, stats.totalZigs - stats.activeZigs - stats.completedZigs), fill: '#f97316' },
  ];

  const chartConfig: ChartConfig = {
    actifs: { label: "Actifs", color: "#06b6d4" },
    completes: { label: "Complétés", color: "#ec4899" },
    abandonnes: { label: "Abandonnés", color: "#f97316" },
  };

  return (
    <>
      {/* Modal des parties */}
      {showGamesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGamesModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Play className="h-6 w-6 text-cyan-400" />
                Statistiques des Parties
              </h2>
              <button 
                onClick={() => setShowGamesModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Parties</p>
                        <p className="text-3xl font-bold text-white">{stats.totalZigs}</p>
                      </div>
                      <Play className="h-10 w-10 text-cyan-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Actives</p>
                        <p className="text-3xl font-bold text-green-400">{stats.activeZigs}</p>
                      </div>
                      <Zap className="h-10 w-10 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Complétées</p>
                        <p className="text-3xl font-bold text-blue-400">{stats.completedZigs}</p>
                      </div>
                      <Trophy className="h-10 w-10 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-3">Parties Récentes</h3>
              <div className="space-y-2">
                {recentZigs.map((zig, index) => (
                  <div key={zig.id} className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-mono text-sm">#{zig.id.slice(0, 8)}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(zig.created_at).toLocaleString('fr-FR', { 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      zig.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }>
                      {zig.status === 'active' ? '🎮 En cours' : '✅ Terminée'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 space-y-6">
      {/* Recherche et Hero */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex gap-3 relative search-container">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
                placeholder="Rechercher utilisateurs (email, pseudo) ou parties (ID)..." 
              className="w-full pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500" 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchResults) setShowSearchResults(true);
                }}
              />
              {searchQuery && (
                <button
                  onClick={onCloseSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
          </div>
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
              title="Rafraîchir les données"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {lastRefresh && (
              <div className="text-xs text-gray-400 flex items-center">
                Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          
          {/* Résultats de recherche */}
          {showSearchResults && (
            <div className="search-results absolute top-full left-0 right-0 mt-2 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-[600px] overflow-y-auto">
              {isSearching ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-2"></div>
                  <p className="text-gray-400">Recherche en cours...</p>
                </div>
              ) : searchResults ? (
                <div className="p-4">
                  {/* Utilisateurs trouvés */}
                  {searchResults.users.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-cyan-400" />
                        Utilisateurs ({searchResults.users.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.users.map((user) => (
                          <Card 
                            key={user.id} 
                            className="bg-gray-700/50 border-gray-600 hover:border-cyan-500/50 transition-colors cursor-pointer"
                            onClick={() => onUserClick(user)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Avatar className="h-10 w-10">
                                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {user.pseudo?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                      </div>
                                    </Avatar>
                                    <div>
                                      <p className="text-white font-semibold">{user.pseudo || 'Sans pseudo'}</p>
                                      <p className="text-gray-400 text-sm">{user.email || 'Pas d\'email'}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                    <div>
                                      <p className="text-gray-400">ID</p>
                                      <p className="text-white font-mono text-xs">{user.id.slice(0, 8)}...</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Total parties</p>
                                      <p className="text-cyan-400 font-bold">{user.gamesCount || 0}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Actives</p>
                                      <p className="text-green-400 font-bold">{user.activeGamesCount || 0}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Terminées</p>
                                      <p className="text-blue-400 font-bold">{user.completedGamesCount || 0}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                                    <div>
                                      <p className="text-gray-400">Inscrit le</p>
                                      <p className="text-white">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR', { 
                                          day: 'numeric', 
                                          month: 'short',
                                          year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    {user.last_seen && (
                                      <div>
                                        <p className="text-gray-400">Dernière connexion</p>
                                        <p className="text-white">
                                          {new Date(user.last_seen).toLocaleDateString('fr-FR', { 
                                            day: 'numeric', 
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parties trouvées */}
                  {searchResults.games.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Play className="h-5 w-5 text-pink-400" />
                        Parties ({searchResults.games.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.games.map((game) => (
                          <Card 
                            key={game.id} 
                            className="bg-gray-700/50 border-gray-600 hover:border-pink-500/50 transition-colors cursor-pointer"
                            onClick={() => onGameClick(game)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                      <Play className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-white font-mono font-semibold text-sm" title={`ID complet: ${game.id}`}>
                                        #{game.id}
                                      </p>
                                      <Badge className={
                                        game.status === 'active' 
                                          ? 'bg-green-500/20 text-green-400 border-green-500/30 mt-1'
                                          : game.status === 'completed'
                                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 mt-1'
                                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30 mt-1'
                                      }>
                                        {game.status === 'active' ? 'En cours' : game.status === 'completed' ? 'Terminée' : game.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                    <div>
                                      <p className="text-gray-400">Étapes</p>
                                      <p className="text-pink-400 font-bold">{game.stepsCount || 0}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Joueurs</p>
                                      <p className="text-cyan-400 font-bold">{game.playersCount || 0}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Créée le</p>
                                      <p className="text-white text-xs">
                                        {new Date(game.created_at).toLocaleDateString('fr-FR', { 
                                          day: 'numeric', 
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  {game.completed_at && (
                                    <div className="mt-2">
                                      <p className="text-gray-400 text-xs">
                                        Terminée le: {new Date(game.completed_at).toLocaleString('fr-FR')}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aucun résultat */}
                  {searchResults.users.length === 0 && searchResults.games.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">Aucun résultat trouvé pour "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
          <Card className="bg-gradient-to-r from-cyan-500/80 via-pink-500/80 to-orange-500/80 text-white p-6 border-none">
            <div>
              <Badge className="bg-white/20 text-white mb-2 border-none">En Direct</Badge>
              <h2 className="text-3xl font-bold">ZigZag Dashboard</h2>
              <p className="max-w-md mt-2 mb-4 text-sm">
                Suivez en temps réel l'activité de votre jeu de déformation de messages !
              </p>
              <Button 
                variant="secondary" 
                className="bg-white text-gray-900 hover:bg-gray-100"
                onClick={() => setShowGamesModal(true)}
              >
                Voir les Parties
              </Button>
            </div>
          </Card>
        </div>
        
        {/* 7-Day Activity */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Activité 7 jours</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartLoader />}>
            <ChartContainer config={{}} className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="zigs" fill="#06b6d4" radius={4} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af' }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as ActivityData;
                        return (
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                            <p className="text-white font-semibold mb-2">{data.day}</p>
                            <div className="space-y-1">
                              <p className="text-cyan-400 text-sm">
                                <span className="font-bold">{data.zigs}</span> {data.zigs === 1 ? 'partie' : 'parties'}
                              </p>
                              <p className="text-pink-400 text-sm">
                                <span className="font-bold">{data.users}</span> {data.users === 1 ? 'utilisateur' : 'utilisateurs'}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            </Suspense>
            <div className="flex justify-between mt-4 text-sm text-gray-300">
              <span><strong className="text-xl text-white">{stats.totalZigs}</strong> Parties</span>
              <span><strong className="text-xl text-white">{stats.activeZigs}</strong> En cours</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer"
          onClick={onShowUsersModal}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Utilisateurs</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-xs text-green-400 mt-1">+{stats.weekGrowth}% cette semaine</p>
              </div>
              <Users className="h-10 w-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gray-800/50 border-gray-700 hover:border-pink-500/50 transition-all cursor-pointer"
          onClick={onShowGamesModalDetails}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Parties Actives</p>
                <p className="text-3xl font-bold text-white">{stats.activeZigs}</p>
                <p className="text-xs text-gray-400 mt-1">En cours de jeu</p>
              </div>
              <Play className="h-10 w-10 text-pink-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-all cursor-pointer"
          onClick={onShowNewsletterModal}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Newsletter</p>
                <p className="text-3xl font-bold text-white">{stats.newsletterSignups}</p>
                <p className="text-xs text-gray-400 mt-1">Inscrits</p>
              </div>
              <Mail className="h-10 w-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer"
          onClick={onShowMessagesModal}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Messages</p>
                <p className="text-3xl font-bold text-white">{stats.contactMessages}</p>
                <p className="text-xs text-gray-400 mt-1">À traiter</p>
              </div>
              <MessageSquare className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parties Récentes */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-white">
          Parties Récentes
          {searchQuery && (
            <span className="text-sm text-gray-400 font-normal ml-2">
              (filtrées: {recentZigs.filter(z => 
                z.id.toLowerCase().includes(searchQuery.toLowerCase())
              ).length})
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(searchQuery 
            ? recentZigs.filter(z => z.id.toLowerCase().includes(searchQuery.toLowerCase()))
            : recentZigs.slice(0, 6)
          ).map((zig, index) => (
            <Card key={zig.id} className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={
                    zig.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    zig.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }>
                    {zig.status === 'active' ? 'En cours' : 
                     zig.status === 'completed' ? 'Terminée' : 'Statut inconnu'}
                  </Badge>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-300">Partie #{zig.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(zig.created_at).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Distribution et Tendances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Distribution des Parties</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="w-1/2 relative">
              <Suspense fallback={<ChartLoader />}>
              <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={playtimeData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={35} 
                      outerRadius={60} 
                      strokeWidth={2}
                      stroke="#1f2937"
                    >
                      {playtimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              </Suspense>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-3xl font-bold text-white">{stats.totalZigs}</span>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
            <div className="w-1/2 space-y-2">
              {playtimeData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.fill }}></span>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Croissance Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartLoader />}>
            <ChartContainer config={{}} className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                  />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af' }} />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#9ca3af' }} 
                    allowDecimals={false}
                    domain={[0, 20]}
                    ticks={[0, 5, 10, 15, 20]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

interface ProfileSidebarProps {
  stats: DashboardStats
  recentUsers: User[]
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ stats, recentUsers }) => (
  <aside className="w-full lg:w-80 flex flex-col space-y-6">
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-cyan-400">
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold">
            ZZ
          </div>
        </Avatar>
        <div>
          <CardTitle className="text-white">Admin ZigZag</CardTitle>
          <p className="text-sm text-gray-400">Dashboard Principal</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-400 mb-2">Activité du jour</p>
        <Progress value={65} className="w-full h-2 bg-gray-700" indicatorClassName="bg-gradient-to-r from-cyan-500 to-pink-500"/>
        <div className="flex justify-between text-xs mt-2">
          <span className="text-green-400">● {stats.activeZigs} parties actives</span>
          <span className="text-gray-400">{stats.todayUsers} nouveaux</span>
        </div>
      </CardContent>
    </Card>
    
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Statistiques Clés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-400" />
            <span className="text-gray-300">Taux de complétion</span>
          </div>
          <span className="font-bold text-white">
            {stats.totalZigs > 0 ? Math.round((stats.completedZigs / stats.totalZigs) * 100) : 0}%
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="text-cyan-400" />
            <span className="text-gray-300">Utilisateurs actifs</span>
          </div>
          <span className="font-bold text-white">{stats.todayUsers}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="text-orange-400" />
            <span className="text-gray-300">Inscrits newsletter</span>
          </div>
          <span className="font-bold text-white">{stats.newsletterSignups}</span>
        </div>
      </CardContent>
    </Card>
    
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Utilisateurs Récents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentUsers.length === 0 ? (
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Aucun utilisateur récent</p>
            <p className="text-gray-500 text-xs mt-1">Les utilisateurs récents apparaîtront ici</p>
          </div>
        ) : (
          recentUsers.slice(0, 5).map((user, index) => (
            <div 
              key={user.id} 
              className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded-lg transition-colors cursor-pointer"
              onClick={() => {
                // Optionnel : ouvrir les détails de l'utilisateur
                console.log('User clicked:', user);
              }}
            >
            <Avatar className="h-8 w-8">
              <div 
                className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                style={{ 
                  background: `linear-gradient(135deg, 
                    hsl(${index * 70}, 70%, 50%), 
                    hsl(${index * 70 + 60}, 70%, 50%))` 
                }}
              >
                {user.pseudo?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user.pseudo || user.email || 'Utilisateur'}</p>
              <p className="text-xs text-gray-500">
                {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              Nouveau
            </Badge>
          </div>
          ))
        )}
      </CardContent>
    </Card>
  </aside>
);

export default ZigzagDashboard;

