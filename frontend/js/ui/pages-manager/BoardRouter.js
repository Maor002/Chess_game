import { ChessGameController } from "./ChessGameController.js";
import { OnlineGameController } from "./OnlineGameController.js";
import { logger } from "@logger/logger.js";

class BoardRouter {
  constructor() {
    this.gameService = this.getGameService();
    this.initialize();
  }

  async initialize() {
    const gameMode = this.getGameMode();
    logger.info("Board Router - Game Mode:", gameMode);

    if (gameMode === "online") {
      logger.info("Loading OnlineGameController");
      new OnlineGameController();
    } else {
      logger.info("Loading ChessGameController");
      new ChessGameController("local");
    }
  }

  getGameMode() {
    // Check localStorage for game mode
    try {
      const mode = localStorage.getItem("GAME_MODE");
      if (mode) {
        const parsed = JSON.parse(mode);
        return parsed;
      }
    } catch (e) {
      logger.warn("Could not parse game mode from localStorage");
    }
    return "local";
  }

  getGameService() {
    // This would import GameService if needed
    return null;
  }
}

// Initialize on page load
new BoardRouter();
