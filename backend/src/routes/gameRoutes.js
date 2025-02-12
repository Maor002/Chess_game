const express = require('express');
const router = express.Router();
const models = require('../models/generateSchemas'); // טעינת כל המודלים
const Game = models.Game; // קבלת המודל של המשחק

if (!Game) {
    console.error("❌ Game model is not loaded correctly!");
}
// שליפת כל המשחקים
router.get('/allGames', async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (error) {
        console.error(" Error fetching games:", error);
        res.status(500).json({ message: error.message });
    }
});

// יצירת משחק חדש
router.post('/createGame', async (req, res) => {
    try {
        const { white, black } = req.body;
        if (!white || !black) {
            return res.status(400).json({ message: 'Both white and black players must be provided' });
        }

        const game = new Game({
            players: { white, black },
            boardState: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
            moves: [],
        });

        await game.save();
        res.status(201).json(game);
    } catch (error) {
        console.error(" Error creating game:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
