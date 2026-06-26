import { SocketClient } from "./SocketClient.js";
import { GameProtocol } from "./GameProtocol.js";

export class OnlineGameService {
  constructor() {
    this.roomCode = null;

    this.socket = new SocketClient(window.location.origin);
    this.protocol = new GameProtocol(this.socket);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket.on("CONNECT", resolve);
      this.socket.on("ERROR", reject);
      this.socket.connect();
    });
  }

  createRoom() {
    console.log("[OnlineGameService] createRoom");
    this.protocol.createRoom();
  }

  // FIX: no longer accepts or forwards playerId — server derives identity from TEMP_USER_ID_2
  joinGame(roomCode) {
    this.roomCode = roomCode;
    console.log("[OnlineGameService] joinGame →", { roomCode });
    this.protocol.joinGame({ roomCode }); // playerId intentionally omitted
  }

  rejoinRoom(roomCode) {
    console.log("[OnlineGameService] rejoinRoom →", roomCode);

    const doRejoin = () => {
      this.roomCode = roomCode;
      this.socket.emit("game:rejoin", { roomCode });
    };

    if (this.socket.isConnected()) {
      doRejoin();
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.socket.on("CONNECT", () => { doRejoin(); resolve(); });
      this.socket.on("ERROR", reject);
    });
  }

  sendMove({ from, to, piece, capturedPiece }) {
    console.log("[OnlineGameService] sendMove →", { from, to, piece, capturedPiece });
    this.protocol.sendMove({ from, to, piece, capturedPiece });
  }

  on(handlers) {
    this.protocol.registerHandlers(handlers);
  }

  disconnect() {
    this.socket.disconnect();
    this.roomCode = null;
  }

  isConnected() {
    return this.socket.isConnected();
  }
}