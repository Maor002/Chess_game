// מארגנת את כל המנהלים
// מספקת API פשוט לשימוש חיצוני
// מתאמת בין כל החלקים
// מנהלת את מחזור החיים של הממשק

import { logger } from "../../Logger/logger.js";
import { BoardRenderer } from "./BoardRenderer.js";
import { GameActionHandler } from "./GameActionHandler.js";
import { MovesHighlighter } from "./MovesHighlighter.js";
import { SelectionManager } from "./SelectionManager.js";
import { MovesListManager } from "./MovesListManager.js";
import { GameStatusManager } from "./GameStatusManager.js";
import { LanguageManager } from "../../language/Language.js";
import { AlertManager } from "../Alerts/AlertManager.js";

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
    this.langManager = new LanguageManager(this);// מנהל השפה
    this.boardRenderer = new BoardRenderer(this.elements.board);//מנהל תצוגת הלוח
    this.selectionManager = new SelectionManager(this.boardRenderer);//מנהל הבחירה אריח על הלוח
    this.movesHighlighter = new MovesHighlighter(this.boardRenderer);//מנהל הדגשת מהלכים
    this.MovesListManager = new MovesListManager(this.elements.movesList);//מנהל תצוגת היסטוריית מהלכים
    this.gameStatus = new GameStatusManager(
      this.elements.turnIndicator,
      this.elements.capturedPieces,
      this.elements.statusMessage,
      this.langManager
    );// מנהל מצב שבדף המשחק
    this.actionHandler = new GameActionHandler(
      this.engine,
      this.selectionManager,
      this.movesHighlighter
    );//פונקצייה לטיפול בפעולות משתמש על הלוח 
      this.alertManager = new AlertManager(this);// מנהל התראות ופופאפים

  }

  createBoard() {
    try {
      this.boardRenderer.render(this.engine.getBoard(), this.handleSquareClick);
    } catch (error) {
      logger.error("Error creating board:", error);
    }
  }

  bindEvents() {
    this.handleSquareClick = this.handleSquareClick.bind(this);//קישור לפונקציית לחיצה על ריבוע
  }

//פעולה בעת לחיצה על אריח
  handleSquareClick(row, col) {
    try {
      const result = this.actionHandler.handleSquareClick(row, col);

      if (result && result.action === "move_executed") {
        this.updateDisplay();
        this.alertManager.alertGameOver();
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
      this.MovesListManager.clearMovesList();
      this.MovesListManager.updateListofMoves(this.engine.getHistoryMoves(), this.currentMoveIndex);
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
    this.selectionManager.clearSelectTail();
  }

  clearHistoryMoves() {
    this.engine.getHistoryMoves().length = 0;
    this.MovesListManager.clearMovesList();
    logger.debug("History of moves cleared");
  }

  // פונקציות חדשות לניווט במהלכים
  goToMove(moveIndex) {
    this.currentMoveIndex = moveIndex;
    this.MovesListManager.highlightMove(moveIndex);
    // כאן אפשר להוסיף לוגיקה לשחזור מצב הלוח
  }

  nextMove() {
    if (this.currentMoveIndex < this.engine.getHistoryMoves().length - 1) {
      this.goToMove(this.currentMoveIndex + 1);
    }
  }

  previousMove() {
    if (this.currentMoveIndex > 0) {
      this.goToMove(this.currentMoveIndex - 1);
    }
  }
  startNewGame() {
    this.engine.startNewGame();
    this.clearHistoryMoves();
    this.clearSelection();
    this.updateDisplay();
    this.clearStatusMessage();
    logger.debug("New game started.");
  }
}
