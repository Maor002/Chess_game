const { models } = require("../schema-generators/generateSchemas"); // ייבוא מודלים
const logger = require("../logger/logger");
const mongoose = require('mongoose');

const TEMP_USER_ID = new mongoose.Types.ObjectId("6a0b681f4a6db2d9b20d8190");
const TEMP_USER_ID_2 = new mongoose.Types.ObjectId("6a0b681f4a6db2d9b20d8192");
//יצירת חדר עם קוד
exports.createRoom = async (req, res) => {
  try {
    const Room = models.Room;
    const Game = models.Game;
    if (!Room || !Game) return res.status(500).json({ success: false, message: "Internal server error" });

    const code = await generateRoomCode();

    // Create the game first
    const gameData = {
      players: {
        white: { userId: TEMP_USER_ID, color: "white" },
        black: { userId: TEMP_USER_ID_2, color: "black" },
      },
      boardState: "startpos",
      moves: [],
      status: "waiting",
      turn: "white",
    };
    const newGame = new Game(gameData);
    const savedGame = await newGame.save();

    const room = new Room({
      code,
      host: TEMP_USER_ID,
      players: { white: { userId: TEMP_USER_ID, socketId: null }, black: { userId: TEMP_USER_ID_2, socketId: null } },
      gameId: savedGame._id,
      status: "waiting",
    });

    await room.save();
    res.json({ success: true, code, roomId: room._id.toString(), gameId: savedGame._id.toString() });
  } catch (err) {
    logger.error("❌ Error creating room:", err);
    res.status(500).json({ success: false, message: "Failed to create room" });
  }
};

// 🔹 הצטרפות לחדר
exports.joinRoom = async (req, res) => {
  try {
    const Room = models.Room;
    const Game = models.Game;
    if (!Room || !Game) return res.status(500).json({ success: false, message: "Internal server error" });

    const { roomId } = req.body;
    if (!roomId) return res.status(400).json({ success: false, message: "Code is required" });

    const room = await Room.findOne({ code: roomId }).populate("gameId");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (room.status === "full" || room.status === "in_game") return res.status(400).json({ success: false, message: "Room is full" });

    // Add second player as black
    room.players.black = { userId: TEMP_USER_ID, socketId: null };

    // Update game with second player
    const game = room.gameId;
    game.players.black = { userId: TEMP_USER_ID, color: "black" };

    // Mark room as full and game as in_progress
    room.status = "full";
    game.status = "in_progress";

    await room.save();
    await game.save();

    res.json({ success: true, room, game });
  } catch (err) {
    logger.error("❌ Error joining room:", err);
    res.status(500).json({ success: false, message: "Failed to join room" });
  }
};
exports.checkRoomExists = async (req, res) => {
  try {
    const Room = models.Room;
    if (!Room) return res.status(500).json({ success: false, message: "Internal server error" });

    const { roomId } = req.params;
    if (!roomId) return res.status(400).json({ success: false, message: "Code is required" });

    const room = await Room.findOne({ code: roomId });
    if (!room) return res.json({ exists: false });
    if (room.status === "full" || room.status === "closed")
      return res.json({ exists: true, available: false, message: "Room is full" });

    res.json({ exists: true, available: true });
  } catch (err) {
    logger.error("❌ Error checking room:", err);
    res.status(500).json({ success: false, message: "Failed to check room" });
  }
};

const generateRoomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};