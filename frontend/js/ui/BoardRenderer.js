// ===== מודול עזר לתצוגת הלוח =====
// מודול זה אחראי על יצירת תצוגת הלוח והכלים בלוח השחמט
// הוא מספק פונקציות ליצירת ריבועים בלוח ולרענון התצוגה של הלוח 
import { ChessConfig } from "../config/chessConfig.js";
export class BoardRenderer {
  constructor(boardElement) {
    this.boardElement = boardElement;
    this.squares = new Map(); // מטמון למשבצות
  }
  
  createSquare(row, col, piece, clickHandler) {
    const square = document.createElement("div");
    square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
    square.dataset.row = row;
    square.dataset.col = col;
    
    const squareKey = `${row}-${col}`;
    this.squares.set(squareKey, square);
    
    if (clickHandler) {
      square.onclick = () => clickHandler(row, col);
    }
    
    this.updateSquareContent(square, piece);
    return square;
  }
  
  updateSquareContent(square, piece) {
    square.textContent = piece 
      ? ChessConfig.pieces[piece.color + piece.type] 
      : "";
  }
  
  render(board, clickHandler) {
    const fragment = document.createDocumentFragment();
    this.squares.clear();
    
    for (let row = 0; row < ChessConfig.BOARD_SIZE; row++) {
      for (let col = 0; col < ChessConfig.BOARD_SIZE; col++) {
        const square = this.createSquare(row, col, board[row][col], clickHandler);
        fragment.appendChild(square);
      }
    }
    
    this.boardElement.innerHTML = "";
    this.boardElement.appendChild(fragment);
  }
  
  getSquare(row, col) {
    return this.squares.get(`${row}-${col}`);
  }
  
  // עדכון מהיר של משבצת בודדת במקום כל הלוח
  updateSquare(row, col, piece) {
    const square = this.getSquare(row, col);
    if (square) {
      this.updateSquareContent(square, piece);
    }
  }
}