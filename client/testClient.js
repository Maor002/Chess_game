const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.emit('join_game', "game123");

socket.on('game_state', (game) => console.log("♟️ Current Game State:", game));

socket.on('receive_move', (move) => console.log(`🛑 Opponent moved: ${move}`));

setTimeout(() => {
    console.log("🎯 Sending move...");
    socket.emit('make_move', { gameId: "game123", move: "e2-e4" });
}, 3000);
