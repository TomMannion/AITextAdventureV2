// src/services/api.js
import axios from "axios";

// Base API URL - proxied by Vite in development
const API_URL = "/api";

// Function to get API settings from localStorage
const getApiSettings = () => {
  const savedSettings = localStorage.getItem("ai_text_adventure_api_settings");
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (e) {
      console.error("Error parsing API settings:", e);
    }
  }
  return null;
};

// Create axios instance with common configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token and API key to all requests
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add API key if available
  const apiSettings = getApiSettings();
  if (apiSettings?.apiKey) {
    config.headers["x-llm-api-key"] = apiSettings.apiKey;
  }

  return config;
});

// Helper function to handle retries with exponential backoff
const withRetry = async (apiCall, maxRetries = 3) => {
  let retryCount = 0;
  let lastError;

  while (retryCount < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // Check if it's a rate limit error (429)
      if (error.response && error.response.status === 429) {
        // Get retry-after from headers or use exponential backoff
        const retryAfterHeader = error.response.headers["retry-after"];
        const retryAfterSeconds = retryAfterHeader
          ? parseInt(retryAfterHeader)
          : Math.pow(2, retryCount + 1); // 2, 4, 8 seconds

        console.log(
          `Rate limited. Retrying after ${retryAfterSeconds} seconds...`
        );

        // Wait for the specified time
        await new Promise((resolve) =>
          setTimeout(resolve, retryAfterSeconds * 1000)
        );
        retryCount++;
        continue;
      }

      // If it's not a rate limit error, just throw it immediately
      throw error;
    }
  }

  // If we've exhausted all retries
  console.error(`Failed after ${maxRetries} retries`, lastError);
  throw lastError;
};

// Create a function to add model options to API calls
const addModelOptions = (options = {}) => {
  const apiSettings = getApiSettings();
  if (!apiSettings) return options;

  return {
    ...options,
    provider: options.provider || apiSettings.preferredProvider,
    modelId: options.modelId || apiSettings.preferredModel,
  };
};

// Auth Services
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Character Services
export const characterAPI = {
  getAll: () => api.get("/characters"),
  getById: (id) => api.get(`/characters/${id}`),
  create: (data) => api.post("/characters", data),
  update: (id, data) => api.put(`/characters/${id}`, data),
  delete: (id) => api.delete(`/characters/${id}`),

  // Character generation with model options and retry logic
  generateNames: (genreData, options = {}) =>
    withRetry(() =>
      api.post("/character-generator/names", {
        ...genreData,
        ...addModelOptions(options),
      })
    ),

  generateTraits: (data, options = {}) =>
    withRetry(() =>
      api.post("/character-generator/traits", {
        ...data,
        ...addModelOptions(options),
      })
    ),

  generateBios: (data, options = {}) =>
    withRetry(() =>
      api.post("/character-generator/bios", {
        ...data,
        ...addModelOptions(options),
      })
    ),

  generateRandom: (genreData, options = {}) =>
    withRetry(() =>
      api.post("/character-generator/random", {
        ...genreData,
        ...addModelOptions(options),
      })
    ),
};

// Game Services
export const gameAPI = {
  getAll: () => api.get("/games"),
  getById: (id) => api.get(`/games/${id}`),
  create: (data) => api.post("/games", data),
  update: (id, data) => api.put(`/games/${id}`, data),
  delete: (id) => api.delete(`/games/${id}`),

  // Title generation with model options and retry logic
  generateTitles: (genreData, options = {}) =>
    withRetry(() =>
      api.post("/games/generate-titles", {
        ...genreData,
        ...addModelOptions(options),
      })
    ),

  // Story progression with model options and retry logic
  getStoryState: (gameId) => api.get(`/games/${gameId}/story`),
  startStory: (gameId, options = {}) =>
    withRetry(() =>
      api.post(`/games/${gameId}/story/start`, addModelOptions(options))
    ),
  makeChoice: (gameId, data, options = {}) =>
    withRetry(() =>
      api.post(`/games/${gameId}/story/choice`, {
        ...data,
        ...addModelOptions(options),
      })
    ),
};

// Model/Provider Services
export const modelAPI = {
  getModels: (provider) => withRetry(() => api.get(`/models/${provider}`)),
};

// Context Config Services
export const contextAPI = {
  getConfig: () => api.get("/context-config"),
  updateConfig: (data) => api.put("/context-config", data),
};

export default {
  auth: authAPI,
  characters: characterAPI,
  games: gameAPI,
  models: modelAPI,
  context: contextAPI,
};
