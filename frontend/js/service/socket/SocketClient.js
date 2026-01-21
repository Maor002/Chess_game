import { io } from "socket.io-client";
import { logger } from "../../logger/logger.js";

export class SocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.socket = null;
    this.handlers = new Map();
    this.options = {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      ...options
    };
  }

  connect() {
    if (this.socket) {
      logger.warn("Socket already initialized");
      return;
    }

    this.socket = io(this.url, this.options);

    this.socket.on("connect", () => {
      logger.info("Socket.IO connected");
      this._emit("CONNECT");
    });

    this.socket.on("disconnect", (reason) => {
      logger.warn("Socket.IO disconnected:", reason);
      this._emit("DISCONNECT", reason);
    });

    this.socket.on("connect_error", (err) => {
      logger.error("Socket.IO connection error", err);
      this._emit("ERROR", err);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event, payload) {
    if (!this.socket?.connected) {
      logger.error("Socket not connected");
      return;
    }
    this.socket.emit(event, payload);
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event).add(handler);
    this.socket?.on(event, handler);
  }

  off(event, handler) {
    this.handlers.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  isConnected() {
    return this.socket?.connected === true;
  }

  /* PRIVATE */

  _emit(event, payload) {
    this.handlers.get(event)?.forEach(handler => handler(payload));
  }
}
