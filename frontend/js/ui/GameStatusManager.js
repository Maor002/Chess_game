// =====  מחלקה לניהול מצב המשחק =====
// מציגה את תור מי זה
// מציגה כלים שנתפסו
// מציגה הודעות חשובות (שח, מט)
// מעצבת את ההודעות (צבעים, אנימציות)
import { ChessConfig } from "../config/chessConfig.js";
import ChessNotationHelper from "./ChessNotationHelper.js";

export class GameStatusManager {
  constructor(turnElement, capturedElement, statusElement) {
    this.turnElement = turnElement;
    this.capturedElement = capturedElement;
    this.statusElement = statusElement;
  }
// פונקציה לעדכון תור השחקן
  updateTurn(currentPlayer) {
    this.turnElement.textContent =
      currentPlayer === ChessConfig.WHITE_PLAYER ? "תור הלבן" : "תור השחור";
  }
// פונקציה לעדכון הכלים שנלכדו
  updateCapturedPieces(capturedPieces) {
    if (!capturedPieces || capturedPieces.length === 0) {
      return;
    }
    const piece = capturedPieces[capturedPieces.length - 1];
    this.capturedElement.textContent = capturedPieces
      .map((p) => ChessConfig.pieces[p.color + p.type])
      .join(" ");
  }
// פונקציה להצגת הודעה למשתמש
  showMessage(message, type = "") {
    this.statusElement.textContent = message;
    this.statusElement.className = `status-message ${type}`;
  }
// פונקציה לניקוי הודעה
  clearMessage() {
    this.statusElement.textContent = "";
    this.statusElement.className = "status-message";
  }
}
