import { Piece } from "./Piece.js";
import {logger} from "../logger/logger.js";
//יורשים של מחלקת Piece   
// כל מחלקה מיישמת את הפונקציה getValidMoves שמחזירה את המהלכים התקפים לכלי בהתאם לחוקים
export class Pawn extends Piece {
  getValidMoves(board) {
    const validMoves = [];
    try {
      const direction = this.color === "w" ? -1 : 1; // כיוון התנועה של הרגלי

      if (this.row === 0 || this.row === 7) {
        return validMoves;
      }

      // תזוזה קדימה אם המשבצת פנויה
      if (board[this.row + direction][this.col] === "") {
        validMoves.push([this.row + direction, this.col]);
      }

      // תזוזה אלכסונית לתפיסת כלי יריב
      if (this.col - 1 > -1)
        if (
          board[this.row + direction][this.col - 1] !== "" &&
          board[this.row][this.col].color !==
            board[this.row + direction][this.col - 1].color
        )
          validMoves.push([this.row + direction, this.col - 1]);
      if (this.col + 1 < 8)
        if (
          board[this.row + direction][this.col + 1] !== "" &&
          board[this.row][this.col].color !==
            board[this.row + direction][this.col + 1].color
        )
          validMoves.push([this.row + direction, this.col + 1]);

      // תנועה של שתי משבצות אם הרגלי בהתחלה
      if (
        (direction === 1 && this.row === 1) ||
        (direction === -1 && this.row === 6)
      ) {
        if (
          board[this.row + direction][this.col] === "" &&
          board[this.row + 2 * direction][this.col] === ""
        ) {
          validMoves.push([this.row + 2 * direction, this.col]);
        }
      }
    } catch (error) {
      logger.error("Error calculating valid pawn moves:", error);
    }

    return validMoves;
  }
}

export class Rook extends Piece {
  getValidMoves(board) {
    const validMoves = [];
    // לוגיקה לקבלת מהלכים תקפים לצריח
    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    try {
      for (let index = 0; index < directions.length; index++) {
        const [x, y] = directions[index];
        let newRow = this.row + x;
        let newCol = this.col + y;

        while (-1 < newRow && newRow < 8 && -1 < newCol && newCol < 8) {
          if (board[newRow][newCol] !== "") {
            if (board[newRow][newCol].color !== this.color) {
              validMoves.push([newRow, newCol]);
              break; // אם יש כלי יריב, להוסיף את המיקום ולצאת מהלולאה
            } else {
              break; // אם יש כלי שלנו, לצאת מהלולאה
            }
          } else if (board[newRow][newCol].color === this.color) {
            break; // אם יש כלי שלנו, לצאת מהלולאה
          } else {
            validMoves.push([newRow, newCol]); // אם המשבצת פנויה, להוסיף את המיקום
          }
          newRow += x;
          newCol += y;
        }
      }
    } catch (error) {
      logger.error("Error calculating valid Bishop moves:", error);
    }
    return validMoves;
  }
}

export class Bishop extends Piece {
  getValidMoves(board) {
    const validMoves = [];
    // לוגיקה לקבלת מהלכים תקפים לרץ
    const directions = [
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ];
    try {
      for (let index = 0; index < directions.length; index++) {
        const [x, y] = directions[index];
        let newRow = this.row + x;
        let newCol = this.col + y;

        while (-1 < newRow && newRow < 8 && -1 < newCol && newCol < 8) {
          if (board[newRow][newCol] !== "") {
            if (board[newRow][newCol].color !== this.color) {
              validMoves.push([newRow, newCol]);
              break; // אם יש כלי יריב, להוסיף את המיקום ולצאת מהלולאה
            } else {
              break; // אם יש כלי שלנו, לצאת מהלולאה
            }
          } else if (board[newRow][newCol].color === this.color) {
            break; // אם יש כלי שלנו, לצאת מהלולאה
          } else {
            validMoves.push([newRow, newCol]); // אם המשבצת פנויה, להוסיף את המיקום
          }
          newRow += x;
          newCol += y;
        }
      }
    } catch (error) {
      logger.error("Error calculating valid Bishop moves:", error);
    }
    return validMoves;
  }
}

export class Knight extends Piece {
  getValidMoves(board) {
    const validMoves = [];
    const directions = [
      [1, 2],
      [-1, 2],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [2, -1],
      [2, 1],
      [-2, 1],
    ];
    // לוגיקה לקבלת מהלכים תקפים לפרש
    try {
      for (let index = 0; index < directions.length; index++) {
        const [x, y] = directions[index];
        const newRow = this.row + x;
        const newCol = this.col + y;
        if (-1 < newRow && newRow < 8 && -1 < newCol && newCol < 8)
          if (
            board[newRow][newCol] === "" ||
            board[newRow][newCol].color !== this.color
          )
            validMoves.push([newRow, newCol]);
      }
    } catch (error) {
      logger.error("Error calculating valid king moves:", error);
    }
    return validMoves;
  }
}

export class Queen extends Piece {
  getValidMoves(board) {
    const validMoves = [];

    // לוגיקה לקבלת מהלכים תקפים למלכה
    const directions = [
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    try {
      for (let index = 0; index < directions.length; index++) {
        const [x, y] = directions[index];
        let newRow = this.row + x;
        let newCol = this.col + y;

        while (-1 < newRow && newRow < 8 && -1 < newCol && newCol < 8) {
          if (board[newRow][newCol] !== "") {
            if (board[newRow][newCol].color !== this.color) {
              validMoves.push([newRow, newCol]);
              break; // אם יש כלי יריב, להוסיף את המיקום ולצאת מהלולאה
            } else {
              break; // אם יש כלי שלנו, לצאת מהלולאה
            }
          } else if (board[newRow][newCol].color === this.color) {
            break; // אם יש כלי שלנו, לצאת מהלולאה
          } else {
            validMoves.push([newRow, newCol]); // אם המשבצת פנויה, להוסיף את המיקום
          }
          newRow += x;
          newCol += y;
        }
      }
    } catch (error) {
      logger.error("Error calculating valid Bishop moves:", error);
    }
    return validMoves;
  }
}

export class King extends Piece {
  constructor(color, type, row, col, grade = 0) {
    super(color, type, row, col, grade);
    this.hasMoved = false;
  }

  getValidMoves(board) {
    const validMoves = [];
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    // לוגיקה לקבלת מהלכים תקפים למלך
    try {
      for (let index = 0; index < directions.length; index++) {
        const [x, y] = directions[index];
        const newRow = this.row + x;
        const newCol = this.col + y;
        if (-1 < newRow && newRow < 8 && -1 < newCol && newCol < 8)
          if (
            board[newRow][newCol] === "" ||
            board[newRow][newCol].color !== this.color
          )
            validMoves.push([newRow, newCol]);
      }
    } catch (error) {
      logger.error("Error calculating valid king moves:", error);
    }
    return validMoves;
  }
}
