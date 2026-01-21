import { io } from "socket.io-client";
import { logger } from "../../logger/logger.js";

export class OnlineGameService {
  constructor() {
    this.socket = null;
    this.gameId = null;
    this.playerId = null;
    this.serverUrl = "http://localhost:3001"; // ✅ תיקון
  }

  connect() {
    if (this.socket) return Promise.resolve();

    return new Promise((resolve, reject) => {
      logger.debug("Connecting to Socket.IO server:", this.serverUrl);

      this.socket = io(this.serverUrl, {
        transports: ["websocket"],
        reconnection: true,
      });

      this.socket.once("connect", () => {
        logger.debug("Socket.IO connected:", this.socket.id);
        resolve();
      });

      this.socket.once("connect_error", (err) => {
        logger.error("Socket.IO connection error:", err);
        reject(err);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      logger.info("Socket.IO disconnected");
    }
  }

  on(event, cb) {
    this.socket?.on(event, cb);
  }

  emit(event, payload) {
    if (!this.socket) {
      logger.error("Socket not connected");
      return;
    }
    logger.debug("Emit:", event, payload);
    this.socket.emit(event, payload);
  }

  /* ========= GAME ACTIONS ========= */

  createGame(playerName) {
    this.playerId = this.generatePlayerId();

    this.emit("game:create", {
      playerId: this.playerId,
      playerName,
    });
  }

  joinGame(gameId, playerName) {
    this.playerId = this.generatePlayerId();
    this.gameId = gameId;

    this.emit("game:join", {
      gameId,
      playerId: this.playerId,
      playerName,
    });
  }

  sendMove(from, to, piece, capturedPiece = null) {
    this.emit("game:move", {
      roomCode: this.gameId,
      playerId: this.playerId,
      from,
      to,
      piece,
      capturedPiece,
    });
  }

  generatePlayerId() {
    return `player_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
// שימוש בדוגמה:
// const onlineGameService = new OnlineGameService();
// await onlineGameService.connect(); 