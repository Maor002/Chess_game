const models = require('../models/generateSchemas'); // ייבוא מודלים
const Game = models.Game; // מודל משחק


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