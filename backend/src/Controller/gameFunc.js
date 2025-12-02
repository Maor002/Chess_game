const { models } = require("../models/generateSchemas");
const logger = require("../logger/logger");
exports.createGame = async (req, res) => {
  // Prevent duplicate responses
  if (res.headersSent) {
    logger.info("Headers already sent, skipping response");
    return;
  }

  try {
    logger.info("CREATE GAME REQUEST");
    logger.debug("Request body:", req.body);
    
    const Game = models.Game;
    
    if (!Game) {
      logger.error("Game model not found!");
      return res.status(500).json({ error: "Game model not loaded yet" });
    }
    
    const gameData = {
      players: {
        white: req.body.white,
        black: req.body.black,
      },
      boardState: req.body.boardState || "startpos",
      moves: [],
      status: "in_progress",
      turn: req.body.turn || "white",
    };
    
    logger.info("Creating game with data:", gameData);
    
    const newGame = new Game(gameData);
    
    logger.info("Game instance created, saving...");
    
    const savedGame = await newGame.save();
    
    logger.info("Game saved successfully:", savedGame._id);
    logger.info("Sending response...");
    
    // Convert to plain object to avoid circular references
    const response = savedGame.toObject();
    
    res.status(201).json(response);
    
    logger.info("Response sent!");
    
  } catch (err) {
    logger.error("=== ERROR CREATING GAME ===");
    logger.error("Error type:", err.name);
    logger.error("Error message:", err.message);
    logger.error("Full error:", err);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to create game",
        message: err.message 
      });
    }
  }
};