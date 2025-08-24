// ===== מודול עזר להדגשת מהלכים =====
// מקבלת רשימת מהלכים אפשריים
// מדגישה אותם על הלוח
// זוכרת מה הודגש כדי לנקות אחר כך
import {logger} from "../Logger/logger.js";
export class MovesHighlighter {
  constructor(boardRenderer) {
    this.boardRenderer = boardRenderer;
    this.highlightedSquares = [];
  }
  // פונקציה להדגשת מהלכים אפשריים
  highlight(validMoves) {
    this.clear();
    
    if (!validMoves) return;
    
    validMoves.forEach(([row, col]) => {
      const square = this.boardRenderer.getSquare(row, col);
      if (square) {
        square.classList.add("possible-move");
        this.highlightedSquares.push(square);
      }
    });
    
    logger.debug(`Highlighted ${validMoves.length} possible moves`);
  }
  
  clear() {
    this.highlightedSquares.forEach(square => {
      square.classList.remove("possible-move");
    });
    this.highlightedSquares = [];
  }
}