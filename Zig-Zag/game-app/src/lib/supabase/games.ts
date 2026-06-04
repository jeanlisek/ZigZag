import { supabase } from './client';
import { Game, Step, GameWithSteps, getNextStepType, MAX_STEPS, StepType, Player } from '@/types/game';
import { getOrCreatePlayerId, getPlayerNickname, getAuthenticatedUserId } from './rooms';
import { retryWithBackoff } from '@/utils/retry';
import { logger } from '@/utils/logger';

// Obtenir la date de fin du jour (23h59) en Europe/Paris
function getEndOfDayParis(): string {
  const now = new Date();
  // Créer une date à 23:59:59 en timezone Europe/Paris
  const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  parisTime.setHours(23, 59, 59, 999);
  return parisTime.toISOString();
}

// Vérifier et terminer les parties expirées
export async function checkAndCompleteExpiredGames(): Promise<void> {
  const now = new Date().toISOString();
  
  // Terminer les parties expirées
  await supabase
    .from('games')
    .update({ status: 'completed' })
    .eq('status', 'active')
    .lte('expires_at', now);
  
  // Mettre à jour les rooms associées
  await supabase
    .from('rooms')
    .update({ status: 'completed' })
    .eq('status', 'in_progress')
    .lte('created_at', now);
}

// Déterminer quel joueur doit jouer pour une étape donnée (rotation circulaire)
export async function getCurrentPlayerForStep(
  gameId: string,
  stepNumber: number,
  players: Player[]
): Promise<Player | null> {
  if (!players || players.length === 0) {
    logger.warn('Aucun joueur trouvé pour la partie', gameId);
    return null;
  }
  
  // Rotation circulaire : le joueur qui doit jouer est déterminé par (stepNumber % nombre de joueurs)
  // stepNumber commence à 0, donc l'index correspond directement
  const playerIndex = stepNumber % players.length;
  const currentPlayer = players[playerIndex];
  
  logger.debug('🎮 Joueur déterminé pour l\'étape', {
    stepNumber,
    playerIndex,
    totalPlayers: players.length,
    currentPlayer: currentPlayer.nickname
  });
  
  return currentPlayer;
}

// Rejoindre une partie multi (ajouter le joueur à la table players)
export async function joinGame(gameId: string): Promise<{ success: boolean; error?: string }> {
  const playerId = await getOrCreatePlayerId();
  const userId = await getAuthenticatedUserId();
  const nickname = getPlayerNickname();
  
  // Vérifier si le joueur est déjà dans la partie
  const { data: existingPlayer } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .single();
  
  if (existingPlayer) {
    // Réactiver le joueur s'il était inactif
    await supabase
      .from('players')
      .update({ is_active: true, nickname })
      .eq('id', existingPlayer.id);
    return { success: true };
  }
  
  // Ajouter le joueur à la partie
  const { error: playerError } = await supabase.from('players').insert({
    game_id: gameId,
    player_id: playerId,
    nickname,
    is_creator: false,
    is_active: true,
    user_id: userId,
  });
  
  if (playerError) {
    logger.error('Erreur ajout joueur:', playerError);
    return { success: false, error: 'Erreur lors de la connexion à la partie' };
  }
  
  return { success: true };
}

// Trouver ou créer une partie aléatoire active
export async function findOrCreateGame(): Promise<Game> {
  // D'abord, terminer les parties expirées
  await checkAndCompleteExpiredGames();
  
  // Chercher une partie aléatoire active (mode = 'random')
  // Utiliser .maybeSingle() au lieu de .single() pour éviter les erreurs si aucune partie n'existe
  const { data: existingGames, error: findError } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'active')
    .eq('mode', 'random')
    .order('created_at', { ascending: true })
    .limit(1);
  
  // Si on trouve une partie
  if (existingGames && existingGames.length > 0 && !findError) {
    const existingGame = existingGames[0];
    
    // Vérifier si la partie a atteint le max d'étapes
    const maxSteps = existingGame.max_steps || MAX_STEPS;
    const { count } = await supabase
      .from('steps')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', existingGame.id);
    
    if (count !== null && count >= maxSteps) {
      // Terminer la partie
      await supabase
        .from('games')
        .update({ status: 'completed' })
        .eq('id', existingGame.id);
      
      // Créer une nouvelle partie
      const newGame = await createNewGame();
      // Ajouter le joueur à la nouvelle partie
      await joinGame(newGame.id);
      return newGame;
    }
    
    // Ajouter le joueur à la partie existante
    await joinGame(existingGame.id);
    return existingGame as Game;
  }
  
  // Aucune partie active trouvée, créer une nouvelle partie
  const newGame = await createNewGame();
  // Ajouter le joueur à la nouvelle partie
  await joinGame(newGame.id);
  return newGame;
}

// Créer une nouvelle partie aléatoire
async function createNewGame(): Promise<Game> {
  const expiresAt = getEndOfDayParis();
  
  // Obtenir l'ID utilisateur authentifié si disponible
  let userId: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id || null;
  } catch (error) {
    // Ignorer l'erreur, continuer sans user_id
  }
  
  const { data, error } = await supabase
    .from('games')
    .insert({
      status: 'active',
      expires_at: expiresAt,
      current_step_number: 0,
      next_step_type: 'drawing',
      mode: 'random',
      max_steps: MAX_STEPS,
      user_id: userId // Lier à l'utilisateur authentifié si disponible
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erreur lors de la création de la partie: ${error.message}`);
  }
  
  return data as Game;
}

// Obtenir une partie par ID
export async function getGame(gameId: string): Promise<Game | null> {
  await checkAndCompleteExpiredGames();
  
  try {
    const { data, error } = await retryWithBackoff(async () => {
      const result = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    });

    if (error || !data) {
      logger.warn('Partie non trouvée:', gameId);
      return null;
    }
    
    return data as Game;
  } catch (err) {
    logger.error('Erreur lors de la récupération de la partie:', err);
    return null;
  }
}

// Obtenir une partie avec toutes ses étapes
export async function getGameWithSteps(gameId: string): Promise<GameWithSteps | null> {
  const game = await getGame(gameId);
  
  if (!game) {
    return null;
  }
  
  const { data: steps, error: stepsError } = await supabase
    .from('steps')
    .select('*')
    .eq('game_id', gameId)
    .order('step_number', { ascending: true });
  
  // Obtenir les joueurs (pour parties privées ET multi)
  const { data: playersData } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_active', true)
    .order('joined_at', { ascending: true }); // Ordre d'arrivée
  
  const players = (playersData || []) as Player[];
  
  return {
    ...game,
    steps: (steps || []) as Step[],
    players
  };
}

// Obtenir la dernière étape d'une partie
export async function getLastStep(gameId: string): Promise<Step | null> {
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .eq('game_id', gameId)
    .order('step_number', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data as Step;
}

// Soumettre une étape
export async function submitStep(
  gameId: string,
  stepType: StepType,
  content: string
): Promise<{ success: boolean; step?: Step; game?: Game; error?: string }> {
  // Vérifier que la partie existe et est active
  const game = await getGame(gameId);
  
  if (!game) {
    return { success: false, error: 'Partie non trouvée' };
  }
  
  if (game.status !== 'active') {
    return { success: false, error: 'Partie terminée' };
  }
  
  // Vérifier le type d'étape attendu
  if (stepType !== game.next_step_type) {
    return { 
      success: false, 
      error: `Type d'étape incorrect. Attendu: ${game.next_step_type}, Reçu: ${stepType}` 
    };
  }
  
  // Obtenir le max_steps de la partie (ou utiliser la constante par défaut)
  const maxSteps = game.max_steps || MAX_STEPS;
  
  // Compter les étapes existantes
  const { count } = await supabase
    .from('steps')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId);
  
  const stepCount = count || 0;
  
  if (stepCount >= maxSteps) {
    await supabase
      .from('games')
      .update({ status: 'completed' })
      .eq('id', gameId);
    
    // Mettre à jour la room si c'est une partie privée
    if (game.mode === 'private' && game.room_code) {
      await supabase
        .from('rooms')
        .update({ status: 'completed' })
        .eq('code', game.room_code);
    }
    
    return { success: false, error: `Partie terminée (${maxSteps} étapes atteintes)` };
  }
  
  const newStepNumber = stepCount + 1;
  const playerId = await getOrCreatePlayerId();
  
  // Vérifier que le joueur est dans la partie
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .eq('is_active', true)
    .single();
  
  if (!player) {
    return { success: false, error: 'Vous devez rejoindre la partie avant de jouer' };
  }
  
  // Obtenir tous les joueurs actifs dans l'ordre d'arrivée
  const { data: allPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_active', true)
    .order('joined_at', { ascending: true });
  
  if (!allPlayers || allPlayers.length === 0) {
    return { success: false, error: 'Aucun joueur dans la partie' };
  }
  
  // Vérifier si le joueur a déjà joué à cette étape
  const { data: existingStep } = await supabase
    .from('steps')
    .select('*')
    .eq('game_id', gameId)
    .eq('step_number', newStepNumber)
    .eq('player_id', playerId)
    .single();
  
  if (existingStep) {
    return { success: false, error: 'Vous avez déjà joué à cette étape' };
  }
  
  // ===== VÉRIFICATION DU TOUR (UNIQUEMENT EN MODE PRIVÉ) =====
  // En mode random, tous les joueurs peuvent jouer en même temps
  // En mode privé, on applique une rotation stricte
  if (game.mode === 'private') {
    // Calculer quel joueur doit jouer à cette étape (rotation)
    const playerIndex = allPlayers.findIndex(p => p.player_id === playerId);
    if (playerIndex === -1) {
      return { success: false, error: 'Joueur non trouvé dans la partie' };
    }
    
    // Le joueur qui doit jouer est déterminé par : (stepNumber - 1) % nombreJoueurs
    const expectedPlayerIndex = (newStepNumber - 1) % allPlayers.length;
    
    if (playerIndex !== expectedPlayerIndex) {
      const expectedPlayer = allPlayers[expectedPlayerIndex];
      return { 
        success: false, 
        error: `Ce n'est pas votre tour. C'est au tour de ${expectedPlayer.nickname}` 
      };
    }
  }
  
  // Obtenir l'ID utilisateur authentifié si disponible
  let userId: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id || null;
  } catch (error) {
    // Ignorer l'erreur, continuer sans user_id
  }
  
  // ===== UPLOAD AUDIO VERS SUPABASE STORAGE =====
  // Si c'est un enregistrement audio avec une blob URL, uploader vers Storage
  if (stepType === 'audio' && content.startsWith('blob:')) {
    const blobUrl = content; // Sauvegarder l'URL blob originale
    try {
      logger.debug('🎤 Upload audio vers Supabase Storage...', { gameId, stepNumber: newStepNumber });
      
      // Récupérer le blob depuis l'URL
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du blob: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Déterminer l'extension selon le type MIME
      let fileExt = 'webm'; // Par défaut
      const mimeType = blob.type || 'audio/webm';
      if (mimeType.includes('webm')) fileExt = 'webm';
      else if (mimeType.includes('ogg')) fileExt = 'ogg';
      else if (mimeType.includes('mp4')) fileExt = 'mp4';
      else if (mimeType.includes('aac')) fileExt = 'aac';
      else if (mimeType.includes('wav')) fileExt = 'wav';
      
      // Créer le nom de fichier : {game_id}/{step_number}-{player_id}.{ext}
      const fileName = `${gameId}/${newStepNumber}-${playerId}.${fileExt}`;
      
      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, blob, {
          contentType: mimeType,
          upsert: false, // Ne pas écraser si le fichier existe déjà
        });
      
      if (uploadError) {
        logger.error('❌ Erreur upload audio:', uploadError);
        // Si le fichier existe déjà, récupérer l'URL publique existante
        if (uploadError.message.includes('already exists')) {
          logger.warn('⚠️ Fichier audio existe déjà, utilisation de l\'URL existante');
        } else {
          // Révoquer l'URL blob avant de retourner l'erreur
          URL.revokeObjectURL(blobUrl);
          return { 
            success: false, 
            error: `Erreur lors de l'upload audio: ${uploadError.message}` 
          };
        }
      }
      
      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('audio-recordings')
        .getPublicUrl(fileName);
      
      logger.debug('✅ Audio uploadé avec succès', { fileName, publicUrl });
      
      // Révoquer l'URL blob pour libérer la mémoire
      URL.revokeObjectURL(blobUrl);
      
      // Remplacer le contenu par l'URL publique
      content = publicUrl;
    } catch (error) {
      logger.error('❌ Erreur lors du traitement audio:', error);
      return { 
        success: false, 
        error: `Erreur lors du traitement audio: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  }
  
  // Insérer la nouvelle étape
  const { data: step, error: stepError } = await supabase
    .from('steps')
    .insert({
      game_id: gameId,
      step_number: newStepNumber,
      step_type: stepType,
      content: content,
      player_id: playerId,
      user_id: userId // Lier à l'utilisateur authentifié si disponible
    })
    .select()
    .single();
  
  if (stepError) {
    return { success: false, error: `Erreur lors de la soumission: ${stepError.message}` };
  }
  
  // Calculer le prochain type d'étape
  const nextStepType = getNextStepType(newStepNumber, maxSteps);
  
  // Vérifier si la partie est terminée
  const newStatus = newStepNumber >= maxSteps ? 'completed' : 'active';
  
  // Mettre à jour la partie
  const { data: updatedGame, error: updateError } = await supabase
    .from('games')
    .update({
      current_step_number: newStepNumber,
      next_step_type: nextStepType,
      status: newStatus
    })
    .eq('id', gameId)
    .select()
    .single();
  
  if (updateError) {
    return { success: false, error: `Erreur lors de la mise à jour: ${updateError.message}` };
  }
  
  // Si la partie est terminée et c'est une partie privée, mettre à jour la room
  if (newStatus === 'completed' && game.mode === 'private' && game.room_code) {
    await supabase
      .from('rooms')
      .update({ status: 'completed' })
      .eq('code', game.room_code);
  }
  
  return {
    success: true,
    step: step as Step,
    game: updatedGame as Game
  };
}

// Vérifier le statut d'une partie (pour polling)
export async function checkGameStatus(gameId: string): Promise<{
  status: string;
  stepCount: number;
  nextStepType: StepType;
  maxSteps: number;
} | null> {
  await checkAndCompleteExpiredGames();
  
  const game = await getGame(gameId);
  
  if (!game) {
    return null;
  }
  
  const { count } = await supabase
    .from('steps')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId);
  
  return {
    status: game.status,
    stepCount: count || 0,
    nextStepType: game.next_step_type,
    maxSteps: game.max_steps || MAX_STEPS
  };
}

// S'abonner aux changements d'une partie en temps réel
export function subscribeToGame(
  gameId: string,
  onStepAdded: (step: Step) => void,
  onGameUpdated: (game: Game) => void
) {
  // S'abonner aux nouvelles étapes
  const stepsSubscription = supabase
    .channel(`steps:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'steps',
        filter: `game_id=eq.${gameId}`
      },
      (payload) => {
        onStepAdded(payload.new as Step);
      }
    )
    .subscribe();
  
  // S'abonner aux mises à jour de la partie
  const gameSubscription = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      },
      (payload) => {
        onGameUpdated(payload.new as Game);
      }
    )
    .subscribe();
  
  // Retourner une fonction pour se désabonner
  return () => {
    stepsSubscription.unsubscribe();
    gameSubscription.unsubscribe();
  };
}
