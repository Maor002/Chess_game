import { logger } from "../Logger/logger.js";
export class MoveValidator {
  constructor(board){
    this.board = board;
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

}