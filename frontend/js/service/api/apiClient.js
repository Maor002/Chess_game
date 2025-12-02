import { API_ENDPOINTS } from "../../config/constants.js";

export class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem("token") || null;
    }

    // Internal method to make API requests
    async request(endpoint, method = "GET", body = null) {
        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        // Add JWT token if exists
        if (this.token) {
            options.headers["Authorization"] = `Bearer ${this.token}`;
        }

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const res = await fetch(this.baseUrl + endpoint, options);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "API error");
            }
            return data;

        } catch (err) {
            logger.error("❌ API ERROR:", err);
            throw err;
        }
    }

    //GAME ENDPOINTS
    createGame(gameData) {
        return this.request(API_ENDPOINTS.CREATE_GAME, "POST", gameData);
    }

    joinGame(gameId, playerName) {
        return this.request(API_ENDPOINTS.JOIN_GAME, "POST", { gameId, playerName });
    }

    getGame(gameId) {
        return this.request(`${API_ENDPOINTS.GET_GAME}?gameId=${gameId}`, "GET");
    }

    leaveGame(gameId, playerId) {
        return this.request(API_ENDPOINTS.LEAVE_GAME, "POST", { gameId, playerId });
    }

    //MOVE ENDPOINTS

    makeMove(gameId, move) {
        return this.request(API_ENDPOINTS.MAKE_MOVE, "POST", { gameId, move });
    }

    getMoves(gameId) {
        return this.request(`${API_ENDPOINTS.GET_MOVES}?gameId=${gameId}`, "GET");
    }

    //GAME ACTIONS

    resign(gameId, playerId) {
        return this.request(API_ENDPOINTS.RESIGN, "POST", { gameId, playerId });
    }

    offerDraw(gameId, playerId) {
        return this.request(API_ENDPOINTS.OFFER_DRAW, "POST", { gameId, playerId });
    }

    acceptDraw(gameId, playerId) {
        return this.request(API_ENDPOINTS.ACCEPT_DRAW, "POST", { gameId, playerId });
    }

    declineDraw(gameId, playerId) {
        return this.request(API_ENDPOINTS.DECLINE_DRAW, "POST", { gameId, playerId });
    }

    //PLAYER ENDPOINTS

    getPlayer(playerId) {
        return this.request(`${API_ENDPOINTS.GET_PLAYER}?playerId=${playerId}`, "GET");
    }

    updatePlayer(playerId, updates) {
        return this.request(API_ENDPOINTS.UPDATE_PLAYER, "POST", { playerId, updates });
    }

    // STATS & HISTORY

    getStats(playerId) {
        return this.request(`${API_ENDPOINTS.GET_STATS}?playerId=${playerId}`, "GET");
    }

    getHistory(playerId) {
        return this.request(`${API_ENDPOINTS.GET_HISTORY}?playerId=${playerId}`, "GET");
    }
}
