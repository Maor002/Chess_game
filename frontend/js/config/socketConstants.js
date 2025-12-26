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