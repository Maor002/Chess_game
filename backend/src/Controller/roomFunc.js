const { models } = require("../schema-generators/generateSchemas"); // ייבוא מודלים
const logger = require("../logger/logger");

//יצירת חדר עם קוד
exports.createRoom = async (req, res) => {
  try {
    const Room = models.Room;

    if (!Room) {
      return res
        .status(500)
        .json({ success: false, message: "Room model not loaded yet" });
    }
    logger.info("CREATE ROOM REQUEST");
    logger.debug("Request body:", req.body);

    const code = await generateRoomCode();
    const room = new Room({ code });
    await room.save();
    res.json({ success: true, code });
    logger.info("Room created with code:", code);
  } catch (error) {
    logger.error("Error creating room:", error);
    res
      .status(500)
      .json({ success: false, message: "Error creating room", error });
  }
};

// 🔹 הצטרפות לחדר
exports.joinRoom = async (req, res) => {
  try {
    const { code, player } = req.body; // קבלת קוד החדר ושם השחקן
    const room = await Room.findOne({ code });

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    logger.info(`JOIN ROOM REQUEST for code: ${code}, player: ${player}`);
    logger.debug("Request body:", req.body);
    if (room.players.length >= 2) {
      return res.status(400).json({ success: false, message: "Room is full" });
    }

    room.players.push(player);
    await room.save();
    res.json({ success: true, message: "Joined room", room });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error joining room", error });
  }
};

//קבלת כל החדרים
exports.getAllrooms = async (req, res) => {
  try {
    const rooms = await Room.find({}, { _id: 1, name: 1, code: 1 }); // קבלת כל החדרים
    res.status(200).json(rooms);
  } catch (error) {
    logger.error("❌ Error fetching rooms:", error);
    res.status(500).json({ message: error.message });
  }
};
