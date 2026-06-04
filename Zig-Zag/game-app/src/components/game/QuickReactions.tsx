'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';
import './QuickReactions.css';

interface Reaction {
  id: string;
  game_id: string;
  player_id: string;
  nickname: string;
  type: 'emoji' | 'message';
  content: string;
  created_at: string;
}

interface QuickReactionsProps {
  gameId: string;
  playerId: string;
  playerNickname: string;
}

export default function QuickReactions({ gameId, playerId, playerNickname }: QuickReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [pendingReactions, setPendingReactions] = useState<Set<string>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);

  // Emojis disponibles
  const emojis = ['👍', '❤️', '😂', '🎉', '🔥', '👏', '😮', '🤔', '💯', '🎨', '🚀', '⭐'];

  // Messages prédéfinis
  const quickMessages = [
    'Prends ton temps ! 😊',
    'GG ! 🎮',
    'Bien joué ! 👏',
    'Hâte de voir ! 👀',
    'C\'est drôle ! 😂',
    'Trop bien ! 🌟',
    'Excellent ! 🎯',
    'Continue ! 💪'
  ];

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [reactions]);

  // Charger les réactions existantes
  useEffect(() => {
    loadReactions();
    
    // S'abonner aux nouvelles réactions en temps réel
    const channel = supabase
      .channel(`game-reactions-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_reactions',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          const newReaction = payload.new as Reaction;
          
          // Si c'est un message en attente qu'on vient d'envoyer, le remplacer par la version serveur
          setReactions(prev => {
            // Retirer les messages en attente avec le même contenu
            const filtered = prev.filter(r => !pendingReactions.has(r.id));
            // Ajouter le nouveau message du serveur
            const updated = [...filtered, newReaction].slice(-50); // Garder les 50 dernières
            setPendingReactions(prev => {
              const newSet = new Set(prev);
              newSet.delete(newReaction.id);
              return newSet;
            });
            return updated;
          });
          
          // Animation de la nouvelle réaction
          setTimeout(() => {
            const element = document.getElementById(`reaction-${newReaction.id}`);
            if (element) {
              element.classList.add('new-reaction');
              // Auto-scroll
              if (feedRef.current) {
                feedRef.current.scrollTop = feedRef.current.scrollHeight;
              }
            }
          }, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, pendingReactions]);

  const loadReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('game_reactions')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true }) // Plus anciennes en premier
        .limit(50);

      if (error) {
        logger.error('Erreur chargement réactions:', error);
        return;
      }

      if (data) {
        setReactions(data);
        // Auto-scroll après chargement
        setTimeout(() => {
          if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (err) {
      logger.error('Erreur chargement réactions:', err);
    }
  };

  const sendReaction = useCallback(async (type: 'emoji' | 'message', content: string) => {
    if (isSending) return;
    
    setIsSending(true);
    
    // Créer un ID temporaire pour l'optimistic update
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticReaction: Reaction = {
      id: tempId,
      game_id: gameId,
      player_id: playerId,
      nickname: playerNickname,
      type,
      content,
      created_at: new Date().toISOString()
    };
    
    // OPTIMISTIC UPDATE : Afficher immédiatement le message
    setReactions(prev => [...prev, optimisticReaction].slice(-50));
    setPendingReactions(prev => new Set(prev).add(tempId));
    
    // Auto-scroll immédiatement
    setTimeout(() => {
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    }, 50);
    
    try {
      const { data, error } = await supabase
        .from('game_reactions')
        .insert({
          game_id: gameId,
          player_id: playerId,
          nickname: playerNickname,
          type,
          content
        })
        .select()
        .single();

      if (error) {
        logger.error('Erreur envoi réaction:', error);
        // Retirer le message optimiste en cas d'erreur
        setReactions(prev => prev.filter(r => r.id !== tempId));
        setPendingReactions(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
      } else if (data) {
        // Le message sera remplacé par la version serveur via l'abonnement Realtime
        // On garde le message optimiste jusqu'à ce que le serveur confirme
      }
    } catch (err) {
      logger.error('Erreur envoi réaction:', err);
      // Retirer le message optimiste en cas d'erreur
      setReactions(prev => prev.filter(r => r.id !== tempId));
      setPendingReactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    } finally {
      setTimeout(() => setIsSending(false), 500); // Cooldown de 500ms
    }
  }, [gameId, playerId, playerNickname, isSending, pendingReactions]);

  // Formater l'heure d'un message
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="quick-reactions-container">
      <div className="reactions-header">
        <h4>💬 Chat en Direct</h4>
        <p className="reactions-subtitle">Communiquez avec les autres joueurs en temps réel !</p>
      </div>

      {/* Liste des réactions récentes - VRAI CHAT */}
      <div className="reactions-feed" ref={feedRef}>
        {reactions.length > 0 ? (
          reactions.map((reaction) => {
            const isOwn = reaction.player_id === playerId;
            const isPending = pendingReactions.has(reaction.id);
            
            return (
              <div 
                key={reaction.id}
                id={`reaction-${reaction.id}`}
                className={`reaction-item ${isOwn ? 'own-reaction' : ''} ${isPending ? 'pending-reaction' : ''}`}
              >
                {!isOwn && (
                  <div className="reaction-avatar">
                    {reaction.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`reaction-bubble ${isOwn ? 'own-bubble' : 'other-bubble'}`}>
                  {!isOwn && (
                    <div className="reaction-author">{reaction.nickname}</div>
                  )}
                  <div className="reaction-content">
                    {reaction.type === 'emoji' ? (
                      <span className="reaction-emoji">{reaction.content}</span>
                    ) : (
                      <span className="reaction-message">{reaction.content}</span>
                    )}
                  </div>
                  <div className="reaction-meta">
                    <span className="reaction-time">{formatTime(reaction.created_at)}</span>
                    {isPending && (
                      <span className="reaction-status">⏳</span>
                    )}
                    {isOwn && !isPending && (
                      <span className="reaction-status">✓</span>
                    )}
                  </div>
                </div>
                {isOwn && (
                  <div className="reaction-avatar own-avatar">
                    {reaction.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-reactions">
            <p>💭 Aucun message pour le moment</p>
            <p className="no-reactions-sub">Soyez le premier à écrire !</p>
          </div>
        )}
      </div>

      {/* Emojis rapides */}
      <div className="emoji-panel">
        <div className="panel-label">Emojis</div>
        <div className="emoji-grid">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              className="emoji-btn"
              onClick={() => sendReaction('emoji', emoji)}
              disabled={isSending}
              title={`Envoyer ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Messages rapides */}
      <div className="messages-panel">
        <div className="panel-label">Messages</div>
        <div className="messages-grid">
          {quickMessages.map((message, index) => (
            <button
              key={index}
              className="message-btn"
              onClick={() => sendReaction('message', message)}
              disabled={isSending}
              title={message}
            >
              {message}
            </button>
          ))}
        </div>
      </div>

      {reactions.length === 0 && (
        <div className="no-reactions">
          <p>💭 Aucune réaction pour le moment</p>
          <p className="no-reactions-sub">Soyez le premier à réagir !</p>
        </div>
      )}
    </div>
  );
}
