//  * ===== מודול מנוע השחמט =====
//  * מטפל בלוגיקה הבסיסית של המשחק - תנועות, חוקים ומצב המשחק
import { ChessConfig } from "../config/chessConfig.js";
import { logger } from "../Logger/logger.js";
import { BoardBuilder } from "./BoardBuilder.js";
import { MoveValidator } from "./MoveValidator.js";
import { MoveExecutor } from "./MoveExecutor.js";

export class ChessEngine {
  constructor() {
    this.gameActive = true;
    this.currentPlayer = ChessConfig.WHITE_PLAYER;
    this.board = [];
    this.startNewGame();
    this.initializeManager();
    logger.debug("Creating new chess engine");
  }
  startNewGame() {
    this.currentPlayer = ChessConfig.WHITE_PLAYER; // הגדרת השחקן הנוכחי כלבן
    this.gameActive = true; // הגדרת המשחק כפעיל
    this.boardBuilder = new BoardBuilder();
    this.board =  this.boardBuilder.initializeBoard();
    logger.debug("starting new game");
  }
  initializeManager() {
    this.moveExecutor = new MoveExecutor(this.board, this.gameActive);
    this.moveValidator = new MoveValidator(this.board);
  }
  switchPlayer() {
    logger.debug(` Switching player from ${this.currentPlayer}`);

    try {
      const previousPlayer = this.currentPlayer;
      this.currentPlayer =
        this.currentPlayer === ChessConfig.WHITE_PLAYER
          ? ChessConfig.BLACK_PLAYER
          : ChessConfig.WHITE_PLAYER;

      logger.info(
        ` Current player updated to ${this.currentPlayer} (previous: ${previousPlayer})`
      );
    } catch (errofr) {
      logger.error(" Error switching player:", error);
      throw new Error(`Failed to switch player: ${error.message}`);
    }
  }
  getBoard() {
 return this.board
  }

  getCapturedPieces() {
    logger.debug(
      ` Returning captured pieces list (${
        this.moveExecutor.getCapturedPieces().length
      } pieces)`
    );
    try {
      return this.moveExecutor.getCapturedPieces();
    } catch (error) {
      logger.error(" Error returning captured pieces:", error);
      return [];
    }
  }
  getCurrentPlayer() {
    logger.debug(` Current player: ${this.currentPlayer}`);
    return this.currentPlayer;
  }
  getHistoryMoves() {
    return this.moveExecutor.getHistoryMoves();
  }
  getGameStatus() {
    return this.gameActive;
  }
}
