const express = require('express');
const models = require('../models/generateSchemas'); // טוען את כל המודלים
const router = express.Router();

const User = models.User; // מקבל את מודל המשתמש

if (!User) {
  console.error("❌ User model is not loaded correctly!");
}

// יצירת משתמש חדש
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!User) {
      return res.status(500).json({ message: "User model is not available" });
    }

    const user = await User.create({ username, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// קבלת כל המשתמשים (לדוגמה בלבד)
router.get('/allUsers', async (req, res) => {
  try {
    if (!User) {
      return res.status(500).json({ message: "User model is not available" });
    }

    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
