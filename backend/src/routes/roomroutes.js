const express = require('express');
const models = require('../models/generateSchemas'); // טוען את כל המודלים
const roomFunctions = require('../routesFunc/roomFunc'); // טוען את הפונקציות של החדרים
const router = express.Router();

const Room = models.Room; // מקבל את מודל המשתמש

if (!Room) {
  console.error("❌ User model is not loaded correctly!");
}

// יצירת משתמש חדש
router.post('/register',userFunctions.register);
router.post('/login',userFunctions.login);
router.post('/createRoom', roomFunctions.createRoom); // יצירת חדר חדש
router.post('/joinRoom', roomFunctions.joinRoom); // הצטרפות לחדר קיים
module.exports = router;
