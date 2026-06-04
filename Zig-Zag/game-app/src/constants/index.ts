/**
 * Constantes de l'application
 */

export const GAME_CONSTANTS = {
  MAX_STEPS: 10,
  STEP_TIMEOUT: 60000, // 60 secondes en millisecondes
  MIN_PLAYERS_PRIVATE: 2,
  MAX_PLAYERS_PRIVATE: 8,
} as const;

export const STEP_TYPES = {
  DRAWING: 'drawing',
  TEXT: 'text',
  AUDIO: 'audio',
} as const;

export const GAME_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const GAME_MODES = {
  RANDOM: 'random',
  PRIVATE: 'private',
} as const;

export const ROUTES = {
  HOME: '/jeu',
  GAME: '/jeu',
  MATCHMAKING: '/jeu/matchmaking',
  PRIVATE: '/jeu/privee',
  ROOM: (code: string) => `/jeu/room/${code}`,
  GAME_PAGE: (id: string) => `/jeu/${id}`,
  GAME_RESULTS: (id: string) => `/jeu/${id}/results`,
} as const;

export const MESSAGES = {
  LOADING: 'Chargement...',
  ERROR_GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
  ERROR_NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
  ERROR_AUTH: 'Vous devez être connecté pour accéder à cette page.',
  SUCCESS_SUBMIT: 'Votre contribution a été enregistrée !',
  WAITING_PLAYER: 'En attente du prochain joueur...',
  GAME_NOT_FOUND: 'Partie non trouvée',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
} as const;
