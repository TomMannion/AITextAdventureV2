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

console.log(`Using API URL: ${API_URL}`);

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
    // For debugging requests
    console.log(`Making API request to: ${config.url}`, config.data || {});

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
    // For debugging responses
    console.log(`API response from ${response.config.url}:`, response.data);

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

    console.error(`API Error (${error.response?.status}):`, errorObj);
    return Promise.reject(errorObj);
  }
);

// Model Service
const modelService = {
  /**
   * Get available models from a specific LLM provider
   * @param {string} provider - Provider name (openai, anthropic, groq, gemini)
   * @param {string} apiKey - API key for the provider
   * @returns {Promise<Array>} List of models
   */
  getProviderModels: async (provider, apiKey) => {
    try {
      return await apiClient.get(`/models/${provider}`, {
        headers: {
          'x-llm-api-key': apiKey
        }
      });
    } catch (error) {
      console.error(`Error fetching models for ${provider}:`, error);
      throw error;
    }
  }
};

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
  createGame: async (gameData, llmApiKey) => {
    if (!llmApiKey) {
      return Promise.reject({
        status: "fail",
        message: "API key is required for game creation",
      });
    }

    try {
      console.log("Creating new game with data:", gameData);
      const response = await apiClient.post(
        "/games",
        gameData,
        gameService.withLLMKey(llmApiKey)
      );

      // Handle different API response structures
      const gameObject = response.data || response;

      console.log("Created game:", gameObject);
      return gameObject;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  },

  /**
   * Get all games with optional filtering
   * @param {Object} params - Query parameters (status, limit, page)
   * @returns {Promise<Array>} Games array
   */
  getAllGames: async (params = {}) => {
    try {
      console.log("Getting all games with params:", params);
      const response = await apiClient.get("/games", { params });

      // Handle different API response structures
      let games = [];

      if (response && response.data && Array.isArray(response.data)) {
        games = response.data;
      } else if (
        response &&
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        games = response.data.data;
      } else if (Array.isArray(response)) {
        games = response;
      }

      console.log(`Found ${games.length} games`);
      return games;
    } catch (error) {
      console.error("Error getting games:", error);
      throw error;
    }
  },

  /**
   * Get a specific game by ID
   * @param {string|number} gameId - Game ID
   * @returns {Promise<Object>} Game details
   */
  getGame: async (gameId) => {
    try {
      const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
      console.log(`Getting game with ID: ${id}`);

      const response = await apiClient.get(`/games/${id}`);

      // Handle different API response structures
      const gameObject = response.data || response;

      // If the response has story segments, make sure they're parsed correctly
      if (gameObject && gameObject.storySegments) {
        console.log(
          `Game has ${gameObject.storySegments.length} story segments`
        );
      }

      return gameObject;
    } catch (error) {
      console.error(`Error getting game ${gameId}:`, error);
      throw error;
    }
  },

  /**
   * Start a game and generate initial story/first segment
   * @param {string|number} gameId - Game ID
   * @param {string} llmApiKey - API key for LLM provider
   * @param {Object} preferences - Optional preferences (provider, model)
   * @returns {Promise<Object>} Game with initial segment
   */
  startGame: async (gameId, llmApiKey, preferences = {}) => {
    try {
      const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
      console.log("[DEBUG] API service startGame:", {
        gameId: id,
        hasApiKey: !!llmApiKey,
        preferences: preferences,
        headers: gameService.withLLMKey(llmApiKey).headers,
      });

      if (!llmApiKey) {
        return Promise.reject({
          status: "fail",
          message: "API key is required for story generation",
        });
      }

      console.log(`Starting game ${id} with LLM API key`);
      const response = await apiClient.post(
        `/games/${id}/start`,
        preferences,
        gameService.withLLMKey(llmApiKey)
      );

      console.log("Game start response:", response);

      // The expected response structure should have game data and initial segment
      // If your API has a different response format, adjust the parsing here
      const result = {
        game: response.data?.game || response.game || response,
        firstSegment:
          response.data?.firstSegment || response.firstSegment || null,
      };

      return result;
    } catch (error) {
      console.error(`Error starting game ${gameId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new story segment based on player choice
   * @param {string|number} gameId - Game ID
   * @param {Object} data - Choice data (optionId or optionText)
   * @param {string} llmApiKey - API key for LLM provider
   * @returns {Promise<Object>} New story segment
   */
  createStorySegment: async (gameId, data, llmApiKey) => {
    try {
      const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;

      if (!llmApiKey) {
        return Promise.reject({
          status: "fail",
          message: "API key is required for story generation",
        });
      }

      // Log what we're sending to the API
      console.log(`Creating new story segment for game ${id}:`, data);

      const response = await apiClient.post(
        `/games/${id}/segments`,
        data,
        gameService.withLLMKey(llmApiKey)
      );

      console.log("Create story segment response:", response);

      // Extract the correct data based on your API structure
      const segmentData = response.data || response;

      return {
        segment: segmentData.segment || segmentData,
        options:
          segmentData.options ||
          (segmentData.segment && segmentData.segment.options) ||
          [],
      };
    } catch (error) {
      console.error(`Error creating story segment for game ${gameId}:`, error);
      throw error;
    }
  },

  /**
   * Explicitly save the current game state
   * @param {string|number} gameId - Game ID
   * @returns {Promise<Object>} Saved game
   */
  saveGame: async (gameId) => {
    try {
      const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
      console.log(`Explicitly saving game ${id}`);

      // If your API has a save endpoint, use it here
      // For now, we'll just pretend it worked
      return { success: true, message: "Game saved successfully" };

      // Uncomment the below if you have a save endpoint:
      // const response = await apiClient.post(`/games/${id}/save`);
      // return response.data || response;
    } catch (error) {
      console.error(`Error saving game ${gameId}:`, error);
      throw error;
    }
  },

  /**
   * Get game segments history
   * @param {string|number} gameId - Game ID
   * @returns {Promise<Array>} Game segments
   */
  getGameSegments: async (gameId) => {
    try {
      const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;
      console.log(`Getting segments for game ${id}`);

      const response = await apiClient.get(`/games/${id}/segments`);

      // Handle different API response structures
      let segments = [];

      if (response && response.data && Array.isArray(response.data)) {
        segments = response.data;
      } else if (
        response &&
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        segments = response.data.data;
      } else if (Array.isArray(response)) {
        segments = response;
      }

      console.log(`Retrieved ${segments.length} segments for game ${id}`);
      return segments;
    } catch (error) {
      console.error(`Error getting segments for game ${gameId}:`, error);
      throw error;
    }
  },

  /**
   * Get options for a specific story segment
   * @param {string|number} segmentId - Segment ID
   * @returns {Promise<Array>} Available options
   */
  getSegmentOptions: async (segmentId) => {
    try {
      const id =
        typeof segmentId === "string" ? parseInt(segmentId, 10) : segmentId;
      console.log(`Getting options for segment ${id}`);

      const response = await apiClient.get(`/options/segments/${id}/options`);

      // Handle different API response structures
      let options = [];

      if (response && response.data && Array.isArray(response.data)) {
        options = response.data;
      } else if (
        response &&
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        options = response.data.data;
      } else if (Array.isArray(response)) {
        options = response;
      }

      console.log(`Retrieved ${options.length} options for segment ${id}`);
      return options;
    } catch (error) {
      console.error(`Error getting options for segment ${segmentId}:`, error);
      throw error;
    }
  },

  /**
   * Choose an option for a story segment
   * @param {string|number} segmentId - Segment ID
   * @param {string|number} optionId - Option ID
   * @returns {Promise<Object>} Result of choice
   */
  chooseOption: async (segmentId, optionId) => {
    try {
      const segId =
        typeof segmentId === "string" ? parseInt(segmentId, 10) : segmentId;
      const optId =
        typeof optionId === "string" ? parseInt(optionId, 10) : optionId;

      console.log(`Choosing option ${optId} for segment ${segId}`);

      const response = await apiClient.post(
        `/options/segments/${segId}/options/${optId}/choose`
      );

      return response.data || response;
    } catch (error) {
      console.error(
        `Error choosing option ${optionId} for segment ${segmentId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Create a custom option for a segment
   * @param {string|number} segmentId - Segment ID
   * @param {string} text - Custom option text
   * @returns {Promise<Object>} Created option
   */
  createCustomOption: async (segmentId, text) => {
    try {
      const id =
        typeof segmentId === "string" ? parseInt(segmentId, 10) : segmentId;

      console.log(`Creating custom option for segment ${id}: "${text}"`);

      const response = await apiClient.post(`/options/segments/${id}/options`, {
        text,
      });

      return response.data || response;
    } catch (error) {
      console.error(
        `Error creating custom option for segment ${segmentId}:`,
        error
      );
      throw error;
    }
  },
};

export { apiClient, gameService, modelService };