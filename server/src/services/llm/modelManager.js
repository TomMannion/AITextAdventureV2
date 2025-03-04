// src/services/llm/modelManager.js
import { getAvailableModels } from "../api/index.js";
import { DEFAULT_MODELS } from "../api/apiHelpers.js";

// Cache for models to avoid repeated API calls
let modelsCache = {
  openai: [],
  groq: [],
  timestamp: null,
  expiresIn: 1000 * 60 * 60, // 1 hour cache expiry
};

/**
 * Gets all available models with optional caching
 * @param {Object} options - Options for fetching models
 * @param {boolean} options.useCache - Whether to use the cache (default: true)
 * @param {string} options.provider - Optional provider to filter by
 * @param {string} options.apiKey - Optional API key to use
 * @returns {Promise<Array>} - List of available models
 */
export async function getModels(options = {}) {
  const { useCache = true, provider = null, apiKey = null } = options;

  const now = Date.now();
  const cacheValid =
    modelsCache.timestamp &&
    now - modelsCache.timestamp < modelsCache.expiresIn;

  // If cache is valid and we want to use it
  if (useCache && cacheValid) {
    if (provider) {
      return modelsCache[provider] || [];
    }
    return [...modelsCache.openai, ...modelsCache.groq];
  }

  // Fetch fresh models
  const models = await getAvailableModels(provider, apiKey);

  // Update cache if we're not using a custom API key
  if (!apiKey) {
    if (!provider) {
      // Sort models by provider
      modelsCache.openai = models.filter((m) => m.provider === "openai");
      modelsCache.groq = models.filter((m) => m.provider === "groq");
    } else {
      modelsCache[provider] = models;
    }
    modelsCache.timestamp = now;
  }

  return models;
}

/**
 * Gets the recommended model for a specific task and provider
 * @param {string} task - The task ('story', 'character', etc.)
 * @param {string} provider - The provider ('openai', 'groq')
 * @returns {string} - The recommended model ID
 */
export function getRecommendedModel(task, provider) {
  const recommendedModels = {
    openai: {
      story: "gpt-4-turbo",
      character: "gpt-3.5-turbo",
      title: "gpt-3.5-turbo",
      default: "gpt-3.5-turbo",
    },
    groq: {
      story: "llama3-70b-8192",
      character: "llama3-8b-8192",
      title: "llama3-8b-8192",
      default: "llama3-8b-8192",
    },
  };

  const providerModels =
    recommendedModels[provider] || recommendedModels.openai;
  return (
    providerModels[task] || providerModels.default || DEFAULT_MODELS[provider]
  );
}

export default {
  getModels,
  getRecommendedModel,
};
