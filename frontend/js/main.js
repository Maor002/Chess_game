/**
 * ===== בקר המשחק הראשי =====
 * מתאם בין מנוע השחמט לממשק המשתמש
 */
class ChessGameController {
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

    /**
     * התחלת משחק חדש
     */
    startNewGame() {
        this.engine.initializeBoard();
        this.ui.clearSelection();
        this.ui.updateDisplay();
        this.ui.clearStatusMessage();
    }

    /**
     * איפוס הלוח
     */
    resetBoard() {
        this.startNewGame();
    }
}

// יצירת מופע של בקר המשחק
const gameController = new ChessGameController();