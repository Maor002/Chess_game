/**
 * ===== בקר המשחק הראשי =====
 * מתאם בין מנוע השחמט לממשק המשתמש
 */
import { ChessEngine } from "../../engine/ManagerChessEngine.js";
import {logger} from "../../logger/logger.js";
import { ChessUI } from "../board-game/ManagerChessUI.js";

export class ChessGameController {
  constructor() {
    this.engine = new ChessEngine();
    this.ui = new ChessUI(this.engine);
    this.initialize();
    logger.debug("ChessGameController initialized");
  }

  /**
   * אתחול המשחק
   */
  initialize() {
    this.ui.updateDisplay();
    this.ui.clearStatusMessage();
  }

}


const gameController = new ChessGameController();
