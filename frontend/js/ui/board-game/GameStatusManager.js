// =====  מחלקה לניהול מצב המשחק =====
// מציגה את תור מי זה
// מציגה כלים שנתפסו
// מציגה הודעות חשובות (שח, מט)
// מעצבת את ההודעות (צבעים, אנימציות)
import { ChessConfig } from "../../config/chessConfig.js";
import { LanguageManager } from "../../language/Language.js";

export class GameStatusManager {
  constructor(turnElement, capturedElement, statusElement, languageManager) {
    this.turnElement = turnElement;
    this.capturedElement = capturedElement;
    this.statusElement = statusElement;
    this.languageManager = languageManager;
  }
  // פונקציה לעדכון תור השחקן
  updateTurn(currentPlayer) {
    this.turnElement.textContent =
      currentPlayer === ChessConfig.WHITE_PLAYER
        ? this.languageManager.translate("white-turn")
        : this.languageManager.translate("black-turn");
  }
  // פונקציה לעדכון הכלים שנלכדו
  updateCapturedPieces(capturedPieces) {
    if (!capturedPieces || capturedPieces.length === 0) {
      this.clearCapturedPieces();
      return;
    }
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
  clearCapturedPieces() {
    this.capturedElement.textContent = "";
  }
}
