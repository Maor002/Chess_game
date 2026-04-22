export class LobbyLogic {
  constructor() {
    this.modal = null;
    this.overlay = null;
    this.closeBtn = null;
  }

  init() {
    // Now elements exist
    this.modal = document.getElementById("lobby-dialog");
    this.overlay = this.modal?.querySelector(".overlay");
    this.closeBtn = document.getElementById("closeBtn");

    if (!this.modal) {
      console.error("Lobby modal not found");
      return;
    }

    // Open modal
    this.modal.classList.remove("hidden");

    // Bind events
    this.bindEvents();
  }

  bindEvents() {
    const close = () => {
      this.modal.classList.add("hidden");

      // Optional: remove from DOM (clean memory)
      document.getElementById("lobbyContainer").innerHTML = "";
    };

    this.closeBtn?.addEventListener("click", close);
    this.overlay?.addEventListener("click", close);
  }
}