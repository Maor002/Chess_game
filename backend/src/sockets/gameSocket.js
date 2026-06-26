const logger = require("../logger/logger");
const gameFunc = require("../Controller/gameFunc");
const { models } = require("../schema-generators/generateSchemas");
const mongoose = require("mongoose");

// Must match the IDs the REST layer assigns
const TEMP_USER_ID   = new mongoose.Types.ObjectId("6a0b681f4a6db2d9b20d8190"); // white
const TEMP_USER_ID_2 = new mongoose.Types.ObjectId("6a0b681f4a6db2d9b20d8192"); // black

function initGameSocket(io) {
  io.on("connection", (socket) => {
    logger.debug(`Player connected: ${socket.id}`);

    // ============================
    // Rejoin Room — white reconnecting after page refresh
    // ============================
    socket.on("game:rejoin", async ({ roomCode }) => {
      try {
        const Room = models.Room;
        const room = await Room.findOne({ code: roomCode });
        if (!room) return socket.emit("error", { message: "Room not found" });

        const roomId = room._id.toString();
        socket.roomId      = roomId;
        socket.roomCode    = roomCode;
        socket.playerColor = "white";
        socket.playerId    = TEMP_USER_ID.toString();

        // Persist the live socketId
        room.players.white.socketId = socket.id;
        await room.save();

        socket.join(roomId);
        logger.info(`White rejoined: ${roomCode} (${roomId}), playerId: ${socket.playerId}`);
      } catch (err) {
        logger.error("Error in game:rejoin:", err);
      }
    });

    // ============================
    // Join Room — black connecting for the first time
    // ============================
    socket.on("game:join", async ({ roomCode }) => {
      try {
        const Room = models.Room;
        const room = await Room.findOne({ code: roomCode }).populate("gameId");

        if (!room) return socket.emit("error", { message: "Room not found" });
        if (room.status !== "waiting" && room.status !== "full") {
          return socket.emit("error", { message: "Room not available" });
        }

        const roomId = room._id.toString();
        socket.roomId      = roomId;
        socket.roomCode    = roomCode;
        socket.playerColor = "black";
        socket.playerId    = TEMP_USER_ID_2.toString();

        // REST joinRoom already set players.black.userId — only update socketId
        if (!room.players.black) {
          room.players.black = { userId: TEMP_USER_ID_2, socketId: socket.id };
        } else {
          room.players.black.socketId = socket.id;
        }
        room.status = "in_game";
        await room.save();

        socket.join(roomId);

        io.to(roomId).emit("game:started", {
          room,
          game: room.gameId,
          players: {
            white: room.players.white,
            black: room.players.black,
          },
        });

        logger.info(`Black joined room ${roomCode} - Game started`);
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
        const result = await gameFunc.makeMoveSocket({
          roomCode: socket.roomCode,
          playerId: socket.playerId,
          from, to, piece, capturedPiece,
        });

        if (!result) {
          return socket.emit("error", { message: "Invalid move or not your turn" });
        }

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
        socket.to(socket.roomId).emit("game:opponent-disconnected", {
          playerId: socket.playerId,
          message: "Opponent has left the game",
        });
      }
    });
  });
}

module.exports = { initGameSocket };