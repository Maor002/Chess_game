/**
 * Chess Board to FEN Converter
 * Converts a chess board representation to Forsyth-Edwards Notation (FEN)
 */

class ChessFENConverter {
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
}