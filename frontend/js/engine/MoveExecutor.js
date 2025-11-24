import {logger} from "../logger/logger.js";
import { ChessConfig } from "../config/chessConfig.js";
export class MoveExecutor {
  constructor(engine) {
    this.engine = engine;
    this.capturedPiecesArray = [];
    this.historyMoves = [];
  }

  executeMove(fromRow, fromCol, toRow, toCol) {
    logger.debug(
      ` Making move from [${fromRow},${fromCol}] to [${toRow},${toCol}]`
    );
    try {
      const movingPiece = this.engine.board[fromRow][fromCol];
      if (!movingPiece) {
        throw new Error("No piece at source position");
      }

      const capturedPiece = this.engine.board[toRow][toCol];

      if (this.isCapturedPiece(capturedPiece)) {
        logger.info(
          ` Capturing piece: ${capturedPiece.constructor.name} (${capturedPiece.color})`
        );
        this.updateCapturedList(capturedPiece);
      }
      if (this.isKingCaptured(capturedPiece)) {
        logger.info("King has been captured, ending game");
        this.engine.gameActive = false;
        if (movingPiece.color === ChessConfig.WHITE_PLAYER) {
          this.engine.isWhiteWin = true;
        } else {
          this.engine.isWhiteWin = false;
        }
      }
      if (this.isKingMoved(movingPiece)) {
        this.engine.board[fromRow][fromCol].hasMoved = true; // עדכון אם המלך זז
        logger.debug("King has moved, updating state");

      }
      this.updatePiecePosition(movingPiece, toRow, toCol);
      this.makeMove(fromRow, fromCol, toRow, toCol);
      this.updatehistoryMoves(fromRow, fromCol, toRow, toCol, movingPiece);
      logger.debug(` Move executed successfully. Captured pieces: ${this.capturedPiecesArray.length}`);
      
    
    } catch (error) {
      logger.error(" Error executing move:", error);
      throw new Error(`Move failed: ${error.message}`);
    }
  }
  updatePiecePosition(piece, toRow, toCol) {
    piece.row = toRow; // עדכון מיקום השורה של הכלי
    piece.col = toCol; // עדכון מיקום העמודה של הכלי
  }
  makeMove(fromRow, fromCol, toRow, toCol) {
    this.engine.board[toRow][toCol] = this.engine.board[fromRow][fromCol];
    this.engine.board[fromRow][fromCol] = "";
  }
  isKingCaptured(capturedPiece) {
    if (capturedPiece.type === "K") {
      logger.info("King has been captured, ending game");
      return true;
    }
    return false;
  }
  isCapturedPiece(capturedPiece) {
    return capturedPiece !== null && capturedPiece !== undefined && capturedPiece !== "";
  }
  isKingMoved(piece) {
    if (piece.type === "K") {
      return true;
    }
    return false;
  }
  updateCapturedList(capturedPiece) {
    this.capturedPiecesArray.push(capturedPiece);
  }
  updatehistoryMoves(fromRow, fromCol, toRow, toCol, movingPiece) {
    const move = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      pieceColor: movingPiece.color,
      pieceType: movingPiece.type,
    };
    this.historyMoves.push(move);
  }
  getCapturedPieces() {
    return this.capturedPiecesArray;
  }
  getHistoryMoves() {
    return this.historyMoves;
  }

}
