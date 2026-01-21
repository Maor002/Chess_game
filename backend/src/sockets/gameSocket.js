const logger = require("../logger/logger");
const gameFunc = require("../Controller/gameFunc");


function initGameSocket(io) {
  io.on("connection", (socket) => {
    logger.debug(`Player connected: ${socket.id}`);


    // ============================
    // הצטרפות לשחקן שני
    // ============================
    socket.on("game:join", async ({ roomCode, playerId }) => {
      try {
        const result = await gameFunc.joinGameSocket({ roomCode, playerId });
        if (!result) {
          return socket.emit("error", { message: "Room full or not found" });
        }

        socket.join(result.room._id.toString());

        // שליחת עדכון לכל השחקנים בחדר
        io.to(result.room._id.toString()).emit("game:joined", {
          room: result.room,
          game: result.game,
        });

        logger.info(`Player ${playerId} joined room ${roomCode}`);
      } catch (err) {
        logger.error("Error joining game via socket:", err);
        socket.emit("error", { message: "Failed to join game" });
        
      }
    });

    // ============================
    // ביצוע מהלך
    // ============================
    socket.on("game:move", async ({ roomCode, playerId, from, to, piece, capturedPiece }) => {
      try {
        const result = await gameFunc.makeMoveSocket({
          roomCode,
          playerId,
          from,
          to,
          piece,
          capturedPiece,
        });

        if (!result) {
          return socket.emit("error", { message: "Invalid move or not your turn" });
        }

        // שליחת העדכון לכל השחקנים בחדר
        io.to(roomCode).emit("game:move", {
          move: result.move,
          boardState: result.game.boardState,
          nextTurn: result.nextTurn,
        });
      } catch (err) {
        logger.error("Error in game:move event:", err);
        socket.emit("error", { message: "Failed to execute move" });
      }
    });

    // ============================
    // התנתקות שחקן
    // ============================
    socket.on("disconnect", () => {
      logger.info(`Player disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initGameSocket };
