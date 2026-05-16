/**
 * LobbyDialog.js
 * --------------
 * Orchestrator + event handlers for the Lobby dialog.
 *
 * Create room → REST (need a roomId back before anything else can happen)
 * Join room   → WS  (roomId already known, need a live connection)
 */

import { LobbyUI } from "../menu/LobbyUI.js";
import { GameService } from "../../service/api/GameService.js";
import { OnlineGameService } from "../../service//socket/OnlineGameService.js";
import { logger } from "@logger/logger.js";

const DEBOUNCE_MS = 300;

export async function initLobby(container) {
  const response = await fetch("/html/components/lobby-dialog.html");
  container.innerHTML = await response.text();
  const els = LobbyUI.getElements();
  const gameService = new GameService();
  const onlineService = new OnlineGameService();

  LobbyUI.show(els.modal);
  let debounceTimer = null;

  // --- Close ---
  function close() {
    clearTimeout(debounceTimer);
    LobbyUI.hide(els.modal, container);
  }

  els.closeBtn?.addEventListener("click", close);
  els.overlay?.addEventListener("click", close);

  // --- Room Input: validate + check availability (REST) ---
  els.roomInput?.addEventListener("input", () => {
    const roomId = els.roomInput.value.trim();
    clearTimeout(debounceTimer);
    LobbyUI.setJoinEnabled(els.joinBtn, false);

    const { valid, message } = LobbyUI.validateRoomId(roomId);
    if (!valid) {
      LobbyUI.setStatus(els.roomStatus, message, message ? "invalid" : "idle");
      return;
    }

    LobbyUI.setStatus(els.roomStatus, "⏳ Checking...", "checking");
    debounceTimer = setTimeout(async () => {
      try {
        const { exists, available, message } = await gameService.checkRoomExists(roomId);
        if (exists && available) {
          LobbyUI.setStatus(els.roomStatus, "✅ Room found!", "valid");
          LobbyUI.setJoinEnabled(els.joinBtn, true);
        } else if (exists && !available) {
          LobbyUI.setStatus(els.roomStatus, `❌ ${message}`, "invalid");
        } else {
          LobbyUI.setStatus(els.roomStatus, "❌ Room not found", "invalid");
        }
      } catch {
        LobbyUI.setStatus(els.roomStatus, "⚠️ Network error", "invalid");
      }
    }, DEBOUNCE_MS);
  });

  // --- Create Room: REST → then join via WS ---
  // We need the server to generate a roomId first, then open a WS connection.
  els.createBtn?.addEventListener("click", async () => {
    try {
      const { code } = await gameService.createRoom(); // server generates the code
      await onlineService.connect();
      onlineService.joinGame(code, await gameService.getPlayerName());
      logger.info("Created and joined room:", code);
    } catch (err) {
      logger.error("Create room failed:", err);
    }
  });

  // --- Join Room: WS only ---
  // Room already exists (confirmed by the input handler via REST),
  // so go straight to opening the WS connection.
  els.joinBtn?.addEventListener("click", async () => {
    const roomId = els.roomInput.value.trim();
    try {
      await onlineService.connect();
      onlineService.joinGame(roomId, await gameService.getPlayerName());
      logger.info("Joined room:", roomId);
    } catch (err) {
      logger.error("Join room failed:", err);
    }
  });
}

// ---------------------------------------------------------------------------
// Bootstrap — hook into your existing trigger button
// ---------------------------------------------------------------------------
document.getElementById("start-online-game")?.addEventListener("click", () => {
  const container = document.getElementById("lobbyContainer");
  initLobby(container);
});