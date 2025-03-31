const models = require('../models/generateschema.js'); // ייבוא מודלים
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Room = models.Room; // מודל חדר


//יצירת חדר עם קוד
app.post("/api/rooms", async (req, res) => {
    try {
      const code = await generateRoomCode();
      const room = new Room({ code });
      await room.save();
      res.json({ success: true, code });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error creating room", error });
    }
  });
  
  // 🔹 הצטרפות לחדר
  app.post("/api/rooms/join", async (req, res) => {
    try {
      const { code, player } = req.body; // קבלת קוד החדר ושם השחקן
      const room = await Room.findOne({ code });
  
      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found" });
      }
  
      if (room.players.length >= 2) {
        return res.status(400).json({ success: false, message: "Room is full" });
      }
  
      room.players.push(player);
      await room.save();
      res.json({ success: true, message: "Joined room", room });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error joining room", error });
    }
  });


