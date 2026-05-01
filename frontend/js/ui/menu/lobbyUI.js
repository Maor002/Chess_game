export const LobbyUI = {
  getElements() {
    return {
      modal:      document.getElementById("lobby-dialog"),
      overlay:    document.querySelector("#lobby-dialog .overlay"),
      closeBtn:   document.getElementById("closeBtn"),
      createBtn:  document.getElementById("createRoomBtn"),
      joinBtn:    document.getElementById("joinRoomBtn"),
      roomInput:  document.getElementById("roomInput"),
      roomStatus: document.getElementById("roomStatus"),
    };
  },

  setStatus(el, message, state) {
    // state: "idle" | "checking" | "valid" | "invalid"
    el.textContent = message;
    el.className = `room-status ${state}`;
  },

  setJoinEnabled(btn, enabled) {
    btn.disabled = !enabled;
  },

  show(modal) {
    modal.classList.remove("hidden");
  },

  hide(modal, container) {
    modal.classList.add("hidden");
    container.innerHTML = "";
  },
};