import {logger} from "../Logger/logger.js";
import { API_ENDPOINTS } from "../utils/constants.js";

export class GameService {
  constructor(baseURL = "http://localhost:3001") {
    this.baseURL = baseURL;
  }

  async createGame(gameData) {
    try {
      logger.info("Creating new game...", gameData);
      
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.CREATE_GAME}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(gameData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create game");
      }

      logger.info("Game created successfully:", data);
      return { success: true, data };

    } catch (error) {
      logger.error("Failed to create game:", error);
      return { success: false, error: error.message };
    }
  }

  async joinGame(gameId, playerData) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.JOIN_GAME}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ gameId, ...playerData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join game");
      }

      return { success: true, data };

    } catch (error) {
      logger.error("Failed to join game:", error);
      return { success: false, error: error.message };
    }
  }

  async getGame(gameId) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.GET_GAME}/${gameId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get game");
      }

      return { success: true, data };

    } catch (error) {
      logger.error("Failed to get game:", error);
      return { success: false, error: error.message };
    }
  }
}