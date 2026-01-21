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
  createGame(data) {
    this.socket.emit("game:create", data);
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
}
