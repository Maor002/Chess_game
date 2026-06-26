import { io } from "socket.io-client";
import { logger } from "@logger/logger.js";

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
      ...options,
    };
  }

  connect() {
    console.log("[SocketClient] connect() called, url:", this.url);

    if (this.socket) {
      console.log("[SocketClient] socket already exists, returning");
      logger.warn("Socket already initialized");
      return;
    }

    console.log("[SocketClient] creating io connection...");
    this.socket = io(this.url, this.options);

    setTimeout(() => {
      console.log("[SocketClient] socket status after 3s:", this.socket?.connected);
    }, 3000);

    // Bind handlers that were registered before connect()
    // FIX 5: moved this block BEFORE the built-in event listeners so internal
    // events (CONNECT, DISCONNECT, ERROR) registered via on() also get bound
    this.handlers.forEach((handlerSet, event) => {
      handlerSet.forEach((handler) => {
        this.socket.on(event, handler);
      });
    });

    this.socket.on("connect", () => {
      console.log("[SocketClient] ✅ CONNECTED!");
      logger.info("Socket.IO connected");
      this._emit("CONNECT");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[SocketClient] ❌ DISCONNECTED!", reason);
      logger.warn("Socket.IO disconnected:", reason);
      this._emit("DISCONNECT", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.error("[SocketClient] connect_error:", err.message);
      this._emit("ERROR", err);
    });

    this.socket.onAny((event, ...args) => {
      console.log("[SocketClient] event received:", event, args);
    });

    this.socket.connect();
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // FIX 6: emit() now returns a boolean so callers can detect failure
  emit(event, payload) {
    if (!this.socket?.connected) {
      logger.error("Socket not connected, could not emit:", event);
      return false;
    }
    this.socket.emit(event, payload);
    return true;
  }

  // FIX 7: on() no longer double-binds when called after connect().
  // connect() binds everything in this.handlers at startup.
  // on() called after connect() must add directly to the socket,
  // but only if it isn't already bound (i.e. this is a new handler).
  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    const handlerSet = this.handlers.get(event);
    if (handlerSet.has(handler)) return;   // already registered, skip

    handlerSet.add(handler);

    // Only bind directly if connect() has already run; otherwise connect()
    // will pick it up from this.handlers when it runs.
    if (this.socket) {
      this.socket.on(event, handler);
    }
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
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }
}