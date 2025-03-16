// src/services/api.service.js
import axios from "axios";

// Get API URL from environment variables - supports both CRA and Vite
const API_URL =
  // Create React App
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  // Vite
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  // Fallback
  "http://localhost:3000/api";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and parse data consistently
apiClient.interceptors.response.use(
  (response) => {
    // Return the data object directly for consistency
    return response.data;
  },
  (error) => {
    // Create a standardized error object
    const errorObj = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred",
      details: error.response?.data || {},
    };

    // Add specific handling for rate limiting
    if (error.response?.status === 429) {
      errorObj.message =
        "Rate limit exceeded. Please wait a moment and try again.";

      // Add the retry-after header if available
      const retryAfter = error.response.headers["retry-after"];
      if (retryAfter) {
        errorObj.retryAfter = parseInt(retryAfter, 10);
      }
    }

    console.error("API Error:", errorObj);
    return Promise.reject(errorObj);
  }
);

// Game Service
const gameService = {
  /**
   * Helper to include LLM API key in headers for LLM dependent endpoints
   * @param {string} llmApiKey - API key for LLM provider
   * @returns {Object} Config object with headers
   */
  withLLMKey: (llmApiKey) => {
    if (!llmApiKey) {
      console.warn("No LLM API key provided");
    }

    return {
      headers: {
        "x-llm-api-key": llmApiKey,
      },
    };
  },

  /**
   * Create a new game
   * @param {Object} gameData - Game data with genre, totalTurns, etc.
   * @param {string} llmApiKey - API key for LLM provider
   * @returns {Promise<Object>} Created game
   */
  createGame: (gameData, llmApiKey) => {
    if (!llmApiKey) {
      return Promise.reject({
        status: "fail",
        message: "API key is required for game creation",
      });
    }

    return apiClient.post(
      "/games",
      gameData,
      gameService.withLLMKey(llmApiKey)
    );
  },

  /**
   * Get all games with optional filtering
   * @param {Object} params - Query parameters (status, limit, page)
   * @returns {Promise<Object>} Games with pagination
   */
  getAllGames: (params = {}) => {
    console.log("Making API request to get all games with params:", params);

    return apiClient.get("/games", { params }).then((response) => {
      console.log("getAllGames raw response:", response);

      // Extract the actual games array based on your API structure
      let games = [];

      // Handle your specific API response format
      if (
        response &&
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        games = response.data.data;
      }
      // Fallback checks
      else if (response && Array.isArray(response.data)) {
        games = response.data;
      } else if (Array.isArray(response)) {
        games = response;
      }

      console.log(`Processed ${games.length} games from API response:`, games);
      return games;
    });
  },

  /**
   * Get a specific game by ID
   * @param {string|number} gameId - Game ID
   * @returns {Promise<Object>} Game details
   */
  getGame: (gameId) => {
    const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
    return apiClient.get(`/games/${id}`);
  },

  /**
   * Start a game and generate initial story/first segment
   * @param {string|number} gameId - Game ID
   * @param {string} llmApiKey - API key for LLM provider
   * @param {Object} preferences - Optional preferences (provider, model)
   * @returns {Promise<Object>} Game with initial segment
   */
  startGame: (gameId, llmApiKey, preferences = {}) => {
    const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;

    if (!llmApiKey) {
      return Promise.reject({
        status: "fail",
        message: "API key is required for story generation",
      });
    }

    return apiClient.post(
      `/games/${id}/start`,
      preferences,
      gameService.withLLMKey(llmApiKey)
    );
  },

  /**
   * Create a new story segment based on player choice
   * @param {string|number} gameId - Game ID
   * @param {Object} data - Choice data (optionId or optionText)
   * @param {string} llmApiKey - API key for LLM provider
   * @returns {Promise<Object>} New story segment
   */
  createStorySegment: (gameId, data, llmApiKey) => {
    const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;

    if (!llmApiKey) {
      return Promise.reject({
        status: "fail",
        message: "API key is required for story generation",
      });
    }

    return apiClient.post(
      `/games/${id}/segments`,
      data,
      gameService.withLLMKey(llmApiKey)
    );
  },

  /**
   * Explicitly save the current game state
   * @param {string|number} gameId - Game ID
   * @returns {Promise<Object>} Saved game
   */
  saveGame: (gameId) => {
    const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
    return apiClient.post(`/games/${id}/save`);
  },

  /**
   * Get game segments history
   * @param {string|number} gameId - Game ID
   * @returns {Promise<Array>} Game segments
   */
  getGameSegments: (gameId) => {
    const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
    return apiClient.get(`/games/${id}/segments`);
  },

  /**
   * Get current game options
   * @param {string|number} gameId - Game ID
   * @returns {Promise<Array>} Current options
   */
  getGameOptions: (gameId) => {
    const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
    return apiClient.get(`/games/${id}/options`);
  },
};

export { apiClient, gameService };
