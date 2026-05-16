const logger = require("../logger/logger");
const gameFunc = require("../Controller/gameFunc");

function initGameSocket(io) {
  io.on("connection", (socket) => {
    logger.debug(`Player connected: ${socket.id}`);

    // ============================
    // Join Room
    // ============================
    socket.on("game:join", async ({ roomCode, playerId }) => {
      try {
        const result = await gameFunc.joinGameSocket({ roomCode, playerId });

        if (!result) {
          return socket.emit("error", { message: "Room full or not found" });
        }

        const roomId = result.room._id.toString();

        // Store on socket so other events can use it without re-querying
        socket.roomId   = roomId;
        socket.roomCode = roomCode;
        socket.playerId = playerId;

        socket.join(roomId);

        io.to(roomId).emit("game:joined", {
          room: result.room,
          game: result.game,
        });

        logger.info(`Player ${playerId} joined room ${roomCode} (${roomId})`);
      } catch (err) {
        logger.error("Error in game:join:", err);
        socket.emit("error", { message: "Failed to join game" });
      }
    });

    // ============================
    // Make Move
    // ============================
    socket.on("game:move", async ({ from, to, piece, capturedPiece }) => {
      try {
        // Use stored roomCode + playerId — no need to send them from the client each time
        const result = await gameFunc.makeMoveSocket({
          roomCode: socket.roomCode,
          playerId: socket.playerId,
          from,
          to,
          piece,
          capturedPiece,
        });

        if (!result) {
          return socket.emit("error", { message: "Invalid move or not your turn" });
        }

        // Emit to the stored roomId (not roomCode)
        io.to(socket.roomId).emit("game:move", {
          move:       result.move,
          boardState: result.game.boardState,
          nextTurn:   result.nextTurn,
        });
      } catch (err) {
        logger.error("Error in game:move:", err);
        socket.emit("error", { message: "Failed to execute move" });
      }
    });

    // ============================
    // Disconnect
    // ============================
    socket.on("disconnect", () => {
      logger.info(`Player disconnected: ${socket.id} (room: ${socket.roomId ?? "none"})`);

      if (socket.roomId) {
        // Notify the other player in the room
        socket.to(socket.roomId).emit("game:opponent-disconnected", {
          playerId: socket.playerId,
        });
      }
    });
  });
}

module.exports = { initGameSocket };