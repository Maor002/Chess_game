//  * ===== מודול מנוע השחמט =====
//  * מטפל בלוגיקה הבסיסית של המשחק - תנועות, חוקים ומצב המשחק
class ChessEngine {
  constructor() {
    this.board = [];
    this.currentPlayer = ChessConfig.WHITE_PLAYER;
    this.capturedPieces = [];
    this.gameActive = true;
    this.initializeBoard();
  }
  initializeBoard() {
    this.board = ChessConfig.initialBoard.map((row) => [...row]);
    this.currentPlayer = ChessConfig.WHITE_PLAYER;
    this.capturedPieces = [];
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    const capturedPiece = this.board[toRow][toCol];
    if (capturedPiece) {
      this.capturedPieces.push(capturedPiece);
    }
    this.board[toRow][toCol] = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = "";
  }
  getValidMoves(row, col) {
    const validMoves = [];
    const piece = this.board[row][col];
    switch (piece[1]) {
      case "P": // רגלי
        this.getPawnMoves(validMoves, piece, row, col);
        break;
      case "R": // צריח
        this.getRookMoves(validMoves, row, col);
        break;
      case "N": // סוס
        this.getKnightMoves(validMoves, row, col);
        break;
      case "B": // רץ
        this.getBishopMoves(validMoves, row, col);
        break;
      case "Q": // מלכה
        this.getQueenMoves(validMoves, row, col);
        break;
      case "K": // מלך
        this.getKingMoves(validMoves, row, col);
        break;
    }

    return validMoves;
  }
  getPawnMoves(validMoves, piece, row, col) {
    const direction = piece[0] === "w" ? -1 : 1; // כיוון התנועה של הרגלי
    if (row === 0 || row === 7) return; // רגלי לא יכול לזוז בשורה הראשונה או האחרונה

    if (this.board[row + direction][col] === "")
      // אם המשבצת קדימה פנויה
      validMoves.push([row + direction, col]);

    if (8 > row  +1 * direction > -1 && 8 > col + -1 * direction > -1)
      if (this.board[row  +1 * direction][col + -1 * direction] !== "")
        // בדיקה אם המשבצת אלכסון פנויה
        validMoves.push([row + +1 * direction, col + -1 * direction]);

    if (
      direction === 1 &&
      row === 1 &&
      this.board[row + 2 * direction][col] === ""
    )
      // אם שני ההמשבצות קדימה פנויות
      validMoves.push([row + 2 * direction, col]);
    else if (
      direction === -1 &&
      row === 6 &&
      this.board[row + 2 * direction][col] === ""
    )
      validMoves.push([row + 2 * direction, col]);
  }
  // בדיקה אם המהלך תקין true or false
  isValidMove(fromRow, fromCol, toRow, toCol) {
    const Moves = this.getValidMoves(fromRow, fromCol);
    return Moves.some((Move) => Move[0] === toRow && Move[1] === toCol);
  }
  // קבלת כל המהלכים התקפים של כלי
  getAllValidMoves(fromRow, fromCol) {
    const allValidMoves = this.getValidMoves(fromRow, fromCol);
    return allValidMoves;
  }

  // החלפת תור שחקן
  switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === ChessConfig.WHITE_PLAYER
        ? ChessConfig.BLACK_PLAYER
        : ChessConfig.WHITE_PLAYER;
  }
  getCurrentPlayer() {
    return this.currentPlayer;
  }
  getBoard() {
    return this.board;
  }
  getCapturedPieces() {
    return this.capturedPieces;
  }
}

// /**
//  * ===== מודול מנוע השחמט =====
//  * מטפל בלוגיקה הבסיסית של המשחק - תנועות, חוקים ומצב המשחק
//  */
// class ChessEngine {
//     constructor() {
//         this.board = [];
//         this.currentPlayer = ChessConfig.WHITE_PLAYER;
//         this.capturedPieces = [];
//         this.gameActive = true;
//         this.initializeBoard();
//     }

//     /**
//      * אתחול הלוח למצב ההתחלתי
//      */
//     initializeBoard() {
//         this.board = ChessConfig.initialBoard.map(row => [...row]);
//         this.currentPlayer = ChessConfig.WHITE_PLAYER;
//         this.capturedPieces = [];
//         this.gameActive = true;
//     }

//     /**
//      * בדיקה האם מהלך תקין
//      * @param {number} fromRow - שורת המקור
//      * @param {number} fromCol - עמודת המקור
//      * @param {number} toRow - שורת היעד
//      * @param {number} toCol - עמודת היעד
//      * @returns {boolean} האם המהלך תקין
//      */
//     isValidMove(fromRow, fromCol, toRow, toCol) {
//         const piece = this.board[fromRow][fromCol];
//         const targetPiece = this.board[toRow][toCol];

//         // לא ניתן לתפוס כלי משלנו
//         if (targetPiece && targetPiece[0] === piece[0]) {
//             return false;
//         }

//         // בדיקת תנועה לפי סוג הכלי
//         return this.validatePieceMove(piece, fromRow, fromCol, toRow, toCol);
//     }

//     /**
//      * בדיקת תקינות מהלך לפי סוג הכלי
//      * @param {string} piece - הכלי (למשל 'wP', 'bK')
//      * @param {number} fromRow - שורת המקור
//      * @param {number} fromCol - עמודת המקור
//      * @param {number} toRow - שורת היעד
//      * @param {number} toCol - עמודת היעד
//      * @returns {boolean} האם המהלך תקין
//      */
//     validatePieceMove(piece, fromRow, fromCol, toRow, toCol) {
//         const pieceType = piece[1];
//         const rowDiff = Math.abs(toRow - fromRow);
//         const colDiff = Math.abs(toCol - fromCol);

//         switch (pieceType) {
//             case 'P': // רגלי (Pawn)
//                 return this.validatePawnMove(piece, fromRow, fromCol, toRow, toCol);
//             case 'R': // צריח (Rook)
//                 return (rowDiff === 0 || colDiff === 0) && this.isPathClear(fromRow, fromCol, toRow, toCol);
//             case 'N': // סוס (Knight)
//                 return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
//             case 'B': // רץ (Bishop)
//                 return rowDiff === colDiff && this.isPathClear(fromRow, fromCol, toRow, toCol);
//             case 'Q': // מלכה (Queen)
//                 return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) &&
//                        this.isPathClear(fromRow, fromCol, toRow, toCol);
//             case 'K': // מלך (King)
//                 return rowDiff <= 1 && colDiff <= 1;
//             default:
//                 return false;
//         }
//     }

//     /**
//      * בדיקת תנועת רגלי
//      * @param {string} piece - הרגלי
//      * @param {number} fromRow - שורת המקור
//      * @param {number} fromCol - עמודת המקור
//      * @param {number} toRow - שורת היעד
//      * @param {number} toCol - עמודת היעד
//      * @returns {boolean} האם המהלך תקין
//      */
//     validatePawnMove(piece, fromRow, fromCol, toRow, toCol) {
//         const direction = piece[0] === 'w' ? -1 : 1; // לבן זז למעלה, שחור למטה
//         const startRow = piece[0] === 'w' ? 6 : 1; // שורת התחלה
//         const targetPiece = this.board[toRow][toCol];
//         const colDiff = Math.abs(toCol - fromCol);

//         if (fromCol === toCol) { // תנועה קדימה
//             if (targetPiece) return false; // לא יכול לתפוס קדימה
//             if (toRow === fromRow + direction) return true; // צעד אחד
//             if (fromRow === startRow && toRow === fromRow + 2 * direction) return true; // צעדיים מההתחלה
//         } else if (colDiff === 1 && toRow === fromRow + direction) {
//             return targetPiece !== ''; // יכול לתפוס רק באלכסון
//         }
//         return false;
//     }

//     /**
//      * בדיקה האם הנתיב בין שתי נקודות פנוי
//      * @param {number} fromRow - שורת המקור
//      * @param {number} fromCol - עמודת המקור
//      * @param {number} toRow - שורת היעד
//      * @param {number} toCol - עמודת היעד
//      * @returns {boolean} האם הנתיב פנוי
//      */
//     isPathClear(fromRow, fromCol, toRow, toCol) {
//         const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
//         const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

//         let currentRow = fromRow + rowStep;
//         let currentCol = fromCol + colStep;

//         while (currentRow !== toRow || currentCol !== toCol) {
//             if (this.board[currentRow][currentCol] !== '') {
//                 return false;
//             }
//             currentRow += rowStep;
//             currentCol += colStep;
//         }

//         return true;
//     }

//     /**
//      * ביצוע מהלך על הלוח
//      * @param {number} fromRow - שורת המקור
//      * @param {number} fromCol - עמודת המקור
//      * @param {number} toRow - שורת היעד
//      * @param {number} toCol - עמודת היעד
//      */
//     makeMove(fromRow, fromCol, toRow, toCol) {
//         const capturedPiece = this.board[toRow][toCol];
//         if (capturedPiece) {
//             this.capturedPieces.push(capturedPiece);
//         }

//         this.board[toRow][toCol] = this.board[fromRow][fromCol];
//         this.board[fromRow][fromCol] = '';
//     }

// /**
//  * החלפת תור שחקן
//  */
// switchPlayer() {
//     this.currentPlayer = this.currentPlayer === ChessConfig.WHITE_PLAYER ?
//                        ChessConfig.BLACK_PLAYER : ChessConfig.WHITE_PLAYER;
// }

//     /**
//      * קבלת מצב הלוח הנוכחי
//      * @returns {Array} מערך דו-ממדי המייצג את הלוח
//      */
//     getBoard() {
//         return this.board;
//     }

//     /**
//      * קבלת השחקן הנוכחי
//      * @returns {string} 'w' או 'b'
//      */
//     getCurrentPlayer() {
//         return this.currentPlayer;
//     }

//     /**
//      * קבלת רשימת הכלים שנתפסו
//      * @returns {Array} מערך של כלים שנתפסו
//      */
//     getCapturedPieces() {
//         return this.capturedPieces;
//     }
// }
