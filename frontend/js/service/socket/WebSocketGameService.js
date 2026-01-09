// WebSocketGameService.js
import { logger } from "@logger/logger.js";
class WebSocketGameService {
  constructor() {
    this.ws = null;
    this.gameId = null;
    this.playerId = null;
    this.isConnected = false;
    this.messageHandlers = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // התחבר לשרת WebSocket
  connect(url = "ws://localhost:3000") {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          logger.info("WebSocket connected");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          logger.error("WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          logger.info("WebSocket disconnected");
          this.isConnected = false;
          this.attemptReconnect(url);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // נסה להתחבר מחדש
  attemptReconnect(url) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        logger.info(
          `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.connect(url);
      }, 2000 * this.reconnectAttempts);
    }
  }

  // טפל בהודעות נכנסות
  handleMessage(data) {
    const { type, payload } = data;

    if (this.messageHandlers[type]) {
      this.messageHandlers[type](payload);
    }
  }

  // רשום handler להודעות
  on(eventType, handler) {
    this.messageHandlers[eventType] = handler;
  }

  // שלח הודעה לשרת
  send(type, payload) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      logger.error("WebSocket not connected");
    }
  }

  // צור משחק חדש
  createOnlineGame(playerName) {
    this.playerId = this.generatePlayerId();
    this.send("create_game", {
      playerId: this.playerId,
      playerName: playerName,
      boardState: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    });
  }

  // הצטרף למשחק קיים
  joinGame(gameId, playerName) {
    this.playerId = this.generatePlayerId();
    this.gameId = gameId;
    this.send("join_game", {
      gameId: gameId,
      playerId: this.playerId,
      playerName: playerName,
    });
  }

  // שלח מהלך
  sendMove(from, to, piece, capturedPiece = null) {
    this.send("move", {
      gameId: this.gameId,
      playerId: this.playerId,
      move: {
        from,
        to,
        piece,
        capturedPiece,
        timestamp: Date.now(),
      },
    });
  }

  // שלח עדכון מצב לוח
  sendBoardState(fen) {
    this.send("board_update", {
      gameId: this.gameId,
      playerId: this.playerId,
      fen: fen,
      timestamp: Date.now(),
    });
  }

  // התנתק מהמשחק
  disconnect() {
    if (this.ws) {
      this.send("leave_game", {
        gameId: this.gameId,
        playerId: this.playerId,
      });
      this.ws.close();
      this.isConnected = false;
    }
  }

  // צור מזהה שחקן ייחודי
  generatePlayerId() {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // בדוק אם מחובר
  isConnectedToGame() {
    return this.isConnected && this.gameId !== null;
  }
}

// יצירת instance גלובלי
const wsGameService = new WebSocketGameService();

export default wsGameService;
