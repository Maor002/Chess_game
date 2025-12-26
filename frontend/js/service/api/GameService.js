import { ApiClient } from "../api/apiClient.js";
import { STORAGE_KEYS,DEFAULT_PREFERENCES} from "../../config/storageConstants.js";
import { GAME_MODES, PLAYER_COLORS } from "../../config/gameConstants.js";
import { ROUTES } from "../../config/routesConstants.js";


export class GameService {
    constructor() {
        this.api = new ApiClient("http://localhost:3001");
    }

    // =====================================================
    // 🔹 Local Storage Helpers
    // =====================================================
    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    load(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    remove(key) {
        localStorage.removeItem(key);
    }

    clearGameData() {
        this.remove(STORAGE_KEYS.GAME_ID);
        this.remove(STORAGE_KEYS.PLAYER_ID);
        this.remove(STORAGE_KEYS.PLAYER_COLOR);
        this.remove(STORAGE_KEYS.GAME_MODE);
        this.remove(STORAGE_KEYS.TIME_CONTROL);
    }

    // =====================================================
    // 🔹 Game Initialization
    // =====================================================
    async createLocalGame(getGameData) {
      //  this.clearGameData();

        const gameData = {
            white: getGameData.players[0],
            black: getGameData.players[1],
            boardState: getGameData.boardState || "startpos",
            moves: [],
            status: "start new game",
            turn: "white"
        };

        // Save details locally
        this.save(STORAGE_KEYS.GAME_MODE, GAME_MODES.LOCAL);
        this.save(STORAGE_KEYS.PLAYER_COLOR, PLAYER_COLORS.WHITE);

        // Create game on backend
        const created = await this.api.createGame(gameData);

        // Save data locally
        this.save(STORAGE_KEYS.GAME_ID, created._id);

        // // redirect
        // if (created && created._id) {
        //     window.location.href = ROUTES.BOARD;
        // }
        return created;
    }
// ONLINE GAME METHODS
    async startOnlineGame(playerName) {
        this.clearGameData();

        this.save(STORAGE_KEYS.GAME_MODE, GAME_MODES.ONLINE);

        // Create empty game (no opponent yet)
        const created = await this.api.createGame(playerName, null);

        this.save(STORAGE_KEYS.GAME_ID, created._id);
        this.save(STORAGE_KEYS.PLAYER_NAME, playerName);

        // Player joined as white by default until someone else joins
        this.save(STORAGE_KEYS.PLAYER_COLOR, PLAYER_COLORS.WHITE);

        // Redirect to waiting room or board
        window.location.href = ROUTES.BOARD;
    }

    async joinOnlineGame(gameId, playerName) {
        const result = await this.api.joinGame(gameId, playerName);

        this.save(STORAGE_KEYS.GAME_ID, gameId);
        this.save(STORAGE_KEYS.PLAYER_NAME, playerName);
        this.save(STORAGE_KEYS.PLAYER_COLOR, PLAYER_COLORS.BLACK);
        this.save(STORAGE_KEYS.GAME_MODE, GAME_MODES.ONLINE);

        window.location.href = ROUTES.BOARD;
    }

    // =====================================================
    // 🔹 In-Game Actions
    // =====================================================
    async makeMove(move) {
        const gameId = this.load(STORAGE_KEYS.GAME_ID);
        return this.api.makeMove(gameId, move);
    }
//GAME ACTIONS
    async resign() {
        const gameId = this.load(STORAGE_KEYS.GAME_ID);
        const playerId = this.load(STORAGE_KEYS.PLAYER_ID);
        return this.api.resign(gameId, playerId);
    }

    async offerDraw() {
        const gameId = this.load(STORAGE_KEYS.GAME_ID);
        const playerId = this.load(STORAGE_KEYS.PLAYER_ID);
        return this.api.offerDraw(gameId, playerId);
    }

    async acceptDraw() {
        const gameId = this.load(STORAGE_KEYS.GAME_ID);
        const playerId = this.load(STORAGE_KEYS.PLAYER_ID);
        return this.api.acceptDraw(gameId, playerId);
    }

    async declineDraw() {
        const gameId = this.load(STORAGE_KEYS.GAME_ID);
        const playerId = this.load(STORAGE_KEYS.PLAYER_ID);
        return this.api.declineDraw(gameId, playerId);
    }

    // =====================================================
    // 🔹 Game Sync
    // =====================================================
    async getCurrentGame() {
        const gameId = this.load(STORAGE_KEYS.GAME_ID);
        if (!gameId) return null;
        return this.api.getGame(gameId);
    }

    async getMoves() {
        const gameId = this.load(STORAGE_KEYS.GAME_ID);
        return this.api.getMoves(gameId);
    }

    // =====================================================
    // 🔹 Preferences
    // =====================================================
    loadPreferences() {
        return this.load(STORAGE_KEYS.PREFERENCES) || DEFAULT_PREFERENCES;
    }

    savePreferences(pref) {
        this.save(STORAGE_KEYS.PREFERENCES, pref);
    }

    // =====================================================
    // 🔹 Utility
    // =====================================================
    getPlayerColor() {
        return this.load(STORAGE_KEYS.PLAYER_COLOR);
    }

    getGameMode() {
        return this.load(STORAGE_KEYS.GAME_MODE);
    }

    getGameId() {
        return this.load(STORAGE_KEYS.GAME_ID);
    }
}
