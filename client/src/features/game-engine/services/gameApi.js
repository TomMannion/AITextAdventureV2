import { apiClient } from '../../../services/api.service';

/**
 * Game API service to handle all game-related API calls
 */
const gameApi = {
  /**
   * Helper to include LLM API key in headers
   * @param {string} apiKey - API key for LLM provider
   * @returns {Object} Config object with headers
   */
  withLLMKey: (apiKey) => {
    if (!apiKey) {
      console.warn('No LLM API key provided');
    }
    
    return {
      headers: {
        'x-llm-api-key': apiKey,
      },
    };
  },
  
  /**
   * Create a new game
   * @param {Object} gameData - Game data (genre, totalTurns, etc.)
   * @param {string} apiKey - API key for LLM provider
   * @returns {Promise<Object>} Created game
   */
  createGame: async (gameData, apiKey) => {
    try {
      console.log('Creating new game with data:', gameData);
      
      const response = await apiClient.post(
        '/games',
        gameData,
        gameApi.withLLMKey(apiKey)
      );
      
      // Handle different API response structures
      const gameObject = response.data || response;
      
      console.log('Created game:', gameObject);
      return gameObject;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },
  
  /**
   * Get all games with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Games array
   */
  getAllGames: async (params = {}) => {
    try {
      console.log('Getting all games with params:', params);
      
      const response = await apiClient.get('/games', { params });
      
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
      console.error('Error getting games:', error);
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
      const id = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
      console.log(`Getting game with ID: ${id}`);
      
      const response = await apiClient.get(`/games/${id}`);
      
      // Handle different API response structures
      const gameObject = response.data || response;
      
      return gameObject;
    } catch (error) {
      console.error(`Error getting game ${gameId}:`, error);
      throw error;
    }
  },
  
  /**
   * Start a game and generate initial story segment
   * @param {string|number} gameId - Game ID
   * @param {string} apiKey - API key for LLM provider
   * @param {Object} preferences - Optional preferences
   * @returns {Promise<Object>} Game with initial segment
   */
  startGame: async (gameId, apiKey, preferences = {}) => {
    try {
      const id = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
      
      console.log('Starting game with preferences:', preferences);
      
      const response = await apiClient.post(
        `/games/${id}/start`,
        preferences,
        gameApi.withLLMKey(apiKey)
      );
      
      console.log('Game start response:', response);
      
      // Extract expected data structure
      const result = {
        game: response.data?.game || response.game || response,
        firstSegment: response.data?.firstSegment || response.firstSegment || null,
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
   * @param {string} apiKey - API key for LLM provider
   * @returns {Promise<Object>} New story segment
   */
  createStorySegment: async (gameId, data, apiKey) => {
    try {
      const id = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
      
      console.log(`Creating new story segment for game ${id}:`, data);
      
      const response = await apiClient.post(
        `/games/${id}/segments`,
        data,
        gameApi.withLLMKey(apiKey)
      );
      
      console.log('Create story segment response:', response);
      
      // Extract correct data structure
      const segmentData = response.data || response;
      
      return {
        segment: segmentData.segment || segmentData,
        options: segmentData.options || (segmentData.segment && segmentData.segment.options) || [],
      };
    } catch (error) {
      console.error(`Error creating story segment for game ${gameId}:`, error);
      throw error;
    }
  },
  
  /**
   * Save the current game state
   * @param {string|number} gameId - Game ID
   * @returns {Promise<Object>} Saved game
   */
  saveGame: async (gameId) => {
    try {
      const id = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
      console.log(`Saving game ${id}`);
      
      // This is a mock implementation
      // Replace with actual API call if available
      return { success: true, message: 'Game saved successfully' };
    } catch (error) {
      console.error(`Error saving game ${gameId}:`, error);
      throw error;
    }
  },
};

export default gameApi;