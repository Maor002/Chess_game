const models = require('../models/generateschema.js'); // ייבוא מודלים
const Game = models.Game; // מודל משחק

exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.find(); // מציאת כל המשחקים
        res.json(games); // מחזיר רשימת משחקים
    } catch (error) {
        console.error("❌ Error fetching games:", error);
        res.status(500).json({ message: error.message });
    }    }
}