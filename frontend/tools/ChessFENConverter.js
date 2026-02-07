/**
 * Chess Board to FEN Converter
 * Converts between chess board representation and Forsyth-Edwards Notation (FEN)
 */

import { ChessConfig } from "../js/config/ChessConfig.js";
import { Pawn, Rook, Knight, Bishop, Queen, King } from "../js/pieces/Pieces.js";
import { logger } from "../js/logger/logger.js";

export class ChessFENConverter {
  // =====================================================
  // 🔹 קבועים
  // =====================================================
  
  static VALID_PIECE_TYPES = ['K', 'Q', 'R', 'B', 'N', 'P'];
  static VALID_COLORS = ['w', 'b'];
  static BOARD_SIZE = 8;
  static STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  // מפה של מחלקות הכלים
  static PIECE_CLASSES = {
    'P': Pawn,
    'R': Rook,
    'N': Knight,
    'B': Bishop,
    'Q': Queen,
    'K': King
  };

  // =====================================================
  // 🔹 אימות (Validation)
  // =====================================================

  /**
   * בדיקת תקינות כלי שחמט
   * @param {Object} piece - הכלי לבדיקה
   * @returns {boolean} true אם תקין
   */
  static isValidPiece(piece) {
    if (!piece || typeof piece !== 'object') return false;
    
    return (
      this.VALID_PIECE_TYPES.includes(piece.type?.toUpperCase()) &&
      this.VALID_COLORS.includes(piece.color)
    );
  }

  /**
   * בדיקה האם משבצת ריקה
   * @param {*} square - המשבצת לבדיקה
   * @returns {boolean} true אם המשבצת ריקה
   */
  static isEmptySquare(square) {
    return square === null || 
           square === undefined || 
           square === '' || 
           square === 0;
  }

  /**
   * בדיקת תקינות מבנה הלוח
   * @param {Array} board - לוח שחמט 8x8
   * @throws {Error} אם הלוח לא תקין
   */
  static validateBoard(board) {
    if (!Array.isArray(board)) {
      throw new Error('הלוח חייב להיות מערך');
    }

    if (board.length !== this.BOARD_SIZE) {
      throw new Error(`הלוח חייב להכיל בדיוק ${this.BOARD_SIZE} שורות`);
    }

    board.forEach((rank, index) => {
      if (!Array.isArray(rank)) {
        throw new Error(`שורה ${index} חייבת להיות מערך`);
      }
      if (rank.length !== this.BOARD_SIZE) {
        throw new Error(`שורה ${index} חייבת להכיל בדיוק ${this.BOARD_SIZE} משבצות`);
      }
    });
  }

  /**
   * בדיקת תקינות מחרוזת FEN
   * @param {string} fen - מחרוזת FEN לבדיקה
   * @returns {boolean} true אם תקין
   */
  static isValidFEN(fen) {
    try {
      this.parseFEN(fen);
      return true;
    } catch (error) {
      logger.warn(`FEN validation failed: ${error.message}`);
      return false;
    }
  }

  // =====================================================
  // 🔹 המרה מלוח ל-FEN (Board → FEN)
  // =====================================================

  /**
   * קבלת סימן FEN עבור כלי
   * @param {Object} piece - כלי שחמט עם type ו-color
   * @returns {string} סימן FEN (אותיות גדולות ללבן, קטנות לשחור)
   */
  static getPieceSymbol(piece) {
    const symbol = piece.type.toUpperCase();
    return piece.color === 'w' ? symbol : symbol.toLowerCase();
  }

  /**
   * המרת שורה אחת (rank) לסימון FEN
   * @param {Array} rank - מערך של 8 משבצות (כלים או ריק)
   * @returns {string} סימון FEN עבור השורה
   */
  static rankToFEN(rank) {
    let fen = '';
    let emptyCount = 0;

    for (const square of rank) {
      if (this.isEmptySquare(square)) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        fen += this.getPieceSymbol(square);
      }
    }

    if (emptyCount > 0) {
      fen += emptyCount;
    }

    return fen;
  }

  /**
   * המרת לוח שחמט לסימון FEN (מיקום בלבד)
   * @param {Array<Array>} board - מערך 8x8 המייצג את לוח השחמט
   * @returns {string} מחרוזת FEN המייצגת את מיקום הכלים
   * @throws {Error} אם מבנה הלוח לא תקין
   */
  static boardToFEN(board) {
    try {
      this.validateBoard(board);
      const ranks = board.map(rank => this.rankToFEN(rank));
      const fen = ranks.join('/');
      logger.debug(`Board converted to FEN: ${fen}`);
      return fen;
    } catch (error) {
      logger.error(`Error converting board to FEN: ${error.message}`);
      throw error;
    }
  }

  /**
   * המרת לוח שחמט לסימון FEN מלא
   * @param {Object} gameState - מצב משחק מלא
   * @param {Array<Array>} gameState.board - לוח שחמט 8x8
   * @param {string} gameState.activeColor - 'w' או 'b' (תור מי לשחק)
   * @param {string} gameState.castling - זכויות הצרחה (למשל 'KQkq')
   * @param {string|null} gameState.enPassant - משבצת en passant או '-'
   * @param {number} gameState.halfmove - מונה חצאי מהלכים (לכלל 50 המהלכים)
   * @param {number} gameState.fullmove - מספר המהלך המלא
   * @returns {string} מחרוזת FEN מלאה
   */
  static toCompleteFEN(gameState) {
    try {
      const {
        board,
        activeColor = 'w',
        castling = '-',
        enPassant = '-',
        halfmove = 0,
        fullmove = 1
      } = gameState;

      const boardFEN = this.boardToFEN(board);
      
      const completeFEN = [
        boardFEN,
        activeColor,
        castling,
        enPassant,
        halfmove,
        fullmove
      ].join(' ');

      logger.debug(`Complete FEN created: ${completeFEN}`);
      return completeFEN;
    } catch (error) {
      logger.error(`Error creating complete FEN: ${error.message}`);
      throw error;
    }
  }

  // =====================================================
  // 🔹 המרה מ-FEN ללוח (FEN → Board)
  // =====================================================

  /**
   * המרת תו FEN לאובייקט Piece
   * @param {string} char - תו FEN (K, Q, R, B, N, P או אותיות קטנות)
   * @param {number} row - מיקום השורה
   * @param {number} col - מיקום העמודה
   * @returns {Piece|null} אובייקט Piece או null למשבצת ריקה
   */
  static fenCharToPiece(char, row, col) {
    const pieceMap = {
      'K': 'K', 'Q': 'Q', 'R': 'R', 'B': 'B', 'N': 'N', 'P': 'P',
      'k': 'K', 'q': 'Q', 'r': 'R', 'b': 'B', 'n': 'N', 'p': 'P'
    };
    
    const type = pieceMap[char];
    if (!type) return null;
    
    const color = char === char.toUpperCase() ? 'w' : 'b';
    const PieceClass = this.PIECE_CLASSES[type];
    const grade = ChessConfig.grade[type] || 0;

    // יצירת מופע של הכלי המתאים
    return new PieceClass(color, type, row, col, grade);
  }

  /**
   * המרת סימון FEN ללוח שחמט
   * @param {string} fenBoard - סימון לוח FEN (למשל "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")
   * @returns {Array<Array>} מערך לוח 8x8 עם אובייקטי Piece
   * @throws {Error} אם ה-FEN לא תקין
   */
  static parseFENToBoard(fenBoard) {
    try {
      logger.debug(`Parsing FEN to board: ${fenBoard}`);

      const board = Array.from(
        { length: this.BOARD_SIZE },
        () => Array(this.BOARD_SIZE).fill('')
      );
      
      const rows = fenBoard.split('/');
      
      if (rows.length !== this.BOARD_SIZE) {
        throw new Error(`לוח FEN חייב להכיל בדיוק ${this.BOARD_SIZE} שורות, קיבלנו ${rows.length}`);
      }
      
      for (let row = 0; row < this.BOARD_SIZE; row++) {
        let col = 0;
        
        for (const char of rows[row]) {
          if (char >= '1' && char <= '8') {
            // מספר = משבצות ריקות
            const skipCount = parseInt(char);
            for (let i = 0; i < skipCount; i++) {
              board[row][col] = '';
              col++;
            }
          } else {
            // אות = כלי
            if (col >= this.BOARD_SIZE) {
              throw new Error(`שורה ${row} ארוכה מדי`);
            }
            board[row][col] = this.fenCharToPiece(char, row, col);
            col++;
          }
        }
        
        if (col !== this.BOARD_SIZE) {
          throw new Error(`שורה ${row} מכילה ${col} משבצות במקום ${this.BOARD_SIZE}`);
        }
      }

      logger.debug('FEN successfully parsed to board');
      return board;
    } catch (error) {
      logger.error(`Error parsing FEN to board: ${error.message}`);
      throw error;
    }
  }

  /**
   * פענוח מחרוזת FEN מלאה למצב משחק
   * @param {string} fen - מחרוזת FEN מלאה
   * @returns {Object} אובייקט מצב משחק
   * @throws {Error} אם ה-FEN לא תקין
   */
  static parseFEN(fen) {
    try {
      logger.debug(`Parsing complete FEN: ${fen}`);

      const parts = fen.trim().split(/\s+/);
      
      if (parts.length < 1) {
        throw new Error('מחרוזת FEN לא תקינה - ריקה או לא תקינה');
      }
      
      const gameState = {
        board: this.parseFENToBoard(parts[0]),
        activeColor: parts[1] || 'w',
        castling: parts[2] || 'KQkq',
        enPassant: parts[3] || '-',
        halfmove: parseInt(parts[4]) || 0,
        fullmove: parseInt(parts[5]) || 1
      };

      logger.debug('FEN successfully parsed to game state');
      return gameState;
    } catch (error) {
      logger.error(`Error parsing complete FEN: ${error.message}`);
      throw error;
    }
  }

  // =====================================================
  // 🔹 פונקציות עזר
  // =====================================================

  /**
   * קבלת FEN של מצב התחלה סטנדרטי
   * @returns {string} מיקום התחלה של שחמט
   */
  static getStartingFEN() {
    return this.STARTING_FEN;
  }

  /**
   * יצירת לוח התחלה עם אובייקטי Piece
   * @returns {Array<Array>} לוח התחלה עם כלים
   */
  static createStartingBoard() {
    try {
      logger.debug('Creating starting board from FEN');
      return this.parseFENToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    } catch (error) {
      logger.error(`Error creating starting board: ${error.message}`);
      throw error;
    }
  }

  /**
   * קבלת רק חלק המיקום מ-FEN מלא
   * @param {string} fen - מחרוזת FEN מלאה
   * @returns {string} רק חלק המיקום
   */
  static getPositionPart(fen) {
    return fen.split(' ')[0];
  }

  /**
   * השוואת שני מצבי לוח
   * @param {string} fen1 - FEN ראשון
   * @param {string} fen2 - FEN שני
   * @returns {boolean} true אם המיקומים זהים
   */
  static comparePositions(fen1, fen2) {
    return this.getPositionPart(fen1) === this.getPositionPart(fen2);
  }

  /**
   * המרת לוח לפורמט של ChessConfig.initialBoard
   * @param {Array<Array>} board - לוח עם אובייקטי Piece
   * @returns {Array<Array>} לוח בפורמט של initialBoard (['wP', 'bR', ...])
   */
  static boardToConfigFormat(board) {
    try {
      logger.debug('Converting board to config format');
      
      return board.map(rank => 
        rank.map(square => {
          if (this.isEmptySquare(square)) return '';
          return `${square.color}${square.type}`;
        })
      );
    } catch (error) {
      logger.error(`Error converting board to config format: ${error.message}`);
      throw error;
    }
  }

  /**
   * המרת FEN לפורמט של ChessConfig.initialBoard
   * @param {string} fen - מחרוזת FEN
   * @returns {Array<Array>} לוח בפורמט של initialBoard
   */
  static fenToConfigFormat(fen) {
    try {
      const board = this.parseFENToBoard(this.getPositionPart(fen));
      return this.boardToConfigFormat(board);
    } catch (error) {
      logger.error(`Error converting FEN to config format: ${error.message}`);
      throw error;
    }
  }

  /**
   * הדפסת לוח לקונסול (לצורכי דיבוג)
   * @param {Array<Array>} board - לוח השחמט
   */
  static printBoard(board) {
    console.log('\n  a b c d e f g h');
    console.log('  ---------------');
    board.forEach((rank, row) => {
      const pieces = rank.map(square => {
        if (this.isEmptySquare(square)) return '.';
        return this.getPieceSymbol(square);
      }).join(' ');
      console.log(`${8 - row} ${pieces} ${8 - row}`);
    });
    console.log('  ---------------');
    console.log('  a b c d e f g h\n');
  }

  /**
   * קבלת סטטיסטיקת כלים בלוח
   * @param {Array<Array>} board - לוח השחמט
   * @returns {Object} אובייקט עם ספירת כלים לפי צבע וסוג
   */
  static getBoardStatistics(board) {
    const stats = {
      white: { P: 0, R: 0, N: 0, B: 0, Q: 0, K: 0, total: 0 },
      black: { P: 0, R: 0, N: 0, B: 0, Q: 0, K: 0, total: 0 }
    };

    board.forEach(rank => {
      rank.forEach(square => {
        if (!this.isEmptySquare(square)) {
          const color = square.color === 'w' ? 'white' : 'black';
          stats[color][square.type]++;
          stats[color].total++;
        }
      });
    });

    return stats;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChessFENConverter;
}