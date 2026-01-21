import { WebSocketClient } from "./SocketClient.js";
import { GameProtocol } from "./GameProtocol.js";

class OnlineGameService {
  constructor() {
    this.gameId = null;
    this.playerId = null;

    this.ws = new WebSocketClient("ws://localhost:3000");
    this.protocol = new GameProtocol(this.ws);
  }

  async connect() {
    await this.ws.connect();
  }

  createGame(playerName) {
    this.playerId = this.generatePlayerId();
    this.protocol.createGame({
      playerId: this.playerId,
      playerName
    });
  }

  joinGame(gameId, playerName) {
    this.gameId = gameId;
    this.playerId = this.generatePlayerId();
    this.protocol.joinGame({
      gameId,
      playerId: this.playerId,
      playerName
    });
  }

  sendMove(move) {
    this.protocol.sendMove({
      gameId: this.gameId,
      playerId: this.playerId,
      move
    });
  }
}
