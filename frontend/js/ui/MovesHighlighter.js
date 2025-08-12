// ===== מודול עזר להדגשת מהלכים =====
// מודול זה אחראי על הדגשת המהלכים האפשריים בלוח השחמט
// הוא מספק פונקציות להדגשת המהלכים האפשריים ולניקוי ההדגשות הקודמות
import {logger} from "../Logger/logger.js";
export class MovesHighlighter {
  constructor(boardRenderer) {
    this.boardRenderer = boardRenderer;
    this.highlightedSquares = [];
  }
  
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