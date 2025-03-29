const models = require('../models/generateschema.js'); // ייבוא מודלים
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Game = models.Game; // מודל משחק
const User = models.User; // מודל משתמש

const User = require('../models/User'); // לוודא שזה הנתיב הנכון

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }
        // בדיקה אם המשתמש כבר קיים לפי email או username
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        // הצפנת הסיסמה עם bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        // יצירת משתמש חדש עם סיסמה מוצפנת
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).json({ message: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Both email and password must be provided' });
        }
        // חיפוש המשתמש לפי אימייל בלבד
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // השוואת הסיסמה המוצפנת עם הסיסמה שהמשתמש שלח
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // יצירת טוקן JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET, // צריך לשמור את זה בקובץ `.env`
            { expiresIn: '2h' } // הטוקן יהיה תקף לשעתיים
        );
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error("❌ Error during login:", error);
        res.status(500).json({ message: error.message });
    }
};
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


