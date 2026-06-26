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
import { pageRouter } from "./PageRouter.js";

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
    LobbyUI.setJoinEnabled(els.joinBtn, true);

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
  els.createBtn?.addEventListener("click", async () => {
    try {
      LobbyUI.setStatus(els.roomStatus, "⏳ Creating room...", "checking");
      const result = await gameService.createRoom();
      const roomCode = result.code;

      logger.info("Room created:", roomCode);

      // Store game mode as online
      gameService.save("GAME_MODE", "online");
      gameService.save("PLAYER_COLOR", "white");
      gameService.save("ROOM_CODE", roomCode);

      // Close lobby and navigate to board
      close();
      pageRouter.navigateTo("board");

      logger.info("Navigating to board with room code:", roomCode);
    } catch (err) {
      logger.error("Create room failed:", err);
      LobbyUI.setStatus(els.roomStatus, "❌ Failed to create room", "invalid");
    }
  });

  // --- Join Room: REST confirmation then navigate ---
  els.joinBtn?.addEventListener("click", async () => {
    const roomCode = els.roomInput.value.trim();
    try {
      LobbyUI.setStatus(els.roomStatus, "⏳ Joining room...", "checking");
      const result = await gameService.joinRoom(roomCode);

      if (!result.success) {
        logger.error("Join room failed:", result.message);
        LobbyUI.setStatus(els.roomStatus, "❌ " + result.message, "invalid");
        return;
      }

      logger.info("Room joined:", roomCode);

      // Store game mode as online
      gameService.save("GAME_MODE", "online");
      gameService.save("PLAYER_COLOR", "black");
      gameService.save("ROOM_CODE", roomCode);

      // Close lobby and navigate to board
      close();
      pageRouter.navigateTo("board");

      logger.info("Navigating to board with room code:", roomCode);
    } catch (err) {
      logger.error("Join room failed:", err);
      LobbyUI.setStatus(els.roomStatus, "❌ Failed to join room", "invalid");
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