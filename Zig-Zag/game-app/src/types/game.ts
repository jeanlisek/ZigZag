// Types pour le jeu multijoueur ZigZag

export type StepType = 'drawing' | 'text' | 'audio';

export type GameStatus = 'active' | 'completed';

// Statuts pour les parties privées
export type RoomStatus = 'waiting' | 'in_progress' | 'completed';

export type GameMode = 'random' | 'private';

export interface Game {
  id: string;
  status: GameStatus;
  created_at: string;
  expires_at: string;
  current_step_number: number;
  next_step_type: StepType;
  mode: GameMode;
  room_code?: string;
  max_steps?: number;
  creator_id?: string;
}

export interface Step {
  id: string;
  game_id: string;
  step_number: number;
  step_type: StepType;
  content: string;
  created_at: string;
  player_id?: string;
}

export interface Player {
  id: string;
  game_id: string;
  player_id: string; // ID stocké côté client (localStorage)
  nickname: string;
  joined_at: string;
  is_creator: boolean;
  is_active: boolean;
}

export interface Room {
  id: string;
  code: string;
  game_id: string;
  status: RoomStatus;
  created_at: string;
  creator_id: string;
  player_count: number;
}

export interface RoomWithPlayers extends Room {
  players: Player[];
  game?: Game;
}

export interface GameWithSteps extends Game {
  steps: Step[];
  players?: Player[];
}

// Séquence des types d'étapes : dessin → texte → audio → dessin → texte → audio...
// Le premier joueur commence toujours par un dessin (step 1)
export const STEP_SEQUENCE: StepType[] = [
  'drawing', // Step 1 (premier joueur)
  'text',    // Step 2
  'audio',   // Step 3
  'drawing', // Step 4
  'text',    // Step 5
  'audio',   // Step 6
  'drawing', // Step 7
  'text',    // Step 8
  'audio',   // Step 9
  'drawing', // Step 10
  'text',    // Step 11
  'audio',   // Step 12
  'drawing', // Step 13
  'text',    // Step 14
  'audio',   // Step 15
  'drawing', // Step 16
  'text',    // Step 17
  'audio',   // Step 18
  'drawing', // Step 19
  'text',    // Step 20
  'audio'    // Step 21
];

export const MAX_STEPS = 10;
export const MIN_PLAYERS_PRIVATE = 3;
export const BASE_STEPS_PRIVATE = 6; // 6 étapes pour 3 joueurs
export const STEPS_PER_EXTRA_PLAYER = 2; // +2 étapes par joueur supplémentaire

// Fonction pour obtenir le type d'étape suivant
export function getNextStepType(currentStepNumber: number, maxSteps: number = MAX_STEPS): StepType {
  const index = currentStepNumber % STEP_SEQUENCE.length;
  return STEP_SEQUENCE[index];
}

// Calculer le nombre d'étapes pour une partie privée
export function calculateMaxSteps(playerCount: number): number {
  if (playerCount < MIN_PLAYERS_PRIVATE) {
    return BASE_STEPS_PRIVATE;
  }
  // 3 joueurs = 6 étapes, 4 joueurs = 8 étapes, 5 joueurs = 10 étapes, etc.
  return BASE_STEPS_PRIVATE + (playerCount - MIN_PLAYERS_PRIVATE) * STEPS_PER_EXTRA_PLAYER;
}

// Générer un code de room unique (6 caractères alphanumériques)
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter la confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
