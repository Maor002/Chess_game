const { models } = require("../schema-generators/generateSchemas");
const logger = require("../logger/logger");

const Game = models.Game;
const Room = models.Room;

/* ============================
    REST: יצירת משחק
============================ */
exports.createGame = async (req, res) => {
  // Prevent duplicate responses
  if (res.headersSent) {
    logger.info("Headers already sent, skipping response");
    return;
  }

  try {
    logger.info("CREATE GAME REQUEST");
    logger.debug("Request body:", req.body);
    
    const Game = models.Game;
    
    if (!Game) {
      logger.error("Game model not found!");
      return res.status(500).json({ error: "Game model not loaded yet" });
    }
    
    const gameData = {
      players: {
        white: req.body.white,
        black: req.body.black,
      },
      boardState: req.body.boardState || "startpos",
      moves: [],
      status: "in_progress",
      turn: req.body.turn || "white",
    };

    logger.debug("Creating game with data:", gameData);

    const newGame = new Game(gameData);
    
    logger.info("Game instance created, saving...");
    
    const savedGame = await newGame.save();
    
    logger.info("Game saved successfully:", savedGame._id);
    logger.info("Sending response...");
    
    // Convert to plain object to avoid circular references
    const response = savedGame.toObject();
    
    res.status(201).json(response);
    
    logger.info("Response sent!");
    
  } catch (err) {
    logger.error("=== ERROR CREATING GAME ===");
    logger.error("Error type:", err.name);
    logger.error("Error message:", err.message);
    logger.error("Full error:", err);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to create game",
        message: err.message 
      });
    }
  }
};

/* ============================
    Socket.IO: הצטרפות לשחקן שני
============================ */
exports.joinGameSocket = async ({ roomCode, playerId }) => {
  try {
    const room = await Room.findOne({ code: roomCode }).populate("gameId");
    if (!room || room.players.black) return null;
    room.players.black = playerId;
    room.status = "ready";
    await room.save();

    const game = await Game.findById(room.gameId._id);
    game.players.black = playerId;
    await game.save();

    return { game, room };
  } catch (err) {
    logger.error("Error joining game via socket:", err);
    throw err;
  }
};

/* ============================
    Socket.IO: ביצוע מהלך
============================ */
exports.makeMoveSocket = async ({ roomCode, playerId, from, to, piece, capturedPiece }) => {
  try {
    const room = await Room.findOne({ code: roomCode }).populate("gameId");
    if (!room) return null;

    const game = await Game.findById(room.gameId._id);
    if (!game) return null;

    const playerColor = game.players.white === playerId ? "white" : "black";
    if (game.turn !== playerColor) return null;

    const moveStr = `${piece}:${from}->${to}` + (capturedPiece ? `x${capturedPiece}` : "");
    game.moves.push(moveStr);
    game.boardState.push(`${from}-${to}`);
    game.turn = game.turn === "white" ? "black" : "white";

    await game.save();
    return { game, move: moveStr, nextTurn: game.turn };
  } catch (err) {
    logger.error("Error making move via socket:", err);
    throw err;
  }
};

/* ============================
    פונקציה ליצירת מזהה שחקן ייחודי
============================ */
function generatePlayerId() {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
exports.generatePlayerId = generatePlayerId;
