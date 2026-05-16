/**
 * LobbyUI.js
 * ----------
 * DOM helpers and input validation for the Lobby dialog.
 */

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

  // state: "idle" | "checking" | "valid" | "invalid"
  setStatus(el, message, state) {
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

  // --- Validation ---

  // TODO: adjust regex to match your Room ID format
validateRoomId(roomId) {
  if (!roomId || roomId.trim().length === 0) {
    return { valid: false, message: "" };
  }
  if (!/^[0-9]{6}$/.test(roomId.trim())) {
    return { valid: false, message: "⚠️ 6-digit code only" };
  }
  return { valid: true, message: "" };
},
};