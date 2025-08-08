//  * ===== מודול מנוע השחמט =====
//  * מטפל בלוגיקה הבסיסית של המשחק - תנועות, חוקים ומצב המשחק
import { ChessConfig } from "../config/chessConfig.js";
import { Rook, Bishop, Knight, Queen, King, Pawn } from "./pieces.js";
import { logger } from "../Logger/logger.js";

export class ChessEngine {
  constructor() {
    logger.debug("Creating new chess engine");
    try {
      this.board = [];
      this.historyMoves = [];
      this.currentPlayer = ChessConfig.WHITE_PLAYER;
      this.capturedPiecesArray = [];
      this.gameActive = true;
      this.initializeBoard();
      logger.info(" Chess engine created successfully");
    } catch (error) {
      logger.error(" Error creating chess engine:", error);
      throw new Error(`Failed to initialize chess engine: ${error.message}`);
    }
  }

  initializeBoard() {
    logger.debug("Initializing chess board");
    try {
      this.board = ChessConfig.initialBoard.map((row) => [...row]);
      logger.debug(
        `Board ${ChessConfig.BOARD_SIZE}x${ChessConfig.BOARD_SIZE} created`
      );
      let piecesCreated = 0;

      for (let row = 0; row < ChessConfig.BOARD_SIZE; row++) {
        for (let col = 0; col < ChessConfig.BOARD_SIZE; col++) {
          try {
            const piece = this.board[row][col];
            const color = piece[0];
            const type = piece[1];
            switch (type) {
              case "P":
                this.board[row][col] = new Pawn(
                  color,
                  type,
                  row,
                  col,
                  ChessConfig.grade["P"]
                );
                piecesCreated++;
                break;
              case "R":
                this.board[row][col] = new Rook(
                  color,
                  type,
                  row,
                  col,
                  ChessConfig.grade["R"]
                );
                piecesCreated++;
                break;
              case "N":
                this.board[row][col] = new Knight(
                  color,
                  type,
                  row,
                  col,
                  ChessConfig.grade["N"]
                );
                piecesCreated++;
                break;
              case "B":
                this.board[row][col] = new Bishop(
                  color,
                  type,
                  row,
                  col,
                  ChessConfig.grade["B"]
                );
                piecesCreated++;
                break;
              case "Q":
                this.board[row][col] = new Queen(
                  color,
                  type,
                  row,
                  col,
                  ChessConfig.grade["Q"]
                );
                piecesCreated++;
                break;
              case "K":
                this.board[row][col] = new King(
                  color,
                  type,
                  row,
                  col,
                  ChessConfig.grade["K"]
                );
                piecesCreated++;
                break;
              default:
                this.board[row][col] = ""; // אם אין כלי, השאר ריק
            }
          } catch (error) {
            logger.error(
              `Error creating piece at position [${row},${col}]:`,
              error
            );
            this.board[row][col] = ""; // במקרה של שגיאה, השאר ריק
          }
        }
      }

      this.currentPlayer = ChessConfig.WHITE_PLAYER;
      this.capturedPiecesArray = [];

      logger.info(
        ` Board initialized successfully with ${piecesCreated} pieces`
      );
      logger.debug(` Current player: ${this.currentPlayer}`);
    } catch (error) {
      logger.error(" Error initializing board:", error);
      throw new Error(`Failed to initialize board: ${error.message}`);
    }
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    logger.debug(
      ` Making move from [${fromRow},${fromCol}] to [${toRow},${toCol}]`
    );

    try {
      const movingPiece = this.board[fromRow][fromCol];
      if (!movingPiece) {
        throw new Error("No piece at source position");
      }

      const capturedPiece = this.board[toRow][toCol];

      if (capturedPiece) {
        logger.info(
          ` Capturing piece: ${capturedPiece.constructor.name} (${capturedPiece.color})`
        );
        this.capturedPiecesArray.push(
          ChessConfig.pieces[capturedPiece.color + capturedPiece.type]
        );
      }
      if (capturedPiece.type === "K") {
        logger.info("King has been captured, ending game");
        this.gameActive = false;
      }
      if (this.board[fromRow][fromCol].type === "K") {
        this.board[fromRow][fromCol].hasMoved = true; // עדכון אם המלך זז
        logger.debug("King has moved, updating state");
      }

      this.board[toRow][toCol] = this.board[fromRow][fromCol];
      this.board[fromRow][fromCol] = "";

      movingPiece.row = toRow; // עדכון מיקום השורה של הכלי
      movingPiece.col = toCol; // עדכון מיקום העמודה של הכלי

      logger.debug(
        ` Move executed successfully. Captured pieces: ${this.capturedPiecesArray.length}`
      );
      // עדכון היסטוריית המהלכים
      const move = {
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
      };
      this.historyMoves.push(move);
    } catch (error) {
      logger.error(" Error executing move:", error);
      throw new Error(`Move failed: ${error.message}`);
    }
  }

  getValidMoves(row, col) {
    logger.debug(
      `🔍 Finding valid moves for piece at position [${row},${col}]`
    );

    try {
      const validMoves = [];
      const piece = this.board[row][col];

      if (!piece) {
        logger.debug(" No piece at given position");
        return validMoves;
      }

      logger.debug(` Piece found: ${piece.constructor.name} (${piece.color})`);

      switch (piece[1]) {
        case "P": // רגלי
          validMoves.push(...this.getPawnMoves(this.board));
          break;
        case "R": // צריח
          validMoves.push(...this.getRookMoves());
          break;
        case "N": // סוס
          validMoves.push(...this.getKnightMoves());
          break;
        case "B": // רץ
          validMoves.push(...this.getBishopMoves());
          break;
        case "Q": // מלכה
          validMoves.push(...this.getQueenMoves());
          break;
        case "K": // מלך
          validMoves.push(...this.getKingMoves());
          break;
        default:
          logger.warn(` Unknown piece type: ${piece[1]}`);
      }

      logger.debug(` Found ${validMoves.length} valid moves`);
      return validMoves;
    } catch (error) {
      logger.error(" Error finding valid moves:", error);
      return [];
    }
  }

  // בדיקה אם המהלך תקין true or false
  isValidMove(fromRow, fromCol, toRow, toCol) {
    logger.debug(
      ` Checking move validity from [${fromRow},${fromCol}] to [${toRow},${toCol}]`
    );

    try {
      const piece = this.board[fromRow][fromCol];
      if (!piece) {
        logger.debug(" No piece at source position");
        return false; // אם אין כלי במיקום, אין מהלכים תקפים
      }

      logger.debug(
        ` Checking move for: ${piece.constructor.name} (${piece.color})`
      );

      const Moves = piece.getValidMoves(this.board);
      const isValid = Moves.some(
        (Move) => Move[0] === toRow && Move[1] === toCol
      );

      logger.debug(
        `${isValid ? "true" : "false"} Move is ${isValid ? "valid" : "invalid"}`
      );
      return isValid;
    } catch (error) {
      logger.error(" Error checking move validity:", error);
      return false;
    }
  }

  // קבלת כל המהלכים התקפים של כלי
  getAllValidMoves(fromRow, fromCol) {
    logger.debug(
      ` Getting all valid moves for piece at position [${fromRow},${fromCol}]`
    );

    try {
      const piece = this.board[fromRow][fromCol];
      if (!piece) {
        logger.debug(" No piece at given position");
        return []; // אם אין כלי במיקום, אין מהלכים תקפים
      }

      logger.debug(
        ` Finding moves for: ${piece.constructor.name} (${piece.color})`
      );

      const allValidMoves = piece.getValidMoves(this.board);
      logger.debug(` Found ${allValidMoves.length} valid moves`);

      return allValidMoves;
    } catch (error) {
      logger.error(" Error getting valid moves:", error);
      return [];
    }
  }

  // החלפת תור שחקן
  switchPlayer() {
    logger.debug(` Switching player from ${this.currentPlayer}`);

    try {
      const previousPlayer = this.currentPlayer;
      this.currentPlayer =
        this.currentPlayer === ChessConfig.WHITE_PLAYER
          ? ChessConfig.BLACK_PLAYER
          : ChessConfig.WHITE_PLAYER;

      logger.info(
        ` Current player updated to ${this.currentPlayer} (previous: ${previousPlayer})`
      );
    } catch (errofr) {
      logger.error(" Error switching player:", error);
      throw new Error(`Failed to switch player: ${error.message}`);
    }
  }

  getCurrentPlayer() {
    logger.debug(` Current player: ${this.currentPlayer}`);
    return this.currentPlayer;
  }

  getBoard() {
    logger.debug(" Returning current board");
    try {
      return this.board;
    } catch (error) {
      logger.error(" Error returning board:", error);
      return [];
    }
  }

  getCapturedPieces() {
    logger.debug(
      ` Returning captured pieces list (${this.capturedPiecesArray.length} pieces)`
    );
    try {
      return this.capturedPiecesArray;
    } catch (error) {
      logger.error(" Error returning captured pieces:", error);
      return [];
    }
  }

 
}
