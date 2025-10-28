// ===== מחלקה לטיפול בפעולות השחקן =====
// מטפלת בלחיצות על הלוח
// מחליטה מה לעשות בכל מצב (בחירה, מהלך, ביטול)
// מתאמת בין השחקן למנוע המשחק
// מנהלת את זרימת המשחק
import {logger} from "../Logger/logger.js";
export class GameActionHandler {
  constructor(engine, selectionManager, movesHighlighter) {
    this.engine = engine;
    this.selectionManager = selectionManager;
    this.movesHighlighter = movesHighlighter;
  }
  // פונקציה לטיפול בלחיצות על משבצות הלוח
  handleSquareClick(row, col) {
    if (!this.engine.getGameStatus()) {
      logger.debug("Click ignored, game not active");
      return false;
    }
    
    const gameState = this.getGameState(row, col);
    if(!this.selectionManager.getSelectedTail() && !gameState.clickedPiece) {
      logger.debug("Click on empty square with no selection, ignoring");
      return false;
    }
    
    return this.processClick(gameState);
  }
  // פונקציה לקבלת מצב המשחק הנוכחי
  getGameState(row, col) {
    const board = this.engine.getBoard();
    return {
      row,
      col,
      clickedPiece: board[row][col],
      selectedSquare: this.selectionManager.getSelectedTail(),
      currentPlayer: this.engine.getCurrentPlayer()
    };
  }
  // פונקציה לעיבוד לחיצות על משבצות הלוח
  processClick({ row, col, clickedPiece, selectedSquare, currentPlayer }) {
    if (selectedSquare) {
      return this.handleSecondClick(row, col, selectedSquare, clickedPiece, currentPlayer);
    } else {
      return this.handleFirstClick(row, col, clickedPiece, currentPlayer);
    }
  }
 // פונקציה לטיפול בלחיצה על משבצת שנבחרה 
  handleSecondClick(row, col, selectedSquare, clickedPiece, currentPlayer) {
    const [selectedRow, selectedCol] = selectedSquare;
    
    // בחירה מחדש של אותה משבצת
    if (this.selectionManager.isSelected(row, col)) {
      this.selectionManager.clearSelectTail();
      return { action: "deselected" };
    }
    
    // ניסיון לבצע מהלך
    if (this.engine.moveValidator.isValidMove(selectedRow, selectedCol, row, col)) {
      return this.executeMove(selectedRow, selectedCol, row, col);
    } else {
      return this.handleInvalidMove(row, col, clickedPiece, currentPlayer);
    }
  }
  // פונקציה לטיפול בלחיצה על משבצת ראשונית
  handleFirstClick(row, col, clickedPiece, currentPlayer) {
    if (clickedPiece && clickedPiece.color === currentPlayer) {
      this.selectPieceAndHighlightMoves(row, col);
      return { action: "selected", row, col };
    }
    return { action: "no_action" };
  }

  executeMove(fromRow, fromCol, toRow, toCol) {
    logger.info(`Executing move from [${fromRow}, ${fromCol}] to [${toRow}, ${toCol}]`);

    const moveResult = this.engine.moveExecutor.executeMove(fromRow, fromCol, toRow, toCol);
    this.selectionManager.clearSelectTail();
    this.engine.switchPlayer();
    
    return { 
      action: "move_executed", 
      from: [fromRow, fromCol], 
      to: [toRow, toCol],
      moveResult 
    };
  }
  // פונקציה לטיפול במהלכים לא חוקיים
  handleInvalidMove(row, col, clickedPiece, currentPlayer) {
    this.selectionManager.clearSelectTail();
    
    if (clickedPiece && clickedPiece.color === currentPlayer) {
      this.selectPieceAndHighlightMoves(row, col);
      return { action: "reselected", row, col };
    }
    
    return { action: "invalid_move" };
  }
  // פונקציה לבחירת כלי
  selectPieceAndHighlightMoves(row, col) {
    this.selectionManager.selectTile(row, col);
    const validMoves = this.engine.moveValidator.getAllValidMoves(row, col);
    this.movesHighlighter.highlightPossibleMoves(validMoves);
    logger.debug(`Selected piece at [${row}, ${col}] with ${validMoves?.length || 0} possible moves`);
  }
}