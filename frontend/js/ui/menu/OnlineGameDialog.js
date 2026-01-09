import { logger } from "../../logger/logger.js";

export class OnlineGameDialog {
  constructor({ onCreate, onJoin, onClose } = {}) {
    this.onCreate = onCreate;
    this.onJoin = onJoin;
    this.onClose = onClose;

    this.templatePath = "../../html/components/online-game-dialog.html";
    this.overlayId = "online-game-overlay";
  }

  async show() {
    if (document.getElementById(this.overlayId)) return;

    const html = await this.loadTemplate();
    document.body.insertAdjacentHTML("beforeend", html);

    this.cache();
    this.bind();
  }

  close() {
    this.overlay?.remove();
    this.onClose?.();
  }

  async loadTemplate() {
    const res = await fetch(this.templatePath);
    if (!res.ok) throw new Error("Failed to load dialog template");
    return res.text();
  }

  cache() {
    this.overlay = document.getElementById(this.overlayId);
    this.createBtn = document.getElementById("create-game-btn");
    this.joinBtn = document.getElementById("join-game-btn");
    this.confirmJoinBtn = document.getElementById("confirm-join-btn");
    this.cancelJoinBtn = document.getElementById("cancel-join-btn");
    this.closeBtn = document.getElementById("close-dialog-btn");

    this.playerNameInput = document.getElementById("player-name-input");
    this.gameIdInput = document.getElementById("game-id-input");
    this.joinSection = document.getElementById("join-game-section");
  }

  bind() {
    this.overlay.addEventListener("click", e => {
      if (e.target === this.overlay) this.close();
    });

    this.closeBtn.addEventListener("click", () => this.close());

    this.createBtn.addEventListener("click", () => {
      this.disable();
      this.onCreate?.(this.playerName());
    });

    this.joinBtn.addEventListener("click", () => {
      this.joinSection.style.display = "block";
    });

    this.confirmJoinBtn.addEventListener("click", () => {
      const gameId = this.gameIdInput.value.trim();
      if (!gameId) return alert("הכנס קוד משחק");

      this.confirmJoinBtn.disabled = true;
      this.onJoin?.(gameId, this.playerName());
    });

    this.cancelJoinBtn.addEventListener("click", () => {
      this.joinSection.style.display = "none";
      this.gameIdInput.value = "";
    });
  }

  disable() {
    this.createBtn.disabled = true;
    this.joinBtn.disabled = true;
  }

  playerName() {
    return this.playerNameInput.value.trim() || "Player";
  }
}
