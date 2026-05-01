     
import { GameService } from "../../service/api/GameService.js";
import { LobbyUI }        from "../menu/lobbyUi.js";

export async function initLobby(container) {
  // Load HTML
  const response = await fetch("/html/components/lobby-dialog.html");
  container.innerHTML = await response.text();

  const els = LobbyUI.getElements();
  LobbyUI.show(els.modal);

  let debounceTimer = null;

  // --- Input: real-time validation + availability check ---
  els.roomInput?.addEventListener("input", () => {
    const value = els.roomInput.value.trim();
    clearTimeout(debounceTimer);
    LobbyUI.setJoinEnabled(els.joinBtn, false);

    const { valid, message } = LobbyValidator.validateRoomId(value);

    if (!valid) {
      LobbyUI.setStatus(els.roomStatus, message, message ? "invalid" : "idle");
      return;
    }

    LobbyUI.setStatus(els.roomStatus, "⏳ Checking...", "checking");

    debounceTimer = setTimeout(async () => {
      try {
        const { exists } = await GameService.checkRoomExists(value);
        if (exists) {
          LobbyUI.setStatus(els.roomStatus, "✅ Room found!", "valid");
          LobbyUI.setJoinEnabled(els.joinBtn, true);
        } else {
          LobbyUI.setStatus(els.roomStatus, "❌ Room not found", "invalid");
        }
      } catch {
        LobbyUI.setStatus(els.roomStatus, "⚠️ Network error", "invalid");
      }
    }, 300);
  });

  // --- Create Room ---
  els.createBtn?.addEventListener("click", async () => {
    try {
      const { roomId } = await GameService.createRoom();
      // TODO: navigate to game with roomId
      console.log("Created room:", roomId);
    } catch (err) {
      console.error("Create room failed:", err);
    }
  });

  // --- Join Room ---
  els.joinBtn?.addEventListener("click", async () => {
    const roomId = els.roomInput.value.trim();
    try {
      await GameService.joinRoom(roomId);
      // TODO: navigate to game with roomId
      console.log("Joined room:", roomId);
    } catch (err) {
      console.error("Join room failed:", err);
    }
  });
  const LobbyValidator = (roomId) => {
   if (!roomId || roomId.trim().length === 0) {
      return { valid: false, message: "" };
    }
    // TODO: adjust this regex to match your Room ID format
    if (!/^[a-zA-Z0-9-]{4,12}$/.test(roomId.trim())) {
      return { valid: false, message: "⚠️ 4–12 alphanumeric characters only" };
    }
    return { valid: true, message: "" };
  };

  // --- Close ---
  const close = () => {
    clearTimeout(debounceTimer);
    LobbyUI.hide(els.modal, container);
  };

  els.closeBtn?.addEventListener("click", close);
  els.overlay?.addEventListener("click", close);
}

// Hook into your existing button
document.getElementById("start-online-game")?.addEventListener("click", () => {
  const container = document.getElementById("lobbyContainer");
  initLobby(container);
});