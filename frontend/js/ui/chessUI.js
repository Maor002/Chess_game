// מארגנת את כל המנהלים
// מספקת API פשוט לשימוש חיצוני
// מתאמת בין כל החלקים
// מנהלת את מחזור החיים של הממשק

import { logger } from "../Logger/logger.js";
import { BoardRenderer } from "./BoardRenderer.js";
import { GameActionHandler } from "./GameActionHandler.js";
import { MovesHighlighter } from "./MovesHighlighter.js";
import { SelectionManager } from "./SelectionManager.js";
import { MovesDisplayManager } from "./MovesDisplayManager.js";
import { GameStatusManager } from "./GameStatusManager.js";
import { LanguageManager } from "../config/Language.js";

export class ChessUI {
  constructor(engine) {
    this.engine = engine;
    this.currentMoveIndex = -1;
    this.initializeElements();
    this.initializeManagers();
    this.bindEvents();
  }

  initializeElements() {
    this.elements = {
      board: document.getElementById("chessBoard"),
      turnIndicator: document.getElementById("turnIndicator"),
      capturedPieces: document.getElementById("capturedPieces"),
      statusMessage: document.getElementById("statusMessage"),
      movesList: document.getElementById("movesList"),
    };
  }

  initializeManagers() {
    this.boardRenderer = new BoardRenderer(this.elements.board);
    this.selectionManager = new SelectionManager(this.boardRenderer);
    this.movesHighlighter = new MovesHighlighter(this.boardRenderer);
    this.movesDisplay = new MovesDisplayManager(this.elements.movesList);
    this.langManager = new LanguageManager();
    this.gameStatus = new GameStatusManager(
      this.elements.turnIndicator,
      this.elements.capturedPieces,
      this.elements.statusMessage
    );
    this.actionHandler = new GameActionHandler(
      this.engine,
      this.selectionManager,
      this.movesHighlighter
    );
  }

  bindEvents() {
    this.handleSquareClick = this.handleSquareClick.bind(this);
  }

  createBoard() {
    try {
      this.boardRenderer.render(this.engine.getBoard(), this.handleSquareClick);
    } catch (error) {
      logger.error("Error creating board:", error);
    }
  }

  handleSquareClick(row, col) {
    try {
      const result = this.actionHandler.handleSquareClick(row, col);

      if (result && result.action === "move_executed") {
        this.updateDisplay();
      }

      return result;
    } catch (error) {
      logger.error("Error handling square click:", error);
    }
  }

  updateDisplay() {
    try {
      this.createBoard();
      this.gameStatus.updateTurn(this.engine.getCurrentPlayer());
      this.gameStatus.updateCapturedPieces(this.engine.getCapturedPieces());
      this.movesDisplay.update(this.engine.historyMoves, this.currentMoveIndex);
    } catch (error) {
      logger.error("Error updating display:", error);
    }
  }

  // פונקציות לניהול מצב המשחק
  showStatusMessage(message, type = "") {
    this.gameStatus.showMessage(message, type);
  }

  clearStatusMessage() {
    this.gameStatus.clearMessage();
  }

  clearSelection() {
    this.selectionManager.clear();
  }

  clearHistoryMoves() {
    this.engine.historyMoves = [];
    this.movesDisplay.clear();
    logger.debug("History of moves cleared");
  }

  // פונקציות חדשות לניווט במהלכים
  goToMove(moveIndex) {
    this.currentMoveIndex = moveIndex;
    this.movesDisplay.highlightMove(moveIndex);
    // כאן אפשר להוסיף לוגיקה לשחזור מצב הלוח
  }

  nextMove() {
    if (this.currentMoveIndex < this.engine.historyMoves.length - 1) {
      this.goToMove(this.currentMoveIndex + 1);
    }
  }

  previousMove() {
    if (this.currentMoveIndex > 0) {
      this.goToMove(this.currentMoveIndex - 1);
    }
  }
}
