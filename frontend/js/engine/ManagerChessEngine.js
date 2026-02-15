//  * ===== מודול מנוע השחמט =====
//  * מטפל בלוגיקה הבסיסית של המשחק - תנועות, חוקים ומצב המשחק
import { ChessConfig } from "../config/chessConfig.js";
import { logger } from "../logger/logger.js";
import { BoardBuilder } from "./BoardBuilder.js";
import { MoveValidator } from "./MoveValidator.js";
import { MoveExecutor } from "./MoveExecutor.js";
import { ChessFENConverter } from "../../tools/ChessFENConverter.js";
export class ChessEngine {
  constructor(gameMode) {
    this.currentPlayer = ChessConfig.WHITE_PLAYER;
    this.gameActive = true;
    this.isWhiteWin = null;
    this.board = null;
    this.moveValidator = null;
    this.moveExecutor = null;
    this.gameMode = gameMode;
    this.initializeGame();
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
      ` Current player updated to ${this.currentPlayer} (previous: ${previousPlayer})`,
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
        } pieces)`,
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
  isGameOver() {
    return !this.gameActive;
  }
  loadGameFromFEN(fen) {
    try {
      logger.info(` Loading position from FEN: ${fen}`);

      const gameState = ChessFENConverter.parseFEN(fen);

      this.board = gameState.board;
      this.currentPlayer =
        gameState.activeColor === "w"
          ? ChessConfig.WHITE_PLAYER
          : ChessConfig.BLACK_PLAYER;
      this.castlingRights = gameState.castling;
      this.enPassantSquare = gameState.enPassant;
      this.halfmoveClock = gameState.halfmove;
      this.fullmoveNumber = gameState.fullmove;

      if (this.moveValidator) {
        this.moveValidator = new MoveValidator(this.board);
      }
      if (this.moveExecutor) {
        this.moveExecutor = new MoveExecutor(this);
      }

      logger.debug(" Position loaded successfully");
      return true;
    } catch (error) {
      logger.error(" Error loading position from FEN:", error);
      throw new Error(`Failed to load position: ${error.message}`);
    }
  }
  getFEN() {
    const fen = ChessFENConverter.boardToFEN(this.board, this.currentPlayer);
    logger.trace(` Current FEN: ${fen}`);
    return fen;
  }
  setTurn(player) {
    if (
      player !== ChessConfig.WHITE_PLAYER &&
      player !== ChessConfig.BLACK_PLAYER
    ) {
      logger.warn(` Invalid player for turn: ${player}`);
      return;
    }
    logger.debug(` Setting turn to ${player}`);
    this.currentPlayer = player;
  }
}
