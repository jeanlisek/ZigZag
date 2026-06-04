import { supabase } from './client';
import {
  Room,
  RoomWithPlayers,
  Player,
  Game,
  RoomStatus,
  generateRoomCode,
  calculateMaxSteps,
  getNextStepType,
  MIN_PLAYERS_PRIVATE,
} from '@/types/game';
import { retryWithBackoff } from '@/utils/retry';
import { logger } from '@/utils/logger';

// Obtenir l'ID utilisateur authentifié (si disponible)
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    logger.error('Erreur récupération session:', error);
    return null;
  }
}

// Générer un ID unique pour le joueur (stocké en localStorage)
// Utilise l'ID utilisateur authentifié si disponible, sinon génère un UUID
export async function getOrCreatePlayerId(): Promise<string> {
  if (typeof window === 'undefined') return '';
  
  // D'abord, essayer d'obtenir l'ID utilisateur authentifié
  const userId = await getAuthenticatedUserId();
  if (userId) {
    // Sauvegarder pour éviter les appels répétés
    localStorage.setItem('zigzag_user_id', userId);
    return userId;
  }
  
  // Sinon, utiliser l'ID localStorage ou en créer un nouveau
  let playerId = localStorage.getItem('zigzag_player_id');
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem('zigzag_player_id', playerId);
  }
  return playerId;
}

// Version synchrone pour compatibilité (utilise le cache)
export function getOrCreatePlayerIdSync(): string {
  if (typeof window === 'undefined') return '';
  
  // Vérifier d'abord si on a un user_id en cache
  const userId = localStorage.getItem('zigzag_user_id');
  if (userId) return userId;
  
  // Sinon utiliser player_id
  let playerId = localStorage.getItem('zigzag_player_id');
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem('zigzag_player_id', playerId);
  }
  return playerId;
}

// Obtenir le nickname du joueur depuis Supabase (utilisateur connecté) ou localStorage
export async function getPlayerNickname(): Promise<string> {
  if (typeof window === 'undefined') return 'Joueur';
  
  try {
    // Essayer d'abord de récupérer depuis Supabase si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      // Récupérer depuis user_metadata
      const usernameFromMetadata = session.user.user_metadata?.username;
      if (usernameFromMetadata) {
        // Sauvegarder en cache dans localStorage
        localStorage.setItem('zigzag_nickname', usernameFromMetadata);
        return usernameFromMetadata;
      }
      
      // Si pas dans user_metadata, essayer depuis la table users
      const { data: userData, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .single();
      
      if (!error && userData?.username) {
        // Sauvegarder en cache dans localStorage
        localStorage.setItem('zigzag_nickname', userData.username);
        return userData.username;
      }
    }
  } catch (err) {
    logger.error('Erreur récupération pseudo depuis Supabase:', err);
  }
  
  // Fallback sur localStorage
  const storedNickname = localStorage.getItem('zigzag_nickname');
  if (storedNickname) {
    return storedNickname;
  }
  
  // Dernier recours : générer un pseudo aléatoire
  return `Joueur_${Math.floor(Math.random() * 1000)}`;
}

// Version synchrone pour compatibilité (utilise le cache localStorage)
export function getPlayerNicknameSync(): string {
  if (typeof window === 'undefined') return 'Joueur';
  
  return localStorage.getItem('zigzag_nickname') || `Joueur_${Math.floor(Math.random() * 1000)}`;
}

// Sauvegarder le nickname
export function setPlayerNickname(nickname: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('zigzag_nickname', nickname);
}

// Créer une nouvelle room privée
export async function createRoom(creatorNickname: string): Promise<{ room: Room; game: Game } | null> {
  const playerId = await getOrCreatePlayerId();
  const userId = await getAuthenticatedUserId();
  setPlayerNickname(creatorNickname);
  
  // Générer un code unique
  let roomCode = generateRoomCode();
  let attempts = 0;
  
  // S'assurer que le code est unique
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from('rooms')
      .select('code')
      .eq('code', roomCode)
      .single();
    
    if (!existing) break;
    roomCode = generateRoomCode();
    attempts++;
  }
  
  // Créer la partie associée
  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 999);
  
  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({
      status: 'active',
      expires_at: expiresAt.toISOString(),
      current_step_number: 0,
      next_step_type: 'drawing',
      mode: 'private',
      room_code: roomCode,
      creator_id: playerId,
      user_id: userId, // Lier à l'utilisateur authentifié si disponible
    })
    .select()
    .single();
  
  if (gameError || !game) {
    logger.error('Erreur création game:', gameError);
    return null;
  }
  
  // Créer la room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({
      code: roomCode,
      game_id: game.id,
      status: 'waiting',
      creator_id: playerId,
      player_count: 1,
      user_id: userId, // Lier à l'utilisateur authentifié si disponible
    })
    .select()
    .single();
  
  if (roomError || !room) {
    logger.error('Erreur création room:', roomError);
    // Supprimer la partie créée
    await supabase.from('games').delete().eq('id', game.id);
    return null;
  }
  
  // Ajouter le créateur comme premier joueur
  await supabase.from('players').insert({
    game_id: game.id,
    player_id: playerId,
    nickname: creatorNickname,
    is_creator: true,
    is_active: true,
    user_id: userId, // Lier à l'utilisateur authentifié si disponible
  });
  
  return { room: room as Room, game: game as Game };
}

// Rejoindre une room existante
export async function joinRoom(
  roomCode: string,
  nickname: string
): Promise<{ success: boolean; room?: RoomWithPlayers; error?: string }> {
  const playerId = await getOrCreatePlayerId();
  const userId = await getAuthenticatedUserId();
  setPlayerNickname(nickname);
  
  // Chercher la room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*, game:games(*)')
    .eq('code', roomCode.toUpperCase())
    .single();
  
  if (roomError || !room) {
    return { success: false, error: 'Room non trouvée. Vérifiez le code.' };
  }
  
  // Vérifier si le joueur est déjà dans la room
  const { data: existingPlayer } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', room.game_id)
    .eq('player_id', playerId)
    .single();
  
  if (existingPlayer) {
    // Réactiver le joueur s'il était inactif
    await supabase
      .from('players')
      .update({ is_active: true, nickname })
      .eq('id', existingPlayer.id);
    
    // Récupérer la room avec les joueurs
    const roomWithPlayers = await getRoomWithPlayers(roomCode);
    return { success: true, room: roomWithPlayers || undefined };
  }
  
  // Vérifier le statut de la room
  if (room.status === 'completed') {
    return { success: false, error: 'Cette partie est terminée.' };
  }
  
  if (room.status === 'in_progress') {
    // Le joueur peut voir le lobby mais pas participer
    const roomWithPlayers = await getRoomWithPlayers(roomCode);
    return { 
      success: true, 
      room: roomWithPlayers || undefined,
      error: 'Partie en cours. Vous pourrez rejoindre la prochaine.'
    };
  }
  
  // Ajouter le joueur à la room
  const { error: playerError } = await supabase.from('players').insert({
    game_id: room.game_id,
    player_id: playerId,
    nickname,
    is_creator: false,
    is_active: true,
    user_id: userId, // Lier à l'utilisateur authentifié si disponible
  });
  
  if (playerError) {
    logger.error('Erreur ajout joueur:', playerError);
    return { success: false, error: 'Erreur lors de la connexion à la room.' };
  }
  
  // Mettre à jour le compteur de joueurs
  await supabase
    .from('rooms')
    .update({ player_count: room.player_count + 1 })
    .eq('id', room.id);
  
  const roomWithPlayers = await getRoomWithPlayers(roomCode);
  return { success: true, room: roomWithPlayers || undefined };
}

// Obtenir une room avec ses joueurs
export async function getRoomWithPlayers(roomCode: string): Promise<RoomWithPlayers | null> {
  try {
    const result = await retryWithBackoff(async () => {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { room, error: null };
    });

    if (result.error || !result.room) {
      logger.warn('Room non trouvée:', roomCode);
      return null;
    }

    const room = result.room;
  
    // Obtenir les joueurs actifs
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', room.game_id)
      .eq('is_active', true)
      .order('joined_at', { ascending: true });
  
    // Obtenir la partie
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', room.game_id)
      .single();
  
    return {
      ...room,
      players: (players || []) as Player[],
      game: game as Game,
    } as RoomWithPlayers;
  } catch (err) {
    logger.error('Erreur lors de la récupération de la room:', err);
    return null;
  }
}

// Obtenir une room par son code
export async function getRoomByCode(roomCode: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', roomCode.toUpperCase())
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data as Room;
}

// Lancer une partie privée
export async function startPrivateGame(
  roomCode: string
): Promise<{ success: boolean; gameId?: string; error?: string }> {
  const playerId = await getOrCreatePlayerId();
  
  // Obtenir la room avec les joueurs
  const room = await getRoomWithPlayers(roomCode);
  
  if (!room) {
    return { success: false, error: 'Room non trouvée.' };
  }
  
  // Vérifier que c'est le créateur qui lance
  if (room.creator_id !== playerId) {
    return { success: false, error: 'Seul le créateur peut lancer la partie.' };
  }
  
  // Vérifier le nombre de joueurs
  const activePlayers = room.players.filter(p => p.is_active);
  if (activePlayers.length < MIN_PLAYERS_PRIVATE) {
    return { 
      success: false, 
      error: `Il faut au moins ${MIN_PLAYERS_PRIVATE} joueurs pour lancer la partie.` 
    };
  }
  
  // Calculer le nombre d'étapes
  const maxSteps = calculateMaxSteps(activePlayers.length);
  
  // Mettre à jour la partie
  const { error: gameError } = await supabase
    .from('games')
    .update({
      max_steps: maxSteps,
      status: 'active',
    })
    .eq('id', room.game_id);
  
  if (gameError) {
    return { success: false, error: 'Erreur lors du lancement de la partie.' };
  }
  
  // Mettre à jour le statut de la room
  const { error: roomError } = await supabase
    .from('rooms')
    .update({ status: 'in_progress' })
    .eq('id', room.id);
  
  if (roomError) {
    return { success: false, error: 'Erreur lors du lancement de la partie.' };
  }
  
  return { success: true, gameId: room.game_id };
}

// Quitter une room
export async function leaveRoom(roomCode: string): Promise<void> {
  const playerId = await getOrCreatePlayerId();
  
  const room = await getRoomByCode(roomCode);
  if (!room) return;
  
  // Marquer le joueur comme inactif
  await supabase
    .from('players')
    .update({ is_active: false })
    .eq('game_id', room.game_id)
    .eq('player_id', playerId);
  
  // Mettre à jour le compteur
  const { data: activePlayers } = await supabase
    .from('players')
    .select('id')
    .eq('game_id', room.game_id)
    .eq('is_active', true);
  
  await supabase
    .from('rooms')
    .update({ player_count: activePlayers?.length || 0 })
    .eq('id', room.id);
}

// S'abonner aux changements d'une room en temps réel
export function subscribeToRoom(
  roomCode: string,
  onPlayersChanged: (players: Player[]) => void,
  onRoomUpdated: (room: Room) => void
) {
  // S'abonner aux changements de joueurs
  const playersChannel = supabase
    .channel(`room-players:${roomCode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
      },
      async () => {
        // Recharger les joueurs
        const room = await getRoomWithPlayers(roomCode);
        if (room) {
          onPlayersChanged(room.players);
        }
      }
    )
    .subscribe();
  
  // S'abonner aux changements de la room
  const roomChannel = supabase
    .channel(`room:${roomCode}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `code=eq.${roomCode.toUpperCase()}`,
      },
      (payload) => {
        onRoomUpdated(payload.new as Room);
      }
    )
    .subscribe();
  
  return () => {
    playersChannel.unsubscribe();
    roomChannel.unsubscribe();
  };
}

// Vérifier si le joueur actuel est le créateur
export function isCurrentPlayerCreator(room: RoomWithPlayers): boolean {
  const playerId = getOrCreatePlayerIdSync();
  return room.creator_id === playerId;
}

