const express = require('express');
const router = express.Router();
const models = require('../models/generateSchemas'); // טעינת כל המודלים
const gameFnuctions = require('../routesFunc/gameFunc'); // טעינת הפונקציות של המשחק
const Game = models.Game; // קבלת המודל של המשחק

if (!Game) {
    console.error("❌ Game model is not loaded correctly!");
}

// יצירת משחק חדש
router.post('/createGame',gameFnuctions.createGame ); 

module.exports = router;
