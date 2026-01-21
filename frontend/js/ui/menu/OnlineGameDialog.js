import { LanguageManager } from "../../language/Language.js";
import { logger } from "../../logger/logger.js";

export class OnlineGameDialog {
  constructor() {
    this.langManager = new LanguageManager(this);
    this.dialogElement = null;
    this.isOpen = false;
    this.currentCallback = null;
    
    this.createDialog();
    logger.debug("OnlineGameDialog initialized.");
  }

  createDialog() {
    // Check if dialog already exists
    if (document.getElementById("online-game-dialog")) {
      this.dialogElement = document.getElementById("online-game-dialog");
      return;
    }

    // Create dialog HTML
    const dialogHTML = `
      <div id="online-game-dialog" class="online-dialog-overlay" style="display: none;">
        <div class="online-dialog">
          <div class="online-dialog-header">
            <h2 id="online-dialog-title">${this.langManager.translate("online-game")}</h2>
            <button class="online-dialog-close" id="online-dialog-close">×</button>
          </div>
          
          <div class="online-dialog-content">
            <!-- Step 1: Enter player name -->
            <div id="step-player-name" class="dialog-step active">
              <div class="form-group">
                <label for="player-name-input">${this.langManager.translate("enter-player-name")}</label>
                <input 
                  type="text" 
                  id="player-name-input" 
                  class="dialog-input" 
                  placeholder="${this.langManager.translate("your-name")}"
                  maxlength="20"
                />
                <span class="input-hint">${this.langManager.translate("name-hint")}</span>
              </div>
              <div class="dialog-actions">
                <button class="dialog-btn dialog-btn-primary" id="btn-continue-name">
                  ${this.langManager.translate("continue")}
                </button>
              </div>
            </div>

            <!-- Step 2: Choose game mode -->
            <div id="step-game-mode" class="dialog-step">
              <div class="game-mode-options">
                <button class="game-mode-card" id="btn-create-game">
                  <div class="card-icon">🎮</div>
                  <h3>${this.langManager.translate("create-game")}</h3>
                  <p>${this.langManager.translate("create-game-desc")}</p>
                </button>
                
                <button class="game-mode-card" id="btn-join-game">
                  <div class="card-icon">🔗</div>
                  <h3>${this.langManager.translate("join-game")}</h3>
                  <p>${this.langManager.translate("join-game-desc")}</p>
                </button>
              </div>
              <div class="dialog-actions">
                <button class="dialog-btn dialog-btn-secondary" id="btn-back-to-name">
                  ${this.langManager.translate("back")}
                </button>
              </div>
            </div>

            <!-- Step 3: Join game - enter game ID -->
            <div id="step-join-game" class="dialog-step">
              <div class="form-group">
                <label for="game-id-input">${this.langManager.translate("enter-game-id")}</label>
                <input 
                  type="text" 
                  id="game-id-input" 
                  class="dialog-input game-id-input" 
                  placeholder="XXXX-XXXX"
                  maxlength="9"
                />
                <span class="input-hint">${this.langManager.translate("game-id-hint")}</span>
              </div>
              <div class="dialog-actions">
                <button class="dialog-btn dialog-btn-secondary" id="btn-back-to-mode">
                  ${this.langManager.translate("back")}
                </button>
                <button class="dialog-btn dialog-btn-primary" id="btn-join-game-confirm">
                  ${this.langManager.translate("join")}
                </button>
              </div>
            </div>

            <!-- Step 4: Waiting for opponent -->
            <div id="step-waiting" class="dialog-step">
              <div class="waiting-content">
                <div class="spinner"></div>
                <h3>${this.langManager.translate("waiting-for-opponent")}</h3>
                <div class="game-code-display">
                  <label>${this.langManager.translate("game-code")}</label>
                  <div class="game-code">
                    <span id="waiting-game-code">----</span>
                    <button class="copy-btn" id="btn-copy-code" title="${this.langManager.translate("copy")}">
                      📋
                    </button>
                  </div>
                </div>
                <p class="waiting-hint">${this.langManager.translate("share-code-hint")}</p>
              </div>
              <div class="dialog-actions">
                <button class="dialog-btn dialog-btn-secondary" id="btn-cancel-waiting">
                  ${this.langManager.translate("cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert into DOM
    document.body.insertAdjacentHTML("beforeend", dialogHTML);
    this.dialogElement = document.getElementById("online-game-dialog");
    
    this.bindDialogEvents();
  }

  bindDialogEvents() {
    // Close button
    document.getElementById("online-dialog-close")?.addEventListener("click", () => {
      this.close();
    });

    // Click outside to close
    this.dialogElement.addEventListener("click", (e) => {
      if (e.target === this.dialogElement) {
        this.close();
      }
    });

    // Step 1: Continue with player name
    document.getElementById("btn-continue-name")?.addEventListener("click", () => {
      this.handleContinueName();
    });

    // Step 1: Enter key on player name
    document.getElementById("player-name-input")?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleContinueName();
      }
    });

    // Step 2: Create game
    document.getElementById("btn-create-game")?.addEventListener("click", () => {
      this.handleCreateGame();
    });

    // Step 2: Join game
    document.getElementById("btn-join-game")?.addEventListener("click", () => {
      this.showStep("step-join-game");
    });

    // Step 2: Back to name
    document.getElementById("btn-back-to-name")?.addEventListener("click", () => {
      this.showStep("step-player-name");
    });

    // Step 3: Back to mode
    document.getElementById("btn-back-to-mode")?.addEventListener("click", () => {
      this.showStep("step-game-mode");
    });

    // Step 3: Join game confirm
    document.getElementById("btn-join-game-confirm")?.addEventListener("click", () => {
      this.handleJoinGame();
    });

    // Step 3: Enter key on game ID
    document.getElementById("game-id-input")?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleJoinGame();
      }
    });

    // Auto-format game ID input (XXXX-XXXX)
    document.getElementById("game-id-input")?.addEventListener("input", (e) => {
      let value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (value.length > 4) {
        value = value.slice(0, 4) + "-" + value.slice(4, 8);
      }
      e.target.value = value;
    });

    // Step 4: Copy game code
    document.getElementById("btn-copy-code")?.addEventListener("click", () => {
      this.copyGameCode();
    });

    // Step 4: Cancel waiting
    document.getElementById("btn-cancel-waiting")?.addEventListener("click", () => {
      this.handleCancelWaiting();
    });
  }

  open(callback) {
    this.currentCallback = callback;
    this.isOpen = true;
    this.dialogElement.style.display = "flex";
    this.showStep("step-player-name");
    
    // Focus on player name input
    setTimeout(() => {
      document.getElementById("player-name-input")?.focus();
    }, 100);
    
    logger.debug("OnlineGameDialog opened");
  }

  close() {
    this.isOpen = false;
    this.dialogElement.style.display = "none";
    this.currentCallback = null;
    this.resetDialog();
    logger.debug("OnlineGameDialog closed");
  }

  showStep(stepId) {
    // Hide all steps
    const steps = this.dialogElement.querySelectorAll(".dialog-step");
    steps.forEach(step => step.classList.remove("active"));

    // Show target step
    const targetStep = document.getElementById(stepId);
    if (targetStep) {
      targetStep.classList.add("active");
    }
  }

  handleContinueName() {
    const nameInput = document.getElementById("player-name-input");
    const playerName = nameInput?.value.trim();

    if (!playerName) {
      this.showError(nameInput, this.langManager.translate("name-required"));
      return;
    }

    if (playerName.length < 2) {
      this.showError(nameInput, this.langManager.translate("name-too-short"));
      return;
    }

    this.playerName = playerName;
    this.showStep("step-game-mode");
    logger.debug("Player name set:", playerName);
  }

  handleCreateGame() {
    if (this.currentCallback) {
      this.currentCallback({
        action: "create",
        playerName: this.playerName
      });
    }
    logger.debug("Create game requested");
  }

  handleJoinGame() {
    const gameIdInput = document.getElementById("game-id-input");
    const gameId = gameIdInput?.value.trim();

    if (!gameId) {
      this.showError(gameIdInput, this.langManager.translate("game-id-required"));
      return;
    }

    if (gameId.length < 8) {
      this.showError(gameIdInput, this.langManager.translate("game-id-invalid"));
      return;
    }

    if (this.currentCallback) {
      this.currentCallback({
        action: "join",
        playerName: this.playerName,
        gameId: gameId
      });
    }
    logger.debug("Join game requested:", gameId);
  }

  showWaiting(gameCode) {
    this.showStep("step-waiting");
    const codeElement = document.getElementById("waiting-game-code");
    if (codeElement) {
      codeElement.textContent = gameCode;
    }
    logger.debug("Showing waiting screen with code:", gameCode);
  }

  copyGameCode() {
    const codeElement = document.getElementById("waiting-game-code");
    const code = codeElement?.textContent;

    if (code && code !== "----") {
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById("btn-copy-code");
        if (btn) {
          const originalText = btn.textContent;
          btn.textContent = "✓";
          btn.classList.add("copied");
          
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove("copied");
          }, 2000);
        }
        logger.debug("Game code copied to clipboard");
      }).catch(err => {
        logger.error("Failed to copy game code:", err);
      });
    }
  }

  handleCancelWaiting() {
    if (this.currentCallback) {
      this.currentCallback({
        action: "cancel"
      });
    }
    this.close();
  }

  showError(inputElement, message) {
    if (!inputElement) return;

    inputElement.classList.add("error");
    
    // Remove existing error message
    const existingError = inputElement.parentElement.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    inputElement.parentElement.appendChild(errorDiv);

    // Remove error on input
    const removeError = () => {
      inputElement.classList.remove("error");
      errorDiv.remove();
      inputElement.removeEventListener("input", removeError);
    };
    inputElement.addEventListener("input", removeError);
  }

  resetDialog() {
    // Reset all inputs
    const nameInput = document.getElementById("player-name-input");
    const gameIdInput = document.getElementById("game-id-input");
    
    if (nameInput) nameInput.value = "";
    if (gameIdInput) gameIdInput.value = "";
    
    // Clear errors
    const errorInputs = this.dialogElement.querySelectorAll(".error");
    errorInputs.forEach(input => input.classList.remove("error"));
    
    const errorMessages = this.dialogElement.querySelectorAll(".error-message");
    errorMessages.forEach(msg => msg.remove());
    
    this.playerName = null;
  }

  updateLanguage() {
    // Update all text content when language changes
    this.createDialog();
  }
}