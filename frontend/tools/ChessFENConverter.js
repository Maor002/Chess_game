/**
 * Chess Board to FEN Converter
 * Converts a chess board representation to Forsyth-Edwards Notation (FEN)
 */

export class ChessFENConverter {
  /**
   * Validates a chess piece object
   * @param {Object} piece - The piece to validate
   * @returns {boolean} True if valid
   */
  static isValidPiece(piece) {
    if (!piece || typeof piece !== 'object') return false;
    
    const validTypes = ['K', 'Q', 'R', 'B', 'N', 'P'];
    const validColors = ['w', 'b'];
    
    return (
      validTypes.includes(piece.type?.toUpperCase()) &&
      validColors.includes(piece.color)
    );
  }

  /**
   * Gets the FEN symbol for a piece
   * @param {Object} piece - Chess piece with type and color
   * @returns {string} FEN symbol (uppercase for white, lowercase for black)
   */
  static getPieceSymbol(piece) {
    const symbol = piece.type.toUpperCase();
    return piece.color === 'w' ? symbol : symbol.toLowerCase();
  }

  /**
   * Converts a single rank (row) to FEN notation
   * @param {Array} rank - Array of 8 squares (pieces or null)
   * @returns {string} FEN notation for the rank
   */
  static rankToFEN(rank) {
    let fen = '';
    let emptyCount = 0;

    for (const square of rank) {
      if (!square) {
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
   * Validates the chess board structure
   * @param {Array} board - 8x8 chess board array
   * @throws {Error} If board is invalid
   */
  static validateBoard(board) {
    if (!Array.isArray(board)) {
      throw new Error('Board must be an array');
    }

    if (board.length !== 8) {
      throw new Error('Board must have exactly 8 ranks');
    }

    for (let i = 0; i < 8; i++) {
      if (!Array.isArray(board[i])) {
        throw new Error(`Rank ${i} must be an array`);
      }
      if (board[i].length !== 8) {
        throw new Error(`Rank ${i} must have exactly 8 squares`);
      }
    }
  }

  /**
   * Converts a chess board to FEN notation (board position only)
   * @param {Array<Array>} board - 8x8 array representing the chess board
   * @returns {string} FEN string representing the board position
   * @throws {Error} If board structure is invalid
   */
  static boardToFEN(board) {
    this.validateBoard(board);

    const ranks = board.map(rank => this.rankToFEN(rank));
    return ranks.join('/');
  }

  /**
   * Converts a chess board to complete FEN notation
   * @param {Object} gameState - Complete game state
   * @param {Array<Array>} gameState.board - 8x8 chess board
   * @param {string} gameState.activeColor - 'w' or 'b'
   * @param {string} gameState.castling - Castling rights (e.g., 'KQkq')
   * @param {string|null} gameState.enPassant - En passant target square or '-'
   * @param {number} gameState.halfmove - Halfmove clock
   * @param {number} gameState.fullmove - Fullmove number
   * @returns {string} Complete FEN string
   */
  static toCompleteFEN(gameState) {
    const {
      board,
      activeColor = 'w',
      castling = '-',
      enPassant = '-',
      halfmove = 0,
      fullmove = 1
    } = gameState;

    const boardFEN = this.boardToFEN(board);
    
    return [
      boardFEN,
      activeColor,
      castling,
      enPassant,
      halfmove,
      fullmove
    ].join(' ');
  }

  // =====================================================
  // 🔹 FEN to Board Conversion (NEW)
  // =====================================================

  /**
   * Converts FEN notation to a chess board array
   * @param {string} fenBoard - FEN board notation (e.g., "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")
   * @returns {Array<Array>} 8x8 board array
   */
  static parseFENToBoard(fenBoard) {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const rows = fenBoard.split('/');
    
    if (rows.length !== 8) {
      throw new Error('FEN board must have exactly 8 ranks');
    }
    
    for (let row = 0; row < 8; row++) {
      let col = 0;
      for (const char of rows[row]) {
        if (char >= '1' && char <= '8') {
          // מספר = משבצות ריקות
          col += parseInt(char);
        } else {
          // אות = כלי
          board[row][col] = this.fenCharToPiece(char);
          col++;
        }
      }
      
      if (col !== 8) {
        throw new Error(`Rank ${row} has invalid number of squares`);
      }
    }
    
    return board;
  }

  /**
   * Converts a FEN character to a piece object
   * @param {string} char - FEN character (K, Q, R, B, N, P or lowercase)
   * @returns {Object|null} Piece object with type and color
   */
  static fenCharToPiece(char) {
    const pieceMap = {
      'K': 'K', 'Q': 'Q', 'R': 'R', 'B': 'B', 'N': 'N', 'P': 'P',
      'k': 'K', 'q': 'Q', 'r': 'R', 'b': 'B', 'n': 'N', 'p': 'P'
    };
    
    const type = pieceMap[char];
    if (!type) return null;
    
    const color = char === char.toUpperCase() ? 'w' : 'b';
    
    return {
      type: type,
      color: color
    };
  }

  /**
   * Parses a complete FEN string into game state
   * @param {string} fen - Complete FEN string
   * @returns {Object} Game state object
   */
  static parseFEN(fen) {
    const parts = fen.trim().split(/\s+/);
    
    if (parts.length < 1) {
      throw new Error('Invalid FEN string');
    }
    
    return {
      board: this.parseFENToBoard(parts[0]),
      activeColor: parts[1] || 'w',
      castling: parts[2] || 'KQkq',
      enPassant: parts[3] || '-',
      halfmove: parseInt(parts[4]) || 0,
      fullmove: parseInt(parts[5]) || 1
    };
  }

  /**
   * Validates a FEN string
   * @param {string} fen - FEN string to validate
   * @returns {boolean} True if valid
   */
  static isValidFEN(fen) {
    try {
      this.parseFEN(fen);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the starting position FEN
   * @returns {string} Standard chess starting position
   */
  static getStartingFEN() {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChessFENConverter;
}