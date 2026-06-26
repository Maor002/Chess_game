export class GameProtocol {
  constructor(socketClient) {
    this.socket = socketClient;
  }
// רישום מאזינים לאירועים
  registerHandlers(handlers) {
    Object.entries(handlers).forEach(([event, handler]) => {
      this.socket.on(event, handler);
    });
  }
// שליחת אירועים לשרת
  createRoom() {
    this.socket.emit("game:create");
  }

  joinGame(data) {
    this.socket.emit("game:join", data);
  }

  sendMove(data) {
    this.socket.emit("game:move", data);
  }

  syncGame(data) {
    this.socket.emit("game:sync", data);
  }

  resign(data) {
    this.socket.emit("game:resign", data);
  }
handleBoardClick(e) {
    const engineTurn = this.engine.getCurrentPlayer(); // "w" or "b"
    const myColor = this.playerColor === "white" ? "w" : "b";
    
    console.log("[OnlineGame] turn check:", { engineTurn, myColor, isGameStarted: this.isGameStarted });
    
  //  if (!this.isGameStarted || engineTurn !== myColor) {
    //    console.log("[OnlineGame] move blocked");
      //  return;
    //}
}
}