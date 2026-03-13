import { ChessEngine } from "../../engine/ManagerChessEngine.js";
import { logger } from "../../logger/logger.js";
import { ChessUI } from "../board-game/ManagerChessUI.js";
import { GameService } from "../../service/api/GameService.js";
import { ChessFENConverter } from "../../../tools/ChessFENConverter.js";

export class ChessGameController {
  constructor(gameMode) {
    this.gameService = new GameService();
    this.gameMode = gameMode;
    this.currentGame = null;
    this.engine = null;
    this.ui = null;
    logger.debug("ChessGameController constructor called");
    // אתחול אסינכרוני
    this.initialize().catch((error) => {
      logger.error("Error during initialization:", error);
    });
  }

  /**
   * אתחול המשחק
   */
  async initialize() {
    logger.info(
      `Starting chess game controller initialization, mode: ${this.gameMode}`,
    );
    switch (this.gameMode) {
      case "local":
        try {
          await this.loadGameData();
          this.initEngine();
          await this.restoreBoardState();
          this.initUI();
          logger.info("Chess game controller initialized successfully");
        } catch (error) {
          logger.error("Error during chess game initialization:", error);
          this.fallbackToNewGame();
        }
        break;
      case "online":
        logger.debug("Initializing online game");
        break;
      default:
        logger.warn("Unknown game mode, defaulting to local");
        this.gameMode = "local";
    }

    window.addEventListener("beforeunload", () => this.ui.saveGame());
  }

  // =====================================================
  // 🔹 Private - Initialization Steps
  // =====================================================

  async loadGameData() {
    this.currentGame = this.gameService.getCurrentLocalGameData();

    if (this.currentGame) {
      logger.info("Loaded saved game from localStorage:", this.currentGame);
      this.gameMode = this.currentGame.gameMode;
      return;
    }

    logger.warn("No saved game in localStorage, trying server...");
    const gameFromServer = await this.gameService.getCurrentLocalGameData();

    if (gameFromServer) {
      logger.info("Game loaded from server:", gameFromServer);
      this.currentGame = gameFromServer;
      this.gameService.setCurrentLocalGame(gameFromServer);
      this.gameMode = gameFromServer.mode || "local";
    } else {
      logger.info("No game found, starting fresh");
      this.gameMode = "local";
    }
  }

  initEngine() {
    logger.debug("Initializing chess engine, mode:", this.gameMode);
    this.engine = new ChessEngine(this.gameMode);
  }

  async restoreBoardState() {
    if (!this.currentGame?.boardState) return;

    // boardState יכול להגיע כמערך או כ-string
    const fen = Array.isArray(this.currentGame.boardState)
      ? this.currentGame.boardState[0]
      : this.currentGame.boardState;

    logger.debug("Restoring board state from FEN:", fen);

    const loaded = this.engine.loadGameFromFEN(fen);
    if (!loaded) logger.error("Failed to load board position from FEN");

    if (this.currentGame.turn) {
      logger.debug("Restoring turn:", this.currentGame.turn);
      this.engine.setTurn(this.currentGame.turn);
    }

    const capturedPieces = ChessFENConverter.getCapturedPiecesDisplay(fen);
    this.engine.setCapturedPieces(capturedPieces);
  }

  initUI() {
    logger.debug("Initializing UI");
    this.ui = new ChessUI(this.engine);
    this.ui.updateDisplay();
    this.ui.clearStatusMessage();
  }

  fallbackToNewGame() {
    logger.warn("Falling back to new game");
    this.gameMode = "local";
    this.engine = new ChessEngine(this.gameMode);
    this.ui = new ChessUI(this.engine);
    this.ui.updateDisplay();
    this.ui.clearStatusMessage();
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
