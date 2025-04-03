const express = require('express');
const models = require('../models/generateSchemas'); // טוען את כל המודלים
const roomFunctions = require('../routesFunc/roomFunc'); // טוען את הפונקציות של החדרים
const router = express.Router();

const Room = models.Room; // מקבל את מודל המשתמש

if (!Room) {
  console.error("❌ User model is not loaded correctly!");
}

router.post('/api/rooms/createRoom', roomFunctions.createRoom); // יצירת חדר חדש
router.post('/api/rooms/joinRoom', roomFunctions.joinRoom); // הצטרפות לחדר קיים
router.get('/api/rooms/getAllRooms', roomFunctions.getAllRooms); // קבלת כל החדרים

module.exports = router;
