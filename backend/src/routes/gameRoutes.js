const express = require('express');
const router = express.Router();
const gameFnuctions = require('../Controller/gameFunc'); // טעינת הפונקציות של המשחק
const models = require('../Controller/gameFunc'); // טעינת כל המודלים
const Game = models.Game; // קבלת המודל של המשחק

if (!Game) {
    console.error("❌ Game model is not loaded correctly!");
}

// יצירת משחק חדש
router.post('/createGame',gameFnuctions.createGame ); 

module.exports = router;
