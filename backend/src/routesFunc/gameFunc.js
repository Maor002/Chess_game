const models = require('../models/generateschema.js'); // ייבוא מודלים
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Game = models.Game; // מודל משחק
const User = models.User; // מודל משתמש

const User = require('../models/User'); // לוודא שזה הנתיב הנכון

exports.createGame = async (req, res) => {
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
}