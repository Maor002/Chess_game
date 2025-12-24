import { LanguageManager } from "../../language/Language.js";
import { logger } from "../../logger/logger.js";
import { UIAlert } from "../alerts/UIAlert.js";
import { GameService } from "../../service/api/GameService.js";

class ChessMenu {
  constructor() {
    this.langManager = new LanguageManager(this);
    this.alert = new UIAlert(this.langManager);
    this.elements = null;
    this.gameService = new GameService();
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

      const gameData = {
        mode: "local",
        players: ["white", "black"],
        turn: "white",
        boardState: ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"],
        status: "active",
      };
      // Clear any existing game data
      this.gameService.clearGameData();
      // Create new local game
      const created = await this.gameService.createLocalGame(gameData);
      if (created && created._id) { // Successfully created
      window.location.href = "html/Board.html"; 
    }else {
      logger.error("Failed to create local game");
      this.alert.error(
        this.langManager.translate("error"),
        this.langManager.translate("Failed-to-start-local-game")
      );
    }
  }
  

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
