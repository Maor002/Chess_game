import { ChessConfig } from "../config/chessConfig";
import { Rook, Bishop, Knight, Queen, King, Pawn } from "../pieces/Pieces.js";
import {logger} from "../Logger/logger.js";
export class BoardBuilder {
  constructor() {
    this.board = Array.from({ length: ChessConfig.BOARD_SIZE }, () =>
      Array(ChessConfig.BOARD_SIZE).fill(null)// יצירת לוח ריק 
    );
  }
  //יוצר את הלוח ומחזיר אותו
  initializeBoard() {
    try {
    logger.debug("Initializing chess board");
    for (let row = 0; row < ChessConfig.BOARD_SIZE; row++) {
      for (let col = 0; col < ChessConfig.BOARD_SIZE; col++) {
        const piece = ChessConfig.initialBoard[row][col];
        this.createPiece(piece, row, col);
      }
    }
    this.currentPlayer = ChessConfig.WHITE_PLAYER;
    logger.debug(` Current player: ${this.currentPlayer}`);

    logger.info(` Board initialized successfully `);

    return this.board; // מחזיר את הלוח
    } catch (error) {
      logger.error(" Error initializing board:", error);
      throw new Error(`Failed to initialize board: ${error.message}`);
    }
  }
 
  //יוצר את הכלים על הלוח
  createPiece(piece, row, col) {
    try {
      const type = piece[1];
      switch (type) {
        case "P":
        this.createPawn(piece, row, col);
          break;
        case "R":
          this.createRook(piece, row, col);
          break;
        case "N":
          this.createKnight(piece, row, col);
          break;
        case "B":
          this.createBishop(piece, row, col);
          break;
        case "Q":
          this.createQueen(piece, row, col);
          break;
        case "K":
          this.createKing(piece, row, col);
          break;
        default:
          this.board[row][col] = ""; // אם אין כלי, השאר ריק
      }
    } catch (error) {
      logger.error(" Error initializing board:", error);
      throw new Error(`Failed to initialize board: ${error.message}`);
    }
  }
  createPawn(piece, row, col) {
    this.board[row][col] = new Pawn(
      piece[0],
      piece[1],
      row,
      col,
      ChessConfig.grade["P"]
    );
  }
  createKing(piece, row, col) {
    this.board[row][col] = new King(
      piece[0],
      piece[1],
      row,
      col,
      ChessConfig.grade["K"]
    );
  }
  createRook(piece, row, col) {
    this.board[row][col] = new Rook(
      piece[0],
      piece[1],
      row,
      col,
      ChessConfig.grade["R"]
    );
  }
  createKnight(piece, row, col) {
    this.board[row][col] = new Knight(
      piece[0],
      piece[1],
      row,
      col,
      ChessConfig.grade["N"]
    );
  }
  createBishop(piece, row, col) {
    this.board[row][col] = new Bishop(
      piece[0],
      piece[1],
      row,
      col,
      ChessConfig.grade["B"]
    );
  }
  createQueen(piece, row, col) {
    this.board[row][col] = new Queen(
      piece[0],
      piece[1],
      row,
      col,
      ChessConfig.grade["Q"]
    );
  }
  getBoard() {
    return this.board;
  }
}

