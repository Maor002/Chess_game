/**
 * ===== מודול ממשק המשתמש =====
 * מטפל בתצוגה ובאינטראקציה עם המשתמש
 */

import { ChessConfig } from "../config/chessConfig.js";
import { logger } from "../Logger/logger.js";
export class ChessUI {
  constructor(engine) {
    this.engine = engine;
    this.selectedSquare = null;
    this.boardElement = document.getElementById("chessBoard");
    this.turnIndicator = document.getElementById("turnIndicator");
    this.capturedPiecesElement = document.getElementById("capturedPieces");
    this.statusMessage = document.getElementById("statusMessage");
    this.historyMovesElement = document.getElementById("movesList");
  }

  /**
   * יצירת הלוח הגרפי
   */
  createBoard() {
    this.boardElement.innerHTML = "";
    const board = this.engine.getBoard();

    for (let row = 0; row < ChessConfig.BOARD_SIZE; row++) {
      for (let col = 0; col < ChessConfig.BOARD_SIZE; col++) {
        const square = this.createSquare(row, col, board[row][col]);
        this.boardElement.appendChild(square);
      }
    }
  }

  /**
   * יצירת משבצת בודדת
   * @param {number} row - מספר השורה
   * @param {number} col - מספר העמודה
   * @param {Piece} piece - הכלי במשבצת
   * @returns {HTMLElement} אלמנט המשבצת
   */
  createSquare(row, col, piece) {
    const square = document.createElement("div");
    square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
    square.dataset.row = row;
    square.dataset.col = col;

    square.onclick = () => this.handleSquareClick(row, col);

    if (piece) {
      square.textContent = ChessConfig.pieces[piece.color + piece.type];
    }

    return square;
  }

  /**
   * טיפול בלחיצה על משבצת
   * @param {number} row - שורה שנלחצה
   * @param {number} col - עמודה שנלחצה
   */
  handleSquareClick(row, col) {
    try {
      if (!this.engine.gameActive) {
        logger.debug("Click ignored, game not active");
        return;
      }

      const board = this.engine.getBoard();
      const clickedPiece = board[row][col];
      const currentPlayer = this.engine.getCurrentPlayer();

      if (this.selectedSquare) {
        const [selectedRow, selectedCol] = this.selectedSquare;

        if (row === selectedRow && col === selectedCol) {
          this.clearSelection();
          logger.debug("Deselected square");
          return;
        }

        if (this.engine.isValidMove(selectedRow, selectedCol, row, col)) {
          logger.info(
            `Valid move from [${selectedRow}, ${selectedCol}] to [${row}, ${col}]`
          );
          this.engine.makeMove(selectedRow, selectedCol, row, col);
          this.clearSelection();
          this.engine.switchPlayer();
          this.updateDisplay();
        } else {
          logger.debug(
            `Invalid move from [${selectedRow}, ${selectedCol}] to [${row}, ${col}]`
          );
          this.clearSelection();
          if (clickedPiece && clickedPiece.color === currentPlayer) {
            this.selectSquare(row, col);
          }
        }
      } else {
        logger.debug("No square selected, checking clicked piece");
        if (clickedPiece && clickedPiece.color === currentPlayer) {
          this.selectSquare(row, col);
          logger.debug(`Selected square [${row}, ${col}]`);
        }
      }
    } catch (error) {
      logger.error("Error handling square click:", error);
    }
  }

  /**
   * בחירת משבצת
   * @param {number} row - שורה לבחירה
   * @param {number} col - עמודה לבחירה
   */
  selectSquare(row, col) {
    try {
      this.selectedSquare = [row, col];
      const square = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
      );
      if (square) {
        square.classList.add("selected");
        this.highlightPossibleMoves(row, col);
      }
    } catch (error) {
      logger.error("Error selecting square:", error);
    }
  }

  /**
   * ביטול בחירה
   */
  clearSelection() {
    try {
      document.querySelectorAll(".square").forEach((square) => {
        square.classList.remove("selected", "possible-move");
      });
      this.selectedSquare = null;
      logger.debug("Selection cleared");
    } catch (error) {
      logger.error("Error clearing selection:", error);
    }
  }

  /**
   * הדגשת מהלכים אפשריים
   * @param {number} row - שורת הכלי הנבחר
   * @param {number} col - עמודת הכלי הנבחר
   */
  highlightPossibleMoves(row, col) {
    try {
      const allValidMoves = this.engine.getAllValidMoves(row, col);
      if (!allValidMoves) return;

      allValidMoves.forEach(([r, c]) => {
        const square = document.querySelector(
          `[data-row="${r}"][data-col="${c}"]`
        );
        if (square) {
          square.classList.add("possible-move");
        }
      });

      logger.debug(`Highlighted ${allValidMoves.length} possible moves`);
    } catch (error) {
      logger.error("Error highlighting moves:", error);
    }
  }

  /**
   * עדכון התצוגה
   */
  updateDisplay() {
    try {
      this.createBoard();
      this.updateTurnIndicator();
      this.updateCapturedPieces();
      this.updateMovesDisplay();
    } catch (error) {
      logger.error("Error updating display:", error);
    }
  }

  /**
   * עדכון מחוון התור
   */
  updateTurnIndicator() {
    const currentPlayer = this.engine.getCurrentPlayer();
    this.turnIndicator.textContent =
      currentPlayer === ChessConfig.WHITE_PLAYER ? "תור הלבן" : "תור השחור";
  }

  /**
   * עדכון רשימת הכלים שנתפסו
   */
  updateCapturedPieces() {
    const capturedPieces = this.engine.getCapturedPieces();
    this.capturedPiecesElement.textContent = capturedPieces.join(" ");
  }

  /**
   * הצגת הודעת מצב
   * @param {string} message - ההודעה להצגה
   * @param {string} type - סוג ההודעה (check, checkmate)
   */
  showStatusMessage(message, type = "") {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message ${type}`;
  }

  /**
   * ניקוי הודעת המצב
   */
  clearStatusMessage() {
    this.statusMessage.textContent = "";
    this.statusMessage.className = "status-message";
  }

updateMovesDisplay() {
  this.historyMovesElement.innerHTML = "";

  for (let i = 0; i < this.engine.historyMoves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = this.engine.historyMoves[i];
    const blackMove = this.engine.historyMoves[i + 1];

    const movePair = document.createElement("div");
    movePair.className = "move-pair";

    const moveNumberElement = document.createElement("div");
    moveNumberElement.className = "move-number";
    moveNumberElement.textContent = `${moveNumber}.`;

    const whiteMoveElement = document.createElement("div");
    whiteMoveElement.className = "move-white";
    const whiteMoveString = JSON.stringify(whiteMove);
    whiteMoveElement.textContent = whiteMoveString ;
    if (i === this.currentMoveIndex)
      whiteMoveElement.classList.add("move-active");

    movePair.appendChild(moveNumberElement);
    movePair.appendChild(whiteMoveElement);

    if (blackMove) {
      const blackMoveElement = document.createElement("div");
      blackMoveElement.className = "move-black";
      const blackMoveString = JSON.stringify(blackMove);
      blackMoveElement.textContent = blackMoveString;
      if (i + 1 === this.currentMoveIndex)
        blackMoveElement.classList.add("move-active");

      movePair.appendChild(blackMoveElement);
    }

    this.historyMovesElement.appendChild(movePair);
  }
}

  clearHistoryMoves() {
    this.engine.historyMoves = [];
    this.historyMovesElement.innerHTML = "";
    logger.debug(` History of moves cleared`);
  }
}
