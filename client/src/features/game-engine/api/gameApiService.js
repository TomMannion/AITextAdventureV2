// src/features/game-engine/api/gameApiService.js
import axios from "axios";

/**
 * Creates a game API service for making server requests
 *
 * @param {string} baseUrl - API base URL
 * @returns {Object} Game API service interface
 */
export function createGameApiService(baseUrl) {
  // Create API client with base URL
  const apiClient = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor for authentication
  apiClient.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => {
      // Return data directly
      return response.data;
    },
    (error) => {
      // Create standardized error object
      const errorObj = {
        status: error.response?.status || 500,
        message:
          error.response?.data?.message ||
          error.message ||
          "Unknown error occurred",
        details: error.response?.data || {},
      };

      console.error(`API Error (${errorObj.status}):`, errorObj);
      return Promise.reject(errorObj);
    }
  );

  // Helper for adding LLM API key to requests
  const withLLMKey = (apiKey) => ({
    headers: { "x-llm-api-key": apiKey },
  });

  return {
    /**
     * Get all games
     *
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} Games list
     */
    getAllGames: async (params = {}) => {
      try {
        const response = await apiClient.get("/games", { params });

        // Handle different API response structures
        let games = [];

        if (response.data && Array.isArray(response.data)) {
          games = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          games = response.data.data;
        } else if (Array.isArray(response)) {
          games = response;
        }

        return games;
      } catch (error) {
        throw new Error(`Failed to load games: ${error.message}`);
      }
    },

    /**
     * Get a specific game
     *
     * @param {string|number} gameId - Game ID
     * @returns {Promise<Object>} Game object
     */
    getGame: async (gameId) => {
      try {
        const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
        const response = await apiClient.get(`/games/${id}`);

        // Handle different API response structures
        return response.data || response;
      } catch (error) {
        throw new Error(`Failed to load game: ${error.message}`);
      }
    },

    /**
     * Create a new game
     *
     * @param {Object} gameData - Game data
     * @param {string} apiKey - LLM API key
     * @returns {Promise<Object>} Created game
     */
    createGame: async (gameData, apiKey) => {
      if (!apiKey) {
        throw new Error("API key is required for game creation");
      }

      try {
        const response = await apiClient.post(
          "/games",
          gameData,
          withLLMKey(apiKey)
        );
        return response.data || response;
      } catch (error) {
        throw new Error(`Failed to create game: ${error.message}`);
      }
    },

    /**
     * Start a game (generate initial story)
     *
     * @param {string|number} gameId - Game ID
     * @param {string} apiKey - LLM API key
     * @param {Object} preferences - LLM preferences
     * @returns {Promise<Object>} Game with initial segment
     */
    startGame: async (gameId, apiKey, preferences = {}) => {
      if (!apiKey) {
        throw new Error("API key is required for story generation");
      }

      try {
        const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
        const response = await apiClient.post(
          `/games/${id}/start`,
          preferences,
          withLLMKey(apiKey)
        );

        return response;
      } catch (error) {
        throw new Error(`Failed to start game: ${error.message}`);
      }
    },

    /**
     * Create a new story segment
     *
     * @param {string|number} gameId - Game ID
     * @param {Object} choiceData - Player choice data
     * @param {string} apiKey - LLM API key
     * @returns {Promise<Object>} New segment with options
     */
    createStorySegment: async (gameId, choiceData, apiKey) => {
      if (!apiKey) {
        throw new Error("API key is required for story generation");
      }

      try {
        const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
        const response = await apiClient.post(
          `/games/${id}/segments`,
          choiceData,
          withLLMKey(apiKey)
        );

        return response;
      } catch (error) {
        throw new Error(`Failed to generate story: ${error.message}`);
      }
    },

    /**
     * Save game progress
     *
     * @param {string|number} gameId - Game ID
     * @returns {Promise<Object>} Result
     */
    saveGame: async (gameId) => {
      try {
        const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
        const response = await apiClient.post(`/games/${id}/save`);

        return response;
      } catch (error) {
        throw new Error(`Failed to save game: ${error.message}`);
      }
    },
  };
}
