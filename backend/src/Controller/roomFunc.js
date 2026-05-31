const { models } = require("../schema-generators/generateSchemas"); // ייבוא מודלים
const logger = require("../logger/logger");
const mongoose = require('mongoose');

const TEMP_USER_ID = new mongoose.Types.ObjectId("6a0b681f4a6db2d9b20d8190");
//יצירת חדר עם קוד
exports.createRoom = async (req, res) => {
  try {  
    const Room = models.Room;
    if (!Room) return res.status(500).json({ success: false, message: "Internal server error" });

    const code = await generateRoomCode();
    const room = new Room({
      code,
      host: TEMP_USER_ID,
      players: { white: { userId: TEMP_USER_ID } },
    });

    await room.save();
    res.json({ success: true, code });
  } catch (err) {
    logger.error("❌ Error creating room:", err);
    res.status(500).json({ success: false, message: "Failed to create room" });
  }
};

// 🔹 הצטרפות לחדר
exports.joinRoom = async (req, res) => {
  try {
    const Room = models.Room;
    if (!Room) return res.status(500).json({ success: false, message: "Internal server error" });

    const { roomId } = req.body;
    if (!roomId) return res.status(400).json({ success: false, message: "Code is required" });

    const room = await Room.findOne({ code: roomId });
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (room.status === "full") return res.status(400).json({ success: false, message: "Room is full" });

    room.players.black = { userId: TEMP_USER_ID };
    room.status = "full";
    await room.save();

    res.json({ success: true, room });
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