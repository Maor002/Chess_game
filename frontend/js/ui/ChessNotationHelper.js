import { ChessConfig } from "../config/chessConfig.js";
// ===== מודול עזר להמרת מיקום ללוח שחמט =====
// מודול זה מספק פונקציות להמרת מיקום (שורה, עמודה) לתצוגת שחמטית
// כמו גם לפורמט המהלך בתצוגה גרפית
export default class ChessNotationHelper {
  static convertToChessNotation(rowIndex, colIndex) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
    return letters[colIndex] + numbers[rowIndex];
  }
  
  static formatMove(move) {
    const pieceSymbol = ChessConfig.pieces[move.pieceColor + move.pieceType];
    const from = this.convertToChessNotation(move.from.row, move.from.col);
    const to = this.convertToChessNotation(move.to.row, move.to.col);
    return `${pieceSymbol} ${from} → ${to}`;
  }
}