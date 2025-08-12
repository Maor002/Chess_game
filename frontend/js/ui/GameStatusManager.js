// ===== מודול לניהול מצב המשחק =====
// מודול זה אחראי על ניהול מצב המשחק, כולל תור השחקן, הכלים שנלכדו והודעות למשתמש
// הוא מספק פונקציות לעדכון התצוגה של תור השחקן, הכלים שנלכדו והודעות למשתמש
import { ChessConfig } from "../config/chessConfig.js";
export class GameStatusManager {
  constructor(turnElement, capturedElement, statusElement) {
    this.turnElement = turnElement;
    this.capturedElement = capturedElement;
    this.statusElement = statusElement;
  }

  updateTurn(currentPlayer) {
    this.turnElement.textContent =
      currentPlayer === ChessConfig.WHITE_PLAYER ? "תור הלבן" : "תור השחור";
  }

  updateCapturedPieces(capturedPieces) {
    if (!capturedPieces || capturedPieces.length === 0) {
      return;
    }
    const piece = capturedPieces[capturedPieces.length - 1];
    this.capturedElement.textContent = capturedPieces
      .map((p) => ChessConfig.pieces[p.color + p.type])
      .join(" ");
  }

  showMessage(message, type = "") {
    this.statusElement.textContent = message;
    this.statusElement.className = `status-message ${type}`;
  }

  clearMessage() {
    this.statusElement.textContent = "";
    this.statusElement.className = "status-message";
  }
}
