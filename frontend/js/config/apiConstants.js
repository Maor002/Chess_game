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
