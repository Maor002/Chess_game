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
    if (!this.engine.gameActive) {
      logger.debug("Click ignored, game not active");
      return false;
    }
    
    const gameState = this.getGameState(row, col);
    return this.processClick(gameState);
  }
  // פונקציה לקבלת מצב המשחק הנוכחי
  getGameState(row, col) {
    const board = this.engine.getBoard();
    return {
      row,
      col,
      clickedPiece: board[row][col],
      selectedSquare: this.selectionManager.getSelected(),
      currentPlayer: this.engine.getCurrentPlayer()
    };
  }
  // פונקציה לעיבוד לחיצות על משבצות הלוח
  processClick({ row, col, clickedPiece, selectedSquare, currentPlayer }) {
    if (selectedSquare) {
      return this.handleSelectedSquareClick(row, col, selectedSquare, clickedPiece, currentPlayer);
    } else {
      return this.handleInitialClick(row, col, clickedPiece, currentPlayer);
    }
  }
 // פונקציה לטיפול בלחיצה על משבצת שנבחרה 
  handleSelectedSquareClick(row, col, selectedSquare, clickedPiece, currentPlayer) {
    const [selectedRow, selectedCol] = selectedSquare;
    
    // בחירה מחדש של אותה משבצת
    if (this.selectionManager.isSelected(row, col)) {
      this.selectionManager.clear();
      return { action: "deselected" };
    }
    
    // ניסיון לבצע מהלך
    if (this.engine.isValidMove(selectedRow, selectedCol, row, col)) {
      return this.executeMove(selectedRow, selectedCol, row, col);
    } else {
      return this.handleInvalidMove(row, col, clickedPiece, currentPlayer);
    }
  }
  // פונקציה לטיפול בלחיצה על משבצת ראשונית
  handleInitialClick(row, col, clickedPiece, currentPlayer) {
    if (clickedPiece && clickedPiece.color === currentPlayer) {
      this.selectPiece(row, col);
      return { action: "selected", row, col };
    }
    return { action: "no_action" };
  }

  executeMove(fromRow, fromCol, toRow, toCol) {
    logger.info(`Executing move from [${fromRow}, ${fromCol}] to [${toRow}, ${toCol}]`);
    
    const moveResult = this.engine.makeMove(fromRow, fromCol, toRow, toCol);
    this.selectionManager.clear();
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
    this.selectionManager.clear();
    
    if (clickedPiece && clickedPiece.color === currentPlayer) {
      this.selectPiece(row, col);
      return { action: "reselected", row, col };
    }
    
    return { action: "invalid_move" };
  }
  // פונקציה לבחירת כלי
  selectPiece(row, col) {
    this.selectionManager.select(row, col);
    const validMoves = this.engine.getAllValidMoves(row, col);
    this.movesHighlighter.highlight(validMoves);
    logger.debug(`Selected piece at [${row}, ${col}] with ${validMoves?.length || 0} possible moves`);
  }
}