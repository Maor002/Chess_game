
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

