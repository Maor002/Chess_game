import { ChessConfig } from "../js/config/chessConfig.js";
import {
  Pawn,
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
} from "../js/pieces/Pieces.js";
import { logger } from "../js/logger/logger.js";

export class ChessFENConverter {
  // =====================================================
  // 🔹 Constants
  // =====================================================

  static VALID_PIECE_TYPES = ["K", "Q", "R", "B", "N", "P"];
  static VALID_COLORS = ["w", "b"];
  static BOARD_SIZE = 8;
  static STARTING_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  // Piece classes map
  static PIECE_CLASSES = {
    P: Pawn,
    R: Rook,
    N: Knight,
    B: Bishop,
    Q: Queen,
    K: King,
  };

  // Piece values for material calculation
  static PIECE_VALUES = {
    P: 1,
    N: 3,
    B: 3,
    R: 5,
    Q: 9,
    K: 0,
  };

  // Unicode symbols for pieces
  static PIECE_SYMBOLS = {
    P: "♟",
    R: "♜",
    N: "♞",
    B: "♝",
    Q: "♛",
    K: "♚",
  };

  // =====================================================
  // 🔹 Validation
  // =====================================================

  static isValidPiece(piece) {
    if (!piece || typeof piece !== "object") return false;

    return (
      this.VALID_PIECE_TYPES.includes(piece.type?.toUpperCase()) &&
      this.VALID_COLORS.includes(piece.color)
    );
  }

  static isEmptySquare(square) {
    return (
      square === null || square === undefined || square === "" || square === 0
    );
  }

  static validateBoard(board) {
    if (!Array.isArray(board)) {
      throw new Error("The board must be array");
    }

    if (board.length !== this.BOARD_SIZE) {
      throw new Error(`Board must contain exactly ${this.BOARD_SIZE} rows`);
    }

    board.forEach((rank, index) => {
      if (!Array.isArray(rank)) {
        throw new Error(`Row ${index} must be an array`);
      }
      if (rank.length !== this.BOARD_SIZE) {
        throw new Error(
          `Row ${index} must contain exactly ${this.BOARD_SIZE} squares`,
        );
      }
    });
  }

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
  // 🔹 Board → FEN
  // =====================================================

  static getPieceSymbol(piece) {
    const symbol = piece.type.toUpperCase();
    return piece.color === "w" ? symbol : symbol.toLowerCase();
  }

  static rankToFEN(rank) {
    let fen = "";
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

static boardToFEN(board) {
  try {
    this.validateBoard(board);
    const ranks = board.map((rank) => this.rankToFEN(rank));
    const fen = ranks.join("/");
    logger.debug(`Board converted to FEN position: ${fen}`);
    return fen;
  } catch (error) {
    logger.error(`Error converting board to FEN: ${error.message}`);
    throw error;
  }
}

static toCompleteFEN(gameState) {
  try {
    const {
      board,
      activeColor = "w",
      castling = "KQkq",
      enPassant = "-",
      halfmove = 0,
      fullmove = 1,
    } = gameState;

    const boardFEN = this.boardToFEN(board);
    const completeFEN = [boardFEN, activeColor, castling, enPassant, halfmove, fullmove].join(" ");
    logger.debug(`Complete FEN created: ${completeFEN}`);
    return completeFEN;
  } catch (error) {
    logger.error(`Error creating complete FEN: ${error.message}`);
    throw error;
  }
}

  // =====================================================
  // 🔹 FEN → Board
  // =====================================================

  static fenCharToPiece(char, row, col) {
    const pieceMap = {
      K: "K",
      Q: "Q",
      R: "R",
      B: "B",
      N: "N",
      P: "P",
      k: "K",
      q: "Q",
      r: "R",
      b: "B",
      n: "N",
      p: "P",
    };

    const type = pieceMap[char];
    if (!type) return null;

    const color = char === char.toUpperCase() ? "w" : "b";
    const PieceClass = this.PIECE_CLASSES[type];
    const grade = ChessConfig.grade[type] || 0;

    return new PieceClass(color, type, row, col, grade);
  }

  static parseFENToBoard(fenBoard) {
    try {
      logger.debug(`Parsing FEN to board: ${fenBoard}`);

      const board = Array.from({ length: this.BOARD_SIZE }, () =>
        Array(this.BOARD_SIZE).fill(""),
      );

      // FIX: Extract only the board position part (before the first space)
      const boardPosition = fenBoard.split(" ")[0];
      const rows = boardPosition.split("/");

      if (rows.length !== this.BOARD_SIZE) {
        throw new Error(
          `FEN board must contain exactly ${this.BOARD_SIZE} rows, received ${rows.length}`,
        );
      }

      for (let row = 0; row < this.BOARD_SIZE; row++) {
        let col = 0;

        for (const char of rows[row]) {
          if (char >= "1" && char <= "8") {
            const skipCount = parseInt(char);
            for (let i = 0; i < skipCount; i++) {
              board[row][col] = "";
              col++;
            }
          } else {
            if (col >= this.BOARD_SIZE) {
              throw new Error(`Row ${row} is too long`);
            }
            board[row][col] = this.fenCharToPiece(char, row, col);
            col++;
          }
        }

        if (col !== this.BOARD_SIZE) {
          throw new Error(
            `Row ${row} contains ${col} squares instead of ${this.BOARD_SIZE}`,
          );
        }
      }

      logger.debug("FEN successfully parsed to board");
      return board;
    } catch (error) {
      logger.error(`Error parsing FEN to board: ${error.message}`);
      throw error;
    }
  }

  static parseFEN(fen) {
    try {
      logger.debug(`Parsing complete FEN: ${fen}`);
      
      const parts = fen.trim().split(/\s+/);

      if (parts.length < 1) {
        throw new Error("Invalid FEN string - empty or malformed");
      }

      const gameState = {
        board: this.parseFENToBoard(parts[0]),
        activeColor: parts[1] || "w",
        castling: parts[2] || "KQkq",
        enPassant: parts[3] || "-",
        halfmove: parseInt(parts[4]) || 0,
        fullmove: parseInt(parts[5]) || 1,
        capturedPieces: this.getCapturedPieces(parts[0]),
      };

      logger.debug("FEN successfully parsed to game state");
      return gameState;
    } catch (error) {
      logger.error(`Error parsing complete FEN: ${error.message}`);
      throw error;
    }
  }

  // =====================================================
  // 🔹 Helpers
  // =====================================================

  static getStartingFEN() {
    return this.STARTING_FEN;
  }

  static createStartingBoard() {
    try {
      logger.debug("Creating starting board from FEN");
      return this.parseFENToBoard(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
      );
    } catch (error) {
      logger.error(`Error creating starting board: ${error.message}`);
      throw error;
    }
  }

  static getPositionPart(fen) {
    return fen.split(" ")[0];
  }

  static comparePositions(fen1, fen2) {
    return this.getPositionPart(fen1) === this.getPositionPart(fen2);
  }

  static boardToConfigFormat(board) {
    try {
      logger.debug("Converting board to config format");

      return board.map((rank) =>
        rank.map((square) => {
          if (this.isEmptySquare(square)) return "";
          return `${square.color}${square.type}`;
        }),
      );
    } catch (error) {
      logger.error(`Error converting board to config format: ${error.message}`);
      throw error;
    }
  }

  static fenToConfigFormat(fen) {
    try {
      const board = this.parseFENToBoard(this.getPositionPart(fen));
      return this.boardToConfigFormat(board);
    } catch (error) {
      logger.error(`Error converting FEN to config format: ${error.message}`);
      throw error;
    }
  }

  static getBoardStatistics(board) {
    const stats = {
      white: { P: 0, R: 0, N: 0, B: 0, Q: 0, K: 0, total: 0 },
      black: { P: 0, R: 0, N: 0, B: 0, Q: 0, K: 0, total: 0 },
    };

    board.forEach((rank) => {
      rank.forEach((square) => {
        if (!this.isEmptySquare(square)) {
          const color = square.color === "w" ? "white" : "black";
          stats[color][square.type]++;
          stats[color].total++;
        }
      });
    });

    return stats;
  }

  // =====================================================
  // 🔹 Captured Pieces Analysis
  // =====================================================

  static getCapturedPieces(fen) {
    try {
      logger.debug(`Calculating captured pieces from FEN: ${fen}`);

      // מיפוי הכלים לסמלים
      const pieceSymbols = {
        white: {
          P: "♙",
          R: "♖",
          N: "♘",
          B: "♗",
          Q: "♕",
          K: "♔",
        },
        black: {
          P: "♟",
          R: "♜",
          N: "♞",
          B: "♝",
          Q: "♛",
          K: "♚",
        },
      };

      // מספר הכלים בלוח התחלתי
      const startingPieces = {
        white: { P: 8, R: 2, N: 2, B: 2, Q: 1, K: 1 },
        black: { P: 8, R: 2, N: 2, B: 2, Q: 1, K: 1 },
      };

      // קבל את הלוח הנוכחי
      const board = this.parseFENToBoard(this.getPositionPart(fen));

      // ספור כלים נוכחיים
      const currentPieces = {
        white: { P: 0, R: 0, N: 0, B: 0, Q: 0, K: 0 },
        black: { P: 0, R: 0, N: 0, B: 0, Q: 0, K: 0 },
      };

      board.forEach((rank) => {
        rank.forEach((square) => {
          if (!this.isEmptySquare(square)) {
            const color = square.color === "w" ? "white" : "black";
            currentPieces[color][square.type]++;
          }
        });
      });

      // בנה מערכים של כלים שנאכלו
      const captured = {
        white: [], // כלים לבנים שנאכלו (יוצגו באזור של שחור)
        black: [], // כלים שחורים שנאכלו (יוצגו באזור של לבן)
      };

      // כלים לבנים שנאכלו על ידי שחור
      for (const piece in startingPieces.white) {
        const count = startingPieces.white[piece] - currentPieces.white[piece];
        for (let i = 0; i < count; i++) {
          captured.white.push(pieceSymbols.white[piece]);
        }
      }

      // כלים שחורים שנאכלו על ידי לבן
      for (const piece in startingPieces.black) {
        const count = startingPieces.black[piece] - currentPieces.black[piece];
        for (let i = 0; i < count; i++) {
          captured.black.push(pieceSymbols.black[piece]);
        }
      }

      logger.debug("Captured pieces calculated:", captured);
      return captured;
    } catch (error) {
      logger.error(`Error calculating captured pieces: ${error.message}`);
      throw error;
    }
  }

  static getCapturedPiecesDisplay(fen) {
    try {
      const captured = this.getCapturedPieces(fen);

      const display = {
        whiteCaptured: "", // כלים לבנים שנאכלו (שחור תפס)
        blackCaptured: "", // כלים שחורים שנאכלו (לבן תפס)
        whiteScore: 0,
        blackScore: 0,
      };

      // כלים לבנים שנאכלו
      for (const [piece, count] of Object.entries(captured.white)) {
        if (piece !== "total" && count > 0) {
          display.whiteCaptured += this.PIECE_SYMBOLS[piece].repeat(count);
          display.blackScore += this.PIECE_VALUES[piece] * count;
        }
      }

      // כלים שחורים שנאכלו
      for (const [piece, count] of Object.entries(captured.black)) {
        if (piece !== "total" && count > 0) {
          display.blackCaptured += this.PIECE_SYMBOLS[piece].repeat(count);
          display.whiteScore += this.PIECE_VALUES[piece] * count;
        }
      }

      display.advantage = display.whiteScore - display.blackScore;

      return display;
    } catch (error) {
      logger.error(`Error getting captured pieces display: ${error.message}`);
      throw error;
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ChessFENConverter;
}
