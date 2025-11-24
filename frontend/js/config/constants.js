// frontend/js/config/constants.js

export const API_ENDPOINTS = {
  // Game endpoints
  CREATE_GAME: '/api/game/createGame',
  JOIN_GAME: '/api/game/joinGame',
  GET_GAME: '/api/game/getGame',
  LEAVE_GAME: '/api/game/leaveGame',
  
  // Move endpoints
  MAKE_MOVE: '/api/game/makeMove',
  GET_MOVES: '/api/game/getMoves',
  
  // Game actions
  RESIGN: '/api/game/resign',
  OFFER_DRAW: '/api/game/offerDraw',
  ACCEPT_DRAW: '/api/game/acceptDraw',
  DECLINE_DRAW: '/api/game/declineDraw',
  
  // Player endpoints
  GET_PLAYER: '/api/player/getPlayer',
  UPDATE_PLAYER: '/api/player/updatePlayer',
  
  // Stats endpoints
  GET_STATS: '/api/stats/getStats',
  GET_HISTORY: '/api/stats/getHistory'
};

export const ROUTES = {
  MENU: '/index.html',
  BOARD: '/html/Board.html',
  PUZZLES: '/html/Puzzles.html',
  SETTINGS: '/html/Settings.html'
};

export const GAME_MODES = {
  LOCAL: 'local',
  ONLINE: 'online',
  VS_COMPUTER: 'computer',
  PUZZLES: 'puzzles'
};

export const PLAYER_COLORS = {
  WHITE: 'white',
  BLACK: 'black',
  RANDOM: 'random'
};

export const TIME_CONTROLS = [
  { id: 'bullet_1', minutes: 1, increment: 0, name: 'Bullet 1+0' },
  { id: 'bullet_2', minutes: 2, increment: 1, name: 'Bullet 2+1' },
  { id: 'blitz_3', minutes: 3, increment: 0, name: 'Blitz 3+0' },
  { id: 'blitz_5', minutes: 5, increment: 0, name: 'Blitz 5+0' },
  { id: 'rapid_10', minutes: 10, increment: 0, name: 'Rapid 10+0' },
  { id: 'rapid_15', minutes: 15, increment: 10, name: 'Rapid 15+10' },
  { id: 'classic_30', minutes: 30, increment: 0, name: 'Classical 30+0' }
];

export const GAME_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  ABANDONED: 'abandoned'
};

export const END_REASONS = {
  CHECKMATE: 'checkmate',
  STALEMATE: 'stalemate',
  RESIGNATION: 'resignation',
  TIMEOUT: 'timeout',
  DRAW_AGREEMENT: 'draw_agreement',
  INSUFFICIENT_MATERIAL: 'insufficient_material',
  THREEFOLD_REPETITION: 'threefold_repetition',
  FIFTY_MOVE_RULE: 'fifty_move_rule'
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Game flow
  JOIN_GAME: 'joinGame',
  LEAVE_GAME: 'leaveGame',
  GAME_STARTED: 'gameStarted',
  GAME_ENDED: 'gameEnded',
  
  // Moves
  MOVE_MADE: 'moveMade',
  MOVE_ERROR: 'moveError',
  
  // Players
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  OPPONENT_DISCONNECTED: 'opponentDisconnected',
  OPPONENT_RECONNECTED: 'opponentReconnected',
  
  // Game actions
  DRAW_OFFERED: 'drawOffered',
  DRAW_ACCEPTED: 'drawAccepted',
  DRAW_DECLINED: 'drawDeclined',
  RESIGNATION: 'resignation',
  
  // Chat (optional)
  CHAT_MESSAGE: 'chatMessage'
};

export const STORAGE_KEYS = {
  GAME_ID: 'chess_game_id',
  PLAYER_ID: 'chess_player_id',
  PLAYER_NAME: 'chess_player_name',
  PLAYER_COLOR: 'chess_player_color',
  GAME_MODE: 'chess_game_mode',
  TIME_CONTROL: 'chess_time_control',
  PREFERENCES: 'chess_preferences'
};

export const DEFAULT_PREFERENCES = {
  soundEnabled: true,
  showLegalMoves: true,
  autoPromoteToQueen: false,
  confirmMoves: false,
  highlightLastMove: true,
  theme: 'default'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  GAME_NOT_FOUND: 'Game not found.',
  INVALID_MOVE: 'Invalid move.',
  NOT_YOUR_TURN: 'Not your turn.',
  GAME_ALREADY_ENDED: 'Game has already ended.',
  PLAYER_NOT_IN_GAME: 'You are not in this game.',
  SERVER_ERROR: 'Server error. Please try again.'
};