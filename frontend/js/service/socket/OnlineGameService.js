import { SocketClient }  from "./SocketClient.js";
import { GameProtocol }  from "./GameProtocol.js";

export class OnlineGameService {
  constructor() {
    this.roomCode = null;
    this.playerId = null;

    this.socket   = new SocketClient("ws://localhost:3000");
    this.protocol = new GameProtocol(this.socket);
  }

  // Opens the socket connection and waits for it to be ready
  connect() {
    return new Promise((resolve, reject) => {
      this.socket.connect();

      this.socket.on("CONNECT", resolve);
      this.socket.on("ERROR",   reject);
    });
  }

  // Emits game:join → { roomCode, playerId }
  joinGame(roomCode, playerId) {
    this.roomCode = roomCode;
    this.playerId = playerId;

    console.log("[OnlineGameService] joinGame →", { roomCode, playerId });
    this.protocol.joinGame({ roomCode, playerId });
  }

  // Emits game:move → { from, to, piece, capturedPiece }
  // roomCode + playerId are stored on the socket server-side, no need to resend
  sendMove({ from, to, piece, capturedPiece }) {
    console.log("[OnlineGameService] sendMove →", { from, to, piece, capturedPiece });
    this.protocol.sendMove({ from, to, piece, capturedPiece });
  }

  // Register listeners for incoming server events
  // Usage: onlineService.on({ "game:joined": handler, "game:move": handler })
  on(handlers) {
    this.protocol.registerHandlers(handlers);
  }

  disconnect() {
    this.socket.disconnect();
    this.roomCode = null;
    this.playerId = null;
  }

  isConnected() {
    return this.socket.isConnected();
  }
}