// src/services/api/index.js
import openaiService from "./openaiService.js";
import groqService from "./groqService.js";
import {
  resolveApiKey,
  DEFAULT_PROVIDER,
  DEFAULT_MODELS,
} from "./apiHelpers.js";

/**
 * Call the appropriate provider's API
 * @param {string} prompt - User prompt
 * @param {string} systemPrompt - System prompt
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Parsed response
 */
export async function callLLM(prompt, systemPrompt, options = {}) {
  const provider = options.provider || DEFAULT_PROVIDER;
  const modelId = options.modelId || DEFAULT_MODELS[provider];
  const apiKey = resolveApiKey(provider, options.apiKey);

  if (!apiKey) {
    throw new Error(`No API key provided for ${provider}`);
  }

  if (provider === "openai") {
    return openaiService.callChatCompletion(
      prompt,
      systemPrompt,
      modelId,
      apiKey,
      options
    );
  } else if (provider === "groq") {
    return groqService.callChatCompletion(
      prompt,
      systemPrompt,
      modelId,
      apiKey,
      options
    );
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Get available models across all providers or a specific provider
 * @param {string} provider - Optional provider name to filter by
 * @param {string} apiKey - Optional API key
 * @returns {Promise<Array>} - List of available models
 */
export async function getAvailableModels(provider = null, apiKey = null) {
  const results = [];

  if (!provider || provider === "openai") {
    const openaiKey = resolveApiKey("openai", apiKey);
    if (openaiKey) {
      const openaiModels = await openaiService.getModels(openaiKey);
      results.push(...openaiModels);
    }
  }

  if (!provider || provider === "groq") {
    const groqKey = resolveApiKey("groq", apiKey);
    if (groqKey) {
      const groqModels = await groqService.getModels(groqKey);
      results.push(...groqModels);
    }
  }

  return results;
}

export { openaiService, groqService };

export default {
  callLLM,
  getAvailableModels,
  openaiService,
  groqService,
};
