import { LanguageManager } from "../../language/Language.js";
import { logger } from "../../logger/logger.js";
import { UIAlert } from "../alerts/UIAlert.js";
import { GameService } from "../../service/api/GameService.js";
import { pageRouter } from "./PageRouter.js";

class ChessMenu {
  constructor() {
    this.langManager = new LanguageManager(this);
    this.alert = new UIAlert(this.langManager);
    this.gameService = new GameService();
    this.modalContainer = document.getElementById("modal-container");
    this.initializeElements();
    this.bindEvents();
    logger.debug("ChessMenu initialized.");
  }

  initializeElements() {
    this.elements = {
      localGameBtn:   document.getElementById("start-local-game"),
      onlineGameBtn:  document.getElementById("start-online-game"),
      puzzlesBtn:     document.getElementById("start-puzzles"),
      vsComputerBtn:  document.getElementById("start-vs-computer"),
    };

    Object.entries(this.elements).forEach(([key, el]) => {
      if (!el) logger.error(`Element '${key}' not found in DOM`);
    });
  }

  bindEvents() {
    const { localGameBtn, onlineGameBtn, puzzlesBtn, vsComputerBtn } = this.elements;

    localGameBtn?.addEventListener("click",    () => this.handleLocalGame());
    onlineGameBtn?.addEventListener("click",   () => this.handleOnlineGame());
    puzzlesBtn?.addEventListener("click",      () => this.handleComingSoon());
    vsComputerBtn?.addEventListener("click",   () => this.handleComingSoon());
  }

  async handleLocalGame() {
    logger.info("Local game button clicked");

    const existing = await this.gameService.getCurrentLocalGameData();
    if (existing) {
      logger.info("Existing local game found, navigating to board");
      pageRouter.navigateTo("board");
      return;
    }

    const gameData = {
      players: ["white", "black"],
      turn: "white",
      boardState: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      status: "active",
      gameMode: "local",
    };

    this.gameService.clearGameData();
    const created = await this.gameService.createLocalGame(gameData);

    if (created?._id) {
      this.gameService.setCurrentLocalGame(created);
      logger.debug("Local game created with ID:", created._id);
      pageRouter.navigateTo("board");
    } else {
      logger.error("Failed to create local game");
      this.alert.error(
        this.langManager.translate("error"),
        this.langManager.translate("Failed-to-start-local-game"),
      );
    }
  }

  async handleOnlineGame() {
    logger.debug("Online game button clicked");

    if (!this.modalContainer) {
      logger.error("modal-container not found in DOM");
      return;
    }

    try {
      const response = await fetch("/html/components/lobbyDialog.html");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.modalContainer.innerHTML = await response.text();
    } catch (err) {
      logger.error("Failed to load lobby dialog:", err);
      return;
    }

    const modal   = document.getElementById("lobbyDialog");
    const overlay = modal?.querySelector(".overlay");
    const closeBtn = document.getElementById("closeBtn");

    if (!modal || !overlay || !closeBtn) {
      logger.error("LobbyDialog: required elements missing after load");
      return;
    }

    const close = () => {
      modal.classList.add("hidden");
      this.modalContainer.innerHTML = "";
    };

    modal.classList.remove("hidden");
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);
  }

  handleComingSoon() {
    this.alert.warning(
      this.langManager.translate("message"),
      this.langManager.translate("Page under construction"),
    );
  }
}

const chessMenu = new ChessMenu();