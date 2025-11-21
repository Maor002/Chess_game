import { LanguageManager } from "../../language/Language.js";
import {logger} from "../../Logger/logger.js";
import { UIAlert } from "../../ui/Alerts/UIAlert.js";

class ChessMenu {
  constructor() {
    this.langManager = new LanguageManager(this);
    this.alert = new UIAlert(this.langManager);
    this.elements = null;
    
    this.initializeElements();
    this.bindEvents();
    logger.debug("ChessMenu initialized.");
  }

  initializeElements() {
    this.elements = {
      localGameBtn: document.getElementById("start-local-game"),
      onlineGameBtn: document.getElementById("start-online-game"),
      puzzlesBtn: document.getElementById("start-puzzles"),
      vsComputerBtn: document.getElementById("start-vs-computer"),
    };

    // Validate that all elements exist
    Object.entries(this.elements).forEach(([key, element]) => {
      if (!element) {
        logger.error(`Element '${key}' not found in DOM`);
      }
    });
  }

  bindEvents() {
    if (!this.elements.localGameBtn || !this.elements.onlineGameBtn) {
      logger.error("Cannot bind events: required elements missing");
      return;
    }

    this.elements.localGameBtn.addEventListener("click", () => {
      this.handleLocalGame();
    });

    this.elements.onlineGameBtn.addEventListener("click", () => {
      this.handleOnlineGame();
    });

    // Add event listeners for other buttons
    this.elements.puzzlesBtn?.addEventListener("click", () => {
      this.handlePuzzles();
    });

    this.elements.vsComputerBtn?.addEventListener("click", () => {
      this.handleVsComputer();
    });
  }

  async handleLocalGame() {
    logger.info("Local Game button clicked");
   // window.location.href = "html/Board.html";
    try {
        const gameData = {
            mode: "local",  
            players: ["white", "black"],
            turn : "white" ,
             board:["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"],
             status: "active"
        };
        localStorage.setItem("chessGameData", JSON.stringify(gameData));
        window.location.href = "html/Board.html";
    } catch (error) {
        logger.error("Error starting local game:", error);
        this.alert.error(
            this.langManager.translate("error"),
            this.langManager.translate("Failed to start local game")
        );
    }
};
  

  handleOnlineGame() {
    logger.info("Online Game button clicked");
    this.alert.warning(
      this.langManager.translate("message"),
      this.langManager.translate("Page under construction")
    );
  }

  handlePuzzles() {
    logger.info("Puzzles button clicked");
      this.alert.warning(
      this.langManager.translate("message"),
      this.langManager.translate("Page under construction")
    );
    // TODO: Implement puzzles functionality
  }

  handleVsComputer() {
    logger.info("VS Computer button clicked");
     logger.info("Puzzles button clicked");
      this.alert.warning(
      this.langManager.translate("message"),
      this.langManager.translate("Page under construction")
    );
    // TODO: Implement VS Computer functionality
  }
}

// Create global instance
const chessMenu = new ChessMenu();
