const { Server } = require('socket.io');
const models = require('../models/generateSchemas'); // ייבוא מודלים
const Game = models.Game; // טוען את מודל המשחק

const setupSocket = (server) => {
    const io = new Server(server, { cors: { origin: '*' } });

    io.on('connection', (socket) => {
        console.log(`🔌 Player connected: ${socket.id}`);

        socket.on('join_game', async (gameId) => {
            socket.join(gameId);
            console.log(`👤 Player joined game: ${gameId}`);

            // שליחת מצב המשחק הנוכחי לכל מי שמתחבר
            const game = await Game.findById(gameId);
            if (game) {
                socket.emit('game_state', game);
            }
        });

        socket.on('make_move', async ({ gameId, move }) => {
            console.log(`🎯 Move received for game ${gameId}:`, move);

            // עדכון מסד הנתונים
            const game = await Game.findById(gameId);
            if (!game) return;

            game.moves.push(move);
            await game.save();

            // שליחת העדכון לכל המשתתפים במשחק
            io.to(gameId).emit('receive_move', move);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Player disconnected: ${socket.id}`);
        });
    });
};

module.exports = { setupSocket };
