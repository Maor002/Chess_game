/**
 * ===== מודול ממשק המשתמש =====
 * מטפל בתצוגה ובאינטראקציה עם המשתמש
 */
class ChessUI {
  constructor(engine) {
    this.engine = engine;
    this.selectedSquare = null;
    this.boardElement = document.getElementById("chessBoard");
    this.turnIndicator = document.getElementById("turnIndicator");
    this.capturedPiecesElement = document.getElementById("capturedPieces");
    this.statusMessage = document.getElementById("statusMessage");
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
   * @param {string} piece - הכלי במשבצת
   * @returns {HTMLElement} אלמנט המשבצת
   */
  createSquare(row, col, piece) {
    const square = document.createElement("div");
    square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
    square.dataset.row = row;
    square.dataset.col = col;

    square.onclick = () => this.handleSquareClick(row, col);

    if (piece) {
      square.textContent = ChessConfig.pieces[piece];
    }

    return square;
  }

  /**
   * טיפול בלחיצה על משבצת
   * @param {number} row - שורה שנלחצה
   * @param {number} col - עמודה שנלחצה
   */
  handleSquareClick(row, col) {
    if (!this.engine.gameActive) return;

    const board = this.engine.getBoard();
    const clickedPiece = board[row][col];
    const currentPlayer = this.engine.getCurrentPlayer();

    if (this.selectedSquare) {
      const [selectedRow, selectedCol] = this.selectedSquare;

      if (row === selectedRow && col === selectedCol) {
        // ביטול בחירה
        this.clearSelection();
        return;
      }

      // ניסיון לבצע מהלך
      if (this.engine.isValidMove(selectedRow, selectedCol, row, col)) {
        this.engine.makeMove(selectedRow, selectedCol, row, col);
        this.clearSelection();
        this.engine.switchPlayer();
        this.updateDisplay();
      } else {
        this.clearSelection();
        // בחירת כלי חדש אם שייך לשחקן הנוכחי
        if (clickedPiece && clickedPiece[0] === currentPlayer) {
          this.selectSquare(row, col);
        }
      }
    } else {
      // בחירת כלי אם שייך לשחקן הנוכחי
      if (clickedPiece && clickedPiece[0] === currentPlayer) {
        this.selectSquare(row, col);
      }
    }
  }

  /**
   * בחירת משבצת
   * @param {number} row - שורה לבחירה
   * @param {number} col - עמודה לבחירה
   */
  selectSquare(row, col) {
    this.selectedSquare = [row, col];
    const square = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    square.classList.add("selected");
    this.highlightPossibleMoves(row, col);
  }

  /**
   * ביטול בחירה
   */
  clearSelection() {
    document.querySelectorAll(".square").forEach((square) => {
      square.classList.remove("selected", "possible-move");
    });
    this.selectedSquare = null;
  }

  /**
   * הדגשת מהלכים אפשריים
   * @param {number} row - שורת הכלי הנבחר
   * @param {number} col - עמודת הכלי הנבחר
   */
  highlightPossibleMoves(row, col) {
    // סריקה של כל המשבצות האפשריות
    const allValidMoves = this.engine.getAllValidMoves(row, col);
    if (!allValidMoves) return;
    allValidMoves.forEach((move) => {
      const [r, c] = move;
      const square = document.querySelector(
        `[data-row="${r}"][data-col="${c}"]`
      );
      if (square) {
        square.classList.add("possible-move");
      }
    });
  }

  /**
   * עדכון התצוגה
   */
  updateDisplay() {
    this.createBoard();
    this.updateTurnIndicator();
    this.updateCapturedPieces();
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
    this.capturedPiecesElement.textContent = capturedPieces
      .map((piece) => ChessConfig.pieces[piece])
      .join(" ");
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
}
