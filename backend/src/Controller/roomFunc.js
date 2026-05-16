const { models } = require("../schema-generators/generateSchemas"); // ייבוא מודלים
const logger = require("../logger/logger");

//יצירת חדר עם קוד
exports.createRoom = async (req, res) => {
  try {
  const Room = models.Room;
  const code = await generateRoomCode();
if (!Room) {
  logger.error("❌ Room model is not loaded correctly!");
  return res.status(500).json({ success: false, message: "Internal server error" });
}
  const room = new Room({
    code,
    host: req.user._id,          // comes from your auth middleware
    players: { white: { userId: req.user._id } },  // creator is white by default
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
  const { code } = req.body;
  const room = await models.Room.findOne({ code });

  if (!room) return res.status(404).json({ success: false, message: "Room not found" });
  if (room.status === "full") return res.status(400).json({ success: false, message: "Room is full" });

  // Assign the joining player to black (white is the host)
  room.players.black = { userId: req.user._id };
  room.status = "full";

  await room.save();
  res.json({ success: true, room });
};
exports.checkRoomExists = async (req, res) => {
  if (!req.params.roomId) {
    return res.status(400).json({ success: false, message: "Room ID is required" });
  }
  const { code } = req.query;
  const room = await models.Room.findOne({ code });

  if (!room) return res.json({ exists: false });
  if (room.status === "full" || room.status === "closed")
    return res.json({ exists: true, available: false, message: "Room is full" });

  res.json({ exists: true, available: true });
};
//קבלת כל החדרים
exports.getAllrooms = async (req, res) => {
  const rooms = await models.Room.find({}, { _id: 1, name: 1, code: 1 });
  res.status(200).json(rooms);
};

generateRoomCode = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  while (true) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const existingRoom = await models.Room.findOne({ code });
    if (!existingRoom) break;
  }
  return code;
}