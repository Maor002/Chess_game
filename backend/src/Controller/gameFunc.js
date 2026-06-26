const { models } = require("../schema-generators/generateSchemas");
const logger = require("../logger/logger");
const mongoose = require("mongoose");

/* ============================
    REST: יצירת משחק
============================ */
exports.createGame = async (req, res) => {
  if (res.headersSent) return;

  try {
    const Game = models.Game;
    if (!Game) return res.status(500).json({ error: "Game model not loaded yet" });

    const whitePlayer = typeof req.body.white === "string"
      ? { color: "white" }
      : req.body.white || { color: "white" };

    const blackPlayer = typeof req.body.black === "string"
      ? { color: "black" }
      : req.body.black;

    const newGame = new Game({
      players: {
        white: whitePlayer,
        black: blackPlayer || null,
      },
      boardState: req.body.boardState || "startpos",
      moves: [],
      status: "in_progress",
      turn: req.body.turn || "white",
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame.toObject());
  } catch (err) {
    logger.error("Error creating game:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to create game", message: err.message });
    }
  }
};

/* ============================
    Socket.IO: הצטרפות לשחקן שני
============================ */
exports.joinGameSocket = async ({ roomCode, playerId }) => {
  // FIX: read models inside the function, not at module load time
  const Room = models.Room;
  const Game = models.Game;

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
  // FIX: read models inside the function — models object is populated async
  // and may be empty if read at module-load time (top-level const Room = models.Room)
  const Room = models.Room;
  const Game = models.Game;

  try {
    console.log("🔍 makeMoveSocket called:", { roomCode, playerId, from, to, piece });

    const room = await Room.findOne({ code: roomCode }).populate("gameId");
    if (!room) {
      logger.warn("makeMoveSocket: room not found for code:", roomCode);
      return null;
    }

    const game = await Game.findById(room.gameId._id);
    if (!game) {
      logger.warn("makeMoveSocket: game not found");
      return null;
    }

    console.log("🔍 game.turn:", game.turn);
    console.log("🔍 white userId:", game.players.white?.userId?.toString());
    console.log("🔍 black userId:", game.players.black?.userId?.toString());
    console.log("🔍 playerId received:", playerId);

    const whiteId = game.players.white?.userId?.toString();
    const blackId = game.players.black?.userId?.toString();
    const playerIdStr = playerId?.toString();

    let playerColor;
    if (whiteId && whiteId === playerIdStr && blackId !== playerIdStr) {
      playerColor = "white";
    } else if (blackId && blackId === playerIdStr && whiteId !== playerIdStr) {
      playerColor = "black";
    } else {
      // Both players share the same userId in dev/temp mode —
      // trust game.turn so moves alternate correctly
      logger.warn("makeMoveSocket: cannot distinguish players by userId, falling back to game.turn");
      playerColor = game.turn;
    }

    if (game.turn !== playerColor) {
      logger.warn(`Not player's turn. turn=${game.turn}, playerColor=${playerColor}`);
      return null;
    }

    // Store move as a proper object matching the schema
    game.moves.push({
      from,
      to,
      piece: piece || "",
      fenAfter: game.boardState,
      timestamp: new Date(),
    });

    // boardState is a String field — overwrite, never push
    game.boardState = `${from}-${to}`;

    game.turn = game.turn === "white" ? "black" : "white";
    await game.save();

    const nextTurnClient = game.turn === "white" ? "w" : "b";
    logger.info(`Move saved: ${from}->${to}, next turn: ${game.turn}`);

    return {
      game,
      move: { from, to, piece: piece || null, capturedPiece: capturedPiece || null },
      nextTurn: nextTurnClient,
    };
  } catch (err) {
    logger.error("Error making move via socket:", err);
    console.log("FULL ERROR:", err);
    throw err;
  }
};

exports.generatePlayerId = () =>
  `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;