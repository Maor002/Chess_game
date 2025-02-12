const { Server } = require('socket.io');

const setupSocket = (server) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('join_game', (gameId) => {
      socket.join(gameId);
      console.log(`Player joined game: ${gameId}`);
    });

    socket.on('make_move', (data) => {
      const { gameId, move } = data;
      socket.to(gameId).emit('receive_move', move);
    });
  });
};

module.exports = { setupSocket };
