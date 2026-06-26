import { ChessEngine } from "../../engine/ManagerChessEngine.js";
import { logger } from "@logger/logger.js";
import { ChessUI } from "../board-game/ManagerChessUI.js";
import { OnlineGameService } from "../../service/socket/OnlineGameService.js";
import { GameService } from "../../service/api/GameService.js";

export class OnlineGameController {
  constructor() {
    this.onlineService = new OnlineGameService();
    this.gameService = new GameService();
    this.currentGame = null;
    this.currentRoom = null;
    this.engine = null;
    this.ui = null;
    this.playerId = null;
    this.playerColor = null;
    this.isGameStarted = false;
    this.lastSelectedSquare = null;
    this._moveHandlerAttached = false; // FIX 4: guard flag

    logger.debug("OnlineGameController constructor called");
    this.initialize().catch((error) => {
      logger.error("Error during initialization:", error);
    });
  }

  async initialize() {
    logger.info("Initializing online game controller game");

    try {
      logger.info("Attempting to connect to socket server...");
      await this.onlineService.connect();
      logger.info("✅ Connected to game server");

      logger.info("Setting up socket listeners...");
      this.setupSocketListeners();

      logger.info("Initializing engine...");
      this.initEngine();

      logger.info("Initializing UI...");
      this.initUI();

      logger.info("Setting up UI...");
      this.setupUI();

      // Check if we arrived from LobbyDialog with a saved roomCode
      const savedRoomCode = localStorage.getItem("ROOM_CODE")?.replace(/"/g, "");
      const savedColor = localStorage.getItem("PLAYER_COLOR")?.replace(/"/g, "");

      console.log("[OnlineGame] savedRoomCode:", savedRoomCode, "savedColor:", savedColor);

      if (savedRoomCode) {
        // savedColor is "white"/"black" from LobbyDialog — map to "w"/"b" for ChessConfig
        this.playerColor = savedColor === "black" ? "b" : "w";
        this.playerId = "player-" + Math.random().toString(36).substr(2, 9);

        // Clear storage so stale values don't poison the next session
        localStorage.removeItem("ROOM_CODE");
        localStorage.removeItem("PLAYER_COLOR");
        localStorage.removeItem("GAME_MODE");

        if (this.playerColor === "b") {
          logger.info("Joining room via socket:", savedRoomCode);
          this.onlineService.joinGame(savedRoomCode, this.playerId);
        } else {
          // white — already created room via REST, rejoin the socket room to receive game:started
          logger.info("Rejoining socket room as white:", savedRoomCode);
          this.onlineService.rejoinRoom(savedRoomCode);
          this.updateRoomDisplay(savedRoomCode, "waiting");
          this.showMessage(`Share this code: ${savedRoomCode}`);
        }
      }

      logger.info("Online game controller initialized successfully");
    } catch (error) {
      logger.error("Error during online game initialization:", error);
      this.showError("Failed to connect to game server");
    }
  }

  initEngine() {
    logger.debug("Initializing chess engine for online mode");
    this.engine = new ChessEngine("online");
  }

  initUI() {
    logger.debug("Initializing UI for online game");
    this.ui = new ChessUI(this.engine);
    this.ui.updateDisplay();
  }

  setupUI() {
    this.showRoomPanel();
    this.attachRoomPanelListeners();
    // FIX 1: Do NOT call attachMoveHandler() here.
    // It must only be called after the game has started (in handleGameStarted),
    // otherwise isGameStarted is still false and every click gets blocked.
  }

  // ========================================
  // Room Management
  // ========================================

  showRoomPanel() {
    const panel = document.getElementById("roomStatusPanel");
    if (panel) {
      panel.style.display = "block";
    }
  }

  attachRoomPanelListeners() {
    const createBtn = document.getElementById("createRoomBtn");
    const joinBtn = document.getElementById("joinRoomBtn");
    const joinInput = document.getElementById("joinRoomInput");
    const copyBtn = document.getElementById("copyRoomBtn");

    if (createBtn) {
      createBtn.addEventListener("click", () => this.handleCreateRoom());
    }

    if (joinBtn) {
      joinBtn.addEventListener("click", () => this.handleJoinRoom());
    }

    if (joinInput) {
      joinInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleJoinRoom();
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", () => this.copyRoomCode());
    }
  }

  handleCreateRoom() {
    logger.info("Creating new room...");
    this.playerColor = "w";
    this.playerId = "player-" + Math.random().toString(36).substr(2, 9);
    this.onlineService.createRoom();
    this.showMessage("Creating room...");
  }

  handleJoinRoom() {
    const input = document.getElementById("joinRoomInput");
    const roomCode = input?.value?.trim();

    if (!roomCode || roomCode.length !== 6) {
      this.showError("Please enter a valid 6-digit room code");
      return;
    }

    logger.info("Joining room:", roomCode);
    this.playerColor = "b"; // FIX 2: explicitly set color for the joining player
    this.playerId = "player-" + Math.random().toString(36).substr(2, 9);
    this.onlineService.joinGame(roomCode, this.playerId);
    this.showMessage("Joining room...");
  }

  copyRoomCode() {
    const codeDisplay = document.getElementById("roomCodeDisplay");
    const code = codeDisplay?.textContent?.trim();

    if (code && code !== "---") {
      navigator.clipboard.writeText(code).then(() => {
        this.showMessage("Room code copied!");
      });
    }
  }

  // ========================================
  // Socket Listeners
  // ========================================

  setupSocketListeners() {
    console.log("[OnlineGame] setupSocketListeners called");
    this.onlineService.on({
      "game:room-created": (data) => {
        console.log("[OnlineGame] ✅ game:room-created received!", data);
        this.handleRoomCreated(data);
      },
      "game:started": (data) => {
        console.log("[OnlineGame] ✅ game:started received!", data);
        this.handleGameStarted(data);
      },
      "game:move": (data) => this.handleRemoteMove(data),
      "game:opponent-disconnected": (data) => this.handleOpponentDisconnect(data),
      "error": (data) => this.handleSocketError(data),
    });
  }

  handleRoomCreated(data) {
    logger.info("Room created:", data);
    this.currentRoom = data;

    this.updateRoomDisplay(data.roomCode, "waiting");
    this.updatePlayerStatus("white", "Waiting for opponent...");
    this.updatePlayerStatus("black", "Waiting...");

    const joinInput = document.getElementById("joinRoomInput");
    const createBtn = document.getElementById("createRoomBtn");
    const joinBtn = document.getElementById("joinRoomBtn");

    if (createBtn) createBtn.style.display = "none";
    if (joinBtn) joinBtn.style.display = "none";
    if (joinInput) joinInput.style.display = "none";

    this.showMessage(`Room created! Share this code: ${data.roomCode}. Waiting for opponent...`);
  }

  handleGameStarted(data) {
    logger.info("Game started:", data);
    this.currentGame = data.game;
    this.currentRoom = data.room;

    // Safely extract roomCode — Mongoose object has .code, plain object may vary
    const roomCode =
      data.room?.code ||
      data.room?.roomCode ||
      data.roomCode ||
      this.currentRoom?.code ||
      "---";

    console.log("[OnlineGame] handleGameStarted roomCode:", roomCode, "data.room:", data.room);

    if (!this.playerColor) {
      this.playerColor = "b"; // fallback: joiner
    }

    this.isGameStarted = true;

    const createBtn = document.getElementById("createRoomBtn");
    const joinBtn = document.getElementById("joinRoomBtn");
    const joinInput = document.getElementById("joinRoomInput");
    if (createBtn) createBtn.style.display = "none";
    if (joinBtn) joinBtn.style.display = "none";
    if (joinInput) joinInput.style.display = "none";

    this.engine.startNewGame();
    this.ui.updateDisplay();

    this.attachMoveHandler();

    this.updateRoomDisplay(roomCode, "in_game");
    this.updatePlayerStatus("white", "Connected");
    this.updatePlayerStatus("black", "Connected");

    this.showMessage(
      "Game started! " +
        (this.playerColor === "w" ? "Your turn" : "Waiting for white to move")
    );
    console.log("[OnlineGame] ✅ handleGameStarted called!", data);
  }


handleRemoteMove(data) {
  logger.info("Received remote move:", data);

  if (!data.move) {
    logger.warn("Invalid move data received");
    return;
  }

  const { from, to } = data.move;

  const fromCol = parseInt(from[0], 10);
  const fromRow = parseInt(from[1], 10);
  const toCol   = parseInt(to[0],   10);
  const toRow   = parseInt(to[1],   10);

  if (isNaN(fromRow) || isNaN(fromCol) || isNaN(toRow) || isNaN(toCol)) {
    logger.warn("handleRemoteMove: could not parse coordinates", { from, to });
    return;
  }

  try {
    // MoveExecutor.executeMove(fromRow, fromCol, toRow, toCol)
    this.engine.moveExecutor.executeMove(fromRow, fromCol, toRow, toCol);
    this.engine.switchPlayer();
  } catch (err) {
    logger.error("handleRemoteMove: engine rejected move:", err.message);
    return;
  }

  this.ui.updateDisplay();
  this.updateTurnIndicator(this.engine.getCurrentPlayer());
  this.addMoveToLog(data.move);
}
  handleOpponentDisconnect(data) {
    logger.warn("Opponent disconnected:", data);
    this.isGameStarted = false;
    this.showError("Opponent has left the game");

    const board = document.getElementById("chessBoard");
    if (board) {
      board.style.pointerEvents = "none";
      board.style.opacity = "0.5";
    }
  }

  handleSocketError(data) {
    logger.error("Socket error:", data);
    this.showError(data.message || "An error occurred");
  }

  // ========================================
  // Move Handling
  // ========================================

  attachMoveHandler() {
    // FIX 4: guard against attaching the listener more than once
    if (this._moveHandlerAttached) {
      logger.debug("Move handler already attached, skipping");
      return;
    }

    const board = document.getElementById("chessBoard");
    if (board) {
      board.addEventListener("click", (e) => this.handleBoardClick(e));
      this._moveHandlerAttached = true;
      logger.debug("Move handler attached");
    }
  }

  handleBoardClick(e) {
    const currentTurn = this.engine.getCurrentPlayer();
    console.log(
      "[OnlineGame] board clicked, isGameStarted:",
      this.isGameStarted,
      "turn:",
      currentTurn,
      "playerColor:",
      this.playerColor
    );

    if (!this.isGameStarted) {
      console.log("[OnlineGame] move blocked - game not started");
      return;
    }

    if (currentTurn !== this.playerColor) {
      console.log("[OnlineGame] move blocked - not your turn");
      return;
    }

    const square = e.target.closest(".square");
    if (!square) return;

    // FIX 3: use data attributes instead of fragile DOM index calculation.
    // Make sure your ChessUI sets these on each square:
    //   square.dataset.row = row;
    //   square.dataset.col = col;
    const row = parseInt(square.dataset.row, 10);
    const col = parseInt(square.dataset.col, 10);

    if (isNaN(row) || isNaN(col)) {
      logger.warn("Square is missing data-row / data-col attributes");
      return;
    }

    const from = this.lastSelectedSquare;
    const to = { row, col };

    // Clicking the same square again deselects it
    if (from && to.row === from.row && to.col === from.col) {
      this.lastSelectedSquare = null;
      this.ui.updateDisplay();
      return;
    }

    if (from) {
      const move = {
        from: `${from.col}${from.row}`,
        to: `${to.col}${to.row}`,
      };

      logger.info("Sending move:", move);
      this.onlineService.sendMove(move);
      this.lastSelectedSquare = null;
    } else {
      this.lastSelectedSquare = { row, col };
    }

    this.ui.updateDisplay();
  }

  // ========================================
  // UI Updates
  // ========================================

  updateRoomDisplay(code, status) {
    const codeDisplay = document.getElementById("roomCodeDisplay");
    const statusDisplay = document.getElementById("gameStatus");

    if (codeDisplay) {
      codeDisplay.textContent = code;
    }

    if (statusDisplay) {
      statusDisplay.textContent = status === "waiting" ? "⏳ Waiting" : "🎮 In Game";
      statusDisplay.className = `status-badge ${status}`;
    }
  }

  updatePlayerStatus(color, status) {
    const statusElement = document.getElementById(`${color}PlayerStatus`);
    if (statusElement) {
      statusElement.textContent = status;
    }
  }

  updateTurnIndicator(turn) {
    const indicator = document.getElementById("turnIndicator");
    if (indicator) {
      indicator.textContent = turn === "w" ? "White to move" : "Black to move";
    }
  }

  addMoveToLog(move) {
    const movesList = document.getElementById("movesList");
    if (movesList && move) {
      const moveText = `${move.from} → ${move.to}`;
      const moveElement = document.createElement("div");
      moveElement.textContent = moveText;
      moveElement.className = `move-item ${move.player || "white"}`;
      movesList.insertBefore(moveElement, movesList.firstChild);
    }
  }

  // ========================================
  // Messages
  // ========================================

  showMessage(message) {
    const statusMsg = document.getElementById("statusMessage");
    if (statusMsg) {
      statusMsg.textContent = message;
      statusMsg.className = "status-message info";
      setTimeout(() => {
        statusMsg.textContent = "";
      }, 5000);
    }
  }

  showError(message) {
    const statusMsg = document.getElementById("statusMessage");
    if (statusMsg) {
      statusMsg.textContent = message;
      statusMsg.className = "status-message error";
      setTimeout(() => {
        statusMsg.textContent = "";
      }, 5000);
    }
  }
}
