//  * ===== מודול מנוע השחמט =====
//  * מטפל בלוגיקה הבסיסית של המשחק - תנועות, חוקים ומצב המשחק
import { ChessConfig } from "../config/chessConfig.js";
import {logger} from "../logger/logger.js";
import { BoardBuilder } from "./BoardBuilder.js";
import { MoveValidator } from "./MoveValidator.js";
import { MoveExecutor } from "./MoveExecutor.js";
export class ChessEngine {
  constructor() {
    this.currentPlayer = ChessConfig.WHITE_PLAYER;
    this.gameActive = true;
    this.initializeGame();
    this.isWhiteWin = null;
    logger.debug("Chess engine created successfully");
  }
  //  מאתחל את כל מערכות המשחק
  initializeGame() {
    this.resetGameState(); // אתחול מצב המשחק
    this.initializeManagers(); // אתחול מנהלי המשחק
    logger.debug("Game initialized and ready to start");
  }

  // מאתחל את מנהלי הלוח והמהלכים
  initializeManagers() {
    this.board = new BoardBuilder().initializeBoard();
    this.moveExecutor = new MoveExecutor(this);
    this.moveValidator = new MoveValidator(this.board);
  }

  // מאפס את מצב המשחק להתחלה חדשה
  resetGameState() {
    this.currentPlayer = ChessConfig.WHITE_PLAYER;
    this.gameActive = true;
    this.isWhiteWin = false;
  }

  //   מתחיל משחק חדש - מאפס הכל ומאתחל מחדש
  startNewGame() {
    this.resetGameState();
    this.board = new BoardBuilder().initializeBoard();
    this.moveValidator = new MoveValidator(this.board);
    this.moveExecutor = new MoveExecutor(this);
    logger.debug("New game started successfully");
  }

  switchPlayer() {
    logger.debug(` Switching player from ${this.currentPlayer}`);
    const previousPlayer = this.currentPlayer;
    this.currentPlayer =
      this.currentPlayer === ChessConfig.WHITE_PLAYER
        ? ChessConfig.BLACK_PLAYER
        : ChessConfig.WHITE_PLAYER;

    logger.info(
      ` Current player updated to ${this.currentPlayer} (previous: ${previousPlayer})`
    );
  }
  getBoard() {
    return this.board;
  }

  getCapturedPieces() {
    try {
      logger.debug(
        ` Returning captured pieces list (${
          this.moveExecutor.getCapturedPieces().length
        } pieces)`
      );
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
