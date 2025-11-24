const { models } = require("../models/generateSchemas");

exports.createGame = async (req, res) => {
  try {
    const Game = models.Game;
    
    if (!Game) {
      return res.status(500).json({ error: "Game model not loaded yet" });
    }
    
    const newGame = new Game({
      players: {
        white: req.body.white,
        black: req.body.black,
      },
      boardState: req.body.boardState || "startpos",
      moves: [],
      status: "in_progress",
      turn: "white",
    });
    
    await newGame.save();
    res.status(201).json(newGame);
  } catch (err) {
    console.error("Error creating game:", err);
    res.status(500).json({ error: "Failed to create game" });
  }
};