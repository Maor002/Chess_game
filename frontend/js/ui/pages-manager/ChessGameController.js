import { ChessEngine } from "../../engine/ManagerChessEngine.js";
import { logger } from "../../logger/logger.js";
import { ChessUI } from "../board-game/ManagerChessUI.js";
import { GameService } from "../../service/api/GameService.js";

export class ChessGameController {
  constructor() {
    this.gameService = new GameService();
    this.gameMode = null;
    this.currentGame = null;
    this.engine = null;
    this.ui = null;
    
    logger.debug("ChessGameController constructor called");
    
    // קריאה ל-initialize בצורה אסינכרונית
    this.initialize().catch(error => {
      logger.error("Error during initialization:", error);
    });
  }

  /**
   * אתחול המשחק
   */
  async initialize() {
    logger.info("Starting chess game controller initialization");
    
    try {
      // קבלת נתוני המשחק השמורים
      this.currentGame = this.gameService.getCurrentGameData();
      
      if (this.currentGame) {
        logger.info("Loading saved game:", this.currentGame);
        this.gameMode = this.currentGame.mode;
      } else {
        logger.warn("No saved game found in localStorage");
        
        // ניסיון לקבל מהשרת (במקרה של רענון דף)
        const gameFromServer = await this.gameService.getCurrentGame();
        
        if (gameFromServer) {
          logger.info("Game loaded from server:", gameFromServer);
          this.currentGame = gameFromServer;
          this.gameService.setCurrentGame(gameFromServer);
          this.gameMode = gameFromServer.mode || "local";
        } else {
          logger.info("No game found on server, starting fresh");
          this.gameMode = "local";
        }
      }
      
      // אתחול המנוע והUI אחרי שיש לנו את הנתונים
      logger.debug("Initializing chess engine");
      this.engine = new ChessEngine();
      
      // טעינת מצב הלוח אם יש
      if (this.currentGame?.boardState?.[0]) {
        logger.debug("Loading board state:", this.currentGame.boardState[0]);
        const loaded = this.engine.loadGameFromFEN(this.currentGame.boardState[0]);
        
        if (!loaded) {
          logger.error("Failed to load board position");
        }
      }
      
      // הגדרת התור
      if (this.currentGame?.turn) {
        logger.debug("Setting turn to:", this.currentGame.turn);
        this.engine.setTurn(this.currentGame.turn);
      }
      
      // אתחול UI
      logger.debug("Initializing UI");
      this.ui = new ChessUI(this.engine);
      
      // עדכון התצוגה
      this.ui.updateDisplay();
      this.ui.clearStatusMessage();
      
      logger.info("Chess game controller initialized successfully");
      
    } catch (error) {
      logger.error("Error during chess game initialization:", error);
      
      // במקרה של שגיאה, התחל משחק רגיל
      logger.warn("Falling back to new game");
      this.engine = new ChessEngine();
      this.ui = new ChessUI(this.engine);
      this.gameMode = "local";
      this.ui.updateDisplay();
      this.ui.clearStatusMessage();
    }
  }

  /**
   * עדכון מצב המשחק אחרי כל מהלך
   */
  async updateGameState() {
    try {
      if (this.currentGame) {
        const updatedGame = {
          ...this.currentGame,
          boardState: [this.engine.getFEN()],
          turn: this.engine.getCurrentTurn(),
          status: this.engine.isGameOver() ? "completed" : "active",
        };
        
        logger.debug("Updating game state:", updatedGame);
        this.gameService.setCurrentGame(updatedGame);
        
        // שמירה גם בשרת
        if (updatedGame._id) {
          await this.gameService.makeMove({
            fen: this.engine.getFEN(),
            turn: this.engine.getCurrentTurn(),
          });
          logger.debug("Game state saved to server");
        }
      }
    } catch (error) {
      logger.error("Error updating game state:", error);
    }
  }

  /**
   * קבלת מצב המשחק הנוכחי
   */
  getGameState() {
    if (!this.engine) {
      logger.warn("Engine not initialized yet");
      return null;
    }
    
    return {
      mode: this.gameMode,
      boardState: this.engine.getFEN(),
      turn: this.engine.getCurrentTurn(),
      gameId: this.currentGame?._id,
    };
  }
}

const gameController = new ChessGameController();