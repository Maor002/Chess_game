/**
 * ===== בקר המשחק הראשי =====
 * מתאם בין מנוע השחמט לממשק המשתמש
 */
import { ChessEngine } from "./engine/ManagerChessEngine.js";
import { logger } from "./Logger/logger.js";
import { ChessUI } from "./ui/ManagerChessUI.js";

export class ChessGameController {
  constructor() {
    this.engine = new ChessEngine();
    this.ui = new ChessUI(this.engine);
    this.initialize();
  }

  /**
   * אתחול המשחק
   */
  initialize() {
    this.ui.updateDisplay();
    this.ui.clearStatusMessage();
  }

  //שחזור המהלך האחרון
  undoLastMove() {
    logger.debug("Undoing last move");
  }
  redoLastMove() {
    logger.debug("Redoing last move");
  }
}

document.querySelector(".new-game-btn").addEventListener("click", () => {
  gameController.ui.startNewGame();
});
document.querySelector("#undo-btn").addEventListener("click", () => {
  gameController.undoLastMove();
});
document.querySelector("#redo-btn").addEventListener("click", () => {
  gameController.redoLastMove();
});
// יצירת מופע של בקר המשחק
const gameController = new ChessGameController();
