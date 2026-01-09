import { LanguageManager } from "../../language/Language.js";
import { logger } from "../../logger/logger.js";
import { UIAlert } from "../alerts/UIAlert.js";
import { GameService } from "../../service/api/GameService.js";

class ChessMenu {
  constructor() {
    this.langManager = new LanguageManager(this);
    this.alert = new UIAlert(this.langManager);
    this.elements = null;
    this.gameService = new GameService();
    this.initializeElements();
    this.bindEvents();
    logger.debug("ChessMenu initialized.");
  }

  initializeElements() {
    this.elements = {
      localGameBtn: document.getElementById("start-local-game"),
      onlineGameBtn: document.getElementById("start-online-game"),
      puzzlesBtn: document.getElementById("start-puzzles"),
      vsComputerBtn: document.getElementById("start-vs-computer"),
    };

    // Validate that all elements exist
    Object.entries(this.elements).forEach(([key, element]) => {
      if (!element) {
        logger.error(`Element '${key}' not found in DOM`);
      }
    });
  }

  bindEvents() {
    if (!this.elements.localGameBtn || !this.elements.onlineGameBtn) {
      logger.error("Cannot bind events: required elements missing");
      return;
    }

    this.elements.localGameBtn.addEventListener("click", () => {
      this.handleLocalGame();
    });

    this.elements.onlineGameBtn.addEventListener("click", () => {
      this.handleOnlineGame();
    });

    // Add event listeners for other buttons
    this.elements.puzzlesBtn?.addEventListener("click", () => {
      this.handlePuzzles();
    });

    this.elements.vsComputerBtn?.addEventListener("click", () => {
      this.handleVsComputer();
    });
  }

  async handleLocalGame() {
    logger.info("Local Game button clicked");

      const gameData = {
        mode: "local",
        players: ["white", "black"],
        turn: "white",
        boardState: ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"],
        status: "active",
      };
      // Clear any existing game data
      this.gameService.clearGameData();
      // Create new local game
      const created = await this.gameService.createLocalGame(gameData);
      if (created && created._id) { // Successfully created
      window.location.href = "html/pages/Board.html"; 
    }else {
      logger.error("Failed to create local game");
      this.alert.error(
        this.langManager.translate("error"),
        this.langManager.translate("Failed-to-start-local-game")
      );
    }
  }
  

  // הוסף את הפונקציה הזו
    initOnlineGameButton() {
        const onlineGameBtn = document.getElementById('online-game-btn');
        if (onlineGameBtn) {
            onlineGameBtn.addEventListener('click', () => this.handleOnlineGame());
        }
    }

    async handleOnlineGame() {
        console.log("Online Game button clicked");
        this.showOnlineGameDialog();
    }

    showOnlineGameDialog() {
        // בדוק אם כבר יש דיאלוג פתוח
        if (document.getElementById('online-game-overlay')) {
            return;
        }

        const dialogHTML = `
            <div id="online-game-overlay" class="game-dialog-overlay">
                <div class="game-dialog">
                    <h2>משחק מקוון</h2>
                    
                    <div class="dialog-content">
                        <label>
                            שם שחקן:
                            <input type="text" id="player-name-input" placeholder="הכנס את שמך" value="Player" />
                        </label>
                        
                        <div class="choice-buttons">
                            <button id="create-game-btn" class="primary-button">
                                🎮 צור משחק חדש
                            </button>
                            <button id="join-game-btn" class="secondary-button">
                                🔗 הצטרף למשחק
                            </button>
                        </div>
                        
                        <div id="join-game-section" style="display: none; margin-top: 15px;">
                            <label>
                                קוד משחק:
                                <input type="text" id="game-id-input" placeholder="הדבק את קוד המשחק" />
                            </label>
                            <div class="dialog-buttons">
                                <button id="confirm-join-btn" class="primary-button">
                                    הצטרף
                                </button>
                                <button id="cancel-join-btn" class="secondary-button">
                                    ביטול
                                </button>
                            </div>
                        </div>

                        <div id="waiting-section" style="display: none; margin-top: 20px; text-align: center;">
                            <div class="spinner"></div>
                            <p>ממתין ליריב...</p>
                            <p style="font-size: 12px; color: #666;">קוד משחק: <strong id="game-code-display"></strong></p>
                        </div>
                    </div>
                    
                    <button id="close-dialog-btn" class="close-button">×</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        this.setupDialogListeners();
    }

    setupDialogListeners() {
        const overlay = document.getElementById('online-game-overlay');
        const closeBtn = document.getElementById('close-dialog-btn');
        const createBtn = document.getElementById('create-game-btn');
        const joinBtn = document.getElementById('join-game-btn');
        const confirmJoinBtn = document.getElementById('confirm-join-btn');
        const cancelJoinBtn = document.getElementById('cancel-join-btn');
        const joinSection = document.getElementById('join-game-section');
        
        const closeDialog = () => {
            overlay?.remove();
        };
        
        // סגירת דיאלוג
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeDialog();
        });
        closeBtn.addEventListener('click', closeDialog);
        
        // צור משחק חדש
        createBtn.addEventListener('click', async () => {
            const playerName = document.getElementById('player-name-input').value.trim() || 'Player';
            createBtn.disabled = true;
            joinBtn.disabled = true;
            await this.createOnlineGame(playerName);
        });
        
        // הצג שדה הצטרפות
        joinBtn.addEventListener('click', () => {
            joinSection.style.display = 'block';
        });
        
        // הצטרף למשחק
        confirmJoinBtn.addEventListener('click', async () => {
            const playerName = document.getElementById('player-name-input').value.trim() || 'Player';
            const gameId = document.getElementById('game-id-input').value.trim();
            
            if (!gameId) {
                this.alertManager.showWarning('אנא הכנס קוד משחק');
                return;
            }
            
            confirmJoinBtn.disabled = true;
            await this.joinOnlineGame(gameId, playerName);
        });
        
        // ביטול הצטרפות
        cancelJoinBtn.addEventListener('click', () => {
            joinSection.style.display = 'none';
            document.getElementById('game-id-input').value = '';
        });
    }

    async createOnlineGame(playerName) {
        try {
            console.log('Creating online game for:', playerName);
            
            // הצג loading
            const waitingSection = document.getElementById('waiting-section');
            const choiceButtons = document.querySelector('.choice-buttons');
            choiceButtons.style.display = 'none';
            waitingSection.style.display = 'block';
            
            // התחבר לשרת
            await wsGameService.connect('ws://localhost:3000');
            
            // צור משחק
            wsGameService.createOnlineGame(playerName);
            
            // חכה לתגובה מהשרת
            wsGameService.on('game_created', async (data) => {
                console.log('Game created:', data);
                
                // הצג את קוד המשחק
                document.getElementById('game-code-display').textContent = data.gameId;
                
                // העתק לקליפבורד
                try {
                    await navigator.clipboard.writeText(data.gameId);
                    this.alertManager.showSuccess(`משחק נוצר! הקוד הועתק: ${data.gameId}`);
                } catch (err) {
                    this.alertManager.showInfo(`קוד משחק: ${data.gameId}`);
                }
                
                // שמור את פרטי המשחק
                this.saveOnlineGameData({
                    mode: "online",
                    gameId: data.gameId,
                    playerId: wsGameService.playerId,
                    playerColor: data.playerColor,
                    playerName: playerName,
                    boardState: data.boardState || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
                    status: "waiting",
                    turn: "white"
                });
            });
            
            // כשיריב מצטרף
            wsGameService.on('opponent_joined', (data) => {
                console.log('Opponent joined:', data);
                this.alertManager.showSuccess(`${data.opponentName} הצטרף למשחק!`);
                
                // עדכן סטטוס
                const gameData = JSON.parse(localStorage.getItem('currentGame'));
                gameData.status = 'active';
                gameData.opponentName = data.opponentName;
                localStorage.setItem('currentGame', JSON.stringify(gameData));
                
                // עבור לדף המשחק
                setTimeout(() => {
                    window.location.href = "html/Board.html";
                }, 1500);
            });
            
        } catch (error) {
            console.error('Failed to create online game:', error);
            this.alertManager.showError('שגיאה בהתחברות לשרת');
            
            // החזר את הכפתורים
            document.querySelector('.choice-buttons').style.display = 'flex';
            document.getElementById('waiting-section').style.display = 'none';
            document.getElementById('create-game-btn').disabled = false;
            document.getElementById('join-game-btn').disabled = false;
        }
    }

    async joinOnlineGame(gameId, playerName) {
        try {
            console.log('Joining game:', gameId);
            
            // התחבר לשרת
            await wsGameService.connect('ws://localhost:3000');
            
            // הצטרף למשחק
            wsGameService.joinGame(gameId, playerName);
            
            // חכה לתגובה
            wsGameService.on('game_joined', async (data) => {
                console.log('Successfully joined game:', data);
                
                this.alertManager.showSuccess('הצטרפת למשחק!');
                
                // שמור פרטי משחק
                this.saveOnlineGameData({
                    mode: "online",
                    gameId: data.gameId,
                    playerId: wsGameService.playerId,
                    playerColor: data.playerColor,
                    playerName: playerName,
                    opponentName: data.opponentName,
                    boardState: data.boardState || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
                    status: "active",
                    turn: "white"
                });
                
                // עבור לדף המשחק
                setTimeout(() => {
                    window.location.href = "html/Board.html";
                }, 1000);
            });
            
            wsGameService.on('error', (error) => {
                console.error('Join game error:', error);
                this.alertManager.showError(error.message || 'משחק לא נמצא');
                document.getElementById('confirm-join-btn').disabled = false;
            });
            
        } catch (error) {
            console.error('Failed to join game:', error);
            this.alertManager.showError('שגיאה בהתחברות לשרת');
            document.getElementById('confirm-join-btn').disabled = false;
        }
    }

    saveOnlineGameData(gameData) {
        // שמור ב-localStorage
        localStorage.setItem('currentGame', JSON.stringify(gameData));
        console.log('Game data saved:', gameData);
    }

  handlePuzzles() {
    logger.info("Puzzles button clicked");
    this.alert.warning(
      this.langManager.translate("message"),
      this.langManager.translate("Page under construction")
    );
    // TODO: Implement puzzles functionality
  }

  handleVsComputer() {
    logger.info("VS Computer button clicked");
    logger.info("Puzzles button clicked");
    this.alert.warning(
      this.langManager.translate("message"),
      this.langManager.translate("Page under construction")
    );
    // TODO: Implement VS Computer functionality
  }
}
  
// Create global instance
const chessMenu = new ChessMenu();
