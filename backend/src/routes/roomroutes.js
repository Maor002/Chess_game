const express = require('express');
const models = require('../models/generateSchemas'); // טעינת כל המודלים
const roomFunctions = require('../Controller/roomFunc'); // טוען את הפונקציות של החדרים
const logger = require("../logger/logger");
const router = express.Router();

const Room = models.Room; // מקבל את מודל המשתמש

if (!Room) {
  logger.error("❌ User model is not loaded correctly!");
}

router.post('/createRoom', roomFunctions.createRoom); // יצירת חדר חדש
router.post('/joinRoom', roomFunctions.joinRoom); // הצטרפות לחדר קיים
router.get('/getAllRooms', roomFunctions.getAllrooms); // קבלת כל החדרים

module.exports = router;
